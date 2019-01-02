/*
 * 用于 经营概况管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 经营概况构造函数
let OperateOverview = function() {};
const serverErrMsg = '服务器异常，请联系客服人员';

// 获取网站当天的数据
OperateOverview.prototype.getTodayData = function(req, res, data) {
    DB.dbQuery.operateOverview.getTodayData(data).then(function(ret) {
        res.send({
            success: true,
            message: '',
            data: {
                todayAddSumMoney: ret[0][0].todayAddSumMoney, // 当日充值金额
                todayAddMoneyCount: ret[0][0].todayAddMoneyCount, // 当日充值金额笔数
                todayAddUserCount: ret[1][0].todayAddUserCount, // 当日新增用户数
                todayAddUserMoney: ret[1][0].todayAddUserMoney, // 当日新增用户数余额总和
                todayAddKbOrderSumMoney: ret[2][0].todayAddKbOrderSumMoney, // 当日空包订单金额
                todayAddKbOrderCount: ret[2][0].todayAddKbOrderCount, // 当日空包订单笔数
                todayAddTaskOrderSumMoney: ret[3][0].todayAddTaskOrderSumMoney, // 当日流量订单金额
                todayAddTaskOrderCount: ret[3][0].todayAddTaskOrderCount // 当日流量订单笔数
            }
        });
    }).catch(err => res.send({
        success: false,
        message: serverErrMsg,
        data: {
            todayAddSumMoney: 0,
            todayAddMoneyCount: 0,
            todayAddUserCount: 0,
            todayAddUserMoney: 0,
            todayAddKbOrderSumMoney: 0,
            todayAddKbOrderCount: 0,
            todayAddTaskOrderSumMoney: 0,
            todayAddTaskOrderCount: 0
        }
    }));
};

// 获取网站全部的数据
OperateOverview.prototype.getAllData = function(req, res, data) {
    DB.dbQuery.operateOverview.getAllData(data).then(function(ret) {
        res.send({
            success: true,
            message: '',
            data: {
                allAddSumMoney: ret[0][0].allAddSumMoney, // 全部充值金额
                allAddMoneyCount: ret[0][0].allAddMoneyCount, // 全部充值笔数
                allAddUserCount: ret[1][0].todayAddUserCount, // 全部新增用户数
                allAddUserMoney: ret[1][0].todayAddUserMoney, // 全部新增用户数余额总和
                allAddKbOrderSumMoney: ret[2][0].allAddKbOrderSumMoney, // 全部空包订单金额
                allAddKbOrderCount: ret[2][0].todayAddKbOrderCount, // 全部空包订单笔数
                allAddTaskOrderSumMoney: ret[3][0].allAddTaskOrderSumMoney, // 全部流量订单金额
                allAddTaskOrderCount: ret[3][0].todayAddTaskOrderCount // 全部流量订单笔数
            }
        });
    }).catch(err => res.send({
        success: false,
        message: serverErrMsg,
        data: {
            allAddSumMoney: 0,
            allAddMoneyCount: 0,
            allAddUserCount: 0,
            allAddUserMoney: 0,
            allAddKbOrderSumMoney: 0,
            allAddKbOrderCount: 0,
            allAddTaskOrderSumMoney: 0,
            allAddTaskOrderCount: 0
        }
    }));
};

// 获取网站某一个时间段的充值情况
OperateOverview.prototype.getAddMoney = function(req, res, data) {
    DB.dbQuery.operateOverview.getAddMoney(data).then(ret => {
        res.send({
            success: true,
            message: '',
            data: {
                addSumMoney: ret[0][0].addSumMoney, // 总充值金额
                addMoneyUserCount: ret[0][0].addMoneyUserCount, // 充值笔数
                subSumMoney: ret[1][0].subSumMoney, // 总退款金额
                subMoneyUserCount: ret[1][0].subMoneyUserCount // 退款笔数
            }
        });
    }).catch(err => res.send({
        success: false,
        message: serverErrMsg,
        data: {
            addSumMoney: 0,
            addMoneyUserCount: 0,
            subSumMoney: 0,
            subMoneyUserCount: 0
        }
    }));
};

// 获取某一个时间段的订单情况
OperateOverview.prototype.getOrderData = function(req, res, data) {
    DB.dbQuery.operateOverview.getOrderData(data).then(ret => {
        res.send({
            success: true,
            message: '',
            data: {
                taskOrderSumMoney: ret[0][0].taskOrderSumMoney, // 流量订单总金额
                taskOrderCount: ret[0][0].addTaskOrderCount, // 流量订单笔数
                kbOrderSumMoney: ret[1][0].kbOrderSumMoney, // 空包订单总金额
                kbOrderCount: ret[1][0].addKbOrderCount, // 空包订单笔数
            }
        });
    }).catch(err => res.send({
        success: false,
        message: serverErrMsg,
        data: {
            taskOrderSumMoney: 0,
            taskOrderCount: 0,
            kbOrderSumMoney: 0,
            kbOrderCount: 0,
        }
    }));
};

// 获取某一个时间段的用户数量情况
OperateOverview.prototype.getUserData = function(req, res, data) {
    DB.dbQuery.operateOverview.getUserData(data).then(ret => {
        res.send({
            success: true,
            message: '',
            data: {
                addUserCount: ret[0][0].addUserCount, // 新增用户
                commonUserCount: ret[1][0].commonUserCount, // 普通用户
                goldUserCount: ret[2][0].goldUserCount, // 金牌用户
                innerUserCount: ret[3][0].innerUserCount, // 内部用户
            }
        });
    }).catch(err => res.send({
        success: false,
        message: serverErrMsg,
        data: {
            addUserCount: 0,
            commonUserCount: 0,
            goldUserCount: 0,
            innerUserCount: 0,
        }
    }));
};
module.exports = OperateOverview;