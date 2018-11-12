module.exports = function (filePath, callback) {
    const postData = querystring.stringify({
        filePath: this.filePath || '/root/test.csv'
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
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });
    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    console.log(req);
    req.write(postData);
    req.end();
};