/*
 * 用于 空包类型管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 空包类型构造函数
let ManageKbType = function () { };

// 创建空包类型
ManageKbType.prototype.createKbType = function (req, res, data) {
    DB.dbQuery.manageKbType.createKbType(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: '空包类型创建成功'
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(不需要分页,查询条件：id，name,status等)
ManageKbType.prototype.readKbType = function (req, res, data) {
    DB.dbQuery.manageKbType.readKbType(data).then(result => {
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
ManageKbType.prototype.readKbTypeById = function (req, res, data) {
    DB.dbQuery.manageKbType.readKbTypeById(data).then(result => {
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
ManageKbType.prototype.updateKbType = function (req, res, data) {
    DB.dbQuery.manageKbType.updateKbType(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用空包类型
ManageKbType.prototype.toggleKbType = function (req, res, data) {
    DB.dbQuery.manageKbType.toggleKbType(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

module.exports = ManageKbType;