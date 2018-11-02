/*
 * 用于 空包单号管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 空包单号构造函数
let ManageKbNumber = function () { };

// 创建空包单号
ManageKbNumber.prototype.createKbOrder = function (req, res, data) {
    DB.dbQuery.manageKbNumber.createKbOrder(data).then(result => {
        res.send({
            success: result.affectedRows === data.numbers.length,
            message: '空包单号创建成功'
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(需要分页,查询条件：id，number,status等)
ManageKbNumber.prototype.readKbOrderPage = function (req, res, data) {
    DB.dbQuery.manageKbNumber.readKbOrderPage(data).then(result => {
        DB.dbQuery.manageKbNumber.readKbOrderPageTotal(data).then(total => {
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
ManageKbNumber.prototype.readKbOrderById = function (req, res, data) {
    DB.dbQuery.manageKbNumber.readKbOrderById(data).then(result => {
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
ManageKbNumber.prototype.updateKbOrder = function (req, res, data) {
    DB.dbQuery.manageKbNumber.updateKbOrder(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用空包单号
ManageKbNumber.prototype.toggleKbOrder = function (req, res, data) {
    DB.dbQuery.manageKbNumber.toggleKbOrder(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

module.exports = ManageKbNumber;