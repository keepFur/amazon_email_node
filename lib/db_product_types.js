/*
 * 用于 产品类型表数据的操作
 */
"use strict";
let Core = require("./core");

// 产品类型构造函数
let ProductType = function (pool) {
    this.pool = pool;
};
// 转换查询参数，传入一个数组，返回字符串
ProductType.prototype.convertParams = function (arr) {
    var str = '(';
    if (Array.isArray(arr) && arr.length) {
        arr.forEach(function (ele, index) {
            if (index !== arr.length - 1) {
                str += '?,';
            } else {
                str += '?)';
            }
        });
    }
    return str;
};

// 读取数据(不分页)
ProductType.prototype.readProductType = function (data) {
    let cmdText = `SELECT ID,product_type AS productType,create_by_id AS createByID ,create_by_name AS createByName 
    ,update_by_id AS updateByID,update_by_name AS updateByName 
    ,company_org_id AS companyOrgID ,company_org_name AS companyOrgName
    FROM amazon_service_product_types WHERE disabled = 1 AND company_org_id = ? `,
        cmdParams = [Number(data.companyOrgID)];
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.productType) {
        cmdText += ` AND product_type = ?`;
        cmdParams.push(data.productType);
    }
    if (data.createByID) {
        cmdText += ` AND create_by_id = ?`;
        cmdParams.push(data.createByID);
    }
    cmdText += ` ORDER BY CONVERT(product_type USING gb2312)`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取数据(分页)
ProductType.prototype.readProductTypePage = function (data) {
    let cmdText = `SELECT ID,product_type AS productType,create_by_id AS createByID ,create_by_name AS createByName 
    ,update_by_id AS updateByID,update_by_name AS updateByName 
    ,company_org_id AS companyOrgID ,company_org_name AS companyOrgName
    FROM amazon_service_product_types WHERE disabled = 1 AND company_org_id = ? `,
        cmdParams = [Number(data.companyOrgID)],
        limit = Number(data.limit),
        offset = Number(data.offset - 1) * limit;
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.keyword) {
        cmdText += ` AND ( update_by_name LIKE '%${data.keyword}%'
        OR create_by_name LIKE '%${data.keyword}%'
        OR product_type LIKE '%${data.keyword}%') `;
    }
    cmdText += ` ORDER BY CONVERT(product_type USING gb2312)  LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取数据(分页)中的总数
ProductType.prototype.readProductTypeTotal = function (data) {
    let cmdText = `SELECT COUNT(ID)  AS total FROM amazon_service_product_types WHERE disabled = 1 AND company_org_id = ? `,
        cmdParams = [Number(data.companyOrgID)];
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.keyword) {
        cmdText += ` AND ( update_by_name LIKE '%${data.keyword}%'
        OR create_by_name LIKE '%${data.keyword}%'
        OR product_type LIKE '%${data.keyword}%') `;
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 创建数据（支持批量）
ProductType.prototype.createProductType = function (data) {
    let cmdText = `INSERT INTO amazon_service_product_types(product_type,create_by_id,create_by_name,company_org_id,company_org_name) VALUES`,
        cmdParams = [];
    if (Array.isArray(data.productType)) {
        data.productType.forEach(function (name, index) {
            if (index !== data.productType.length - 1) {
                cmdText += '(?,?,?,?,?),';
            } else {
                cmdText += '(?,?,?,?,?)';
            }
            cmdParams.push(name);
            cmdParams.push(data.createByID);
            cmdParams.push(data.createByName);
            cmdParams.push(data.companyOrgID);
            cmdParams.push(data.companyOrgName);
        });
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新数据
ProductType.prototype.updateProductType = function (data) {
    let cmdText = `UPDATE amazon_service_product_types SET update_by_id = ?, update_by_name = ? `,
        cmdParams = [data.updateByID, data.updateByName];
    if (data.productType) {
        cmdText += `, product_type = ?`;
        cmdParams.push(data.productType);
    }
    cmdText += ` WHERE ID = ?`;
    cmdParams.push(data.ID);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 删除数据
ProductType.prototype.deleteProductType = function (data) {
    let cmdText = `UPDATE  amazon_service_product_types SET disabled = 0 WHERE ID IN `,
        cmdParams = data.IDS;
    cmdText += this.convertParams(data.IDS);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
module.exports = ProductType;