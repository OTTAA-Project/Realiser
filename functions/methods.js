const admin = require('firebase-admin');
const serviceAccount = require('./ottaaproject-flutter-firebase-adminsdk-z2x83-b744263584.json');

try{
    admin.app('realiser')
} catch (e){
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://ottaaproject-realiser-lexicons.firebaseio.com/",
    }, 'realiser');
}

const rt = admin.app('realiser').database()

async function addLexiconData(path, data){
    const newDataRef = rt.ref(path)
    await newDataRef.set(data)
    return `Added data to ${path}`
}

const { solveMOD, solveMISC, prepareMeta } = require('./prepares.js')

async function prepareSentence(words, types, props, language){
    const personsPluralsSn = await rt.ref(`${language}/PERSONS/PLURALS`).get()
    const personsPlurals = personsPluralsSn.val() || {};
    const personsGendersSn = await rt.ref(`${language}/PERSONS/GENDERS`).get()
    const personsGenders = personsGendersSn.val() || {};
    const advTimesSn = await rt.ref(`${language}/ADVERBS/TIMES`).get()
    const advTimes = advTimesSn.val() || {};
    const defaultsSn = await rt.ref(`${language}/DEFAULTS`).get()
    const defaults = defaultsSn.val() || {};
    const pastersSn = await rt.ref(`${language}/PASTERS`).get()
    const pasters = pastersSn.val() || {};

    [words, types] = await solveMISC(words.map(w => w.toLowerCase()), types.map(t => t.toUpperCase()), rt.ref(`${language}/DEFINITIVES/MISC`))

    const prepared = [];
    let i=0;
    if (words.length !== types.length) throw new Error('Word and Wordtype arrays must be equally lengthed, if some words do not have a wordtype, use an empty string', {cause: 400})
    while( i< types.length){
        let type = types[i];
        let j = 1, jMax = 1;
        let t1 = types[i]
        let t2 = types[i+j]
        while(i+j < types.length){
            if(!pasters[t1]) break;
            else if(!pasters[t1][t2]) break;
            else {
                const pasteMode = pasters[t1][t2].split(':');
                j++;
                switch(pasteMode[0]){
                    case 'MIGHT':
                        t2 = types[i+j];
                        break;
                    case 'JOIN':
                        jMax = j;
                        t1 = types[i+j-1];
                        t2 = types[i+j];
                        break;
                    case 'MORPH':
                        jMax = j;
                        t1 = types[i+j-1];
                        t2 = types[i+j]
                        type = pasteMode[1];
                        break;
                }
            }
        }
        const wToken = words.slice(i, i+jMax);
        const tToken = types.slice(i, i+jMax);
        const pToken = Object.fromEntries(Object.entries(props).filter(e => i <= e[0] && e[0] < i+jMax).map(e => [e[0]-i, e[1]]))
        prepared.push(prepareMeta(
            {words: wToken, types: tToken, composed: j>1, type, children: [], meta: {}, props: pToken, position: prepared.length, headless: true}, 
            personsPlurals, 
            personsGenders, 
            advTimes,
            defaults
        ))
        i+=jMax;
    }

    return await solveMOD(prepared, personsPlurals, personsGenders, advTimes, defaults);
}

const { isDependant } = require('./dependencies.js')

async function parseDependencies(wordList, headlessList, language){ //Algorithm LSU from "A Fundamental Algorithm for Dependency Parsing"
    const isHeadOfSn = await rt.ref(`${language}/HEADS`).get()
    const isHeadOf = isHeadOfSn.val(); //if heads gets too large this might be done for each wordtype relation and not bringing the whole isHeadOf obj
    for(let i=0; i<wordList.length; i++){
        //children
        const updateHeadlessList = []
        for(let j=0; j<headlessList.length; j++){
            if(isDependant(headlessList[j], wordList[i], isHeadOf)) {
                const headlessNoMore = headlessList[j]
                wordList[headlessNoMore.position].headless = false;
                wordList[i].children.push(headlessNoMore)
            } else {
                updateHeadlessList.push(headlessList[j])
            }
        }
        headlessList = updateHeadlessList;
        //head
        let headless = true;
        let j = 1;
        while(true){
            const passedLeft = i-j < 0;
            const passedRight = i+j >= wordList.length;
            if(passedLeft && passedRight) break;
            if(!passedLeft){
                if(isDependant(wordList[i], wordList[i-j], isHeadOf)) {
                    wordList[i-j].children.push({position: i, type: wordList[i].type});
                    wordList[i].headless = false;
                    headless = false;
                    break;
                }
            }
            /* HERE: THIS SHOULD NOT BE NECESSARY (and less efficient) IF USING THE headlessList
            if(!passedRight){
                if(isDependant(wordList[i], wordList[i+j], isHeadOf)) {
                    wordList[i+j].children.push({position: i, type: wordList[i].type});
                    wordList[i].headless = false;
                    headless = false;
                    break;
                }
            }
            */
            j++;
        }
        if (headless) headlessList.push({position: i, type: wordList[i].type})
    }
    return [wordList, headlessList];
}

const { handleType } = require('./handlers.js')

async function handleSentence(sentence, language, src = 'static'){
    const defaultsSn = await rt.ref(`${language}/DEFAULTS`).get()
    const defaults = defaultsSn.val() || {};
    const langRef = rt.ref(language)

    for (obj of sentence) await handleType(obj, sentence, langRef, src, defaults);

    return sentence;
}

async function realiseSentence(obj, language){
    const defaultsSn = await rt.ref(`${language}/DEFAULTS`).get()
    const defaults = defaultsSn.val() || {};

    const finalProcessing = (w) => {
        let i = w.position +1;
        while(w.children.map(e => e.position).includes(i)) i++;
        if (obj[i]) if (w.type === obj[i].type && !obj[i].types.includes('CON')) obj[i].words.unshift(defaults.CON)
    }
    obj.slice(0, -1).forEach(finalProcessing)

    const finalSentence = []
    for (tok of obj){
        finalSentence.push(...tok.words);
    }

    return finalSentence.join(' ')
}

module.exports = { addLexiconData, prepareSentence, parseDependencies, handleSentence, realiseSentence }