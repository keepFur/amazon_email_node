/*
 * 用于 任务类型管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 任务类型构造函数
let TaskTypeManage = function () { };

// 创建任务类型
TaskTypeManage.prototype.createTaskType = function (req, res, data) {
    DB.dbQuery.manageTaskType.createTaskType(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: '任务类型创建成功'
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(需要分页,查询条件：id，name,status等)
TaskTypeManage.prototype.readTaskTypePage = function (req, res, data) {
    DB.dbQuery.manageTaskType.readTaskTypePage(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                total: result.length,
                rows: result,
            },
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
};

// 读取一条记录通过id
TaskTypeManage.prototype.readTaskTypeById = function (req, res, data) {
    DB.dbQuery.manageTaskType.readTaskTypeById(data).then(result => {
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
TaskTypeManage.prototype.updateTaskType = function (req, res, data) {
    DB.dbQuery.manageTaskType.updateTaskType(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用任务类型
TaskTypeManage.prototype.toggleTaskType = function (req, res, data) {
    DB.dbQuery.manageTaskType.toggleTaskType(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

module.exports = TaskTypeManage;