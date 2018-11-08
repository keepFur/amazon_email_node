/*
 * 用于 空包订单管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
let XLSX = require('xlsx');
let fs = require('fs');
let path = require('path');
let Core = require('./core');
const mkdir = '/src/download/';
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
                                    type: 7,
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

// 根据快递公司的代码获取快递公司的名字
function getKbTypeByCode(code) {
    var kb = {
        ST: '申通',
        ZT: '中通',
        LB: '龙邦',
        GT: '国通',
        YF: '亚风速运',
        BS: '百世'
    };
    return kb[code];
}

/**
 * 生成一个工作集
 * 
 * @param {String} fileName 工作集名称
 * @param {Array} data 数据 [[],[],[]...],第一个元素是列，之后的元素分别是每一行的元素
 * @returns 
 */
function make_book(fileName, data) {
    let ws = XLSX.utils.aoa_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, fileName);
    return wb;
}

/**
 * 下载异常文件
 *
 * @param {*} content
 */
function downloadErrFile(res, content) {
    let errFilePath = path.join(path.resolve(), mkdir + 'error.docx');
    fs.writeFile(errFilePath, content, err => {
        if (err) console.log(err.message);
        res.download(errFilePath);
    });
}

// 导出空包订单
KbOrderManage.prototype.exportKbOrderToExcel = function (req, res, data) {
    data.userId = req.user.id;
    data.isSuper = req.user.isSuper;
    DB.dbQuery.manageKbOrder.readKbOrderPage(data).then(result => {
        var temp = result.map(function (item) {
            return [item.number, getKbTypeByCode(item.kbCompany), item.kbNumber, item.addressFrom, item.addressTo, item.toName, Core.flyer.formatDate('yyyy-mm-dd hh:MM:ss', item.createdDate)];
        });
        var columns = ['订单号', '快递类型', '快递单号', '发货地址', '收货地址', '收货人', '下单时间'];
        let fileName = Core.flyer.formatDate('yyyy-mm-dd') + '-空包订单.xls',
            filePath = path.join(path.resolve(), mkdir + fileName);
        temp.unshift(columns);
        let workbook = make_book(fileName, temp);
        XLSX.writeFileAsync(filePath, workbook, () => {
            res.download(filePath);
        });
    }).catch(err => {
        downloadErrFile(res, '空包订单导出发生异常，请刷新页面重试。\n异常原因：' + err.message);
    });
};

// 拼多多批量发货
KbOrderManage.prototype.pbbBtach = function (req, res, data) {
    data.userId = req.user.id;
    data.isSuper = req.user.isSuper;
    DB.dbQuery.manageKbOrder.readKbOrderPage(data).then(result => {
        var temp = result.map(function (item) {
            return [item.number, getKbTypeByCode(item.kbCompany), item.kbNumber];
        });
        var columns = ['订单号', '快递公司', '快递单号'];
        let fileName = Core.flyer.formatDate('yyyy-mm-dd') + '-拼多多批量发货.xls',
            filePath = path.join(path.resolve(), mkdir + fileName);
        temp.unshift(['order_sn', 'shipping_name', 'shipping_sn']);
        temp.unshift(columns);
        let workbook = make_book(fileName, temp);
        XLSX.writeFileAsync(filePath, workbook, () => {
            res.download(filePath);
        });
    }).catch(err => {
        downloadErrFile(res, '空包订单导出发生异常，请刷新页面重试。\n异常原因：' + err.message);
    });
};

// 导出待扫描订单
KbOrderManage.prototype.downloadKbOrderToExcel = function (req, res, data) {
    if (!data.kbCompany) {
        console.log('请选择快递平台');
        downloadErrFile(res, '请选择快递平台');
        return;
    }
    data.userId = req.user.id;
    data.isSuper = req.user.isSuper;
    // 待扫描
    data.status = 1;
    DB.dbQuery.manageKbOrder.readKbOrderPage(data).then(result => {
        let id = [];
        var temp = result.map(function (item) {
            var toPca = item.addressToPca.split('-');
            var fromPca = item.addressFromPca.split('-');
            id.push(item.id);
            return [item.kbNumber, fromPca[0], fromPca[1], fromPca[2], toPca[0], toPca[1], toPca[2], item.toName, item.kbWeight, item.addressTo.split(/,|，/)[2]];
        });
        if (temp.length === 0) {
            console.log('没有待扫描的订单');
            downloadErrFile(res, '没有待扫描的订单');
            return;
        }
        var columns = ['运单号', '寄件省份', '寄件城市', '寄件区县', '派件省份', '派件城市', '派件区县', '收件人', '重量', '收货详细地址'];
        let fileName = getKbTypeByCode(data.kbCompany) + Core.flyer.formatDate('yyyy-mm-dd') + '-待扫描.xls',
            filePath = path.join(path.resolve(), mkdir + fileName);
        temp.unshift(columns);
        let workbook = make_book(fileName, temp);
        XLSX.writeFileAsync(filePath, workbook, () => {
            res.download(filePath, function (err) {
                if (err) {
                    console.log(err.message);
                } else {
                    // 将状态标记为已扫描
                    DB.dbQuery.manageKbOrder.toggleKbOrder({
                        status: 2,
                        id: id
                    }).catch(err => {
                        console.log(err.message);
                    });
                }
            });
        });
    }).catch(err => {
        downloadErrFile(res, '空包订单导出发生异常，请刷新页面重试。\n异常原因：' + err.message);
    });
};

