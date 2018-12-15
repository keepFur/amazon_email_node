/*
 * 用于 经营概况 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 经营概况构造函数
let OperateOverview = function(pool) {
    this.pool = pool;
};

// 获取网站当天的数据
OperateOverview.prototype.getTodayData = function() {
    let cmdText = `
    SELECT SUM(count) AS todayAddSumMoney ,COUNT(*) AS todayAddMoneyCount FROM yidian_logs_score WHERE type =1 AND to_days(created_date) = to_days(now());
    SELECT COUNT(*) AS todayAddUserCount FROM yidian_user WHERE to_days(created_date) = to_days(now());
    SELECT COUNT(*) AS todayAddKbOrderCount ,SUM(price) AS todayAddKbOrderSumMoney FROM yidian_kb_order WHERE to_days(created_date) = to_days(now());
    SELECT COUNT(*) AS todayAddTaskOrderCount ,SUM(task_sum_money) AS todayAddTaskOrderSumMoney  FROM yidian_task WHERE to_days(created_date) = to_days(now());
    `,
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 获取网站全部时间的数据
OperateOverview.prototype.getAllData = function() {
    let cmdText = `
    SELECT SUM(count) AS allAddSumMoney ,COUNT(*) AS allAddMoneyCount FROM yidian_logs_score WHERE type =1;
    SELECT COUNT(*) AS todayAddUserCount FROM yidian_user;
    SELECT COUNT(*) AS todayAddKbOrderCount,SUM(price) AS allAddKbOrderSumMoney FROM yidian_kb_order;
    SELECT COUNT(*) AS todayAddTaskOrderCount,SUM(task_sum_money) AS allAddTaskOrderSumMoney FROM yidian_task;
    `,
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 获取网站某一个时间段的充值情况
OperateOverview.prototype.getAddMoney = function(data) {
    let cmdText = `
    SELECT SUM(count) AS addSumMoney,COUNT(*) AS addMoneyUserCount FROM yidian_logs_score WHERE type =1 AND DATE_SUB(CURDATE(), INTERVAL ? DAY) <= date(created_date);
    SELECT SUM(count) AS subSumMoney, COUNT(*) AS subMoneyUserCount FROM yidian_logs_score WHERE type IN(3,8) AND DATE_SUB(CURDATE(), INTERVAL ? DAY) <= date(created_date); `,
        cmdParams = [data.day | 0, data.day | 0];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 获取某一个时间段的订单情况
OperateOverview.prototype.getOrderData = function(data) {
    let cmdText = `
    SELECT COUNT(*) AS addTaskOrderCount,SUM(task_sum_money) AS taskOrderSumMoney FROM yidian_task WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY) <= date(created_date);
    SELECT COUNT(*) AS addKbOrderCount,SUM(total) AS kbOrderSumMoney FROM yidian_kb_order WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY) <= date(created_date); `,
        cmdParams = [data.day, data.day];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 获取某一个时间段的用户数量情况
OperateOverview.prototype.getUserData = function(data) {
    let cmdText = `
    SELECT COUNT(*) AS addUserCount FROM yidian_user WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY) <= date(created_date);
    SELECT COUNT(*) AS commonUserCount FROM yidian_user WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY) <= date(created_date) AND LEVEL = 1;
    SELECT COUNT(*) AS goldUserCount FROM yidian_user WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY) <= date(created_date) AND LEVEL = 2;
    SELECT COUNT(*) AS innerUserCount FROM yidian_user WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY) <= date(created_date) AND LEVEL = 3;
    `,
        cmdParams = [data.day, data.day, data.day, data.day];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = OperateOverview;