/*
 * 用于 其它关联邮件的收取邮件 模块功能的数据实现
 */
"use strict";
let Imap = require('imap'),
    inspect = require('util').inspect,
    simpleParser = require('mailparser').simpleParser,
    fs = require('fs'),
    Core = require('./core');

/**
 * 声明一个其它邮箱类
 * 
 * @class OtherReceive
 */
class OtherReceive {
    constructor(pool) {
        this.pool = pool;
    }

    //编写一个收信代码方法
    imapReceive() {

        let imap = new Imap({
            user: 'support.eu@aukey.com',
            password: 'L5SSGxfvkVuGkR7o',
            host: 'imap.exmail.qq.com',
            port: 993,
            tls: true
        });

        function openInBox(cb) {
            imap.openBox('INBOX', true, cb);
        }

        let message = [];

        imap.once('ready', function () {
            openInBox(function (err, box) {
                Core.flyer.log('open');

                if (err) {
                    throw err;
                }

                imap.search(['UNSEEN', ['SINCE', 'Dec 13,2017']], function (err, results) {
                    if (err) {
                        throw err;
                    }
                    if(results && results.length === 0){
                        return
                    }
                    let f = imap.fetch(results, { bodies: '' });

                    f.on('message', function (msg, seqno) {

                        Core.flyer.log('Message #'+seqno);
                        let prefix = '(#' + seqno + ') ';

                       
                        msg.on('body', function (stream, info) {
                            let buffer = '';
                            stream.on('data', function(chunk) {
                              buffer += chunk.toString('utf8');
                            });
                            stream.once('end', function() {
                                Core.flyer.log((prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer))));
                                simpleParser(buffer,(err,mail)=>{
                                    Core.flyer.log(JSON.stringify(mail));
                                });
                            });
                           
                        });

                        msg.once('end', function () {
                            Core.flyer.log(seqno + 'Finished.');
                        });
                    });

                    f.once('error', function (err) {
                        Core.flyer.log('Fetch error: ' + err);
                    });

                    f.once('end', function () {
                        Core.flyer.log('Done fetching all messages!');
                        imap.end();
                    });
                });
            });
        });

        imap.once('error', function (err) {
            Core.flyer.log(err);
        });

        imap.once('end', function () {
            Core.flyer.log('Connection ended');
        });

        imap.connect();
    }
}

module.exports = OtherReceive;
