async function solveMOD(tokens, personsPlurals, personsGenders, advTimes, defaults){
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
            tokens[i] = prepareMeta(tokens[i], personsPlurals, personsGenders, advTimes, defaults)
        }
    }
    return tokens;
}

async function solveMISC(words, types, definitivesRef){
    var definitives;

    for (let i=0; i<types.length; i++){
        if (types[i] === 'MISC'){
            if (!definitives){
                const definitivesSn = await definitivesRef.get();
                definitives = definitivesSn.val() || {};
            }
            types[i] = definitives[words[i]] || 'MISC';
        }
    }
    return [words, types];
}

function prepareMeta(obj, personsPlurals, personsGenders, advTimes, defaults){
    switch(obj.type){
        case 'NOUN':
            return prepareMetaNOUN(obj, personsPlurals, personsGenders, defaults);
        case 'SUBJ': 
            return prepareMetaSUBJ(obj, personsPlurals, personsGenders, defaults);
        case 'ADV':
            return prepareMetaADV(obj, advTimes, defaults);
        case 'ADJ':
            return prepareMetaADJ(obj);
    }
    return obj; 
}

function prepareMetaNOUN(obj, personsPlurals, personsGenders, defaults){
    
    const genders = []
    for(let i=0; i<obj.words.length; i++){
        if (obj.types[i] === 'NOUN'){
            if(personsGenders.flat(1).includes(obj.words[i])) genders.push(obj.words[i])
            else if(obj.props[i]) genders.push(obj.props[i].gender || defaults.GENDER)
            else genders.push(defaults.GENDER)
        }
    }
    if(genders.length > 0){
        const foundPerson = personsPlurals.find(person => ( obj.words.includes(person[0]) || obj.words.includes(person[1]))) || defaults.PERSON;
        obj.meta.PERSON = genders.length > 1 ? foundPerson[1] : foundPerson[0];
        if (!personsGenders.flat(1).includes(obj.meta.PERSON)){
            const foundGender = personsGenders.find(gender => ( genders.includes(gender[0]) || genders.includes(gender[1])));
            obj.meta.GENDER = genders.length > 1 ? foundGender[1] : foundGender[0]; 
        }
    } else {
        obj.meta.PERSON = defaults.GENDER;
    }

    obj.type = 'SUBJ' //HERE: this might be temporary, for now it seems to be no difference between a SUBJ and a NOUN
    
    return obj;
}

function prepareMetaSUBJ(obj, personsPlurals, personsGenders, defaults){
    
    const genders = []
    for(let i=0; i<obj.words.length; i++){
        if (obj.types[i] === 'SUBJ'){
            if(personsGenders.flat(1).includes(obj.words[i])) genders.push(obj.words[i])
            else if(obj.props[i]) genders.push(obj.props[i].gender || defaults.GENDER)
            else genders.push(defaults.GENDER)
        }
    }
    if(genders.length > 0){
        const foundPerson = personsPlurals.find(person => ( obj.words.includes(person[0]) || obj.words.includes(person[1]))) || personsPlurals.at(-1);
        obj.meta.PERSON = genders.length > 1 ? foundPerson[1] : foundPerson[0];
        const foundGender = personsGenders.find(gender => ( genders.includes(gender[0]) || genders.includes(gender[1])));
        obj.meta.GENDER = genders.length > 1 ? foundGender[1] : foundGender[0]; 
    } else {
        obj.meta.PERSON = defaults.GENDER;
    }
    
    return obj;
}

function prepareMetaADV(obj, advTimes, defaults){
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

function prepareMetaADJ(obj){
    obj.types = obj.types.map(t => t === 'MOD' ? 'ADJ' : t)
    return obj;
}

module.exports = { solveMOD, solveMISC, prepareMeta }