/*
 * 用于 通知管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 通知构造函数
let NoticeManage = function () {};
// 个人通知业务

// 创建通知
NoticeManage.prototype.createNoticePerson = function (req, res, data) {
    DB.dbQuery.noticeManage.createNoticePerson(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: '通知创建成功'
        });
    }).catch(err => res.send({
        success: false,
        message: err.message
    }));
};
// 读取通知
NoticeManage.prototype.readNoticePersonPage = function (req, res, data) {
    data.userId = req.user.id;
    DB.dbQuery.noticeManage.readNoticePersonPage(data).then(result => {
        DB.dbQuery.noticeManage.readNoticePersonPageTotal(data).then(total => {
            res.send({
                success: true,
                message: '',
                data: {
                    total: total[0].total,
                    rows: result,
                },
            });
        }).catch(err => res.send({
            success: false,
            message: err.message,
            data: {
                rows: [],
                total: 0
            }
        }));
    }).catch(err => res.send({
        success: false,
        message: err.message,
        data: {
            rows: [],
            total: 0
        }
    }));
};
// 标记为已读
NoticeManage.prototype.markedReadNotice = function (req, res, data) {
    DB.dbQuery.noticeManage.markedReadNotice(data).then(result => {
        res.send({
            success: result.affectedRows === data.ids.length,
            message: '通知标记成功'
        });
    }).catch(err => res.send({
        success: false,
        message: err.message
    }));
};
// 删除通知
NoticeManage.prototype.deleteNotice = function (req, res, data) {
    DB.dbQuery.noticeManage.deleteNotice(data).then(result => {
        res.send({
            success: result.affectedRows === data.ids.length,
            message: '通知删除成功'
        });
    }).catch(err => res.send({
        success: false,
        message: err.message
    }));
};

// 系统通知业务

// 创建通知
NoticeManage.prototype.createNotice = function (req, res, data) {
    DB.dbQuery.noticeManage.createNotice(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: '通知创建成功'
        });
    }).catch(err => res.send({
        success: false,
        message: err.message
    }));
};

// 读取记录(需要分页,查询条件：id，Noticename,status等)
NoticeManage.prototype.readNoticePage = function (req, res, data) {
    DB.dbQuery.noticeManage.readNoticePage(data).then(result => {
        DB.dbQuery.noticeManage.readNoticePageTotal(data).then(total => {
            res.send({
                success: true,
                message: '',
                data: {
                    total: total[0].total,
                    rows: result,
                },
            });
        }).catch(err => res.send({
            success: false,
            message: err.message,
            data: {
                rows: [],
                total: 0
            }
        }));
    }).catch(err => res.send({
        success: false,
        message: err.message,
        data: {
            rows: [],
            total: 0
        }
    }));
};

// 读取一条记录通过id
NoticeManage.prototype.readNoticeById = function (req, res, data) {
    DB.dbQuery.noticeManage.readNoticeById(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            },
        });
    }).catch(err => res.send({
        success: false,
        message: err.message,
        data: {
            rows: []
        }
    }));
};

// 更新
NoticeManage.prototype.updateNotice = function (req, res, data) {
    DB.dbQuery.noticeManage.updateNotice(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({
        success: false,
        message: err.message
    }));
};

// 禁用或启用通知
NoticeManage.prototype.toggleNotice = function (req, res, data) {
    DB.dbQuery.noticeManage.toggleNotice(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({
        success: false,
        message: err.message
    }));
};

module.exports = NoticeManage;