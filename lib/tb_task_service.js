/*
 * 用于 淘宝任务 模块功能的业务逻辑实现
 */
"use strict";
let DB = require("./db");
const https = require('https');
const Core = require('./core');
// 淘宝任务构造函数
let TbTaskService = function() {};

// 创建淘宝任务
TbTaskService.prototype.createTask = function(req, res, data) {
    //  判断用户余额是否充值
    // 计算会员的价格
    data.taskSumMoney = Core.flyer.computeTotalPriceTask(req.user.level, data.taskSumMoney);
    data.taskUnitPrice = Core.flyer.computeTotalPriceTask(req.user.level, data.taskUnitPrice);
    DB.dbQuery.userManage.readUserById({ id: req.user.id }).then(user => {
        if (user && user.length > 0 && user[0].money >= data.taskSumMoney) {
            data.taskUserId = req.user.id;
            DB.dbQuery.tbTask.createTask(data).then(result => {
                if (result.affectedRows === 1) {
                    // 扣除用户
                    DB.dbQuery.userManage.reduceMoneyUser({
                        money: data.taskSumMoney,
                        id: req.user.id
                    }).then(reduceResult => {
                        DB.dbQuery.logsScoreManage.createLogsScore({
                            userId: req.user.id,
                            userName: req.user.userName,
                            type: 2,
                            count: data.taskSumMoney,
                            orderNumber: data.taskOrderNumber,
                            balance: parseInt(user[0].money) - parseInt(data.taskSumMoney)
                        }).then(function(logResult) {
                            console.log(`在${new Date()},用户： ${req.user.userName}扣除${data.taskSumMoney}分`);
                            res.send({
                                success: reduceResult.affectedRows === 1,
                                message: '任务创建成功'
                            });
                        });
                    });
                } else {
                    res.send({
                        success: false,
                        message: '任务创建失败'
                    });
                }
            }).catch(err => res.send({ success: false, message: err.message }));
        } else {
            res.send({
                success: false,
                message: '用户未登录或者可用余额不足'
            });
        }
    }).catch((err) => {
        res.send({
            success: false,
            message: '用户未登录或者可用余额不足'
        });
    });
};

// 读取记录(需要分页,查询条件：id，username,status等)
TbTaskService.prototype.readTaskPage = function(req, res, data) {
    data.taskUserId = req.user.id;
    data.isSuper = req.user.isSuper;
    DB.dbQuery.tbTask.readTaskPage(data).then(result => {
        DB.dbQuery.tbTask.readTaskPageTotal(data).then(total => {
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
TbTaskService.prototype.readTaskById = function(req, res, data) {
    DB.dbQuery.tbTask.readTaskById(data).then(result => {
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
TbTaskService.prototype.updateTask = function(req, res, data) {
    DB.dbQuery.tbTask.updateTask(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用淘宝任务
TbTaskService.prototype.toggleTask = function(req, res, data) {
    DB.dbQuery.tbTask.toggleTask(data).then(result => {
        if (data.status == 3) {
            // 给用户的账户增加退款金额
            DB.dbQuery.userManage.addMoneyUser({
                money: data.count,
                id: data.taskUserId
            }).then(result => {
                // 增加退款日志
                DB.dbQuery.userManage.readUserById({ id: data.taskUserId }).then(user => {
                    if (user.length) {
                        // 增加退款日志
                        DB.dbQuery.logsScoreManage.createLogsScore({
                            userId: user[0].id,
                            userName: user[0].userName,
                            type: 3,
                            count: data.count,
                            orderNumber: data.taskOrderNumber,
                            balance: parseInt(user[0].money)
                        }).then(function(logResult) {
                            res.send({
                                success: logResult.affectedRows === 1,
                                message: ''
                            });
                            console.log(`在${new Date()},用户： ${user[0].userName}退款到账${data.count}`);
                        }).catch(err => {
                            res.send({
                                success: false,
                                message: '服务器发生异常，请联系客服。'
                            });
                            console.log(err.message);
                        });
                    } else {
                        res.send({
                            success: false,
                            message: '该订单的下单用户不存在'
                        });
                    }
                }).catch(err => {
                    res.send({
                        success: false,
                        message: '服务器异常，请联系客服解决。'
                    });
                });
            }).catch(err => res.send({ success: false, message: err.message }));
        } else {
            res.send({
                success: result.affectedRows === 1,
                message: ''
            });
        }
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 根据任务订单号，奖任务标记为已完成
TbTaskService.prototype.maskCompleteTask = function(req, res, data) {
    DB.dbQuery.tbTask.maskCompleteTask(data).then(result => {
        res.send({
            success: true,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取所有的状态为处理中的任务
TbTaskService.prototype.readAllProcessTask = function(req, res) {
    DB.dbQuery.tbTask.readAllProcessTask({
        isSuper: req.user.isSuper,
        taskUserId: req.user.id
    }).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            },
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};

// 获取淘宝详情
TbTaskService.prototype.getTbDetail = function(reqClient, resClient) {
    const url = `https://acs.m.taobao.com/h5/mtop.taobao.detail.getdetail/6.0/?data=${encodeURIComponent(JSON.stringify({ itemNumId: reqClient.query.id }))}`;
    https.get(url, function(res) {
        const { statusCode } = res;
        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`);
        }
        if (error) {
            Core.flyer.log(error.message);
            res.resume();
            return;
        }
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                resClient.send(parsedData);
            } catch (e) {
                Core.flyer.log(e.message);
            }
        });
    }).on('error', e => {
        Core.flyer.log(e.message);
    });
};

module.exports = TbTaskService;