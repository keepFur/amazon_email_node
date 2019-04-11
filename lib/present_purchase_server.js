/*
 * 用于 礼品订单管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
let XLSX = require('xlsx');
let fs = require('fs');
let path = require('path');
let Core = require('./core');
let APIArea = require('./api_area');
const mkdir_templeate = '/src/download_template/';
const mkdir_order = '/src/download_order/';
const APIParseExcel = require('./api_parse_excel');
// 礼品订单构造函数
let PresentPurchase = function () {};
const serverErrMessage = '服务器发生异常，请联系客服。';
// 创建礼品订单
PresentPurchase.prototype.createPresentOrder = function (req, res, data) {
    // 计算会员的价格
    const kdPrice = 310;
    data.price = Core.flyer.computeTotalPrice(req.user.level, kdPrice) + Number(data.price); // fen
    data.total = data.price;
    data.userId = req.user.id;
    //  判断用户余额是否足够
    DB.dbQuery.userManage.readUserById({
        id: req.user.id
    }).then(user => {
        if (user && user.length > 0 && user[0].money >= data.total) {
            // 余额充足
            DB.dbQuery.presentPurchase.createPresentOrder(data).then(result => {
                if (result.affectedRows === data.addressTo.length) {
                    // 扣除用户余额
                    DB.dbQuery.userManage.reduceMoneyUser({
                        money: data.total,
                        id: req.user.id
                    }).then(reduceResult => {
                        DB.dbQuery.logsScoreManage.createLogsScore({
                            userId: req.user.id,
                            userName: req.user.userName,
                            type: 9,
                            count: data.total,
                            orderNumber: data.orderNumber,
                            balance: parseInt(user[0].money) - parseInt(data.total)
                        }).then(function (logResult) {
                            console.log(`在${new Date()},用户： ${req.user.userName}扣除${data.total/100}元`);
                            res.send({
                                success: reduceResult.affectedRows === 1,
                                message: '礼品订单创建成功'
                            });
                        });
                    });
                } else {
                    res.send({
                        success: false,
                        message: '礼品订单创建失败'
                    });
                }
            }).catch(err => res.send({
                success: false,
                message: serverErrMessage
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

// 读取礼品订单记录(需要分页,查询条件：id，name,status等)
PresentPurchase.prototype.readPresentOrderPage = function (req, res, data) {
    data.userId = req.user.id;
    data.isSuper = req.user.isSuper;
    DB.dbQuery.presentPurchase.readPresentOrderPage(data).then(result => {
        DB.dbQuery.presentPurchase.readPresentOrderTotal(data).then(total => {
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
PresentPurchase.prototype.readPresentOrderById = function (req, res, data) {
    DB.dbQuery.presentPurchase.readPresentOrderById(data).then(result => {
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

// 读取礼品列表
PresentPurchase.prototype.readPresent = function (req, res, data) {
    DB.dbQuery.presentPurchase.readPresent(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            }
        });
    }).catch(err => res.send({
        success: false,
        message: err.message
    }));
};

// 读取单个礼品通过id
PresentPurchase.prototype.readPresentById = function (req, res, data) {
    DB.dbQuery.presentPurchase.readPresentById(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            }
        });
    }).catch(err => res.send({
        success: false,
        message: err.message
    }));
};

// 读取发货人信息
PresentPurchase.prototype.readFromUserInfoById = function (req, res, data) {
    DB.dbQuery.presentPurchase.readFromUserInfoById(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            },
        });
    }).catch(err => res.send({
        success: false,
        message: err.message
    }));
};

// 保存发货人信息
PresentPurchase.prototype.saveFromUserInfoById = function (req, res, data) {
    DB.dbQuery.presentPurchase.saveFromUserInfoById(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({
        success: false,
        message: err.message
    }));
};

// 修改发货人信息
PresentPurchase.prototype.updateFromUserInfoById = function (req, res, data) {
    DB.dbQuery.presentPurchase.updateFromUserInfoById(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({
        success: false,
        message: err.message
    }));
};

// 读取发货仓库信息
PresentPurchase.prototype.readFromStock = function (req, res, data) {
    DB.dbQuery.presentPurchase.readFromStock(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            }
        });
    }).catch(err => res.send({
        success: false,
        message: err.message
    }));
};

// 读取发货仓库信息通过id
PresentPurchase.prototype.readFromStockById = function (req, res, data) {
    DB.dbQuery.presentPurchase.readFromStockById(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            }
        });
    }).catch(err => res.send({
        success: false,
        message: err.message
    }));
};

// 禁用或启用礼品订单
PresentPurchase.prototype.togglePresentOrder = function (req, res, data) {
    DB.dbQuery.presentPurchase.togglePresentOrder(data).then(result => {
        if (data.status === '3') {
            // 给用户的账户增加退款金额
            DB.dbQuery.userManage.addMoneyUser({
                money: data.count,
                id: data.userId
            }).then(result => {
                // 增加退款日志
                DB.dbQuery.userManage.readUserById({
                    id: data.userId
                }).then(user => {
                    if (user.length) {
                        DB.dbQuery.logsScoreManage.createLogsScore({
                            userId: data.userId,
                            userName: data.userName,
                            type: 10,
                            count: data.count,
                            orderNumber: data.number,
                            balance: parseInt(user[0].money)
                        }).then(function (logResult) {
                            res.send({
                                success: logResult.affectedRows === 1,
                                message: ''
                            });
                            console.log(`在${new Date()},用户： ${data.userName}充值${data.count}`);
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
                        message: serverErrMessage
                    });
                });
            }).catch(err => res.send({
                success: false,
                message: serverErrMessage
            }));
        } else {
            res.send({
                success: result.affectedRows === 1,
                message: ''
            });
        }
    }).catch(err => res.send({
        success: false,
        message: serverErrMessage
    }));
};

// 修改礼品订单信息
PresentPurchase.prototype.updatePresentOrder = function (req, res, data) {
    DB.dbQuery.presentPurchase.updatePresentOrder(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({
        success: false,
        message: serverErrMessage
    }));
};

// 设置快递单号
PresentPurchase.prototype.setPresentKdNumber = function (req, res, data) {
    DB.dbQuery.presentPurchase.setPresentKdNumber(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({
        success: false,
        message: serverErrMessage
    }));
};


// 根据快递公司的代码获取快递公司的名字
function getKbTypeByCode(code) {
    var kb = {
        ST: '申通快递',
        ZT: '中通快递',
        LB: '龙邦快递',
        GT: '国通快递',
        YF: '亚风速运',
        BS: '百世快递',
        YT: '圆通快递',
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
    let errFilePath = path.join(path.resolve(), mkdir_templeate + 'error.csv');
    fs.writeFile(errFilePath, content, err => {
        if (err) console.log(err.message);
        res.download(errFilePath);
    });
}

// 导出礼品订单
PresentPurchase.prototype.exportKbOrderToExcel = function (req, res, data) {
    data.userId = req.user.id;
    data.isSuper = req.user.isSuper;
    DB.dbQuery.presentPurchase.readKbOrderPage(data).then(result => {
        var temp = result.map(function (item) {
            return [item.number, getKbTypeByCode(item.kbCompany), item.kbNumber, item.addressFrom, item.addressTo, item.toName, Core.flyer.formatDate('yyyy-mm-dd hh:MM:ss', item.createdDate)];
        });
        var columns = ['订单号', '快递类型', '快递单号', '发货地址', '收货地址', '收货人', '下单时间'];
        let fileName = Core.flyer.formatDate('yyyy-mm-dd') + '-礼品订单.xls',
            filePath = path.join(path.resolve(), mkdir_order + fileName);
        temp.unshift(columns);
        let workbook = make_book(fileName, temp);
        XLSX.writeFileAsync(filePath, workbook, () => {
            res.download(filePath);
        });
    }).catch(err => {
        downloadErrFile(res, '礼品订单导出发生异常，请刷新页面重试。\n异常原因：' + err.message);
    });
};

// 拼多多批量发货
PresentPurchase.prototype.pbbBtach = function (req, res, data) {
    data.userId = req.user.id;
    data.isSuper = req.user.isSuper;
    DB.dbQuery.presentPurchase.readKbOrderPage(data).then(result => {
        var temp = result.map(function (item) {
            return [item.number, getKbTypeByCode(item.kbCompany), item.kbNumber];
        });
        var columns = ['订单号', '快递公司', '快递单号'];
        let fileName = Core.flyer.formatDate('yyyy-mm-dd') + '-PDDPLFH.xlsx',
            filePath = path.join(path.resolve(), mkdir_order + fileName);
        temp.unshift(['order_sn', 'shipping_name', 'shipping_sn']);
        temp.unshift(columns);
        let workbook = make_book(fileName, temp);
        XLSX.writeFileAsync(filePath, workbook, () => {
            res.download(filePath);
        });
    }).catch(err => {
        downloadErrFile(res, '礼品订单导出发生异常，请刷新页面重试。\n异常原因：' + err.message);
    });
};

// 导出待扫描订单
PresentPurchase.prototype.downloadKbOrderToExcel = function (req, res, data) {
    if (!data.kbCompany) {
        console.log('请选择快递平台');
        downloadErrFile(res, '请选择快递平台');
        return;
    }
    data.userId = req.user.id;
    data.isSuper = req.user.isSuper;
    // 待扫描
    data.status = 1;
    DB.dbQuery.presentPurchase.readKbOrderPage(data).then(result => {
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
            filePath = path.join(path.resolve(), mkdir_order + fileName);
        temp.unshift(columns);
        let workbook = make_book(fileName, temp);
        XLSX.writeFileAsync(filePath, workbook, () => {
            res.download(filePath, function (err) {
                if (err) {
                    console.log(err.message);
                } else {
                    // 将状态标记为已扫描
                    DB.dbQuery.presentPurchase.toggleKbOrder({
                        status: 2,
                        id: id
                    }).catch(err => {
                        console.log(err.message);
                    });
                }
            });
        });
    }).catch(err => {
        downloadErrFile(res, '礼品订单导出发生异常，请刷新页面重试。\n异常原因：' + err.message);
    });
};

// 下载发货地址模版
PresentPurchase.prototype.downloadTemplate = function (req, res, data) {
    if (!data.plant) {
        console.log('请选择电商平台');
        downloadErrFile(res, '请选择电商平台');
        return;
    }
    let filePath = path.join(path.resolve(), mkdir_templeate + (data.plant === 'PDD' ? '拼多多收货地址模版.xlsx' : '淘宝-京东收货地址模版.xlsx'));
    res.download(filePath);
};

// 根据平台获取表格的key
function getKeyByPlant(plant) {
    plant = plant || 'TB';
    var key = {
        TB: {
            name: '收货人姓名',
            phone: '联系手机',
            province: '省',
            city: '市',
            area: '区',
            detail: '收货地址',
            email: '订单编号'
        },
        PDD: {
            name: '收货人',
            phone: '手机',
            province: '省',
            city: '市',
            area: '区',
            detail: '街道',
            email: '订单号'
        },
        JD: {
            name: '客户姓名',
            phone: '联系电话',
            province: '省',
            city: '市',
            area: '区',
            detail: '客户地址',
            email: '订单号'
        }
    };
    return key[plant];
}

/**
 *获取一个地址中的省市区
 *
 * @param {*} add
 */
