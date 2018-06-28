"use strict";
let DB = require("./db");
let XLSX = require('xlsx');
let fs = require('fs');
let path = require('path');
let Core = require('./core');
let pinyin = require('pinyin');
// 客诉记录构造函数
let CustomerComplaintHistory = function () {

};
const mkdir = '/src/download/';

// 查询所有的基础数据
CustomerComplaintHistory.prototype.readAllBaseDatas = function (req, res, data) {
    DB.dbQuery.customerComplaintHistory.readAllBaseDatas(data).then(result => {
        res.send({
            data: {
                store: result[0],
                productType: result[1].map(function (item, index) {
                    item.productTypePY = pinyin(item.productType, {
                        style: pinyin.STYLE_FIRST_LETTER, // 设置拼音风格
                        heteronym: false//启用多音字模式
                    }).join(',').replace(/,/ig, '') + '-' + item.productType;
                    return item;
                }),
                productGroup: result[2],
                countries: result[3],
                questionType: result[4],
                resolveMethod: result[5]
            },
            success: true
        });
    }).catch(err => {
        res.send({
            success: false,
            message: err.message,
            data: {
                store: [],
                countries: [],
                productType: [],
                productGroup: [],
                questionType: [],
                resolveMethod: []
            }
        });
    });
};

// 创建一条客诉记录
CustomerComplaintHistory.prototype.createCustomerComplaint = function (req, res, data) {
    DB.dbQuery.customerComplaintHistory.createCustomerComplaint(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取客诉记录(需要分页)
CustomerComplaintHistory.prototype.readCustomerComplaint = function (req, res, data) {
    DB.dbQuery.customerComplaintHistory.readCustomerComplaint(data).then(result => {
        DB.dbQuery.customerComplaintHistory.readCustomerComplaintTotal(data).then(total => {
            res.send({
                success: true,
                message: '',
                data: {
                    total: total[0].total,
                    rows: result
                }
            });
        }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
};

// 通过id获取一条客诉记录
CustomerComplaintHistory.prototype.readCustomerComplaintByID = function (req, res, data) {
    DB.dbQuery.customerComplaintHistory.readCustomerComplaintByID(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            }
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};

// 通过订单号获取一条客诉记录
CustomerComplaintHistory.prototype.readCustomerComplaintByOrderNumber = function (req, res, data) {
    DB.dbQuery.customerComplaintHistory.readCustomerComplaintByOrderNumber(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            }
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};

// 更新一条客诉记录
CustomerComplaintHistory.prototype.updateCustomerComplaint = function (req, res, data) {
    DB.dbQuery.customerComplaintHistory.updateCustomerComplaint(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 删除一条客诉记录（通过ID）
CustomerComplaintHistory.prototype.deleteCustomerComplaint = function (req, res, data) {
    DB.dbQuery.customerComplaintHistory.deleteCustomerComplaint(data).then(result => {
        res.send({
            success: result.affectedRows === data.ID.length,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 导出客诉记录到excel(可以根据条件导出)
CustomerComplaintHistory.prototype.exportToExcelCustomerComplaint = function (req, res, data) {
    const columns = ['店铺', 'SKU', '商品名称', '品类', 'ASIN', '分组',
        '订单号', '数量', '订单时间', '国家', '问题描述',
        '问题类型', '处理人', '处理时间', '处理方式', '客诉时间', '备注'],
        conditions = JSON.parse(decodeURIComponent(data.conditions)),
        selectedDatas = JSON.parse(decodeURIComponent(data.selectedDatas));
    let filePath = path.join(path.resolve(), mkdir);
    fs.exists(filePath, exists => {
        if (!exists) {
            fs.mkdir(filePath, err => {
                if (err) {
                    res.send({
                        success: false,
                        message: '下载目录创建失败'
                    });
                }
                // 用户选择了数据的话，直接导出用户选择的数据
                if (selectedDatas.length) {
                    exportsSelectDatas(selectedDatas, columns, res);
                } else {
                    exportsAllDatasByConditions(conditions, columns, res);
                }
            });
        } else {
            if (selectedDatas.length) {
                exportsSelectDatas(selectedDatas, columns, res);
            } else {
                exportsAllDatasByConditions(conditions, columns, res);
            }
        }
    });
};

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
 * 将对象数组中的元素转换为一个单独的数组
 * 例如：输入[{},{},{}],输出：[[],[],[]]
 * @param {Array} objectArr 
 */
function objectArrToArr(objectArr) {
    let returnArr = [];
    const keys = ['storeName', 'SKU', 'productName', 'productTypeName', 'ASIN', 'productGroupName',
        'orderNumber', 'number', 'orderTime', 'countriesName', 'description', 'questionTypeName',
        'resolveUserName', 'resolveTime', 'resolveMethodName', 'customerComplaintTime', 'remark'],
        dateKeys = ['orderTime', 'resolveTime', 'customerComplaintTime'],
        selectKeys = ['productTypeName', 'productGroupName', 'countriesName', 'questionTypeName', 'resolveMethodName'];
    if (Array.isArray(objectArr) && objectArr.length) {
        objectArr.forEach(function (item) {
            let tempArr = [];
            keys.forEach(function (key) {
                // 如果是日期的话，需要进行格式化之后再返回
                if (item[key] instanceof Date || dateKeys.indexOf(key) !== -1) {
                    // 订单时间的话，如果是默认值（1970-01-01）,则返回空字符串
                    if (key === 'orderTime' && Core.flyer.formatDate("yyyy-mm-dd", item[key]) === '1970-01-01') {
                        tempArr.push(' ');
                    } else {
                        tempArr.push(Core.flyer.formatDate("yyyy-mm-dd HH:MM", item[key]));
                    }
                } else {
                    // 订单数量为0的话，返回空字符串
                    if (key === 'number') {
                        tempArr.push(item[key] === 0 ? ' ' : item[key]);
                    } else if (selectKeys.indexOf(key) !== -1) {
                        // 下拉框中的值，如果是'-'或者'N/A'，直接返回空字符串
                        if (item[key] === '-' || item[key] === 'N/A') {
                            tempArr.push(' ');
                        } else {
                            tempArr.push(item[key]);
                        }
                    } else {
                        tempArr.push(item[key]);
                    }
                }
            });
            returnArr.push(tempArr);
        }, this);
        return returnArr;
    } else {
        return [];
    }
}

/**
 * 导出用户选中的数据
 * 
 * @param {any} selectedDatas 
 */
function exportsSelectDatas(selectedDatas, columns, res) {
    let temp = objectArrToArr(selectedDatas),
        fileName = Core.flyer.formatDate('yyyy-mm-dd') + '-cs-record.xls',
        filePath = path.join(path.resolve(), mkdir + fileName);
    temp.unshift(columns);
    let workbook = make_book(fileName, temp);
    XLSX.writeFileAsync(filePath, workbook, () => {
        res.download(filePath);
    });
}

/**
 *导出根据条件筛选之后的数据 
 * 
 * @param {any} conditions 查询条件
 */
function exportsAllDatasByConditions(conditions, columns, res) {
    DB.dbQuery.customerComplaintHistory.readCustomerComplaintNoPage(conditions).then(result => {
        let fileName = Core.flyer.formatDate('yyyy-mm-dd') + '-cs-record.xls',
            filePath = path.join(path.resolve(), mkdir + fileName);
        let temp = objectArrToArr(result);
        temp.unshift(columns);
        let workbook = make_book(fileName, temp);
        XLSX.writeFileAsync(filePath, workbook, () => res.download(filePath));
    }).catch(err => {
        let errFilePath = path.join(path.resolve(), mkdir + 'err.xls');
        fs.writeFile(errFilePath, '客诉记录导出发生异常，请刷新页面重试。\n异常原因：' + err.message, err => {
            res.download(errFilePath);
        });
    });
}

module.exports = CustomerComplaintHistory;