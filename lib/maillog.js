/*
 * 用于 邮件日志表数据的操作
 */
"use strict";
let DB = require("./db");

// 邮件日志构造函数
let Maillog = function () {
};

// 创建数据
Maillog.prototype.createMaillog = function (req, res, data) {
    DB.dbQuery.maillog.createMaillog(data).then(() => { }).catch(err => {
        console.log('写日志出现异常：' + err);
    });
};

// 读取数据(分页)
Maillog.prototype.readMaillogPage = (req, res, data) => {
    DB.dbQuery.maillog.readMaillogPage(data).then(result => {
        DB.dbQuery.maillog.readMaillogPageTotal(data).then(total => {
            res.send({
                success: true,
                message: '',
                data: {
                    total: total[0].total,
                    rows: result
                }
            });
        }).catch(err => {
            res.send({
                data: {
                    rows: [],
                    total: 0
                },
                message: err.message,
                success: false
            });
        });
    }).catch(err => {
        res.send({
            data: {
                rows: [],
                total: 0
            },
            message: err.message,
            success: false
        });
    });
};
module.exports = Maillog;