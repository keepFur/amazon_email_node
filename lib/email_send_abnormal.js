/*
 * 用于邮件异常模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 产品构造函数
let emailSendAbnormal = function (pool) {
};

// 读取记录(需要分页,查询条件：ID，SKU,ASIN等
emailSendAbnormal.prototype.readEmailSendAbnormal = function (req, res, data) {
    DB.dbQuery.emailSendAbnormal.readEmailSendAbnormal(data).then(function (result, err) {
        if (err) {
            res.send({
                success: false,
                message: err.message
            });
        }
        DB.dbQuery.emailSendAbnormal.readEmailSendAbnormalTotal(data).then(function (total, err) {
            if (err) {
                res.send({
                    success: false,
                    message: err.message
                });
            }
            res.send({
                success: true,
                message: '',
                data: {
                    total: total[0].total,
                    rows: result
                }
            });
        });
    });
};

// 更新
emailSendAbnormal.prototype.updateEmailSendAbnormal = function (req, res, data) {
    DB.dbQuery.emailSendAbnormal.updateEmailSendAbnormal(data).then(function (result, err) {
        if (err) {
            res.send({
                success: false,
                message: err.message
            });
        }
        res.send({
            success: true,
            message: ''
        });
    });
};
// 读取记录(需要分页,查询条件：ID，SKU,ASIN等
emailSendAbnormal.prototype.readAbnormalNoTips = function (req, res, data) {
    DB.dbQuery.emailSendAbnormal.readAbnormalNoTips(data).then(function (result, err) {
        if (err) {
            res.send({
                success: false,
                message: err.message
            });
        }
        DB.dbQuery.emailSendAbnormal.readAbnormalNoTipsTotal(data).then(function (total, err) {
            if (err) {
                res.send({
                    success: false,
                    message: err.message
                });
            }
            res.send({
                success: true,
                message: '',
                data: {
                    total: total[0].total,
                    rows: result
                }
            });
        });
    });
};

module.exports = emailSendAbnormal;