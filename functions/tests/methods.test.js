const expect = require('chai').expect

////////////////////////////
/////// MAIN METHODS ///////
////////////////////////////

describe('Testing Prepare Sentence', () => {
    before(() => {
        this.prepareSentence = require('../methods.js').prepareSentence;
        
        const testObj = {
            words: ['yo', 'el abuelo', 'estar', 'ir a', 'mi', 'casa', 'linda', 'ahora'],
            types: ['SUBJ', 'SUBJ', 'VERB', 'VERB', 'PREP', 'NOUN', 'MOD', 'MISC'],
            language: 'es',
            props: {}
        }

        this.resultObj = this.prepareSentence(
            testObj.words,
            testObj.types,
            testObj.props,
            testObj.language
            )
    })

    it('Should join words/wordtypes and detect undefined types', async () => {
        const thisResult = await this.resultObj;
        expect(thisResult.length).to.equal(5)
        expect(thisResult[0].type).to.equal('SUBJ')
        expect(thisResult[1].type).to.equal('VERB')
        expect(thisResult[2].type).to.equal('OBJ')
        expect(thisResult[3].type).to.equal('ADJ')
        expect(thisResult[4].type).to.equal('ADV')
    })

    it('Should split definitives', async () => {
        const thisResult = await this.resultObj;
        expect(thisResult[0].types).to.include('ART')
        expect(thisResult[2].types).to.include('PREP')
    })

    it('Should manage SUBJ metadata (GENDER/PERSON)', async () => {
        const thisResult = await this.resultObj;
        expect(thisResult[0].meta.PERSON).to.equal('nosotros')
        expect(thisResult[0].meta.GENDER).to.equal('ellos')
    })

    it('Should manage ADV metadata (TIME)', async () => {
        const thisResult = await this.resultObj;
        expect(thisResult[4].meta.TIME).to.equal('presente')
    })
})

////////////////////////////
///////   PREPARES   ///////
////////////////////////////

describe('Testing prepare NOUN methods', () => {
    before(() => {
        const { getApp } = require('../getter.js')
        this.langRef = getApp().database().ref('es')
        this.prepareMeta = require('../prepares.js').prepareMeta;
    })

    it('Should split words in definitive MISC', async () => {
        const testObj = {
            words: ['casa de un amigo'],
            types: ['NOUN'],
            type: 'NOUN',
            props: {},
            meta: {},
            composed: true
        }
        
        const resultObj = await this.prepareMeta(testObj, this.langRef)
        expect(resultObj.words.length).to.eql(4)
        expect(resultObj.types.length).to.eql(4)
        expect(resultObj.types).to.include('NOUN')
        expect(resultObj.types).to.include('PREP')
        expect(resultObj.types).to.include('ART')
    })

    it('Should mark NOUN type as SUBJ for later processing', async () => {
        const testObj = {
            words: ['casa de un amigo'],
            types: ['NOUN'],
            type: 'NOUN',
            props: {},
            meta: {},
            composed: true
        }
        
        this.prepareMeta(testObj, this.langRef)
        .then((resultObj) => {  
            expect(resultObj.type).to.equal('SUBJ')
        })
    })

    it('Should properly detect/define gender', async () => {
        const testObj = {
            words: ['abuelo', 'y', 'mamá'],
            types: ['NOUN', 'CON', 'NOUN'],
            type: 'NOUN',
            props: {},
            meta: {},
            composed: true
        }
        
        const resultObj = await this.prepareMeta(testObj, this.langRef)
        expect(resultObj.meta.PERSON).to.equal('ellos')
        expect(resultObj.meta.GENDER).to.equal('ellos')
        expect(resultObj.genders).to.eql(['él', 'ella'])
    })
})

describe('Testing prepare SUBJ methods', () => {
    before(() => {
        const { getApp } = require('../getter.js')
        this.langRef = getApp().database().ref('es')
        this.prepareMeta = require('../prepares.js').prepareMeta;
    })

    it('Should manage gender', async () => {
        const testObj = {
            words: ['yo', 'vos', 'mamá', 'y', 'ella'],
            types: ['SUBJ', 'SUBJ', 'SUBJ', 'CON', 'SUBJ'],
            type: 'SUBJ',
            props: {
                0: {
                    gender: 'él'
                },
                1: {
                    gender: 'ella'
                }
            },
            meta: {},
            composed: true
        }
        
        var resultObj;
        //Should properly detect/define gender
        resultObj = await this.prepareMeta(testObj, this.langRef)
        expect(resultObj.meta.PERSON).to.equal('nosotros')
        expect(resultObj.meta.GENDER).to.equal('ellos')
        expect(resultObj.genders).to.eql(['él', 'ella', 'ella', 'ella']) //eql is deep equality
        
        testObj.props['0'].gender = 'ella'
        //Should use plural feminines if all genders are feminine'
        resultObj = await this.prepareMeta(testObj, this.langRef)
        expect(resultObj.meta.PERSON).to.equal('nosotros')
        expect(resultObj.meta.GENDER).to.equal('ellas')
        expect(resultObj.genders).to.eql(['ella', 'ella', 'ella', 'ella']) //eql is deep equality
    })
})