// 下载发货地址模版
KbOrderManage.prototype.downloadTemplate = function (req, res, data) {
    if (!data.plant) {
        console.log('请选择电商平台');
        downloadErrFile(res, '请选择电商平台');
        return;
    }
    let filePath = path.join(path.resolve(), mkdir + (data.plant === 'PDD' ? '拼多多收货地址模版.xlsx' : '淘宝-京东收货地址模版.xlsx'));
    res.download(filePath);
};

// 通过excel导入发货地址
KbOrderManage.prototype.importAddressExcel = function (req, res, file) {
    if (!file.length) {
        res.send({
            success: false,
            message: '没有选择文件'
        });
    } else {
        let filePath = file[0].path;
        try {
            const workbook = XLSX.readFile(filePath, {
                cellNF: true,
                cellStyles: true
            });
            // 获取 Excel 中所有表名  返回 ['sheet1', 'sheet2']
            const sheetNames = workbook.SheetNames;
            // 根据表名获取对应某张表
            const worksheet = workbook.Sheets[sheetNames[0]];
            let JSONDatas = XLSX.utils.sheet_to_json(worksheet);
            let datas = JSONDatas.map((item) => {
                return {
                    name: item['收件人姓名'],
                    phone: item['收件人电话'],
                    province: item['收件人省份'],
                    city: item['收件人城市'],
                    area: item['收件人区县'],
                    detail: item['详细地址'],
                    email: item[req.headers.plant === 'PDD' ? '平台订单号' : '邮编'],
                };
            });
            fs.unlink(filePath, (err) => {
                if (err) console.log(err.message);
                console.log('成功删除文件:' + filePath);
            });
            res.send({
                success: true,
                message: '',
                data: datas
            });
        } catch (error) {
            fs.unlink(filePath, (err) => {
                if (err) console.log(err.message);
                console.log('成功删除文件:' + filePath);
            });
            res.send({
                success: false,
                message: error.message,
                data: []
            });
        }
    }
};

// 通过excel导入空包单号
KbOrderManage.prototype.importKbNumberExcel = function (req, res, file) {
    if (!file.length) {
        res.send({
            success: false,
            message: '没有选择文件'
        });
    } else {
        let filePath = file[0].path;
        try {
            const workbook = XLSX.readFile(filePath, {
                cellNF: true,
                cellStyles: true
            });
            // 获取 Excel 中所有表名  返回 ['sheet1', 'sheet2']
            const sheetNames = workbook.SheetNames;
            // 根据表名获取对应某张表
            const worksheet = workbook.Sheets[sheetNames[0]];
            let JSONDatas = XLSX.utils.sheet_to_json(worksheet);
            let datas = JSONDatas.map((item) => {
                return {
                    number: item['单号'],
                    plant: item['电商平台简称'],
                    company: item['快递公司简称']
                };
            });
            fs.unlink(filePath, (err) => {
                if (err) console.log(err.message);
                console.log('成功删除文件:' + filePath);
            });
            // 插入到数据库中
            DB.dbQuery.manageKbNumber.createKbNumberByExcel({
                numbers: datas
            }).then((result) => {
                res.send({
                    success: result.affectedRows === datas.length,
                    message: ''
                });
            }).catch(err => {
                res.send({
                    success: false,
                    message: err.message,
                });
                console.log(err.message)
            });
        } catch (error) {
            fs.unlink(filePath, (err) => {
                if (err) console.log(err.message);
                console.log('成功删除文件:' + filePath);
            });
            res.send({
                success: false,
                message: error.message,
            });
        }
    }
};

// 下载空包单号模版
KbOrderManage.prototype.downloadKbNumberTemplate = function (req, res) {
    let filePath = path.join(path.resolve(), mkdir + '空包单号导入模版.xlsx');
    res.download(filePath);
};
module.exports = KbOrderManage;