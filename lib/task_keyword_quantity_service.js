/*
 * 用于 任务数量和关键词 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 任务数量和关键词构造函数
let TaskKeywordQuantity = function() {};

// 创建任务数量和关键词
TaskKeywordQuantity.prototype.createTaskKeywordQuantity = function(req, res, data) {
    DB.dbQuery.plantManage.createTaskKeywordQuantity(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: '任务数量和关键词成功'
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(需要分页,查询条件：id,status等)
TaskKeywordQuantity.prototype.readTaskKeywordQuantityPage = function(req, res, data) {
    DB.dbQuery.plantManage.readTaskKeywordQuantityPage(data).then(result => {
        DB.dbQuery.plantManage.readTaskKeywordQuantityPageTotal(data).then(total => {
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
TaskKeywordQuantity.prototype.readTaskKeywordQuantityById = function(req, res, data) {
    DB.dbQuery.plantManage.readTaskKeywordQuantityById(data).then(result => {
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
TaskKeywordQuantity.prototype.updateTaskKeywordQuantity = function(req, res, data) {
    DB.dbQuery.plantManage.updateTaskKeywordQuantity(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用平台
TaskKeywordQuantity.prototype.toggleTaskKeywordQuantity = function(req, res, data) {
    DB.dbQuery.plantManage.toggleTaskKeywordQuantity(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

module.exports = TaskKeywordQuantity;