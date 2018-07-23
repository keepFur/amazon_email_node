/*
 * 用于 反馈意见 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 反馈意见构造函数
let AdviceFeedbackManage = function(pool) {
    this.pool = pool;
};

// 创建一个反馈意见
AdviceFeedbackManage.prototype.createAdviceFeedback = function(data) {
    let cmdText = `INSERT INTO yidian_advice_feedback
        (title,content,user_id,user_name, created_date)
        VALUES (?,?,?,?,?)`,
        cmdParams = [];
    cmdParams.push(data.title);
    cmdParams.push(data.content);
    cmdParams.push(data.userId);
    cmdParams.push(data.userName);
    cmdParams.push(new Date());
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(需要分页,查询条件：id，adviceFeedback_title 等)
AdviceFeedbackManage.prototype.readAdviceFeedbackPage = function(data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit,
        cmdText = `SELECT id, title,content,created_date AS createdDate,update_date AS updateDate 
        ,status FROM yidian_advice_feedback WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    // 普通用户只能看自己的反馈意见
    if (!data.isSuper) {
        cmdText += ` AND user_id = ?`;
        cmdParams.push(data.userId);
    }
    if (data.title) {
        cmdText += ` AND title LIKE '%${data.title}%' `;
    }
    if (data.content) {
        cmdText += ` AND content LIKE '%${data.content}%' `;
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
    cmdText += ` ORDER BY created_date DESC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取总数根据条件
AdviceFeedbackManage.prototype.readAdviceFeedbackPageTotal = function(data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_advice_feedback WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    // 普通用户只能看自己的反馈意见
    if (!data.isSuper) {
        cmdText += ` AND user_id = ?`;
        cmdParams.push(data.userId);
    }
    if (data.title) {
        cmdText += ` AND title LIKE '%${data.title}%' `;
    }
    if (data.content) {
        cmdText += ` AND content LIKE '%${data.content}%' `;
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
AdviceFeedbackManage.prototype.readAdviceFeedbackById = function(data) {
    let cmdText = `SELECT id, title,content,created_date AS createdDate,update_date AS updateDate 
        ,status FROM yidian_advice_feedback WHERE  id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
AdviceFeedbackManage.prototype.updateAdviceFeedback = function(data) {
    let cmdText = `UPDATE  yidian_advice_feedback SET update_date = ?  WHERE id = ?`,
        cmdParams = [new Date(), data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用反馈意见
AdviceFeedbackManage.prototype.toggleAdviceFeedback = function(data) {
    let cmdText = `UPDATE  yidian_advice_feedback SET status = ? WHERE id = ? `,
        cmdParams = [data.status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = AdviceFeedbackManage;