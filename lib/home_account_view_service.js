/*
 * 用于 账号预览管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 首页账号预览构造函数
let HomeAccountView = function() {};

// 读取某一段时间的创建任务数量
HomeAccountView.prototype.readTaskCountOfInTime = function(req, res, data) {
    data.taskUserId = req.user.id;
    data.isSuper = req.user.isSuper;
    DB.dbQuery.homeAccountView.readTaskCountOfInTime(data).then(result => {
        res.send({
            success: true,
            data: {
                rows: result
            },
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};

//  读取某一段时间的创建任务类型
HomeAccountView.prototype.readTaskTypeOfInTime = function(req, res, data) {
    data.taskUserId = req.user.id;
    data.isSuper = req.user.isSuper;
    DB.dbQuery.homeAccountView.readTaskTypeOfInTime(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            },
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};

// 读取某一段时间中的充值数量
HomeAccountView.prototype.readAddMoneyOfInTime = function(req, res, data) {
    data.userId = req.user.id;
    data.isSuper = req.user.isSuper;
    DB.dbQuery.homeAccountView.readAddMoneyOfInTime(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            }
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};
module.exports = HomeAccountView;