/*
 * 用于 空包单号管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 空包单号构造函数
let ManageKbNumber = function () { };

// 创建空包单号
ManageKbNumber.prototype.createKbNumber = function (req, res, data) {
    DB.dbQuery.manageKbNumber.createKbNumber(data).then(result => {
        res.send({
            success: result.affectedRows === data.numbers.length,
            message: '空包单号创建成功'
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(需要分页,查询条件：id，number,status等)
ManageKbNumber.prototype.readKbNumberPage = function (req, res, data) {
    DB.dbQuery.manageKbNumber.readKbNumberPage(data).then(result => {
        DB.dbQuery.manageKbNumber.readKbNumberPageTotal(data).then(total => {
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
ManageKbNumber.prototype.readKbNumberById = function (req, res, data) {
    DB.dbQuery.manageKbNumber.readKbNumberById(data).then(result => {
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
ManageKbNumber.prototype.updateKbNumber = function (req, res, data) {
    DB.dbQuery.manageKbNumber.updateKbNumber(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用空包单号
ManageKbNumber.prototype.toggleKbNumber = function (req, res, data) {
    DB.dbQuery.manageKbNumber.toggleKbNumber(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

module.exports = ManageKbNumber;