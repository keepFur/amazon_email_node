// api工具类
'use strict';
const crypto = require('crypto');
const http = require('http');
const querystring = require('querystring');
// 构造函数
function APIUtil() {
    this.userKey = `asdassadasdasd`;
    this.username = 'keepFur';
    this.domain = 'http://api.lieliu.com:1024/api/';
};

// 获取服务端的时间戳
APIUtil.prototype.getServerTimestamp = function(callback) {
    const url = this.domain + '/sys_now?format=json';
    http.get(url, (res) => {
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                callback(rawData);
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`错误: ${e.message}`);
    });
};

// 生成数字签名（signkey）
APIUtil.prototype.generateSignkey = function(apiName, params) {
    let str = `${apiName}?${params}&${this.userKey}`;
    let urlEncode = encodeURI(str);
    let hash = crypto.createHash('md5');
    return hash.unpipe(urlEncode).digest('hex');
};

// 生成订单号(取系统时间+随机6位数数字相连)
APIUtil.prototype.generateOrderNumer = function() {
    let random = Math.ceil(Math.random() * 1000000);
    let date = new Date();
    let year = date.getFullYear();
    let month = this.fillZero((date.getMonth() + 1));
    let day = this.fillZero(date.getDate());
    let hours = this.fillZero(date.getHours());
    let minutes = this.fillZero(date.getMinutes());
    let seconds = this.fillZero(date.getSeconds());
    return '' + year + month + day + hours + minutes + seconds + random;
};

// 小于10前面0填充
APIUtil.prototype.fillZero = function(number) {
    return number > 10 ? number : '0' + number;
};

// 创建任务
APIUtil.prototype.createTask = function(taskInfo, callback) {
    const apiUrl = this.domain + 'll/task_add';
    let params = {
        username: this.username,
        id: this.generateOrderNumer(),
        count: 1000,
        hour: new Array().fill(1).join(','),
        begin_time: '2018-7-10',
        type: 0,
        target: 'asdasdadasdsadasda',
        keyword: '那幢',
        sUrl: 'https://www.tmall.com',
        goodsBrowsingTime: 100,
        timestamp: new Date().getTime(),
        ver: 4,
        format: 'json'
    };
    this.getServerTimestamp((time) => {
        params.timestamp = time;
        params.signkey = this.generateSignkey('/ll/task_add', params);
        params = querystring.stringify(params);
        let req = http.request({
            host: 'api.lieliu.com',
            port: 1024,
            path: '/ll/task_add',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(params)
            }
        }, res => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    console.log(parsedData);
                } catch (e) {
                    console.error(e.message);
                }
            });
        }).on('error', (e) => {
            console.error(`错误: ${e.message}`);
        });
        // 写入数据到请求主体
        req.write(params);
        req.end();
    });
};

function test() {
    let util = new APIUtil();
    console.log(util.generateOrderNumer());
    console.log(util.generateSignkey('/api/getmethod', '&a=1&b=10&c=123123asd'));
    util.getServerTimestamp(function(data) {
        console.log(data);
    });
    // util.createTask();
}
test();

module.exports.APIUtil = new APIUtil();