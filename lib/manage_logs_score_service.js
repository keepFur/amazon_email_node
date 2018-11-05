/*
 * 用于 日志余额管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 余额日志构造函数
let LogsScoreManage = function() {};

// 创建日志余额
LogsScoreManage.prototype.createLogsScore = function(req, res, data) {
    DB.dbQuery.logsScoreManage.createLogsScore(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: '余额日志创建成功'
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(需要分页,查询条件：id，LogsScorename,status等)
LogsScoreManage.prototype.readLogsScorePage = function(req, res, data) {
    data.userId = req.user.id;
    data.isSuper = req.user.isSuper;
    DB.dbQuery.logsScoreManage.readLogsScorePage(data).then(result => {
        DB.dbQuery.logsScoreManage.readLogsScorePageTotal(data).then(total => {
            res.send({
                success: true,
                message: '',
                data: {
                    total: total[0].total,
                    rows: result,
                },
            });
        }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
};

// 读取一条记录通过id
LogsScoreManage.prototype.readLogsScoreById = function(req, res, data) {
    DB.dbQuery.logsScoreManage.readLogsScoreById(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            },
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};

// 禁用或启用日志余额
LogsScoreManage.prototype.toggleLogsScore = function(req, res, data) {
    DB.dbQuery.logsScoreManage.toggleLogsScore(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

module.exports = LogsScoreManage;