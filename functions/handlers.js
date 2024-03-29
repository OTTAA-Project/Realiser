const { dbGetter } = require("./getter.js");

/*
async function findART(obj, langRef){
    const addART = []
    let i = 0, j = 0;
    while(i<obj.words.length){
        if(obj.types[i] === 'NOUN' || obj.types[i] === 'SUBJ'){
            const articlesGenders = await dbGetter.getPersistent(langRef, 'ARTICLES/GENDERS', {});
            addART.push([i, articlesGenders[genders[j]]])
            j++;
        }
        i++;
    }
    addART.forEach((v, i) => {
        obj.words.splice(v[0] + i, 0, v[1])
        obj.types.splice(v[0] + i, 0, 'ART')
    })
}
*/

async function handleType(obj, sentence, langRef, src, forces){
    if(obj.position > 0){
        if(sentence[obj.position-1].props.next){
            obj.props.prev = sentence[obj.position-1].props.next;
        }
    }
    switch (obj.type){
        case 'VERB':
            obj = await handleVERB(obj, sentence, langRef, src, forces);
            break;
        case 'NOUN':
            obj = await handleNOUN(obj, sentence, langRef, src);
            break;
        case 'SUBJ':
            obj = await handleSUBJ(obj, sentence, langRef, src);
            break;
        case 'ADJ':
            obj = await handleADJ(obj, langRef);
            break;
        case 'ADV':
            obj = await handleADV(obj, langRef);
            break;
    }

    return obj
}

async function handleVERB(obj, sentence, langRef, src, forces){
    //join prepositions with the previous verb
    let prepIndex = obj.types.findIndex(t => t === 'PREP')
    while (prepIndex > 0) {
        obj.types.splice(prepIndex);
        obj.words.splice(prepIndex-1, 2, `${obj.words[prepIndex-1]} ${obj.words[prepIndex]}`)
        prepIndex = obj.types.findIndex(t => t === 'PREP')
    }

    const defaults = await dbGetter.getPersistent(langRef, 'DEFAULTS', {})
    
    const childrenSUBJ = obj.children.filter(c => c.type === 'SUBJ' || c.type === 'NOUN') //HERE: check if include NOUN here is ok
    if (forces.PERSON && childrenSUBJ.every(c => !sentence[c.position].words.includes(forces.PERSON))){
        obj.meta.PERSON = forces.PERSON;
    } else if (childrenSUBJ.length > 1) {
        const childrenSUBJpersons = childrenSUBJ.map(c => sentence[c.position].meta.PERSON)
        const personsPlurals = await dbGetter.getPersistent(langRef, 'PERSONS/PLURALS', {})
        const foundPerson = personsPlurals.find(person => childrenSUBJpersons.includes(person[0]) || childrenSUBJpersons.includes(person[1]));
        obj.meta.PERSON = foundPerson[1];
    } else if (childrenSUBJ.length === 1) obj.meta.PERSON = sentence[childrenSUBJ[0].position].meta.PERSON || defaults.PERSON[0];
    else obj.meta.PERSON = defaults.PERSON[0];
    
    const childrenADV = obj.children.filter(c => c.type === 'ADV')
    if (forces.TIME){
        obj.meta.TIME = forces.TIME;
    } else if (childrenADV.length > 1) { //HERE: maybe sorting here is worthless since we do a for loop later, maybe it's better to just do the loop and overwrite if position is higher
        const sortedChildrenADV = childrenADV.sort((a, b) => Math.abs(a.position - obj.position) - Math.abs(b.position - obj.position))
        for (childADV of sortedChildrenADV) {
            if (sentence[childADV.position].meta.TIME) {
                obj.meta.TIME = sentence[childADV.position].meta.TIME;
                break;
            }
        }
    } else if (childrenADV.length === 1) obj.meta.TIME = sentence[childrenADV[0].position].meta.TIME || defaults.TIME;
    else obj.meta.TIME = defaults.TIME;
    
    return await conjugateVERB(obj, langRef, src, defaults);
}

