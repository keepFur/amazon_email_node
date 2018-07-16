/*
 * 用于 日志积分 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 日志积分构造函数
let LogsScoreManage = function(pool) {
    this.pool = pool;
};

// 创建一个日志积分
LogsScoreManage.prototype.createLogsScore = function(data) {
    let cmdText = `INSERT INTO yidian_logs_score
        (user_id,user_name,type,count,created_date)
        VALUES (?,?,?,?,?)`,
        cmdParams = [];
    cmdParams.push(data.userId);
    cmdParams.push(data.userName);
    cmdParams.push(data.type);
    cmdParams.push(data.count);
    cmdParams.push(new Date());
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(需要分页,查询条件：id，notice_title 等)
LogsScoreManage.prototype.readLogsScorePage = function(data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit,
        cmdText = `SELECT score.id, user_id AS userId,user_name AS userName, type,count,score.created_date AS createdDate
        ,score.status,user.money AS mainCount FROM yidian_logs_score score LEFT JOIN yidian_user user ON score.user_id=user.id WHERE 1=1 `,
        cmdParams = [];
    // 普通用户只能看自己的
    if (!data.isSuper) {
        cmdText += ` AND user_id = ?`;
        cmdParams.push(data.userId);
    }
    if (data.id) {
        cmdText += ` AND score.id = ?`;
        cmdParams.push(data.id);
    }
    if (data.userName) {
        cmdText += ` AND user_name LIKE '%${data.userName}%' `;
    }
    if (data.type) {
        cmdText += ` AND type LIKE '%${data.type}%' `;
    }
    if (data.status) {
        cmdText += ` AND score.status = ? `;
        cmdParams.push(data.status);
    }
    if (data.createdDateStart) {
        cmdText += ` AND score.created_date >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND score.created_date < ? `;
        cmdParams.push(data.createdDateEnd);
    }
    cmdText += ` ORDER BY score.created_date DESC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取总数根据条件
LogsScoreManage.prototype.readLogsScorePageTotal = function(data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_logs_score WHERE 1 = 1 `,
        cmdParams = [];
    if (!data.isSuper) {
        cmdText += ` AND user_id = ?`;
        cmdParams.push(data.userId);
    }
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.userName) {
        cmdText += ` AND user_name LIKE '%${data.userName}%' `;
    }
    if (data.type) {
        cmdText += ` AND type LIKE '%${data.type}%' `;
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.createdDateStart) {
        cmdText += ` AND created_date >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND created_date < ? `;
        cmdParams.push(data.createdDateEnd);
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取一条记录通过ID
LogsScoreManage.prototype.readLogsScoreById = function(data) {
    let cmdText = `SELECT id, user_id AS userId,user_name AS userName, type,count,created_date AS createdDate
        ,status FROM yidian_logs_score WHERE id=? `,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用日志积分
LogsScoreManage.prototype.toggleLogsScore = function(data) {
    let cmdText = `UPDATE  yidian_logs_score SET status = ? WHERE id = ? `,
        cmdParams = [data.status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = LogsScoreManage;