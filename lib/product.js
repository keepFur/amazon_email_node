/*
 * 用于 产品 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
let XLSX = require('xlsx');
let formidable = require('formidable');
let util = require('util');
let path = require('path');
// 产品构造函数
let Product = function (pool) {
};

// 创建一条产品记录
Product.prototype.createProduct = function (req, res, data) {
    DB.dbQuery.product.createProduct(data).then(result => {
        res.send({
            success: result.affectedRows === data.products.length,
            message: result.affectedRows + '个产品创建成功'
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 修正所有产品记录
Product.prototype.adjustProduct = function (req, res, data) {
    DB.dbQuery.product.adjustProduct(data).then(result => {
        res.send({
            success: true,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(需要分页,查询条件：ID，SKU,ASIN等)
Product.prototype.readProduct = function (req, res, data) {
    DB.dbQuery.product.readProduct(data).then(result => {
        DB.dbQuery.product.readProductTotal(data).then(total => {
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

// 读取一条记录，通过ID
Product.prototype.readProductByID = function (req, res, data) {
    DB.dbQuery.product.readProductByID(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            },
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};

// 读取一条记录，通过SKU
Product.prototype.readProductBySKU = function (req, res, data) {
    DB.dbQuery.product.readProductBySKU(data).then(result => {
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
Product.prototype.updateProduct = function (req, res, data) {
    DB.dbQuery.product.updateProduct(data).then(result => {
        res.send({
            success: result.affectedRows === data.length,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 删除
Product.prototype.deleteProduct = function (req, res, data) {
    DB.dbQuery.product.deleteProduct(data).then(result => {
        res.send({
            success: result.affectedRows === data.ID.length,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

/**
 * 上传产品excel文件
 * 
 */
Product.prototype.upload_product_excel = function (req, res) {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write('received upload:\n\n');
        res.end(util.inspect({ fields: fields, files: files }));
    });
};

