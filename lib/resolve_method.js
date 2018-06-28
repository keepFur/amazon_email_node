/*
 * 用于 处理方式表数据的操作
 */
"use strict";
let DB = require("./db");

// 处理方式构造函数
let ResolveMethod = function () {
};

// 读取数据(不分页)
ResolveMethod.prototype.readResolveMethod = function (req, res, data) {
    DB.dbQuery.resolveMethod.readResolveMethod(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            }
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};

// 读取数据(分页)
ResolveMethod.prototype.readResolveMethodPage = function (req, res, data) {
    DB.dbQuery.resolveMethod.readResolveMethodPage(data).then(result => {
        DB.dbQuery.resolveMethod.readResolveMethodTotal(data).then(total => {
            res.send({
                success: true,
                message: '',
                data: {
                    rows: result,
                    total: total[0].total
                }
            });
        }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
};

// 创建数据
ResolveMethod.prototype.createResolveMethod = function (req, res, data) {
    DB.dbQuery.resolveMethod.createResolveMethod(data).then(result => {
        res.send({
            success: result.affectedRows === data.resolveMethodName.length,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 更新数据
ResolveMethod.prototype.updateResolveMethod = function (req, res, data) {
    DB.dbQuery.resolveMethod.updateResolveMethod(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
        // 同时更新客诉记录中的数据 暂时还没进行权限的限制
        DB.dbQuery.customerComplaintHistory.updateCustomerComplaintForBaseData({
            resolveMethodName: data.resolveMethodName,
            resolveMethodID: data.ID,
            orgGroupIDAll: data.orgGroupIDAll
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 删除数据
ResolveMethod.prototype.deleteResolveMethod = function (req, res, data) {
    DB.dbQuery.resolveMethod.deleteResolveMethod(data).then(result => {
        res.send({
            success: result.affectedRows === data.IDS.length,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};
module.exports = ResolveMethod;