"use strict";

const fs = require('fs');
const Core = require('./core');
var DOMAIN = 'aukey.com';
var mailgun = require('mailgun-js')({ apiKey: "key-78mhse86jrhi-89bwhxelfe-lzcgfkc1", domain: DOMAIN });

mailgun.get(`/${DOMAIN}/events`, { "begin": "12 May 2018 00:00:00 -0000", "end": '18 May 2018 09:00:00 -0000', "ascending": "yes", "event": 'failed', "limit": 300 }, function (error, body) {
    if (error) {
        console.log(error);
        return;
    }

    // console.log(body.items.length);
    let tos = [], filters = [], eu = [], us = [], ca = [], support = [], times = [];
    body.items.forEach(element => {
        if (tos.indexOf(element.message.headers.to) === -1) {
            tos.push(element.message.headers.to);
            // filters.push(element);
            switch (element.message.headers.from) {
                case 'support.eu@aukey.com':
                    eu.push(element);
                    break;
                case 'support@aukey.com':
                    support.push(element);
                    break;
                case 'support.ca@aukey.com':
                    ca.push(element);
                    break;
                case 'support.us@aukey.com':
                    us.push(element);
                    break;
            }
            times.push(getDate(element.message.headers['message-id']));
        }

    });

    console.log(us.length);
    console.log(support.length);
    console.log(eu.length);
    console.log(ca.length);
    filters = us.concat(ca).concat(eu).concat(support);
    filters.forEach(element => {
        console.log('    收件人   ' + element.message.headers.to + '    发件人   ' + element.message.headers.from + '   发送时间    ' + getDate(element.message.headers['message-id']) + '   主题    ' + element.message.headers.subject);
    });
    console.log(filters.length);
    // times.sort(function (a, b) {
    //     return a > b;
    // });
    // console.log(times);
});


function getDate(string) {
    return string.substr(0, 4) + '-' + string.substr(4, 2) + '-' + string.substr(6, 2) + ' ' + string.substr(8, 2) + ':' + string.substr(10, 2);
}