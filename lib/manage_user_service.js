/*
 * 用于 用户管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
const bcrypt = require('bcrypt');
// 用户构造函数
let UserManage = function() {};

// 创建用户
UserManage.prototype.createUser = function(req, res, data) {
    // 判重
    DB.dbQuery.userManage.userLogin(data).then(function(user) {
        if (user.length !== 0) {
            res.send({
                success: false,
                message: '用户名已经存在'
            });
        } else {
            genHashPassword(data.password, function(err, genresult) {
                if (err) {
                    res.send({
                        success: false,
                        message: err.message
                    });
                } else {
                    data.password = genresult.hash;
                    data.salt = genresult.salt;
                    DB.dbQuery.userManage.createUser(data).then(result => {
                        res.send({
                            success: result.affectedRows === 1,
                            message: '用户创建成功'
                        });
                    }).catch(err => res.send({ success: false, message: err.message }));
                }
            });
        }
    });
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
            success: result.affectedRows === 1,
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
        // 将获取到的用户密码和salt进行hash
        if (result.length === 0) {
            res.send({
                success: false,
                message: '用户名不存在'
            });
        } else {
            bcrypt.hash(data.password, result[0].salt, function(err, hash) {
                if (err) {
                    res.send({
                        success: false,
                        message: '密码不正确'
                    });
                } else {
                    if (hash === result[0].password) {
                        req.session.userId = result[0].id;
                        req.session.userName = data.userName;
                        res.send({
                            success: true,
                            message: '登录成功'
                        });
                    } else {
                        res.send({
                            success: false,
                            message: '密码不正确'
                        });
                    }
                }
            });
        }
    });
};

// 用户密码经过hash处理
function genHashPassword(password, fn) {
    bcrypt.genSalt(12, function(err, salt) {
        if (err) {
            return fn(err);
        }
        bcrypt.hash(password, salt, function(err, hash) {
            if (err) {
                return fn(err);
            }
            fn(null, {
                hash,
                salt
            });
        });
    });
};
module.exports = UserManage;