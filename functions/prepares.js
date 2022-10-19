const { dbGetter } = require('./getter.js')

async function solveMOD(tokens, langRef){
    for (let i=0; i<tokens.length; i++){
        if (tokens[i].type === 'MOD'){
            let j = 1;
            while(true){
                const passedLeft = i-j < 0;
                const passedRight = i+j >= tokens.length;
                if(passedLeft && passedRight) break;
                if(!passedLeft){
                    if(tokens[i-j].type == 'NOUN' || tokens[i-j].type == 'SUBJ') {
                        tokens[i].type = 'ADJ';
                        tokens[i].types = tokens[i].types.map(t => t === 'MOD' ? 'ADJ' : t)
                        break;
                    }
                    if(tokens[i-j].type == 'VERB') {
                        tokens[i].type = 'ADV';
                        tokens[i].types = tokens[i].types.map(t => t === 'MOD' ? 'ADV' : t)
                        break;
                    }
                }
                if(!passedRight){
                    if(tokens[i+j].type == 'NOUN' || tokens[i+j].type == 'SUBJ') {
                        tokens[i].type = 'ADJ';
                        tokens[i].types = tokens[i].types.map(t => t === 'MOD' ? 'ADJ' : t)
                        break;
                    }
                    if(tokens[i+j].type == 'VERB') {
                        tokens[i].type = 'ADV';
                        tokens[i].types = tokens[i].types.map(t => t === 'MOD' ? 'ADV' : t)
                        break;
                    }
                }
                j++;
            }
            tokens[i] = await prepareMeta(tokens[i], langRef)
        }
    }
    return tokens;
}

async function solveMISC(words, types, langRef){
    for (let i=0; i<types.length; i++){
        if (types[i] === 'MISC') types[i] = await dbGetter.getOnce(langRef, `DEFINITIVES/MISC/${obj.words[i]}`) || 'MISC';
    }
    return [words, types];
}

async function findART(obj, langRef){
    for(let i=0; i<obj.words.length; i++){
        const wordsSplit = obj.words[i].split(' ');
        if(wordsSplit.length > 1){
            const newWords = []
            const newTypes = []
            let currentNewWord = []
            const articlesGenders = await dbGetter.getPersistent(langRef, 'ARTICLES/GENDERS', {});
            const articleList = Object.keys(articlesGenders).map(k => articlesGenders[k])
            for(w of wordsSplit){
                if(articleList.includes(w)){
                    if(currentNewWord.length > 0){
                        newWords.push(currentNewWord.join(' '))
                        newTypes.push(obj.types[i])
                        currentNewWord = []
                    }
                    newWords.push(w)
                    newTypes.push('ART')
                    console.log(newWords)
                    console.log(newTypes)
                } else {
                    currentNewWord.push(w)
                }
            }
            newWords.push(currentNewWord.join(' '))
            newTypes.push(obj.types[i])
            obj.words.splice(i, 1, ...newWords)
            obj.types.splice(i, 1, ...newTypes)
        }
    }
}

async function prepareMeta(obj, langRef){

    switch(obj.type){
        case 'NOUN':
            return await prepareMetaNOUN(obj, langRef);
        case 'SUBJ': 
            return await prepareMetaSUBJ(obj, langRef);
        case 'ADV':
            return await prepareMetaADV(obj, langRef);
        case 'ADJ':
            return await prepareMetaADJ(obj, langRef);
    }
    return obj; 
}

