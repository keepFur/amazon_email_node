/*
 * 用于 经营概况管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 经营概况构造函数
let OperateOverview = function () { };
const serverErrMsg = '服务器异常，请联系客服人员';

// 获取网站当天的数据
OperateOverview.prototype.getTodayData = function (req, res, data) {
    DB.dbQuery.operateOverview.getTodayData(data).then(function (ret) {
        res.send({
            success: true,
            message: '',
            data: {
                todayAddSumMoney: '',// 当日充值金额
                todayAddMoneyCount: '',// 当日充值金额笔数
                todayAddUserCount: '',// 当日新增用户数
                todayAddKbOrderSumMoney: '',// 当日空包订单金额
                todayAddKbOrderCount: '',// 当日空包订单笔数
                todayAddTaskOrderSumMoney: '',// 当日流量订单金额
                todayAddTaskOrderCount: ''// 当日流量订单金额
            }
        });
    }).catch(err => res.send({
        success: false,
        message: serverErrMsg,
        data: {
            todayAddSumMoney: 0,
            todayAddMoneyCount: 0,
            todayAddUserCount: 0,
            todayAddKbOrderSumMoney: 0,
            todayAddKbOrderCount: 0,
            todayAddTaskOrderSumMoney: 0,
            todayAddTaskOrderCount: 0
        }
    }));
};

// 获取网站全部的数据
OperateOverview.prototype.getAllData = function (req, res, data) {
    DB.dbQuery.operateOverview.getAllData(data).then(function (ret) {
        res.send({
            success: true,
            message: '',
            data: {
                allAddSumMoney: '',// 全部充值金额
                allAddMoneyCount: '',// 全部充值笔数
                allAddUserCount: '',// 全部新增用户数
                allAddKbOrderSumMoney: '',// 全部空包订单金额
                allAddKbOrderCount: '',// 全部空包订单笔数
                allAddTaskOrderSumMoney: '',// 全部流量订单金额
                allAddTaskOrderCount: ''// 全部流量订单笔数
            }
        });
    }).catch(err => res.send({
        success: false,
        message: serverErrMsg,
        data: {
            allAddSumMoney: 0,
            allAddMoneyCount: 0,
            allAddUserCount: 0,
            allAddKbOrderSumMoney: 0,
            allAddKbOrderCount: 0,
            allAddTaskOrderSumMoney: 0,
            allAddTaskOrderCount: 0
        }
    }));
};

// 获取网站某一个时间段的充值情况
OperateOverview.prototype.getAddMoney = function (req, res, data) {
    DB.dbQuery.operateOverview.getAddMoney(data).then(ret => {
        res.send({
            success: true,
            message: '',
            data: {
                addSumMoney: '',// 总充值金额
                addMoneyUserCount: '',// 充值笔数
                subSumMoney: '',// 总退款金额
                subMoneyUserCount: ''// 退款笔数
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
OperateOverview.prototype.getOrderData = function (req, res, data) {
    DB.dbQuery.operateOverview.getOrderData(data).then(ret => {
        res.send({
            success: true,
            message: '',
            data: {
                taskOrderSumMoney: 0,// 流量订单总金额
                taskOrderCount: 0,// 流量订单笔数
                kbOrderSumMoney: 0,// 空包订单总金额
                kbOrderCount: 0,// 空包订单笔数
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
OperateOverview.prototype.getUserData = function (req, res, data) {
    DB.dbQuery.operateOverview.getUserData(data).then(ret => {
        res.send({
            success: true,
            message: '',
            data: {
                goldUserCount: 0,// 金牌用户
                addUserCount: 0,// 新增用户
                purUserCount: 0,// 已下单用户
                unpurUserCount: 0,// 未下单用户
            }
        });
    }).catch(err => res.send({
        success: false,
        message: serverErrMsg,
        data: {
            goldUserCount: 0,
            addUserCount: 0,
            purUserCount: 0,
            unpurUserCount: 0,
        }
    }));
};
module.exports = OperateOverview;