/*
 * 用于 经营概况管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
const bcrypt = require('bcrypt');
// 经营概况构造函数
let OperateOverview = function () { };

// 创建经营概况
OperateOverview.prototype.createUser = function (req, res, data) {
    if (!data.phone) {
        res.send({
            success: false,
            message: '手机号不能为空'
        });
        return;
    }
    // 判重
    DB.dbQuery.operateOverview.userLogin(data).then(function (user) {
        if (user.length !== 0) {
            res.send({
                success: false,
                message: '经营概况名已经存在'
            });
        } else {
            genHashPassword(data.password, function (err, genresult) {
                if (err) {
                    res.send({
                        success: false,
                        message: err.message
                    });
                } else {
                    data.password = genresult.hash;
                    data.salt = genresult.salt;
                    DB.dbQuery.operateOverview.createUser(data).then(result => {
                        req.session.userId = result.insertId;
                        // 需要写一条日志到系统中，或者直接调用经营概况的充值方法
                        DB.dbQuery.operateOverview.addMoneyUser({
                            money: 250,
                            id: req.session.userId
                        }).then(() => {
                            DB.dbQuery.logsScoreManage.createLogsScore({
                                userId: req.session.userId,
                                userName: data.userName,
                                type: 4,
                                count: 250,
                                orderNumber: Date.now(),
                                balance: 250
                            }).then(function () {
                                res.send({
                                    success: result.affectedRows === 1,
                                    message: '经营概况创建成功'
                                });
                                console.log(`在${new Date()},经营概况： ${data.userName}充值${10}元`);
                            });
                        });
                    }).catch(err => res.send({ success: false, message: err.message }));
                }
            });
        }
    });
};

// 读取记录(需要分页,查询条件：id，username,status等)
OperateOverview.prototype.readUserPage = function (req, res, data) {
    DB.dbQuery.operateOverview.readUserPage(data).then(result => {
        DB.dbQuery.operateOverview.readUserPageTotal(data).then(total => {
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
OperateOverview.prototype.readUserById = function (req, res, data) {
    DB.dbQuery.operateOverview.readUserById(data).then(result => {
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
OperateOverview.prototype.updateUser = function (req, res, data) {
    DB.dbQuery.operateOverview.updateUser(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 经营概况充值
OperateOverview.prototype.addMoneyUser = function (req, res, data) {
    DB.dbQuery.operateOverview.addMoneyUser(data).then(result => {
        DB.dbQuery.logsScoreManage.createLogsScore({
            userId: data.id,
            userName: data.userName,
            type: 4,
            count: data.money,
            orderNumber: Date.now(),
            balance: parseInt(data.balance) + parseInt(data.money)
        }).then(function () {
            res.send({
                success: result.affectedRows === 1,
                message: ''
            });
            console.log(`在${new Date()},经营概况： ${data.userName}充值${data.money}元`);
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用经营概况
OperateOverview.prototype.toggleUser = function (req, res, data) {
    DB.dbQuery.operateOverview.toggleUser(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 会员等级修改
OperateOverview.prototype.updateLevelUser = function (req, res, data) {
    DB.dbQuery.operateOverview.readUserById(data).then(u => {
        if (u && u[0].lever === 2) {
            res.send({
                success: false,
                message: '老板，你已经是我们的顶级会员了，已经大权在握，杠杠的！！！'
            });
        } else {
            DB.dbQuery.operateOverview.updateLevelUser(data).then(result => {
                DB.dbQuery.logsScoreManage.createLogsScore({
                    userId: data.id,
                    userName: data.userName,
                    type: 6,
                    count: 990,
                    orderNumber: data.orderNumber,
                    balance: parseInt(data.money) - 990
                }).then(function (logResult) {
                    console.log(`在${new Date()},经营概况： ${data.userName}扣除9.9元`);
                    res.send({
                        success: result.affectedRows === 1,
                        message: ''
                    });
                });
            }).catch(err => res.send({ success: false, message: err.message }));
        }
    });
};

// 经营概况权限修改
OperateOverview.prototype.updateIsSuperUser = function (req, res, data) {
    DB.dbQuery.operateOverview.updateIsSuperUser(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 经营概况登录
OperateOverview.prototype.userLogin = function (req, res, data) {
    DB.dbQuery.operateOverview.userLogin(data).then(result => {
        // 将获取到的经营概况密码和salt进行hash
        if (result.length === 0) {
            res.send({
                success: false,
                message: '经营概况名不存在'
            });
        } else {
            bcrypt.hash(data.password, result[0].salt, function (err, hash) {
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

// 重置密码
OperateOverview.prototype.setUserPassword = function (req, res, data) {
    DB.dbQuery.operateOverview.userLogin(data).then(result => {
        if (result.length === 0) {
            res.send({
                success: false,
                message: '经营概况不存在'
            });
        } else {
            genHashPassword(data.password, function (err, genresult) {
                if (err) {
                    res.send({
                        success: false,
                        message: err.message
                    });
                } else {
                    data.password = genresult.hash;
                    data.salt = genresult.salt;
                    DB.dbQuery.operateOverview.setUserPassword(data).then(result => {
                        res.send({
                            success: result.affectedRows === 1,
                            message: '密码修改成功'
                        });
                    }).catch(err => res.send({ success: false, message: err.message }));
                }
            });
        }
    });
};

// 根据手机号和经营概况名获取经营概况信息
OperateOverview.prototype.getUserInfoByPhone = function (req, res, data) {
    DB.dbQuery.operateOverview.getUserInfoByPhone(data).then(result => {
        res.send({
            success: result.length === 1,
            message: result.length === 1 ? '' : '经营概况名和手机号不匹配'
        });
    });
};

// 经营概况密码经过hash处理
function genHashPassword(password, fn) {
    bcrypt.genSalt(12, function (err, salt) {
        if (err) {
            return fn(err);
        }
        bcrypt.hash(password, salt, function (err, hash) {
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
module.exports = OperateOverview;