async function conjugateVERB(obj, langRef, src){ 
    const defaults = await dbGetter.getPersistent(langRef, 'DEFAULTS', {});
    const newWordsInf = obj.words.map(word => getVERBInfinitive(word, langRef));
    const newWordsSeq = newWordsInf.map(p => new Promise((resolve) => {
        p.then(inf => dbGetter.getOnce(langRef, `VERBS/SEQUENCES/${inf}`))
        .then(seq => resolve(seq))
    }));
    const newWords = obj.words.map((w, i) => new Promise((resolve) => {
        Promise.all([newWordsInf[i], newWordsSeq[i-1]])
        .then(([inf, seq]) => {
            seq = i == 0 ? obj.props.prev?.VERB : seq?.VERB
            if(seq){
                if (seq === 'INF') return inf.split(' ')
                return Promise.all(inf.split(' ').map(winf => getVERBConjugations(winf, src, langRef, seq)))
            } else {
                if (obj.words.length > 1 && 
                    i === obj.words.length - 1 && 
                    !Object.keys(defaults).includes(obj.types.at(-2))) return Promise.all(inf.split(' ').map(winf => getVERBConjugations(winf, src, langRef, obj.meta.TIME, obj.meta.PERSON)).concat(':CON:'))
                return Promise.all(inf.split(' ').map(winf => getVERBConjugations(winf, src, langRef, obj.meta.TIME, obj.meta.PERSON)))
            }
        }).then(conj => resolve(conj.join(' ')))
    }));
    obj.words = await Promise.all(newWords);
    obj.infs = await Promise.all(newWordsInf);
    obj.props.next = await newWordsSeq.at(-1);
    if (obj.words.at(-1).includes(':CON:')){
        obj.words.splice(-1, 1, ...[defaults.CON, obj.words.at(-1).replace(' :CON:', '')])
        obj.types.splice(-1, 0, 'CON')
    }
    return obj
}

async function getVERBConjugations(infinitive, src, langRef, time, person){
    let conj;
    switch (src){
        case 'static':
            conj = await dbGetter.getOnce(langRef, `VERBS/CONJUGATIONS/${infinitive}/${time + (person ? '/' + person : '')}`)
            break;
        /*
        case 'wordreference':
            break;
        */
    }
    return conj || infinitive;
}

async function getVERBInfinitive(word, langRef){
    const fullInf = [];
    const wordSplit = word.split(' ');
    var i = 0;
    while(i < wordSplit.length){
        const w = wordSplit[i];
        const infinitiveData = await dbGetter.getOnce(langRef, `VERBS/INFINITIVES/${w}`);
        if(infinitiveData) {
            const [inf, unless] = infinitiveData.split(':')
            if(unless){
                const unlessSplit = unless.split(' ')
                if(unless === wordSplit.slice(i, i+unlessSplit.length).join(' ')){
                    fullInf.push(unless);
                    i+=unlessSplit.length;
                    continue
                }
            }
            fullInf.push(inf) //not necesssary to use "else" bc of "continue"
        } else fullInf.push(w)
        i++;
    }
    return fullInf.join(' ') 
}

async function handleNOUN(obj, sentence, langRef, src){
    const defaults = await dbGetter.getPersistent(langRef, 'DEFAULTS', {})
    if(obj.props.prev){
        if(obj.props.prev[obj.types[0]]){
            const toPrepend = obj.props.prev[obj.types[0]].EXCEPTION 
                ? obj.props.prev[obj.types[0]].EXCEPTION[obj.words[0]] || obj.props.prev[obj.types[0]].DEFAULT
                : obj.props.prev[obj.types[0]].DEFAULT;
            const toPrependSplit = toPrepend.split(',')
            for(let t=toPrependSplit.length-1; t>=0; t--){
                const tp = toPrependSplit[t];
                switch(tp){
                    case 'ART':
                        const articlesGenders = await dbGetter.getPersistent(langRef, 'ARTICLES/GENDERS', {});
                        obj.words.unshift(articlesGenders[obj.genders[0]])
                        obj.types.unshift('ART')
                        break;
                    case 'NONE':
                        continue;
                    default:
                        obj.words[0] = [tp, obj.words[0]].join(' ')
                        break;
                }
            }
        }
    }
    if (obj.composed) {
        if(obj.types.at(-2) === 'NOUN' || obj.types.at(-2) === 'SUBJ'){
            obj.words.splice(-1, 0, defaults.CON);
            obj.types.splice(-1, 0, "CON");
        } else if (obj.types.at(-2) === 'ART' && (obj.types.at(-3) === 'NOUN' || obj.types.at(-3) === 'SUBJ')){
            obj.words.splice(-2, 0, defaults.CON);
            obj.types.splice(-2, 0, "CON");
        }
    }
    for (c of obj.children){
        switch (sentence[c.position].type){ 
            case 'ADJ':
                sentence[c.position].meta.PERSON = obj.meta.GENDER || obj.meta.PERSON || 'él';
                sentence[c.position] = await conjugateADJ(sentence[c.position], langRef, src);
                break;
        }
    }
    return obj;
}

