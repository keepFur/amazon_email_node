/*
 * 用于 充值套餐 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 充值套餐构造函数
let PackageManage = function(pool) {
    this.pool = pool;
};

// 创建一个充值套餐
PackageManage.prototype.createPackage = function(data) {
    let cmdText = `INSERT INTO yidian_package
        (package_name,package_present_score,package_purchase_score,
        package_present_money,package_purchase_money,package_pay_method,created_date)
        VALUES (?,?,?,?,?,?,?)`,
        cmdParams = [];
    cmdParams.push(data.packageName);
    cmdParams.push(data.packagePresentScore);
    cmdParams.push(data.packagePurchaseScore);
    cmdParams.push(data.packagePresentMoney);
    cmdParams.push(data.packagePurchaseMoney);
    cmdParams.push(data.packagePayMethod);
    cmdParams.push(new Date());
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(需要分页,查询条件：id，package_title 等)
PackageManage.prototype.readPackagePage = function(data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit,
        cmdText = `SELECT id, package_name AS packageName,package_present_score AS packagePresentScore,package_purchase_score AS packagePurchaseScore,
        package_present_money AS packagePresentMoney,package_purchase_money AS packagePurchaseMoney,package_pay_method AS packagePayMethod,
        created_date AS createdDate,update_date AS updateDate 
        ,status FROM yidian_package WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.packageName) {
        cmdText += ` AND package_name LIKE '%${data.packageName}%' `;
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.createdDateStart) {
        cmdText += ` AND created_date >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND created_date < ? `;
        cmdParams.push(data.createdDateEnd);
    }
    cmdText += ` ORDER BY  package_purchase_money ASC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取总数根据条件
PackageManage.prototype.readPackagePageTotal = function(data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_package WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.packageName) {
        cmdText += ` AND package_name LIKE '%${data.packageName}%' `;
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.createdDateStart) {
        cmdText += ` AND created_date >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND created_date < ? `;
        cmdParams.push(data.createdDateEnd);
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取一条记录通过ID
PackageManage.prototype.readPackageById = function(data) {
    let cmdText = `SELECT id, package_name AS packageName,package_present_score AS packagePresentScore,package_purchase_score AS packagePurchaseScore,
        package_present_money AS packagePresentMoney,package_purchase_money AS packagePurchaseMoney,package_pay_method AS packagePayMethod,
        created_date AS createdDate,update_date AS updateDate 
        ,status FROM yidian_package WHERE  id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
PackageManage.prototype.updatePackage = function(data) {
    let cmdText = `UPDATE  yidian_package SET `,
        cmdParams = [];
    if (data.packageName) {
        cmdText += `, package_name = ?`;
        cmdParams.push(data.packageName);
    }
    if (data.packagePresentScore) {
        cmdText += `,package_present_score = ?`;
        cmdParams.push(data.packagePresentScore);
    }
    if (data.packagePurchaseScore) {
        cmdText += `,package_purchase_score = ?`;
        cmdParams.push(data.packagePurchaseScore);
    }
    if (data.packagePresentMoney) {
        cmdText += `,package_present_money = ?`;
        cmdParams.push(data.packagePresentMoney);
    }
    if (data.packagePurchaseMoney) {
        cmdText += `,package_purchase_money = ?`;
        cmdParams.push(data.packagePurchaseMoney);
    }
    cmdText += `,update_date = ?`;
    cmdParams.push(new Date());
    cmdText += ` WHERE id = ?`;
    cmdParams.push(data.id);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用充值套餐
PackageManage.prototype.togglePackage = function(data) {
    let cmdText = `UPDATE  yidian_package SET status = ? WHERE id = ? `,
        cmdParams = [data.status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = PackageManage;