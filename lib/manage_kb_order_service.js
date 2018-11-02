/*
 * 用于 空包单号管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 空包单号构造函数
let ManageKbOrder = function () { };

// 创建空包单号
ManageKbOrder.prototype.createKbOrder = function (req, res, data) {
    DB.dbQuery.manageKbOrder.createKbOrder(data).then(result => {
        res.send({
            success: result.affectedRows === data.numbers.length,
            message: '空包单号创建成功'
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(需要分页,查询条件：id，number,status等)
ManageKbOrder.prototype.readKbOrderPage = function (req, res, data) {
    DB.dbQuery.manageKbOrder.readKbOrderPage(data).then(result => {
        DB.dbQuery.manageKbOrder.readKbOrderPageTotal(data).then(total => {
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
ManageKbOrder.prototype.readKbOrderById = function (req, res, data) {
    DB.dbQuery.manageKbOrder.readKbOrderById(data).then(result => {
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
ManageKbOrder.prototype.updateKbOrder = function (req, res, data) {
    DB.dbQuery.manageKbOrder.updateKbOrder(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用空包单号
ManageKbOrder.prototype.toggleKbOrder = function (req, res, data) {
    DB.dbQuery.manageKbOrder.toggleKbOrder(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

module.exports = ManageKbOrder;