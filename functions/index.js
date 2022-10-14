const functions = require('firebase-functions');

const app = require('./routing.js');

exports.realiser = functions.https.onRequest(app);