// 读取xls文件的数据
Product.prototype.readXlsFileData = function (req, res, next) {
    let file = req.body.file,
        companyOrgID = req.body.companyOrgID || 1119,
        companyOrgName = req.body.companyOrgName || '品牌一部',
        createByID = req.body.createByID,
        createByName = req.body.createByName,
        filePath = path.join(path.resolve(), "/src/upload/" + file.path);
    const workbook = XLSX.readFile(filePath, {
        cellNF: true,
        cellStyles: true
    });
    // 获取 Excel 中所有表名
    const sheetNames = workbook.SheetNames; // 返回 ['sheet1', 'sheet2']
    // 根据表名获取对应某张表
    const worksheet = workbook.Sheets[sheetNames[0]];
    let JSONDatas = XLSX.utils.sheet_to_formulae(worksheet);
    let columns = JSONDatas.slice(0, 7),
        storeNames = [],
        productTypeNames = [],
        productGroupNames = [],
        countriesNames = [],
        datas = [],
        row = {
            companyOrgID: companyOrgID,
            companyOrgName: companyOrgName,
            storeName: 'N/A',
            SKU: 'N/A',
            ASIN: 'N/A',
            countriesName: 'N/A',
            productTypeName: 'N/A',
            productGroupName: 'N/A',
            productName: 'N/A'
        };
    for (let i = 7; i < JSONDatas.length; i++) {
        let JSON_I = JSONDatas[i], val_i = 'N/A';
        // 防止数组越界
        try {
            val_i = JSON_I.split('\'')[1] || 'N/A';
        } catch (error) {
            val_i = 'N/A';
        }
        if (JSON_I.startsWith('A')) {
            row.storeName = val_i;
            storeNames.push(val_i);
        } else if (JSON_I.startsWith('B')) {
            row.SKU = val_i;
        } else if (JSON_I.startsWith('C')) {
            row.countriesName = val_i;
            countriesNames.push(val_i);
        } else if (JSON_I.startsWith('D')) {
            row.productGroupName = val_i;
            productGroupNames.push(val_i);
        } else if (JSON_I.startsWith('E')) {
            row.productTypeName = val_i;
            productTypeNames.push(val_i);
        } else if (JSON_I.startsWith('F')) {
            row.ASIN = val_i;
        } else if (JSON_I.startsWith('G')) {
            row.productName = val_i;
        }
        if ((i % 7 === 0 && i !== 7) || i === JSONDatas.length - 1) {
            if (!isEmpty(row)) {
                datas.push(row);
                row = {
                    companyOrgID: companyOrgID,
                    companyOrgName: companyOrgName,
                    storeName: 'N/A',
                    SKU: 'N/A',
                    ASIN: 'N/A',
                    countriesName: 'N/A',
                    productTypeName: 'N/A',
                    productGroupName: 'N/A',
                    productName: 'N/A'
                };
            }
        }
    }
    // 去除重复的数据，判断标准是，SKU相同的就是同一个商品，比较范围是在各自的部门下
    uniqueProduct(datas, {
        companyOrgID
    }, uniqueArr => {
        if (uniqueArr.length) {
            DB.dbQuery.product.createProduct({
                products: uniqueArr
            }).then(result => {
                // 对国家数据进行去重处理，然后进行新增
                uniqueCountries(getUniqueArr(countriesNames), {
                    companyOrgID
                }, countriesNames => {
                    createCountries(countriesNames, {
                        companyOrgID: companyOrgID,
                        companyOrgName: companyOrgName,
                        createByID: createByID,
                        createByName: createByName
                    }, () => {

                    });
                });
                // 对商品品类数据进行去重，在数据库层面去重
                uniqueProducType(getUniqueArr(productTypeNames), {
                    companyOrgID
                }, productTypeName => {
                    createProductType(productTypeName, {
                        companyOrgID: companyOrgID,
                        companyOrgName: companyOrgName,
                        createByID: createByID,
                        createByName: createByName
                    });
                });
                // 对商品分组进行数据去重
                uniqueProducGroup(getUniqueArr(productGroupNames), {
                    companyOrgID
                }, productGroupName => {
                    createProductGroup(productGroupName, {
                        companyOrgID: companyOrgID,
                        companyOrgName: companyOrgName,
                        createByID: createByID,
                        createByName: createByName
                    });
                });
                // 对店铺进行去重 todo
                uniqueStore(getUniqueArr(storeNames), {
                    companyOrgID
                }, storeName => {
                    createStore(storeName, {
                        companyOrgID: companyOrgID,
                        companyOrgName: companyOrgName,
                        createByID: createByID,
                        createByName: createByName
                    });
                });
                // 导入数据成功之后，需要进行数据修正
                DB.dbQuery.product.adjustProduct({}).then(result => {
                    res.send({
                        success: true,
                        message: `数据导入成功，共导入数据 ${uniqueArr.length} 条`
                    });
                }).catch(err => res.send({ message: err.message, success: false }));
            }).catch(err => res.send({ message: err.message, success: false }));
        } else {
            res.send({
                success: true,
                message: '数据导入成功,共导入数据 0 条'
            });
        }
    });
};

/**
 * 检测对象是否是空对象(不包含任何可读属性)。
 * 方法既检测对象本身的属性，也检测从原型继承的属性(因此没有使hasOwnProperty)
 * 
 * @param {any} obj 
 * @returns 
 */
function isEmpty(obj) {
    for (let name in obj) {
        return false;
    }
    return true;
}

/**
 *  找出传入的数组不存在产品中心的数据 ，最后返回一个数组
 * 
 * @param {any} inputArr 
 */
