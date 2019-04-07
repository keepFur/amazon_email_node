/*
 * 用于 通知 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 通知构造函数
let NoticeManage = function (pool) {
    this.pool = pool;
};

// 个人通知业务

// 创建一个通知
NoticeManage.prototype.createNoticePerson = function (data) {
    let cmdText = `INSERT INTO yidian_notice_person
        (title, content, user_id, remark, created_date)
        VALUES (?,?,?,?,?)`,
        cmdParams = [data.title, data.content, data.userId, data.remark, new Date()];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
// 读取记录(需要分页等)
NoticeManage.prototype.readNoticePersonPage = function (data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit,
        cmdText = `SELECT n.id, title, content, u.username, n.user_id,n.remark, n.created_date AS createdDate,n.update_date AS updateDate 
        ,n.status FROM yidian_notice_person n INNER JOIN yidian_user u ON n.user_id = u.id WHERE n.user_id = ? `,
        cmdParams = [data.userId];
    if (data.status) {
        cmdText += ` AND n.status = ? `;
        cmdParams.push(data.status);
    }
    if (data.createdDateStart) {
        cmdText += ` AND n.created_date >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND n.created_date < ? `;
        cmdParams.push(data.createdDateEnd);
    }
    cmdText += ` ORDER BY n.created_date DESC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取总数根据条件
NoticeManage.prototype.readNoticePersonPageTotal = function (data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_notice_person WHERE user_id = ? `,
        cmdParams = [data.userId];
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
// 通知标记为已读
NoticeManage.prototype.markedReadNotice = function (data) {
    let cmdText = `UPDATE  yidian_notice_person SET status = 2, update_date = ? WHERE id IN ${Core.flyer.convertParams(data.ids)}`,
        cmdParams = [new Date(), ...data.ids];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
// 删除通知
NoticeManage.prototype.deleteNotice = function (data) {
    let cmdText = `DELETE FROM yidian_notice_person WHERE id IN  ${Core.flyer.convertParams(data.ids)}`,
        cmdParams = [...data.ids];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 系统通知业务
// 创建一个通知
NoticeManage.prototype.createNotice = function (data) {
    let cmdText = `INSERT INTO yidian_notice
        (notice_title,notice_content,created_date)
        VALUES (?,?,?)`,
        cmdParams = [];
    cmdParams.push(data.noticeTitle);
    cmdParams.push(data.noticeContent);
    cmdParams.push(new Date());
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(需要分页,查询条件：id，notice_title 等)
NoticeManage.prototype.readNoticePage = function (data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit,
        cmdText = `SELECT id, notice_title AS noticeTitle,notice_content AS noticeContent,created_date AS createdDate,update_date AS updateDate 
        ,status FROM yidian_notice WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.noticeTitle) {
        cmdText += ` AND notice_title LIKE '%${data.noticeTitle}%' `;
    }
    if (data.noticeContent) {
        cmdText += ` AND notice_content LIKE '%${data.noticeContent}%' `;
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
NoticeManage.prototype.readNoticePageTotal = function (data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_notice WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.noticeTitle) {
        cmdText += ` AND notice_title LIKE '%${data.noticeTitle}%' `;
    }
    if (data.noticeContent) {
        cmdText += ` AND notice_content LIKE '%${data.noticeContent}%' `;
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
NoticeManage.prototype.readNoticeById = function (data) {
    let cmdText = `SELECT id, notice_title AS noticeTitle,created_date AS createdDate,update_date AS updateDate 
        ,status,notice_content AS noticeContent FROM yidian_notice WHERE id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
NoticeManage.prototype.updateNotice = function (data) {
    let cmdText = `UPDATE  yidian_notice SET `,
        cmdParams = [];
    if (data.noticeTitle) {
        cmdText += `, notice_title = ?`;
        cmdParams.push(data.noticeTitle);
    }
    if (data.noticeContent) {
        cmdText += `,notice_content = ?`;
        cmdParams.push(data.noticeContent);
    }
    cmdText += `,update_date = ?`;
    cmdParams.push(new Date());
    cmdText += ` WHERE id = ?`;
    cmdParams.push(data.id);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用通知
NoticeManage.prototype.toggleNotice = function (data) {
    let cmdText = `UPDATE  yidian_notice SET status = ? WHERE id = ? `,
        cmdParams = [data.status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = NoticeManage;