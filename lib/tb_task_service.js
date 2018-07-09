/*
 * 用于 淘宝任务 模块功能的业务逻辑实现
 */
"use strict";
let DB = require("./db");
// 淘宝任务构造函数
let TbTaskService = function() {};

// 创建淘宝任务
TbTaskService.prototype.createTask = function(req, res, data) {
    DB.dbQuery.tbTask.createTask(data).then(result => {
        if (result.affectedRows === 1) {
            DB.dbQuery.taskKeywordQuantity.createTaskKeywordQuantity({
                taskId: result.insertId,
                keywordQuantity: data.keywordQuantity
            }).then(result => {
                res.send({
                    success: result.affectedRows === data.keywordQuantity.length,
                    message: '淘宝任务创建成功'
                });
            }).catch(err => res.send({ success: false, message: err.message }));
        } else {
            res.send({
                success: false,
                message: '淘宝任务创建失败'
            });
        }
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(需要分页,查询条件：id，username,status等)
TbTaskService.prototype.readTaskPage = function(req, res, data) {
    DB.dbQuery.tbTask.readTaskPage(data).then(result => {
        DB.dbQuery.tbTask.readTaskPageTotal(data).then(total => {
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
TbTaskService.prototype.readTaskById = function(req, res, data) {
    DB.dbQuery.tbTask.readTaskById(data).then(result => {
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
TbTaskService.prototype.updateTask = function(req, res, data) {
    DB.dbQuery.tbTask.updateTask(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用淘宝任务
TbTaskService.prototype.toggleTask = function(req, res, data) {
    DB.dbQuery.tbTask.toggleTask(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

module.exports = TbTaskService;