async function prepareMetaNOUN(obj, langRef){
    
    const defaults = await dbGetter.getPersistent(langRef, 'DEFAULTS', {});

    await findART(obj, langRef)
    const genders = []
    const addART = []
    for(let i=0; i<obj.words.length; i++){
        if (obj.types[i] === 'NOUN'){
            const personsGenders = await dbGetter.getPersistent(langRef, 'PERSONS/GENDERS', {});
            if(personsGenders.flat(1).includes(obj.words[i])) genders.push(obj.words[i])
            else if(obj.props[i]) genders.push(obj.props[i].gender || defaults.GENDER)
            else genders.push(await dbGetter.getOnce(langRef, `DEFINITIVES/GENDER/${obj.words[i]}`) || defaults.GENDER)
        }
        if (i === 0){
            const articlesGenders = await dbGetter.getPersistent(langRef, 'ARTICLES/GENDERS', {});
            addART.push([0, articlesGenders[genders.at(-1)]])
        }
        else if (obj.types[i-1] !== 'ART' && obj.types[i-1] !== 'CON'){
            const articlesGenders = await dbGetter.getPersistent(langRef, 'ARTICLES/GENDERS', {});
            addART.push([i, articlesGenders[genders.at(-1)]])
        }
    }
    addART.forEach((v, i) => {
        obj.words.splice(v[0] + i, 0, v[1])
        obj.types.splice(v[0] + i, 0, 'ART')
    })
    if(genders.length > 0){
        const personsGenders = await dbGetter.getPersistent(langRef, 'PERSONS/GENDERS', {});
        const personsPlurals = await dbGetter.getPersistent(langRef, 'PERSONS/PLURALS', {});
        const foundPerson = personsPlurals.find(person => ( obj.words.includes(person[0]) || obj.words.includes(person[1]))) || personsPlurals.at(-1);
        obj.meta.PERSON = genders.length > 1 ? foundPerson[1] : foundPerson[0];
        const foundGender = personsGenders.find(gender => ( genders.includes(gender[0]) || genders.includes(gender[1])));
        obj.meta.GENDER = genders.length > 1 ? foundGender[1] : foundGender[0]; 
    } else {
        obj.meta.PERSON = defaults.GENDER;
    }

    //HERE: this might be temporary, for now it seems to be no difference between a SUBJ and a NOUN
    obj.type = 'SUBJ' 
    obj.types = obj.types.map(t => t === 'NOUN' ? 'SUBJ' : t)
    
    return obj;
}

async function prepareMetaSUBJ(obj, langRef){
    
    const defaults = await dbGetter.getPersistent(langRef, 'DEFAULTS', {});

    const genders = []
    for(let i=0; i<obj.words.length; i++){
        if (obj.types[i] === 'SUBJ'){
            const personsGenders = await dbGetter.getPersistent(langRef, 'PERSONS/GENDERS', {});
            if(personsGenders.flat(1).includes(obj.words[i])) genders.push(obj.words[i])
            else if(obj.props[i]) genders.push(obj.props[i].gender || defaults.GENDER)
            else genders.push(await dbGetter.getOnce(langRef, `DEFINITIVES/GENDER/${obj.words[i]}`) || defaults.GENDER)
        }
    }
    if(genders.length > 0){
        const personsGenders = await dbGetter.getPersistent(langRef, 'PERSONS/GENDERS', {});
        const personsPlurals = await dbGetter.getPersistent(langRef, 'PERSONS/PLURALS', {});
        const foundPerson = personsPlurals.find(person => ( obj.words.includes(person[0]) || obj.words.includes(person[1]))) || personsPlurals.at(-1);
        obj.meta.PERSON = genders.length > 1 ? foundPerson[1] : foundPerson[0];
        const foundGender = personsGenders.find(gender => ( genders.includes(gender[0]) || genders.includes(gender[1])));
        obj.meta.GENDER = genders.length > 1 ? foundGender[1] : foundGender[0]; 
    } else {
        obj.meta.PERSON = defaults.GENDER;
    }
    
    return obj;
}

async function prepareMetaADV(obj, langRef){

    const advTimes = await dbGetter.getPersistent(langRef, 'ADVERBS/TIMES', {})
    obj.types = obj.types.map(t => t === 'MOD' ? 'ADV' : t)
    for (word of obj.words){
        for (time in advTimes){
            if (advTimes[time].includes(word)){
                obj.meta.TIME = time;
                return obj;
            }
        }
    }
    return obj;
}

async function prepareMetaADJ(obj, langRef){
    obj.types = obj.types.map(t => t === 'MOD' ? 'ADJ' : t)
    return obj;
}

module.exports = { solveMOD, solveMISC, prepareMeta }