/*
 * 用于 充值套餐管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 充值套餐构造函数
let PackageManage = function() {};

// 创建充值套餐
PackageManage.prototype.createPackage = function(req, res, data) {
    DB.dbQuery.packageManage.createPackage(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: '充值套餐创建成功'
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(需要分页,查询条件：id，Packagename,status等)
PackageManage.prototype.readPackagePage = function(req, res, data) {
    DB.dbQuery.packageManage.readPackagePage(data).then(result => {
        DB.dbQuery.packageManage.readPackagePageTotal(data).then(total => {
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
PackageManage.prototype.readPackageById = function(req, res, data) {
    DB.dbQuery.packageManage.readPackageById(data).then(result => {
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
PackageManage.prototype.updatePackage = function(req, res, data) {
    DB.dbQuery.packageManage.updatePackage(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用充值套餐
PackageManage.prototype.togglePackage = function(req, res, data) {
    DB.dbQuery.packageManage.togglePackage(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

module.exports = PackageManage;