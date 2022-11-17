const expect = require('chai').expect
const app = require('../routing.js')

const request = require('supertest')(app)

////////////////////////////
///////   PREPARES   ///////
////////////////////////////

describe('POST/prepare endpoint', () => {
    describe('response', () => {
        before(() => {
            this.testObj = {
                words: ['yo', 'el abuelo', 'estar', 'ir a', 'mi', 'casa', 'linda', 'ahora'],
                types: ['SUBJ', 'SUBJ', 'VERB', 'VERB', 'PREP', 'NOUN', 'MOD', 'MISC'],
                language: 'es',
                props: {}
            }

            this.response = request.post('/prepare').send(this.testObj)
        })

        it('Should return a correct status and an array in sentence', async () => {
            const res = await this.response;
            expect(res.status).to.equal(200);
            expect(res.body).to.include.keys('sentence');
            expect(res.body.sentence.length).to.exist;
        })
    })
    describe('error', () => {
        it('Should return status 400 if words and types have different length', async () => {
            const res = await request.post('/prepare').send({
                words: ['hola', 'tener', 'sueño'],
                types: ['VERB', 'NOUN'],
                language: 'es',
                props: {}
            })
            expect(res.status).to.equal(400);
            expect(res.body).to.include.keys('error');
        })
        it('Should return status 500 if words a key has an improper value', async () => {
            const res = await request.post('/prepare').send({
                words: 'hola',
                types: ['VERB', 'NOUN'],
                language: 'es',
                props: {}
            })
            expect(res.status).to.equal(500);
            expect(res.body).to.include.keys('error');
        })
    })
})

////////////////////////////
///////    PARSE     ///////
////////////////////////////

describe('POST/parse endpoint', () => {
    describe('response', () => {
        before(() => {
            this.testObj = {
                words: ['yo', 'el abuelo', 'estar', 'ir a', 'mi', 'casa', 'linda', 'ahora'],
                types: ['SUBJ', 'SUBJ', 'VERB', 'VERB', 'PREP', 'NOUN', 'MOD', 'MISC'],
                language: 'es',
                props: {}
            }

            this.response = request.post('/parse').send(this.testObj)
        })

        it('Should return a correct status and an array in sentence', async () => {
            const res = await this.response;
            expect(res.status).to.equal(200);
            expect(res.body).to.include.keys('sentence');
            expect(res.body.sentence.length).to.exist;
        })
    })
    describe('error', () => {
        it('Should return status 400 if words and types have different length', async () => {
            const res = await request.post('/prepare').send({
                words: ['hola', 'tener', 'sueño'],
                types: ['VERB', 'NOUN'],
                language: 'es',
                props: {}
            })
            expect(res.status).to.equal(400);
            expect(res.body).to.include.keys('error');
        })
        it('Should return status 500 if words a key has an improper value', async () => {
            const res = await request.post('/prepare').send({
                words: 'hola',
                types: ['VERB', 'NOUN'],
                language: 'es',
                props: {}
            })
            expect(res.status).to.equal(500);
            expect(res.body).to.include.keys('error');
        })
    })
})

////////////////////////////
///////  DEPENDATE   ///////
////////////////////////////

describe('POST/process endpoint', () => {
    describe('response', () => {
        before(() => {
            this.testObj = {
                words: ['yo', 'el abuelo', 'estar', 'ir a', 'mi', 'casa', 'linda', 'ahora'],
                types: ['SUBJ', 'SUBJ', 'VERB', 'VERB', 'PREP', 'NOUN', 'MOD', 'MISC'],
                language: 'es',
                props: {}
            }

            this.response = request.post('/process').send(this.testObj)
        })

        it('Should return a correct status and an array in sentence', async () => {
            const res = await this.response;
            expect(res.status).to.equal(200);
            expect(res.body).to.include.keys('sentence');
            expect(res.body.sentence.length).to.exist;
        })
    })
    describe('error', () => {
        it('Should return status 400 if words and types have different length', async () => {
            const res = await request.post('/prepare').send({
                words: ['hola', 'tener', 'sueño'],
                types: ['VERB', 'NOUN'],
                language: 'es',
                props: {}
            })
            expect(res.status).to.equal(400);
            expect(res.body).to.include.keys('error');
        })
        it('Should return status 500 if words a key has an improper value', async () => {
            const res = await request.post('/prepare').send({
                words: 'hola',
                types: ['VERB', 'NOUN'],
                language: 'es',
                props: {}
            })
            expect(res.status).to.equal(500);
            expect(res.body).to.include.keys('error');
        })
    })
})

////////////////////////////
///////   REALISE    ///////
////////////////////////////

describe('POST/realise endpoint', () => {
    describe('response', () => {
        before(() => {
            this.testObj = {
                words: ['yo', 'el abuelo', 'estar', 'ir a', 'mi', 'casa', 'linda', 'ahora'],
                types: ['SUBJ', 'SUBJ', 'VERB', 'VERB', 'PREP', 'NOUN', 'MOD', 'MISC'],
                language: 'es',
                props: {}
            }

            this.response = request.post('/realise').send(this.testObj)
        })

        it('Should return a correct status and an array in sentence', async () => {
            const res = await this.response;
            expect(res.status).to.equal(200);
            expect(res.body).to.include.keys('sentence');
            expect(res.body.sentence.length).to.exist;
        })
    })
    describe('error', () => {
        it('Should return status 400 if words and types have different length', async () => {
            const res = await request.post('/prepare').send({
                words: ['hola', 'tener', 'sueño'],
                types: ['VERB', 'NOUN'],
                language: 'es',
                props: {}
            })
            expect(res.status).to.equal(400);
            expect(res.body).to.include.keys('error');
        })
        it('Should return status 500 if words a key has an improper value', async () => {
            const res = await request.post('/prepare').send({
                words: 'hola',
                types: ['VERB', 'NOUN'],
                language: 'es',
                props: {}
            })
            expect(res.status).to.equal(500);
            expect(res.body).to.include.keys('error');
        })
    })
})

////////////////////////////
///////   REPLICATE  ///////
////////////////////////////

describe('POST/replicate endpoint', () => {
    describe('response', () => {
        before(() => {
            this.testObj = {
                words: ['yo', 'el abuelo', 'estar', 'ir a', 'mi', 'casa', 'linda', 'ahora'],
                types: ['SUBJ', 'SUBJ', 'VERB', 'VERB', 'PREP', 'NOUN', 'MOD', 'MISC'],
                language: 'es',
                props: {}
            }

            this.response = request.post('/replicate').send(this.testObj)
        })

        it('Should replicate the request object', async () => {
            const res = await this.response;
            expect(res.status).to.equal(200)
            expect(res.body).to.include.keys(Object.keys(this.testObj))
            expect(res.body.words).to.eql(this.testObj.words)
            expect(res.body.types).to.eql(this.testObj.types)
            expect(res.body.language).to.eql(this.testObj.language)
            expect(res.body.props).to.eql(this.testObj.props)
        })
    })
})