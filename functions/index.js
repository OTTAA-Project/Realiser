const functions = require('firebase-functions');

const app = require('./routing.js');

exports.realiser = functions.https.onRequest(app);

/////////////////
///// LOCAL /////
/////////////////

const PORT = 9090;
app.listen(PORT, () => console.log(`Realiser up locally on http://localhost:${PORT}`))