const expect = require('chai').expect;

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

//For now only SUBJ and VERB are important because ADJ and ADV have mostly no function and NOUN is basically the same as SUBJ