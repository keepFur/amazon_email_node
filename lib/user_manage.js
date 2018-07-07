/*
 * 用于 用户管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 用户构造函数
let UserManage = function() {};

// 创建用户
UserManage.prototype.createUser = function(req, res, data) {
    DB.dbQuery.userManage.createUser(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: '用户创建成功'
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(需要分页,查询条件：id，username,status等)
UserManage.prototype.readUserPage = function(req, res, data) {
    DB.dbQuery.userManage.readUserPage(data).then(result => {
        DB.dbQuery.userManage.readUserPageTotal(data).then(total => {
            res.send({
                success: true,
                message: '',
                data: {
                    total: total[0].total,
                    rows: result,
                },
            });
        }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
};

// 读取一条记录通过id
UserManage.prototype.readUserById = function(req, res, data) {
    DB.dbQuery.userManage.readUserById(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            },
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};

// 更新
UserManage.prototype.updateUser = function(req, res, data) {
    DB.dbQuery.userManage.updateUser(data).then(result => {
        res.send({
            success: result.affectedRows === data.length,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 用户充值
UserManage.prototype.addMoneyUser = function(req, res, data) {
    DB.dbQuery.userManage.addMoneyUser(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用用户
UserManage.prototype.toggleUser = function(req, res, data) {
    DB.dbQuery.userManage.toggleUser(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 会员等级修改
UserManage.prototype.updateLevelUser = function(req, res, data) {
    DB.dbQuery.userManage.updateLevelUser(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 用户权限修改
UserManage.prototype.updateIsSuperUser = function(req, res, data) {
    DB.dbQuery.userManage.updateIsSuperUser(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 用户登录
UserManage.prototype.userLogin = function(req, res, data) {
    DB.dbQuery.userManage.userLogin(data).then(result => {
        res.send({
            success: result.length !== 0 ? result[0].password === data.password ? true : false : false,
            message: ''
        });
    });
};

module.exports = UserManage;