"use strict";
/*
* 用于 店铺数据获取 模块功能的业务实现
*/
let DB = require("./db"),
    Config = require("./config");
let ShopManage = function () {
};

// 创建店铺（支持批量）
ShopManage.prototype.createStore = function (req, res, data) {
    DB.dbQuery.shopManage.createStore(data).then(result => {
        res.send({
            success: result.affectedRows === data.storeName.length,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};
//读取店铺数据（分页）
ShopManage.prototype.readStorePage = function (req, res, data) {
    DB.dbQuery.shopManage.readStorePage(data).then(function (data) {
        res.send({
            rows: data[1],
            total: data[0][0]['count']
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
};
//读取店铺数据（不分页）
ShopManage.prototype.readStoreNoPage = function (req, res, data) {
    DB.dbQuery.shopManage.readStoreNoPage(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            }
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};
//编辑店铺
ShopManage.prototype.updateStore = function (req, res, data) {
    DB.dbQuery.shopManage.updateStore(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
        // 更新客诉记录和产品中心的店铺名称
        DB.dbQuery.customerComplaintHistory.updateCustomerComplaintForBaseData({
            storeName: data.storeName,
            storeID: data.ID
        });
        DB.dbQuery.product.updateByBaseData({
            oldStoreName: data.oldStoreName,
            storeName: data.storeName,
            companyOrgID: data.companyOrgID
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};
//删除店铺
ShopManage.prototype.deleteStore = function (req, res, data) {
    DB.dbQuery.shopManage.deleteStore(data).then(result => {
        res.send({
            success: result.affectedRows === data.IDS.length,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};
//展示所有的部门
ShopManage.prototype.showCompanylist = function (data, res) {
    let reqData = data;
    DB.dbQuery.shopManage.showCompanylist(data).then(data => {
        res.send({
            rows: data[1],
            total: data[0][0]['count']
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
};
module.exports = ShopManage;


