async function handleType(obj, sentence, langRef, src, defaults){
    switch (obj.type){
        case 'VERB':
            obj = await handleVERB(obj, sentence, langRef, src, defaults);
            break;
        case 'NOUN':
            obj = await handleNOUN(obj, sentence, langRef, src, defaults);
            break;
        case 'SUBJ':
            obj = await handleSUBJ(obj, sentence, langRef, src, defaults);
            break;
        case 'ADJ':
            obj = await handleADJ(obj, defaults);
            break;
        case 'ADV':
            obj = await handleADV(obj, defaults);
            break;
    }
}

async function handleVERB(obj, sentence, langRef, src, defaults){
    //HERE: we are joining prepositions into the previous verb
    let prepIndex = obj.types.findIndex(t => t === 'PREP')
    while (prepIndex >= 0) {
        obj.types.splice(prepIndex);
        obj.words.splice(prepIndex-1, 2, `${obj.words[prepIndex-1]} ${obj.words[prepIndex]}`)
        prepIndex = obj.types.findIndex(t => t === 'PREP')
    }
    /////////////////////////////////////////////////////////
    obj.meta.PERSON = defaults.PERSON;
    
    const childrenSUBJ = obj.children.filter(c => c.type === 'SUBJ' || c.type === 'NOUN') //HERE: check if include NOUN here is ok
    if (childrenSUBJ.length > 1) {
        const childrenSUBJpersons = childrenSUBJ.map(c => sentence[c.position].meta.PERSON)
        const personsPluralsSn = await langRef.child(`PERSONS/PLURALS`).get() //if there's more than one subj token, recall the personPlurals
        const personsPlurals = personsPluralsSn.val() || {};
        const foundPerson = personsPlurals.find(person => ( childrenSUBJpersons.includes(person[0]) || childrenSUBJpersons.includes(person[1])));
        obj.meta.PERSON = foundPerson[1];
    } else if (childrenSUBJ.length === 1) obj.meta.PERSON = sentence[childrenSUBJ[0].position].meta.PERSON || obj.meta.PERSON;
    
    obj.meta.TIME = defaults.TIME;
    const childrenADV = obj.children.filter(c => c.type === 'ADV')
    if (childrenADV.length > 1) {
        const sortedChildrenADV = childrenADV.sort((a, b) => Math.abs(a.position - obj.position) - Math.abs(b.position - obj.position))
        for (childADV of sortedChildrenADV) {
            if (sentence[childADV.position].meta.TIME) {
                obj.meta.TIME = sentence[childADV.position].meta.TIME;
                break;
            }
        }
    } else if (childrenADV.length === 1) obj.meta.TIME = sentence[childrenADV[0].position].meta.TIME || obj.meta.TIME;
    
    return await conjugateVERB(obj, langRef, src, defaults);
}

async function conjugateVERB(obj, langRef, src, defaults){ 

    const newWordsInf = obj.words.map(word => getVERBInfinitive(word, langRef));
    const newWordsSeq = newWordsInf.map(p => new Promise((resolve) => {
        p.then(inf => langRef.child(`VERBS/SEQUENCES/${inf}`).get())
        .then(seq => resolve(seq.exists() ? seq.val() : undefined))
    }))
    const newWords = obj.words.map((w, i) => new Promise((resolve) => {
        Promise.all([newWordsInf[i], newWordsSeq[i-1]])
        .then(([inf, seq]) => {
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
    }))
    obj.words = await Promise.all(newWords)
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
            const conjSn = await langRef.child(`VERBS/CONJUGATIONS/${infinitive}/${time + (person ? '/' + person : '')}`).get()
            conj = conjSn.val();
            break;
        case 'wordreference':
            break;
    }
    return conj || infinitive;
}

async function getVERBInfinitive(word, langRef){
    const fullInf = []
    for(let w of word.split(' ')){
        const infinitiveSn = await langRef.child(`VERBS/INFINITIVES/${w}`).get();
        if(infinitiveSn.exists()) fullInf.push(infinitiveSn.val())
        else fullInf.push(w)
    }
    return fullInf.join(' ')
}

async function handleNOUN(obj, sentence, langRef, src, defaults){
    if (obj.composed && obj.types.at(-2) === 'NOUN') {
        obj.words.splice(-1, 0, defaults.CON);
        obj.types.splice(-1, 0, "CON");
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

async function handleSUBJ(obj, sentence, langRef, src, defaults){
    if (obj.composed && obj.types.at(-2) === 'SUBJ') {
        obj.words.splice(-1, 0, defaults.CON);
        obj.types.splice(-1, 0, "CON");
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

async function handleADJ(obj, defaults){
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
            const conjSn = await langRef.child(`ADJECTIVES/GENDERS/${word}/${person}`).get()
            conj = conjSn.val();
            break;
        case 'wordreference':
            break;
    }
    return conj || word;
}

async function handleADV(obj, defaults){
    if (obj.composed && obj.types.at(-2) === 'ADV') {
        obj.words.splice(-1, 0, defaults.CON); //HERE: generalize this for multiple languages
        obj.types.splice(-1, 0, "CON");
    }
    return obj
}

module.exports = { handleType }