function getPCAByAddress(item, plant) {
    let key = getKeyByPlant(plant);
    let detail = item[key.detail];
    let p = '';
    let c = '';
    let a = '';
    let d = '';
    if (plant === 'TB') {
        p = detail.split(' ')[0];
        c = detail.split(' ')[1];
        a = detail.split(' ')[2];
        d = detail.split(' ')[3];
    } else if (plant === 'PDD') {
        p = item[key.province];
        c = item[key.city];
        a = item[key.area];
        d = item[key.detail];
    } else if (plant === 'JD') {
        const allP = APIArea.getProvinceServer().rows;
        allP.forEach(element => {
            if (detail.indexOf(element.name.replace('省', '')) !== -1) {
                p = element.name.replace('省', '');
                return false;
            }
        });
        var detailArr = detail.replace(new RegExp(p), p + ' ').replace('市', '市 ').replace('区', '区 ').replace('县', '县 ').replace('镇', '镇 ').replace('乡', '乡 ').replace('北京', '北京 北京市').split(' ');
        c = detailArr[1];
        a = detailArr[2];
        d = detailArr[3];
    }
    return {
        p,
        c,
        a,
        d,
        key,
        success: true
    };
}

// 获取文件编码
function getFileCodeing(filePath) {
    var buffer = fs.readFileSync(filePath, {});
    var encoding = '';
    if (buffer[0] == 0xff && buffer[1] == 0xfe) {
        encoding = 'unicode';
    } else if (buffer[0] == 0xfe && buffer[1] == 0xff) {
        encoding = 'unicode';
    } else if (buffer[0] == 0xef && buffer[1] == 0xbb) {
        encoding = 'utf-8';
    } else {
        encoding = 'gbk';
    }
    return encoding;
}

