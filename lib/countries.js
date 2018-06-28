/*
 * 用于 国家表数据的操作
 */
"use strict";
let DB = require("./db");

// 国家构造函数
let Countries = function () {
};

// 读取数据(不分页)
Countries.prototype.readCountries = function (req, res, data) {
    DB.dbQuery.countries.readCountries(data).then(result => {
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
Countries.prototype.readCountriesPage = function (req, res, data) {
    DB.dbQuery.countries.readCountriesPage(data).then(result => {
        DB.dbQuery.countries.readCountriesTotal(data).then(total => {
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
                success: false,
                message: err.message,
                data: {
                    rows: [],
                    total: 0
                }
            });
        });
    }).catch(err => {
        res.send({
            success: false,
            message: err.message,
            data: {
                rows: [],
                total: 0
            }
        });
    });
};

// 创建数据
Countries.prototype.createCountries = function (req, res, data) {
    DB.dbQuery.countries.createCountries(data).then(result => {
        res.send({
            success: result.affectedRows === data.countriesName.length,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 更新数据
Countries.prototype.updateCountries = function (req, res, data) {
    DB.dbQuery.countries.updateCountries(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
        // 同时更新产品中心的数据
        DB.dbQuery.product.updateByBaseData({
            countriesName: data.countriesName,
            countriesID: data.ID,
            companyOrgID: data.companyOrgID
        });
        // 同时更新客诉记录中的数据
        DB.dbQuery.customerComplaintHistory.updateCustomerComplaintForBaseData({
            countriesName: data.countriesName,
            countriesID: data.ID,
            orgGroupIDAll: data.orgGroupIDAll
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 删除数据
Countries.prototype.deleteCountries = function (req, res, data) {
    DB.dbQuery.countries.deleteCountries(data).then(result => {
        res.send({
            success: result.affectedRows === data.IDS.length,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};
module.exports = Countries;