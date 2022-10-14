const express = require('express');
const { error } = require("firebase-functions/lib/logger");

const { 
    addLexiconData, 
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

app.get('/', (req, res) => res.send('Welcome to the coolest Realiser!'))

app.post('/lexicon', allowCors, (req, res) => {
    if (!req.body.path || !req.body.data) res.status(400).json({err: 'Properties path and data required in the POST body to achieve adding data to lexicon'})
    else {
        addLexiconData(req.body.path, req.body.data)
        .then(result => res.status(201).json({success: result}))
        .catch(err => res.status(err.cause||500).json({err: err.message}))
    }
})

app.post('/', allowCors, (req, res) => {
    const body = req.body;
    if (!body.words || !body.types) {
        res.status(400).send({err: 'Wrong request body, missing properties words and/or types'})
        return;
    }
    prepareSentence(body.words, body.types, body.props || {}, body.language || 'en')
    .then(prepared => parseDependencies(prepared, [], body.language || 'en'))
    .then(([parsed, headless]) => handleSentence(parsed, body.language || 'en'))
    .then(handled => res.status(200).json({sentence: handled}))
    .catch((err) => {
        error(`Error at parsing: ${err.message}`);
        res.status(err.cause||500).json({error: err.message});
    })
})

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
    if (!body.sentence) {
        res.status(400).send({err: 'Wrong request body, missing property sentence'})
        return;
    }
    parseDependencies(body.sentence, [])
    .then((parsed, headless) => res.status(200).json({parsed, headless}))
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
    prepareSentence(body.words, body.types, body.props || {}, body.language || 'en')
    .then(prepared => parseDependencies(prepared, [], body.language || 'en'))
    .then(([parsed, headless]) => handleSentence(parsed, body.language || 'en'))
    .then(handled => realiseSentence(handled, body.language || 'en'))
    .then(realised => res.status(200).json({sentence: realised}))
    .catch((err) => {
        error(`Error at parsing: ${err.message}`);
        res.status(err.cause||500).json({error: err.message});
    })
})

module.exports = app;