function uniqueProduct(inputArr, params, next) {
    if (Array.isArray(inputArr) && inputArr.length) {
        DB.dbQuery.product.readProductNoPage(params).then(result => {
            if (result.length) {
                result = result.map(item => encodeURIComponent(item.SKU + '#' + item.ASIN + '#' + item.countriesName + '#' + item.storeName + '#' + item.productGroupName));
                inputArr = inputArr.filter(item => result.indexOf(encodeURIComponent(item.SKU + '#' + item.ASIN + '#' + item.countriesName + '#' + item.storeName + '#' + item.productGroupName)) === -1);
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

/**
 *  找出传入的店铺数组不存在数据库中的数据 ，最后返回一个数组
 * 
 * @param {any} inputArr 
 */
function uniqueStore(inputArr, params, next) {
    if (Array.isArray(inputArr) && inputArr.length) {
        DB.dbQuery.shopManage.readStoreNoPage(params).then(function (result) {
            if (result.length) {
                result = result.map(item => encodeURIComponent(item.storeName));
                inputArr = inputArr.filter(item => result.indexOf(encodeURIComponent(item)) === -1);
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

/**
 *  找出传入的国家数组不存在数据库中的数据 ，最后返回一个数组
 * 
 * @param {any} inputArr 
 */
function uniqueCountries(inputArr, params, next) {
    if (Array.isArray(inputArr) && inputArr.length) {
        DB.dbQuery.countries.readCountries(params).then(function (result, err) {
            if (result.length) {
                result = result.map(item => encodeURIComponent(item.countriesName));
                inputArr = inputArr.filter(item => result.indexOf(encodeURIComponent(item)) === -1);
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

/**
 *  找出传入的商品品类数组不存在数据库中的数据 ，最后返回一个数组
 * 
 * @param {any} inputArr 
 */
function uniqueProducType(inputArr, params, next) {
    if (Array.isArray(inputArr) && inputArr.length) {
        DB.dbQuery.productType.readProductType(params).then(result => {
            if (result.length) {
                result = result.map(item => encodeURIComponent(item.productType));
                inputArr = inputArr.filter(item => result.indexOf(encodeURIComponent(item)) === -1);
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

/**
 *  找出传入的商品分组数组不存在数据库中的数据 ，最后返回一个数组
 * 
 * @param {any} inputArr 
 */
function uniqueProducGroup(inputArr, params, next) {
    if (Array.isArray(inputArr) && inputArr.length) {
        DB.dbQuery.productGroup.readProductGroup(params).then(result => {
            if (result.length) {
                result = result.map(item => encodeURIComponent(item.productGroupName));
                inputArr = inputArr.filter(item => result.indexOf(encodeURIComponent(item)) === -1);
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


/**
 * 创建分组（批量）
 * 
 * @param {any} productGroupName 
 * @param {any} next 
 */
function createProductGroup(productGroupName, userInfo) {
    if (Array.isArray(productGroupName) && productGroupName.length) {
        DB.dbQuery.productGroup.createProductGroup({
            productGroupName: productGroupName,
            companyOrgID: userInfo.companyOrgID,
            companyOrgName: userInfo.companyOrgName,
            createByID: userInfo.createByID,
            createByName: userInfo.createByName
        });
    }
}


/**
 * 创建品类（批量）
 * 
 * @param {any} productType 
 * @param {any} next 
 */
function createProductType(productType, userInfo, next) {
    if (Array.isArray(productType) && productType.length) {
        DB.dbQuery.productType.createProductType({
            productType: productType,
            companyOrgID: userInfo.companyOrgID,
            companyOrgName: userInfo.companyOrgName,
            createByID: userInfo.createByID,
            createByName: userInfo.createByName
        });
    }
}

/**
 * 创建店铺（批量）
 * 
 * @param {any} storeName 
 * @param {any} next 
 */
function createStore(storeName, userInfo, next) {
    if (Array.isArray(storeName) && storeName.length) {
        DB.dbQuery.shopManage.createStore({
            storeName: storeName,
            companyOrgID: userInfo.companyOrgID,
            companyOrgName: userInfo.companyOrgName,
            createByID: userInfo.createByID,
            createByName: userInfo.createByName
        });
    }
}

/**
 * 创建国家（批量）
 * 
 * @param {any} countriesName 
 * @param {any} userInfo 
 * @param {any} next 
 */
function createCountries(countriesName, userInfo, next) {
    if (Array.isArray(countriesName) && countriesName.length) {
        DB.dbQuery.countries.createCountries({
            countriesName: countriesName,
            companyOrgID: userInfo.companyOrgID,
            companyOrgName: userInfo.companyOrgName,
            createByID: userInfo.createByID,
            createByName: userInfo.createByName
        });
    }
}

/**
 * 数组去重
 * 
 * @param {any} inputArr 
 */
function getUniqueArr(inputArr) {
    let hashTable = {},
        newArr = [],
        eleTypeofIsObject = false;
    if (Array.isArray(inputArr)) {
        if (inputArr.length) {
            for (let i = 0, l = inputArr.length; i < l; i++) {
                eleTypeofIsObject = typeof inputArr[i] === 'object';
                if (!hashTable[eleTypeofIsObject ? JSON.stringify(inputArr[i]) : inputArr[i].trim()] && inputArr[i] !== 'N/A') {
                    hashTable[eleTypeofIsObject ? JSON.stringify(inputArr[i]) : inputArr[i].trim()] = true;
                    newArr.push(inputArr[i].trim());
                }
            }
        }
    }
    return newArr.filter(item => item && item !== 'N/A' && item !== '#N/A');
}

module.exports = Product;