const qnas = require('./qna.js');
const { createRequestPromise } = require('../functions/requests.js');

for (let i=0; i<qnas.length; i++){
    createRequestPromise({
        host: 'us-central1-ottaaproject-flutter.cloudfunctions.net',
        path: '/realiser/replicate',
        method: 'POST',
        body: qnas[i].question
    }, false)
    .then(result => {
        console.log(i, '\n', qnas[i].answer, '\n', result, '\n')
    })
}