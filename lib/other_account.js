"use strict";
let DB = require("./db"),
    Core = require('./core'),
    crypto = require('crypto'),
    key = new Buffer("aukey-hj-amazon"),
    decipher,
    relation_account = require("./relation_account"),
    OtherAccount = function () {

    };
//写入数据
OtherAccount.prototype.addInsert = function (req, res, next) {
    //判断邮箱格式是否是符合要求的
    var Relation_account = new relation_account();
    Relation_account.justifyAccount(req.body).then(function (data) {
        if (data) {
            //账号信息正常
            DB.dbQuery.otherAccount.addInsert(req.body).then(function (data) {
                res.send(data);
            }, function (err) {
                res.send(err);
            });
        } else {
            //信息异常
            res.send({
                message: 'err'
            })
        }
    }).catch(err => {
        res.send([]);
        Core.flyer.log('判断邮箱格式是否是符合要求出错：' + err.message + '，时间：' + new Date());
    });
};
//判断数据是否存在
OtherAccount.prototype.justifyCount = function (req, res, next) {
    DB.dbQuery.otherAccount.justifyCount(req.body).then(function (data) {
        res.send({
            count: data[0]['count']
        });
    }, function (err) {
        res.send({
            count: 1
        });
        Core.flyer.log('判断数据是否存在出错：' + err.message + '，时间：' + new Date());
    });
};
//修改数据
OtherAccount.prototype.update = function (req, res, next) {
    var Relation_account = new relation_account();
    //对传送过来的密码需要进行转码
    Relation_account.justifyAccount(req.body).then(function (data) {
        if (data) {
            DB.dbQuery.otherAccount.update(req.body).then(function (data) {
                res.send({
                    data: data,
                    success: true,
                    message: ''
                });
            }, function (err) {
                Core.flyer.log('更新账户信息出错：' + err.message + '，时间：' + new Date());
                res.send(err);
            });
        } else {
            res.send({
                success: false,
                message: '账号信息不匹配'
            });
        }
    }).catch(err => {
        res.send({
            success: false,
            message: '账号信息不匹配'
        });
        Core.flyer.log('判断数据是否存在出错：' + err.message + '，时间：' + new Date());
    });
};
//删除数据
OtherAccount.prototype.delete = function (req, res, next) {
    DB.dbQuery.otherAccount.updateStatus(req.query).then(function () {
        DB.dbQuery.otherAccount.delete(req.query).then(function (data) {
            res.send(data);
        }, function (err) {
            res.send(err);
        });
    }).catch(err => {
        res.send(err);
        Core.flyer.log('更新账户状态出错：' + err.message + '，时间：' + new Date());
    });
};
//查询
OtherAccount.prototype.select = function (req, res, next) {
    DB.dbQuery.otherAccount.select(req).then(function (data) {
        var Data = {};
        Data.total = data[0][0]['count'];
        Data.rows = data[1];
        Data.rows.forEach(function (obj, index) {
            decipher = crypto.createDecipher('aes-256-cbc', key);
            var decipher_smtp = crypto.createDecipher('aes-256-cbc', key);
            if (obj.smtp_password) {
                obj.smtp_password = decipher_smtp.update(obj.smtp_password, 'hex', 'utf8') + decipher_smtp.final('utf8');
            }
            obj.password = decipher.update(obj.password, 'hex', 'utf8') + decipher.final('utf8');
        })
        //查询每个关联邮箱中的未读邮件条数
        res.send(Data);
    }, function (err) {
        res.send(err);
    });
};
//查询单个关联邮箱内部的邮件
OtherAccount.prototype.getOtherEmailall = function (req, res, next) {
    DB.dbQuery.otherAccount.getOtherEmailall(req.query).then(function (data) {
        var Data = {};
        Data.total = data[0][0]['total']
        Data.rows = data[1]
        res.send(Data);
    }, function (err) {
        res.send(err);
    })
}
//查询单个关联邮箱内部的邮件
OtherAccount.prototype.getOtherEmailsingle = function (req, res, next) {
    DB.dbQuery.otherAccount.getOtherEmailsingle(req.query).then(function (data) {
        res.send(data);
    }, function (err) {
        res.send(err);
    })
}
module.exports = OtherAccount;