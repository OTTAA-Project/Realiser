const expect = require('chai').expect

describe('Testing prepare NOUN methods', () => {
    before(() => {
        const { getDbRef } = require('../getter.js')
        this.langRef = getDbRef().database().ref('es')
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

describe('Testing prepare SUBJ methods', async () => {
    before(() => {
        const { getDbRef } = require('../getter.js')
        this.langRef = getDbRef().database().ref('es')
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
        const { getDbRef } = require('../getter.js')
        this.langRef = getDbRef().database().ref('es')
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

//MISSING SOLVE MISC BUT MUST DEFINITIVES MISC ARE NOT DONE YET