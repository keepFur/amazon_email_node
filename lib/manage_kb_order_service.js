/*
 * 用于 空包订单管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 空包订单构造函数
let KbOrderManage = function () { };

// 创建空包订单
KbOrderManage.prototype.createKbOrder = function (req, res, data) {
    //  判断用户余额是否足够
    DB.dbQuery.userManage.readUserById({ id: req.user.id }).then(user => {
        if (user && user.length > 0 && user[0].money >= data.total) {
            // 余额充足之后，需要去获取一批（根据收货人的数量决定的）空包单号分配给相应的订单
            DB.dbQuery.manageKbNumber.readKbNumberPage({
                limit: data.addressTo.length,
                offset: 1,
                status: 1,
                company: data.kbCompany,
                plant: data.plant
            }).then(number => {
                if (!number.length) {
                    res.send({
                        success: false,
                        message: '快递单号库存不足,请联系客服人员'
                    });
                } else {
                    data.userId = req.user.id;
                    data.kbNumber = number;
                    DB.dbQuery.manageKbOrder.createKbOrder(data).then(result => {
                        if (result.affectedRows === data.kbNumber.length) {
                            // 扣除用户余额
                            DB.dbQuery.userManage.reduceMoneyUser({
                                money: data.total,
                                id: req.user.id
                            }).then(reduceResult => {
                                DB.dbQuery.logsScoreManage.createLogsScore({
                                    userId: req.user.id,
                                    userName: req.user.userName,
                                    type: 2,
                                    count: data.total,
                                    orderNumber: data.number,
                                    balance: parseInt(req.user.money) - parseInt(data.total)
                                }).then(function (logResult) {
                                    // 余额扣除完之后还需要把快递单号设置为不可用状态 todo
                                    DB.dbQuery.manageKbNumber.toggleKbNumber({
                                        status: 0,
                                        id: number.map(item => item.id)
                                    });
                                    console.log(`在${new Date()},用户： ${req.user.userName}扣除${data.total}元`);
                                    res.send({
                                        success: reduceResult.affectedRows === 1,
                                        message: '空包订单创建成功'
                                    });
                                });
                            });
                        } else {
                            res.send({
                                success: false,
                                message: '空包订单创建失败'
                            });
                        }
                    }).catch(err => res.send({
                        success: false,
                        message: err.message
                    }));
                }
            }).catch(err => res.send({
                success: false,
                message: err.message
            }));
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

// 读取记录(需要分页,查询条件：id，name,status等)
KbOrderManage.prototype.readKbOrderPage = function (req, res, data) {
    data.userId = req.user.id;
    data.isSuper = req.user.isSuper;
    DB.dbQuery.manageKbOrder.readKbOrderPage(data).then(result => {
        DB.dbQuery.manageKbOrder.readKbOrderPageTotal(data).then(total => {
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
KbOrderManage.prototype.readKbOrderById = function (req, res, data) {
    DB.dbQuery.manageKbOrder.readKbOrderById(data).then(result => {
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
KbOrderManage.prototype.updateKbOrder = function (req, res, data) {
    DB.dbQuery.manageKbOrder.updateKbOrder(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用空包订单
KbOrderManage.prototype.toggleKbOrder = function (req, res, data) {
    DB.dbQuery.manageKbOrder.toggleKbOrder(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

module.exports = KbOrderManage;