// 通过excel导入发货地址
PresentPurchase.prototype.importAddressExcel = function (req, res, file) {
    if (!file.length) {
        res.send({
            success: false,
            message: '没有选择文件'
        });
    } else {
        let filePath = file[0].path;
        try {
            APIParseExcel(filePath, function (err, resdata) {
                if (err) {
                    res.send({
                        success: false,
                        message: serverErrMessage
                    });
                } else {
                    // const workbook = XLSX.readFile(filePath, {
                    //     cellNF: true,
                    //     cellStyles: true,
                    // });
                    // 获取 Excel 中所有表名  返回 ['sheet1', 'sheet2']
                    // const sheetNames = workbook.SheetNames;
                    // 根据表名获取对应某张表
                    // const worksheet = workbook.Sheets[sheetNames[0]];
                    // let JSONDatas = getFileCodeing(filePath) === 'utf-8' ? XLSX.utils.sheet_to_json(worksheet) : JSON.parse(resdata.replace(/\s\":/g, '\":'));
                    let JSONDatas = JSON.parse(resdata.replace(/\s\":/g, '\":'));
                    console.log('JSONDATAS====>' + JSONDatas);
                    fs.unlink(filePath, (err) => {
                        if (err) console.log(err.message);
                        console.log('成功删除文件:' + filePath);
                    });
                    const plant = req.body.plant || 'TB';
                    var detail = JSONDatas.length && JSONDatas[0][getKeyByPlant(plant).detail];
                    if (!detail) {
                        res.send({
                            success: false,
                            message: '请选择和电商平台相对应的表格进行导入。',
                        });
                    } else {
                        let datas = JSONDatas.map((item) => {
                            var address = getPCAByAddress(item, plant);
                            const key = address.key;
                            return {
                                name: item[key.name],
                                phone: item[key.phone],
                                province: address.p,
                                city: address.c,
                                area: address.a,
                                detail: address.d.replace(/，|,/g, ''),
                                email: item[key.email],
                            };
                        });
                        res.send({
                            success: true,
                            message: '',
                            data: datas
                        });
                    }
                }
            });
        } catch (error) {
            fs.unlink(filePath, (err) => {
                if (err) console.log(err.message);
                console.log('成功删除文件:' + filePath);
            });
            res.send({
                success: false,
                message: serverErrMessage,
                data: []
            });
        }
    }
};

/**
 *  找出传入的店铺数组不存在数据库中的数据 ，最后返回一个数组
 * 
 * @param {any} inputArr 
 */
function uniqueKbNumber(inputArr, params, next) {
    if (Array.isArray(inputArr) && inputArr.length) {
        DB.dbQuery.manageKbNumber.readKbNumberByNumber(params).then(function (result) {
            if (result.length) {
                result = result.map(item => item.number);
                inputArr = inputArr.filter(item => result.indexOf(item) === -1);
                next(inputArr);
            } else {
                next(inputArr);
            }
        }).catch(() => {
            next([]);
        });
    } else {
        next([]);
    }
}

function unniqueArr(arr) {
    var newArr = arr.map(i => i.number);
    var ret = [];
    for (let i = 0; i < arr.length; i++) {
        if (newArr.indexOf(arr[i].number) === -1) {
            ret.push(arr[i]);
        }
    }
    return ret;
}

// 通过excel导入礼品单号
PresentPurchase.prototype.importKbNumberExcel = function (req, res, file) {
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
            // 先本地去重
            datas = unniqueArr(datas);
            // 再去数据库判重
            uniqueKbNumber(datas, {
                numbers: datas.map(i => i.number)
            }, function (ret) {
                if (ret.length === 0) {
                    res.send({
                        success: true,
                        message: '礼品单号创建成功'
                    });
                } else {
                    // 插入到数据库中
                    DB.dbQuery.manageKbNumber.createKbNumberByExcel({
                        numbers: ret
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
                }
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

// 下载礼品单号模版
PresentPurchase.prototype.downloadKbNumberTemplate = function (req, res) {
    let filePath = path.join(path.resolve(), mkdir_templeate + '礼品单号导入模版.xlsx');
    res.download(filePath);
};
module.exports = PresentPurchase;