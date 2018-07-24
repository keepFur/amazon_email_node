/*
 * 用于 首页找好概览 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 构造函数
let HomeAccountView = function(pool) {
    this.pool = pool;
};

// 读取某一段时间内的任务数量
HomeAccountView.prototype.readTaskCountOfInTime = function(data) {
    let cmdText = `SELECT DISTINCT(DATE_FORMAT(task.created_date,'%Y-%m-%d')) as createdDate ,count(id) as count from yidian_task task WHERE 1=1 `,
        cmdParams = [];
    // 普通用户只能看读自己创建的任务
    if (!data.isSuper) {
        cmdText += ` AND task_user_id = ?`;
        cmdParams.push(data.taskUserId);
    }
    if (data.createdDateStart) {
        cmdText += ` AND Date(created_date) >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND Date(created_date) <= ? `;
        cmdParams.push(data.createdDateEnd);
    }
    cmdText += ` GROUP BY createdDate`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取某一段时间内的任务类型
HomeAccountView.prototype.readTaskTypeOfInTime = function(data) {
    let cmdText = `SELECT  count(id) as count ,task_child_type from yidian_task task WHERE 1=1 `,
        cmdParams = [];
    // 普通用户只能看读自己创建的任务
    if (!data.isSuper) {
        cmdText += ` AND task_user_id = ?`;
        cmdParams.push(data.taskUserId);
    }
    if (data.createdDateStart) {
        cmdText += ` AND Date(created_date) >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND Date(created_date) <= ? `;
        cmdParams.push(data.createdDateEnd);
    }
    cmdText += ` GROUP BY task.task_child_type`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取某一段时间内的积分充值金额
HomeAccountView.prototype.readAddMoneyOfInTime = function(data) {
    let cmdText = `SELECT DISTINCT(DATE_FORMAT(score.created_date,'%Y-%m-%d')) as createdDate ,sum(score.count) as count from yidian_logs_score score WHERE type=1 `,
        cmdParams = [];
    // 普通用户只能看读自己创建的任务
    if (!data.isSuper) {
        cmdText += ` AND user_id = ?`;
        cmdParams.push(data.userId);
    }
    if (data.createdDateStart) {
        cmdText += ` AND Date(created_date) >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND Date(created_date) <= ? `;
        cmdParams.push(data.createdDateEnd);
    }
    cmdText += ` GROUP BY createdDate`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
module.exports = HomeAccountView;