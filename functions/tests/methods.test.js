const expect = require('chai').expect

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