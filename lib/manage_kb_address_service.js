/*
 * 用于 空包地址管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 空包地址构造函数
let ManageKbAddress = function () { };

// 创建空包地址
ManageKbAddress.prototype.createKbAddress = function (req, res, data) {
    data.userId = req.user.id;
    DB.dbQuery.manageKbAddress.createKbAddress(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: '空包地址创建成功'
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(需要分页,查询条件：id，number,status等)
ManageKbAddress.prototype.readKbAddress = function (req, res, data) {
    data.userId = req.user.id;
    data.isSuper = req.user.isSuper;
    DB.dbQuery.manageKbAddress.readKbAddress(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                total: result.length,
                rows: result,
            }
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
};

// 读取一条记录通过id
ManageKbAddress.prototype.readKbAddressById = function (req, res, data) {
    DB.dbQuery.manageKbAddress.readKbAddressById(data).then(result => {
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
ManageKbAddress.prototype.updateKbAddress = function (req, res, data) {
    DB.dbQuery.manageKbAddress.updateKbAddress(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用空包地址
ManageKbAddress.prototype.toggleKbAddress = function (req, res, data) {
    DB.dbQuery.manageKbAddress.toggleKbAddress(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

module.exports = ManageKbAddress;