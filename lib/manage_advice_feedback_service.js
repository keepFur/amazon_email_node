/*
 * 用于 反馈意见管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 反馈意见构造函数
let AdviceFeedbackManage = function() {};

// 创建反馈意见
AdviceFeedbackManage.prototype.createAdviceFeedback = function(req, res, data) {
    data.userId = req.user.id;
    data.userName = req.user.userName;
    DB.dbQuery.adviceFeedbackManage.createAdviceFeedback(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: '反馈意见创建成功'
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(需要分页,查询条件：id，AdviceFeedbackname,status等)
AdviceFeedbackManage.prototype.readAdviceFeedbackPage = function(req, res, data) {
    data.isSuper = req.user.isSuper;
    data.userId = req.user.id;
    DB.dbQuery.adviceFeedbackManage.readAdviceFeedbackPage(data).then(result => {
        DB.dbQuery.adviceFeedbackManage.readAdviceFeedbackPageTotal(data).then(total => {
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
AdviceFeedbackManage.prototype.readAdviceFeedbackById = function(req, res, data) {
    DB.dbQuery.adviceFeedbackManage.readAdviceFeedbackById(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            },
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};

// 更新
AdviceFeedbackManage.prototype.updateAdviceFeedback = function(req, res, data) {
    DB.dbQuery.adviceFeedbackManage.updateAdviceFeedback(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用反馈意见
AdviceFeedbackManage.prototype.toggleAdviceFeedback = function(req, res, data) {
    DB.dbQuery.adviceFeedbackManage.toggleAdviceFeedback(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

module.exports = AdviceFeedbackManage;