describe('Testing prepare ADV methods', async () => {
    before(() => {
        const { getApp } = require('../getter.js')
        this.langRef = getApp().database().ref('es')
        this.prepareMeta = require('../prepares.js').prepareMeta;
    })

    it('Should detect adverbial TIME', async () => {
        const testObj = {
            words: ['antes'],
            types: ['ADV'],
            type: 'ADV',
            props: {},
            meta: {},
            composed: true
        }

        const resultObj = await this.prepareMeta(testObj, this.langRef)
        expect(resultObj.meta.TIME).to.equal('pasado')
    })

    it('Should transform MOD into ADV', async () => {
        const testObj = {
            words: ['después'],
            types: ['MOD'],
            type: 'ADV',
            props: {},
            meta: {},
            composed: true
        }
        
        const resultObj = await this.prepareMeta(testObj, this.langRef)
        expect(resultObj.meta.TIME).to.equal('futuro')
        expect(resultObj.types).not.to.include('MOD')
        expect(resultObj.types).to.include('ADV')
    })
})

//HERE: MISSING SOLVE MISC BUT MUST DEFINITIVES MISC ARE NOT DONE YET

////////////////////////////
/////// DEPENDENCIES ///////
////////////////////////////

describe('Test Dependencies', () => {
    before(() => {
        this.isDependant = require('../dependencies.js').isDependant;
        this.isHeadOf = {
            "PARENT": {
                "CHILD_SING": "SING:",
                "CHILD_MULT": "MULT:",
                "CHILD_MULT_UNID": "MULT:UNID",
                "CHILD_MULT_LEFT": "MULT:LEFT",
                "CHILD_MULT_RIGHT": "MULT:RIGHT"
            }
        }
    })

    it('Should only get one dependant if SING', () => {
        const child = {type: 'CHILD_SING', position: 0, children: []}
        const parent = {type: 'PARENT', position: 1, children: []}

        expect(this.isDependant(child, parent, this.isHeadOf)).true
        
        //add a children with the same name
        parent.children.push({type: 'CHILD_SING', position: 2})

        expect(this.isDependant(child, parent, this.isHeadOf)).false
    })
    
    it('Should get many dependants if MULT', () => {
        const child = {type: 'CHILD_MULT', position: 0, children: []}
        const parent = {type: 'PARENT', position: 1, children: []}

        expect(this.isDependant(child, parent, this.isHeadOf)).true
        
        //add a children with the same name
        parent.children.push({type: 'CHILD_MULT', position: 2})

        expect(this.isDependant(child, parent, this.isHeadOf)).true
    })

    it('Should only get dependants on one side if MULT:UNID', () => {
        const child = {type: 'CHILD_MULT_UNID', position: 0, children: []}
        const parent = {type: 'PARENT', position: 2, children: []}

        expect(this.isDependant(child, parent, this.isHeadOf)).true
        
        //add a children with the same name on the same direction
        parent.children.push({type: 'CHILD_MULT_UNID', position: 1})

        expect(this.isDependant(child, parent, this.isHeadOf)).true
        
        //clear children
        parent.children.length = 0
        //add a children with the same name on a different direction
        parent.children.push({type: 'CHILD_MULT_UNID', position: 3})

        expect(this.isDependant(child, parent, this.isHeadOf)).false
    })

    it('Should only get dependants on the left if MULT:RIGHT (because RIGHT refers to the position of the HEAD)', () => {
        const child = {type: 'CHILD_MULT_RIGHT', position: 0, children: []}
        const parent = {type: 'PARENT', position: 2, children: []}

        expect(this.isDependant(child, parent, this.isHeadOf)).true
        
        //add a children with the same name to the left
        parent.children.push({type: 'CHILD_MULT_RIGHT', position: 1})

        expect(this.isDependant(child, parent, this.isHeadOf)).true

        //change child position to the right
        child.position = 3
        expect(this.isDependant(child, parent, this.isHeadOf)).false
    })

    it('Should only get dependants on the left if MULT:LEFT (because RIGHT refers to the position of the HEAD)', () => {
        const child = {type: 'CHILD_MULT_LEFT', position: 2, children: []}
        const parent = {type: 'PARENT', position: 1, children: []}

        expect(this.isDependant(child, parent, this.isHeadOf)).true
        
        //add a children with the same name to the right
        parent.children.push({type: 'CHILD_LEFT', position: 3})

        expect(this.isDependant(child, parent, this.isHeadOf)).true

        //change child position to the left
        child.position = 0
        expect(this.isDependant(child, parent, this.isHeadOf)).false
    })
})

