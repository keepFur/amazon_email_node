/*
 * 用于 首页找好概览 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 构造函数
let HomeAccountView = function(pool) {
    this.pool = pool;
};

// 读取某一段时间内的流量购买数量
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

// 读取某一段时间内的空包购买数量
HomeAccountView.prototype.readKbCountOfInTime = function(data) {
    let cmdText = `SELECT DISTINCT(DATE_FORMAT(o.created_date,'%Y-%m-%d')) as createdDate ,count(id) as count from yidian_kb_order o WHERE 1=1 `,
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

// 读取某一段时间内的任务类型
HomeAccountView.prototype.readTaskTypeOfInTime = function(data) {
    let cmdText = `SELECT  count(task.id) as count ,type.name AS taskTypeName  from yidian_task task INNER JOIN yidian_task_type type ON type.id=task.task_child_type WHERE 1=1 `,
        cmdParams = [];
    // 普通用户只能看读自己创建的任务
    if (!data.isSuper) {
        cmdText += ` AND task_user_id = ?`;
        cmdParams.push(data.taskUserId);
    }
    if (data.createdDateStart) {
        cmdText += ` AND Date(task.created_date) >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND Date(task.created_date) <= ? `;
        cmdParams.push(data.createdDateEnd);
    }
    cmdText += ` GROUP BY task.task_child_type`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取某一段时间内的空包类型
HomeAccountView.prototype.readKbTypeOfInTime = function(data) {
    let cmdText = `SELECT  count(o.id) as count,o.plant,type.name AS kbCompany from yidian_kb_order o INNER JOIN yidian_kb_type type ON type.code=o.kb_company AND type.plant = o.plant  WHERE 1=1 `,
        cmdParams = [];
    // 普通用户只能看读自己创建的任务
    if (!data.isSuper) {
        cmdText += ` AND user_id = ?`;
        cmdParams.push(data.userId);
    }
    if (data.createdDateStart) {
        cmdText += ` AND Date(o.created_date) >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND Date(o.created_date) <= ? `;
        cmdParams.push(data.createdDateEnd);
    }
    cmdText += ` GROUP BY o.plant,type.name`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取某一段时间内的充值金额
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