async function handleSUBJ(obj, sentence, langRef, src){
    const defaults = await dbGetter.getPersistent(langRef, 'DEFAULTS', {})
    if(obj.props.prev){
        if(obj.props.prev[obj.types[0]]){
            const toPrepend = obj.props.prev[obj.types[0]].EXCEPTION 
                ? obj.props.prev[obj.types[0]].EXCEPTION[obj.words[0]] || obj.props.prev[obj.types[0]].DEFAULT
                : obj.props.prev[obj.types[0]].DEFAULT;
            const toPrependSplit = toPrepend.split(',')
            for(let t=toPrependSplit.length-1; t>=0; t--){
                const tp = toPrependSplit[t];
                switch(tp){
                    case 'ART':
                        const articlesGenders = await dbGetter.getPersistent(langRef, 'ARTICLES/GENDERS', {});
                        obj.words.unshift(articlesGenders[obj.genders[0]])
                        obj.types.unshift('ART')
                        break;
                    case 'NONE':
                        continue;
                    default:
                        obj.words[0] = [tp, obj.words[0]].join(' ')
                        break;
                }
            }
        }
    }
    if (obj.composed) {
        if(obj.types.at(-2) === 'NOUN' || obj.types.at(-2) === 'SUBJ'){
            obj.words.splice(-1, 0, defaults.CON);
            obj.types.splice(-1, 0, "CON");
        } else if (obj.types.at(-2) === 'ART' && (obj.types.at(-3) === 'NOUN' || obj.types.at(-3) === 'SUBJ')){
            obj.words.splice(-2, 0, defaults.CON);
            obj.types.splice(-2, 0, "CON");
        }
    }
    for (c of obj.children){
        switch (sentence[c.position].type){ 
            case 'ADJ':
                sentence[c.position].meta.PERSON = obj.meta.GENDER || obj.meta.PERSON || 'él';
                sentence[c.position] = await conjugateADJ(sentence[c.position], langRef, src);
                break;
        }
    }
    return obj;
}

async function handleADJ(obj, langRef){
    const defaults = await dbGetter.getPersistent(langRef, 'DEFAULTS', {})
    if (obj.composed && obj.types.at(-2) === 'ADJ') {
        obj.words.splice(-1, 0, defaults.CON); //HERE: generalize this for multiple languages
        obj.types.splice(-1, 0, "CON");
    }
    return obj
}

async function conjugateADJ(obj, langRef, src){
    for (let i=0; i<obj.words.length; i++){
        if (obj.types[i] === 'ADJ') obj.words[i] = await getADJConjugations(obj.words[i], src, langRef, obj.meta.PERSON);
    }
    return obj
}

async function getADJConjugations(word, src, langRef, person){
    let conj;
    switch (src){
        case 'static':
            conj = await dbGetter.getOnce(langRef, `ADJECTIVES/GENDERS/${word}/${person}`);
            break;
        case 'wordreference':
            break;
    }
    return conj || word;
}

async function handleADV(obj, langRef){
    const defaults = await dbGetter.getPersistent(langRef, 'DEFAULTS', {})
    if (obj.composed && obj.types.at(-2) === 'ADV') {
        obj.words.splice(-1, 0, defaults.CON); //HERE: generalize this for multiple languages
        obj.types.splice(-1, 0, "CON");
    }
    return obj
}

module.exports = { handleType }