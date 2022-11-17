const functions = require('firebase-functions');

require('dotenv').config()

const app = require('./routing.js');

exports.realiser = functions.https.onRequest(app);