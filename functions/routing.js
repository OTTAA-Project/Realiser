const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./docs/swagger.config.json')
const { log, error } = require("firebase-functions/lib/logger");

const { 
    prepareSentence, 
    parseDependencies, 
    handleSentence, 
    realiseSentence 
} = require('./methods.js');

function allowCors(req, res, next){
    res.set('Access-Control-Allow-Origin', '*'); //this should be configured for only the apps we want to be able to access the API

    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    } else {
        next();
    }
}

const app = express()

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname)); //swagger customCssUrl requires defining an static path on functions (root)
app.use(
    '/docs',
    allowCors,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, {
        customCssUrl: '/assets/swagger.css',
        customSiteTitle: 'OTTAA Realiser Docs',
        customfavIcon: '/assets/logo.ico',
        swaggerOptions: {
            supportedSubmitMethods: [] //to disable the "Try it out" button
        }
    })
)

app.get('/', (req, res) => res.send('Welcome to the coolest Realiser!'))

app.post('/prepare', allowCors, (req, res) => {
    const body = req.body;
    if (!body.words || !body.types) {
        res.status(400).send({err: 'Wrong request body, missing properties words and/or types'})
        return;
    }
    prepareSentence(body.words, body.types, body.props || {}, body.language || 'en')
    .then(prepared => res.status(200).json({sentence: prepared}))
    .catch((err) => {
        error(`Error at preparing: ${err.message}`);
        res.status(err.cause||500).json({error: err.message});
    })
})

app.post('/parse', allowCors, (req, res) => {
    const body = req.body;
    if (!body.words || !body.types) {
        res.status(400).send({err: 'Wrong request body, missing properties words and/or types'})
        return;
    }
    const forces = {...req.query}
    prepareSentence(body.words, body.types, body.props || {}, body.language || 'en')
    .then(prepared => parseDependencies(prepared, [], body.language || 'en'))
    .then((sentence, headless) => res.status(200).json({sentence, headless}))
    .catch((err) => {
        error(`Error at parsing: ${err.message}`);
        res.status(err.cause||500).json({error: err.message});
    })
})

app.post('/dependate', allowCors, (req, res) => {
    const body = req.body;
    if (!body.words || !body.types) {
        res.status(400).send({err: 'Wrong request body, missing properties words and/or types'})
        return;
    }
    const forces = {...req.query}
    prepareSentence(body.words, body.types, body.props || {}, body.language || 'en')
    .then(prepared => parseDependencies(prepared, [], body.language || 'en'))
    .then(([parsed, headless]) => handleSentence(parsed, body.language || 'en', forces))
    .then(handled => res.status(200).json({sentence: handled}))
    .catch((err) => {
        error(`Error at parsing: ${err.message}`);
        res.status(err.cause||500).json({error: err.message});
    })
})

app.post('/realise', allowCors, (req, res) => {
    const body = req.body;
    if (!body.words || !body.types) {
        res.status(400).send({err: 'Wrong request body, missing properties words and/or types'})
        return;
    }
    const forces = {...req.query}
    prepareSentence(body.words, body.types, body.props || {}, body.language || 'en')
    .then(prepared => parseDependencies(prepared, [], body.language || 'en'))
    .then(([parsed, headless]) => handleSentence(parsed, body.language || 'en', forces))
    .then(handled => realiseSentence(handled, body.language || 'en'))
    .then(realised => res.status(200).json({sentence: realised}))
    .catch((err) => {
        error(`Error at parsing: ${err.message}`);
        res.status(err.cause||500).json({error: err.message});
    })
})

app.post('/replicate', allowCors, (req, res) => {
    res.status(200).json(req.body)
})

module.exports = app;