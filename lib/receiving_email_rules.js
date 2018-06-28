/*
* 用于 收信规则模块功能的业务实现
*/
"use strict";
let DB = require("./db");
// 收信规则构造函数
let ReceivingEmailRules = function () {

};
// 获取所有的收信规则（支持状态、规则模糊匹配）
ReceivingEmailRules.prototype.getReceivingEmailRuleList = function (res, params) {
    let promise = DB.dbQuery.receivingEmailRules.getReceivingEmailRuleList(params);
    if (promise && promise.then) {
        promise.then(function (data) {
            res.send({
                total: data.length,
                data: data
            });
        }, function (err) {
            res.send({
                total: 0,
                data: [],
                responseFail: true
            });
        });
    }
};
// 获取一条收信规则，通过id
ReceivingEmailRules.prototype.getReceivingEmailRuleById = function (res, params) {
    DB.dbQuery.receivingEmailRules.getReceivingEmailRuleById(params).then(function (data) {
        res.send({
            success: true,
            data: data
        });
    },function (err) {
        res.send({
            data: [],
            success: true
        });
    });
};

// 新增收信规则（单个操作）
ReceivingEmailRules.prototype.addReceivingEmailRule = function (res, params) {
    DB.dbQuery.receivingEmailRules.addReceivingEmailRule(params).then(function (data) {
            res.send({
                success: true
            });
        }).catch(function(err){
            res.send({
                success: false,
                message: err.message
            });
        })
       
};
// 通过收信规则id删除收信规则（支持批量）
ReceivingEmailRules.prototype.deleteReceivingEmailRulesById = function (res, params) {
    DB.dbQuery.receivingEmailRules.deleteReceivingEmailRulesById(params).then(function (data) {
            res.send({
                success: true
            });
        }).catch(function(err){
            res.send({
                success: false,
                message: err.message
            });
        })
        
};
// 通过收信规则id修改收信规则状态
ReceivingEmailRules.prototype.refreshReceivingEmailRulesById = function (res, params) {
    DB.dbQuery.receivingEmailRules.refreshReceivingEmailRulesById(params).then(function (data) {
        res.send({
            success: true
        });
    }).catch(function(err){
        res.send({
            success: false,
            message: err.message
        });
    })
};

// 编辑收信规则（单个操作）
ReceivingEmailRules.prototype.editReceivingEmailRule = function (res, params) {
    DB.dbQuery.receivingEmailRules.editReceivingEmailRule(params).then(function (data) {
        res.send({
            success: true
        });
    }).catch(function(err){
        res.send({
            success: false,
            message: err.message
        });
    })
};
// 运行收信规则（单个操作）
ReceivingEmailRules.prototype.runReceivingEmailRulesById = function (res, params) {
    DB.dbQuery.receivingEmailRules.runReceivingEmailRulesById(params).then(function (data) {
        res.send({
            success: true
        });
    }).catch(function(err){
        res.send({
            success: false,
            message: err.message
        });
    })
};
module.exports = ReceivingEmailRules;