////////////////////////////
///////   HANDLERS   ///////
////////////////////////////

describe('Test VERB handlers', () => {
    before(() => {
        const { getApp } = require('../getter.js')
        this.langRef = getApp().database().ref('es')
        this.handleType = require('../handlers.js').handleType
    })

    it('Should get TIME metadata from ADV children (and PERSON be default)', async () => {
        const testObj = [
            {
                words: ['hacer'],
                types: ['VERB'],
                type: 'VERB',
                position: 0,
                children: [
                    {position: 1, type: 'ADV'}
                ],
                meta: {},
                composed: false,
                props: {}
            },
            {
                words: ['hoy'],
                types: ['ADV'],
                type: 'ADV',
                position: 1,
                children: [],
                meta: {TIME: 'presente'},
                composed: false,
                props: {}
            }
        ]
        const resultObj = await this.handleType(testObj[0], testObj, this.langRef, 'static', {})
        expect(resultObj.meta.TIME).to.equal(testObj[1].meta.TIME)
        expect(resultObj.meta.PERSON).to.equal('él') //default PERSON HERE: should generalize this
    })

    it('Should get PERSON metadata from SUBJ children (and PERSON be default)', async () => {
        const testObj = [
            {
                words: ['hacer'],
                types: ['VERB'],
                type: 'VERB',
                position: 0,
                children: [
                    {position: 1, type: 'SUBJ'}
                ],
                meta: {},
                composed: false,
                props: {}
            },
            {
                words: ['yo'],
                types: ['SUBJ'],
                type: 'SUBJ',
                position: 1,
                children: [],
                meta: {PERSON: 'yo'},
                composed: false,
                props: {}
            }
        ]
        const resultObj = await this.handleType(testObj[0], testObj, this.langRef, 'static', {})
        expect(resultObj.meta.PERSON).to.equal(testObj[1].meta.PERSON)
        expect(resultObj.meta.TIME).to.equal('presente') //default TIME HERE: should generalize this
    })

    it('Should get metadata from ADV and SUBJ children simultaneously', async () => {
        const testObj = [
            {
                words: ['yo'],
                types: ['SUBJ'],
                type: 'SUBJ',
                position: 0,
                children: [],
                meta: {PERSON: 'yo'},
                composed: false,
                props: {}
            },
            {
                words: ['hacer'],
                types: ['VERB'],
                type: 'VERB',
                position: 1,
                children: [
                    {position: 0, type: 'SUBJ'},
                    {position: 2, type: 'ADV'}
                ],
                meta: {},
                composed: false,
                props: {}
            },
            {
                words: ['hoy'],
                types: ['ADV'],
                type: 'ADV',
                position: 2,
                children: [],
                meta: {TIME: 'presente'},
                composed: false,
                props: {}
            }
        ]
        const resultObj = await this.handleType(testObj[1], testObj, this.langRef, 'static', {})
        expect(resultObj.meta.PERSON).to.equal(testObj[0].meta.PERSON)
        expect(resultObj.meta.TIME).to.equal(testObj[2].meta.TIME)
    })

    it('Should handle forcing TIME and PERSON', async () => {
        const testObj = [
            {
                words: ['hacer'],
                types: ['VERB'],
                type: 'VERB',
                position: 0,
                children: [],
                meta: {},
                composed: false,
                props: {}
            }
        ]
        const forces = {PERSON: 'él', TIME: 'pasado'}
        const resultObj = await this.handleType(testObj[0], testObj, this.langRef, 'static', forces)
        expect(resultObj.meta.PERSON).to.equal(forces.PERSON)
        expect(resultObj.meta.TIME).to.equal(forces.TIME)
    })
})

describe('Test SUBJ handlers', () => {

})

//HERE: For now only SUBJ and VERB are important because ADJ and ADV have mostly no function and NOUN is basically the same as SUBJ
