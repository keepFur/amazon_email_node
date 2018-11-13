var querystring = require('querystring');
var http = require('http');
module.exports = function (filePath, callback) {
    const postData = querystring.stringify({
        // filePath: filePath || '/root/test.csv'
        // filePath: '/root/jd.xlsx' // 0
        // filePath: '/root/tb.csv' // 0
        // filePath: '/root/pdd.csv' // 1
        filePath: '/root/tb.xlsx' // 
    });
    const options = {
        hostname: '60.205.201.95',
        port: 8111,
        path: '/parseFile',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    const req = http.request(options, (res) => {
        var data = '';
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
            data = data + chunk;
        });
        res.on('end', () => {
            console.log('No more data in response.');
            callback(null, data);
        });
    });
    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        callback(e, []);
    });
    console.log(req);
    req.write(postData);
    req.end();
};