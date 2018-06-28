/*
 * 用于 产品分组表数据的操作
 */
"use strict";
let DB = require("./db");

// 产品分组构造函数
let ProductGroup = function () {
};

// 读取数据(不分页)
ProductGroup.prototype.readProductGroup = function (req, res, data) {
    DB.dbQuery.productGroup.readProductGroup(data).then(result => {
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
ProductGroup.prototype.readProductGroupPage = (req, res, data) => {
    DB.dbQuery.productGroup.readProductGroupPage(data).then(result => {
        DB.dbQuery.productGroup.readProductGroupTotal(data).then(total => {
            res.send({
                success: true,
                message: '',
                data: {
                    total: total[0].total,
                    rows: result
                }
            });
        }).catch(err => {
            res.send({
                data: {
                    rows: [],
                    total: 0
                },
                message: err.message,
                success: false
            });
        });
    }).catch(err => {
        res.send({
            data: {
                rows: [],
                total: 0
            },
            message: err.message,
            success: false
        });
    });
};

// 创建数据
ProductGroup.prototype.createProductGroup = function (req, res, data) {
    DB.dbQuery.productGroup.createProductGroup(data).then(result => {
        res.send({
            success: result.affectedRows === data.productGroupName.length,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 更新数据
ProductGroup.prototype.updateProductGroup = function (req, res, data) {
    DB.dbQuery.productGroup.updateProductGroup(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
        // 同时更新产品中心的数据
        DB.dbQuery.product.updateByBaseData({
            productGroupName: data.productGroupName,
            productGroupID: data.ID,
            companyOrgID: data.companyOrgID
        });
        // 同时更新客诉记录中的数据
        DB.dbQuery.customerComplaintHistory.updateCustomerComplaintForBaseData({
            productGroupName: data.productGroupName,
            productGroupID: data.ID,
            orgGroupIDAll: data.orgGroupIDAll
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 删除数据
ProductGroup.prototype.deleteProductGroup = function (req, res, data) {
    DB.dbQuery.productGroup.deleteProductGroup(data).then(result => {
        res.send({
            success: result.affectedRows === data.IDS.length,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};
module.exports = ProductGroup;