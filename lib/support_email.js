'use strict';
const http = require('http');
const url = require('url');
const Core = require('./core');
const querystring = require('querystring');
const Config = require('./config');

/**
 * 专门为support邮箱写的发送邮件功能
 * 
 */
function sendEmailForSupport(data, callback) {
    // 发送邮件参数
    const params = formatEmailData(data);
    let resData = '';
    const req = http.get(Config.supportApiHostName + '/sendEmail/sendEmail?' + params, (res) => {
        res.setEncoding('utf8');
        res.on('data', (d) => {
            resData += d;
        });
        res.on('end', () => {
            callback(resData);
        });
        res.on('error', (err) => {
            callback(resData, err);
        });
    });
    // 异常处理
    req.on('error', (e) => {
        Core.flyer.log('调用外部发送邮件接口发生异常：' + e.message);
        callback(resData, e);
    });
    // 关闭链接
    req.end();
}

/**
 * 格式化邮件参数
 * 
 * @param {any} data 原始参数 
 */
function formatEmailData(data) {
    // 发送邮件参数
    const params = querystring.stringify({
        emailTo: data.to || '',
        emailFrom: data.from || '',
        emailSubject: data.subject || '',
        emailText: data.html || '',
        fileUrl: data.attachments.map(function (item) {
            return Config.serviceDomain + '/upload/' + item.md5Name;
        }) || []
    });
    Core.flyer.log('接口参数' + params);
    return params;
}


/**
 * 判断是否是support邮箱
 * 是的话  返回true，否  返回false
 * 
 * @param {any} from 发件人
 */
function checkSupport(from) {
    const supportEmail = ['support.us@aukey.com', 'support.eu@aukey.com', 'support.ca@aukey.com', 'support@aukey.com'];
    return supportEmail.indexOf(from) !== -1;
}

/**
 * 测试邮件发送接口
 * 
 * @param {any} data 
 */
function testSendEmail(data) {
    sendEmailForSupport({
        to: 'keepFur@163.com',
        from: 'support.ca@aukey.com',
        subject: '测试数据',
        text: '测试数据',
        attachment: []
    }, function (res) {
        console.log(res);
    });
}
// testSendEmail();
module.exports = {
    checkSupport,
    sendEmailForSupport
};