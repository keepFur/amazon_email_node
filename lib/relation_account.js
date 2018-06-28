"use strict";
let DB = require("./db"),
    Imap = require('imap'),
    MailParser = require("mailparser").simpleParser,
    fs = require("fs"),
    path = require("path"),
    Other_account = require("./db_other_account"),
    queryData,
    crypto = require('crypto'),
    RelationAccount = function () {
        this.tpl = DB.dbQuery.relationAccount;
        this.index = 0;
    },
    key = new Buffer("aukey-hj-amazon"),
    decipher,
    Core = require("./core");
var j;
RelationAccount.prototype = {
    //获取邮件
    updateOtherEmailAll: function (req, res) {
        var _this = this;
        j = 0;
        decipher = crypto.createDecipher('aes-256-cbc', key);
        DB.dbQuery.otherAccount.selectSingleOther(req.body).then(function (data) {
            if (data.length) {
                new recieveEmail(data[0], res, req.body.pageNumber);
            } else {
                res.send({
                    message: '还没有添加其他邮箱账户'
                });
            }
        }).catch(err => {
            Core.flyer.log('关联单个邮箱账户出现异常：' + err.message);
        });

    },
    justifyAccount: function (data) {
        return new Promise(function (resolve, reject) {
            new connectEmail(data, resolve, reject);
        })
    }
}
//插入数据
function insertRelatedMail(email) {
    return DB.dbQuery.relationAccount.insertRelatedMail(email, queryData)
}
//清除数据
function removeRelatedMail(data) {
    return DB.dbQuery.relationAccount.removeRelatedMail(data);
}
//存储附件
function insertAttach(attach) {
    attach.forEach(function (obj, index) {
        fs.writeFileSync(path.join(__dirname, "../src/upload/", obj.filename || (Core.flyer.getGUID() + '.word')), obj.content, { flag: 'w', encoding: 'utf-8' })
    });
}
//获取单个邮箱邮件
function recieveEmail(email, res, pageNumber) {
    //初始化邮箱对象
    var imap = new Imap({
        user: email.account, //你的邮箱账号
        password: decipher.update(email.password, 'hex', 'utf8') + decipher.final('utf8'), //你的邮箱密码
        host: email.imap || 'imap.exmail.qq.com', //邮箱服务器的主机地址
        port: email.imap_port || 993, //邮箱服务器的端口地址
        tls: true, //使用安全传输协议
        tlsOptions: { rejectUnauthorized: false } //禁用对证书有效性的检查
    });
    imap.emails = [];
    //邮件内容处理
    function openInbox(cb) {
        imap.openBox('INBOX', true, cb);
    }
    //邮箱打开后
    imap.once('ready', function () {
        openInbox(function (err, box) {
            if (err) {
                Core.flyer.log(err);
            }
            removeRelatedMail(email.account).then(function () {
                var todayDate = new Date().toDateString().split(' ');
                var today = todayDate[1] + ' ' + todayDate[2] + ',' + todayDate[3]
                imap.search(['NEW'], function (err, results) {
                    if (err) {
                        Core.flyer.log(err);
                    }
                    if (results.length) {
                        var resultslength = results.length;
                        var showresult = results.slice((results.length - (15 * pageNumber)) >= 0 ? (results.length - (15 * pageNumber)) : 0, results.length - (15 * (pageNumber - 1)));
                        var f = imap.fetch(showresult, { bodies: '' });//抓取邮件（默认情况下邮件服务器的邮件是未读状态）
                        j = 0;
                        f.on('message', function (msg, seqno) {
                            msg.on('body', function (stream, info) {
                                MailParser(stream, (err, mail) => {
                                    //获取当前邮件的所有信息
                                    // 写入数据
                                    var promise = insertRelatedMail(mail);
                                    promise.then(function () {
                                        //判断都已经写入了
                                        if (++j === showresult.length) {
                                            res.send({
                                                total: resultslength
                                            });
                                        }

                                    }, function () {
                                        //判断都已经写入了
                                        if (++j === showresult.length) {
                                            res.send({
                                                total: resultslength
                                            });
                                        }
                                    });
                                    //存入附件
                                    if (mail.attachments && mail.attachments.length) {
                                        insertAttach(mail.attachments);
                                    }
                                })

                            });
                        });
                        f.once('error', function (err) {
                            Core.flyer.log('抓取出现错误: ' + err);
                            res.send('yes');
                        });
                        f.once('end', function (data) {
                            Core.flyer.log(email.account + ':所有邮件抓取完成!');
                            imap.end();
                        });
                    } else {
                        Core.flyer.log('账号:' + imap.user + ',没有未读邮件!');
                        imap.end();
                        res.send({
                            total: 0
                        });
                    }
                });
            }).catch(err => {
                Core.flyer.log('移除关联邮箱出现异常：' + err.message);
            });
        });
    });
    //连接失败
    imap.once('error', function (err) {
        removeRelatedMail(email.account).then(function () {
            Core.flyer.log(err);
            res.send(err.message);
        }).catch(err => {
            Core.flyer.log('移除关联邮箱出现异常：' + err.message);
        });
    });

    //连接登录邮箱
    imap.connect();
}
function connectEmail(email, resolve, reject) {
    //初始化邮箱对象
    var imap = new Imap({
        user: email.account, //你的邮箱账号
        password: email.password, //你的邮箱密码
        host: email.imap || 'imap.qq.com', //邮箱服务器的主机地址
        port: email.imap_port || 993, //邮箱服务器的端口地址
        tls: true, //使用安全传输协议
        tlsOptions: { rejectUnauthorized: false } //禁用对证书有效性的检查
    });
    //邮件内容处理
    function openInbox(cb) {
        imap.openBox('INBOX', true, cb);
    }

    //邮箱打开后
    imap.once('ready', function () {
        openInbox(function (err, box) {
            if (err) {
                resolve(false)
            } else {
                resolve(true)
            }
        })

    });
    //连接失败
    imap.once('error', function (err) {
        resolve(false)
    });
    //连接登录邮箱
    imap.connect();
}
module.exports = RelationAccount;