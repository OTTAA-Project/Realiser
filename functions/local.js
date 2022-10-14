const functions = require('firebase-functions');

const app = require('./routing.js');

/////////////////
///// LOCAL /////
/////////////////

const PORT = 9090;
app.listen(PORT, () => console.log(`Realiser up locally on http://localhost:${PORT}`))