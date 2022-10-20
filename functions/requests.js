const https =  require('https');
const http = require('http');

function createRequestPromise(options, unsafe){
    /*
    options come from http and https request:
        host: webpage URL (without http and https)
        port: PORT, can be undefined
        path: subpath for the URL
        method: GET/POST/PUT/DELETE
    */
    var requester;
    if(unsafe) requester = http;
    else requester = https;
    return new Promise((resolve) => {
        const req = requester.request(options, 
            (response) => {
            var str = '';
            
            //another chunk of data has been received, so append it to `str`
            response.on('data', function (chunk) {
                str += chunk;
            });
    
            //the whole response has been received, so we just print it out here
            response.on('end', function () {
                resolve(str)
            });
        }).end(JSON.stringify(options.body), 'utf-8');
    })
}

module.exports = { createRequestPromise }