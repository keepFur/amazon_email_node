/*
 * 用于 发送邮件的日志的数据操作
 */
"use strict";
let Core = require("./core");

// 构造函数
let Maillog = function (pool) {
    this.pool = pool;
};

// 新增一条日志
Maillog.prototype.createMaillog = function (data) {
    let cmdText = `INSERT INTO mail_log (mail_id,user_id,user_name,content) VALUES(?,?,?,?)`,
        cmdParams = [data.mailID, data.userID, data.userName, data.content];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 查询所有的日志(分页)
Maillog.prototype.readMaillogPage = function (data) {
    let cmdText = `SELECT id,mail_id AS mailID,user_id AS userID,user_name AS userName,content,starttime FROM  mail_log WHERE 1 = 1 `,
        cmdParams = [],
        limit = Number(data.limit),
        offset = Number(data.offset - 1) * limit;
    if (data.mailID) {
        cmdText += ` AND mail_id = ?`;
        cmdParams.push(data.mailID);
    }
    if (data.userName) {
        cmdText += ` AND user_name = ?`;
        cmdParams.push(data.userName);
    }
    if (data.content) {
        cmdText += ` AND  content LIKE '%${data.content}%' `;
    }
    cmdText += ` ORDER BY id DESC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 查询所有的日志(分页总数)
Maillog.prototype.readMaillogPageTotal = function (data) {
    let cmdText = `SELECT COUNT(id)  AS total FROM mail_log WHERE 1 = 1 `,
        cmdParams = [];
    if (data.mailID) {
        cmdText += ` AND mail_id = ?`;
        cmdParams.push(data.mailID);
    }
    if (data.userName) {
        cmdText += ` AND user_name = ?`;
        cmdParams.push(data.userName);
    }
    if (data.content) {
        cmdText += ` AND content LIKE '%${data.content}%' `;
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = Maillog;