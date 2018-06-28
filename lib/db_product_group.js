/*
 * 用于 产品分组表数据的操作
 */
"use strict";
let Core = require("./core");

// 产品分组构造函数
let ProductGroup = function (pool) {
    this.pool = pool;
};
// 转换查询参数，传入一个数组，返回字符串
ProductGroup.prototype.convertParams = function (arr) {
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
ProductGroup.prototype.readProductGroup = function (data) {
    let cmdText = `SELECT ID,product_group_name AS productGroupName,create_by_id AS createByID ,create_by_name AS createByName 
    ,update_by_id AS updateByID,update_by_name AS updateByName 
    ,company_org_id AS companyOrgID ,company_org_name AS companyOrgName
    FROM amazon_service_product_groups WHERE disabled = 1 AND company_org_id = ? `,
        cmdParams = [data.companyOrgID];
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.productGroupName) {
        cmdText += ` AND product_group_name = ?`;
        cmdParams.push(data.productGroupName);
    }
    if (data.createByID) {
        cmdText += ` AND create_by_id = ?`;
        cmdParams.push(data.createByID);
    }
    cmdText += ` ORDER BY CONVERT(product_group_name USING gb2312) ASC `;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取数据(分页)
ProductGroup.prototype.readProductGroupPage = function (data) {
    let cmdText = `SELECT ID,product_group_name AS productGroupName,create_by_id AS createByID ,create_by_name AS createByName 
    ,update_by_id AS updateByID,update_by_name AS updateByName 
    ,company_org_id AS companyOrgID ,company_org_name AS companyOrgName
    FROM amazon_service_product_groups WHERE disabled = 1 AND company_org_id = ? `,
        cmdParams = [data.companyOrgID],
        limit = Number(data.limit),
        offset = Number(data.offset - 1) * limit;
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.keyword) {
        cmdText += ` AND ( update_by_name LIKE '%${data.keyword}%'
        OR create_by_name LIKE '%${data.keyword}%'
        OR product_group_name LIKE '%${data.keyword}%') `;
    }
    cmdText += ` ORDER BY CONVERT(product_group_name USING gb2312) ASC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取数据(分页)中的总数
ProductGroup.prototype.readProductGroupTotal = function (data) {
    let cmdText = `SELECT COUNT(ID)  AS total FROM amazon_service_product_groups WHERE disabled = 1 AND company_org_id = ?  `,
        cmdParams = [data.companyOrgID];
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.keyword) {
        cmdText += ` AND ( update_by_name LIKE '%${data.keyword}%'
        OR create_by_name LIKE '%${data.keyword}%'
        OR product_group_name LIKE '%${data.keyword}%') `;
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 创建数据
ProductGroup.prototype.createProductGroup = function (data) {
    let cmdText = `INSERT INTO amazon_service_product_groups(product_group_name,create_by_id,create_by_name,company_org_id,company_org_name) VALUES `,
        cmdParams = [];
    if (Array.isArray(data.productGroupName)) {
        data.productGroupName.forEach(function (name, index) {
            if (index !== data.productGroupName.length - 1) {
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
ProductGroup.prototype.updateProductGroup = function (data) {
    let cmdText = `UPDATE amazon_service_product_groups SET update_by_id = ?, update_by_name = ? `,
        cmdParams = [data.updateByID, data.updateByName];
    if (data.productGroupName) {
        cmdText += `, product_group_name = ?`;
        cmdParams.push(data.productGroupName);
    }
    cmdText += ` WHERE ID = ?`;
    cmdParams.push(data.ID);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 删除数据
ProductGroup.prototype.deleteProductGroup = function (data) {
    let cmdText = `UPDATE  amazon_service_product_groups SET disabled = 0 WHERE ID IN ` + this.convertParams(data.IDS),
        cmdParams = data.IDS;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
module.exports = ProductGroup;