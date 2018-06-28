/*
 * 用于 处理方式表数据的操作
 */
"use strict";
let Core = require("./core");

// 处理方式构造函数
let ResolveMethod = function (pool) {
    this.pool = pool;
};
// 转换查询参数，传入一个数组，返回字符串
ResolveMethod.prototype.convertParams = function (arr) {
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
ResolveMethod.prototype.readResolveMethod = function (data) {
    let cmdText = `SELECT ID,resolve_method_name AS resolveMethodName,create_by_id AS createByID ,create_by_name AS createByName ,
    update_by_id AS updateByID,update_by_name AS updateByName, company_org_id AS companyOrgID ,company_org_name AS companyOrgName
    FROM amazon_service_solutions WHERE disabled = 1 AND company_org_id = ?`,
        cmdParams = [data.companyOrgID];
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.resolveMethodName) {
        cmdText += ` AND resolve_method_name = ?`;
        cmdParams.push(data.resolveMethodName);
    }
    if (data.createByID) {
        cmdText += ` AND create_by_id = ?`;
        cmdParams.push(data.createByID);
    }
    cmdText += ` ORDER BY CONVERT(resolve_method_name USING gb2312) ASC`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取数据(分页)
ResolveMethod.prototype.readResolveMethodPage = function (data) {
    let cmdText = `SELECT ID,resolve_method_name AS resolveMethodName,create_by_id AS createByID ,create_by_name AS createByName ,
    update_by_id AS updateByID,update_by_name AS updateByName ,company_org_id AS companyOrgID ,company_org_name AS companyOrgName
    FROM amazon_service_solutions WHERE disabled = 1 AND company_org_id = ? `,
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
        OR resolve_method_name LIKE '%${data.keyword}%') `;
    }
    cmdText += ` ORDER BY CONVERT(resolve_method_name USING gb2312) ASC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取数据(分页)中的总数
ResolveMethod.prototype.readResolveMethodTotal = function (data) {
    let cmdText = `SELECT COUNT(ID)  AS total FROM amazon_service_solutions WHERE disabled = 1 AND company_org_id = ? `,
        cmdParams = [data.companyOrgID];
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.keyword) {
        cmdText += ` AND ( update_by_name LIKE '%${data.keyword}%'
        OR create_by_name LIKE '%${data.keyword}%'
        OR resolve_method_name LIKE '%${data.keyword}%') `;
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 创建数据（支持批量）
ResolveMethod.prototype.createResolveMethod = function (data) {
    let cmdText = `INSERT INTO amazon_service_solutions(resolve_method_name,create_by_id,create_by_name,company_org_id,company_org_name) VALUES`,
        cmdParams = [];
    if (Array.isArray(data.resolveMethodName)) {
        data.resolveMethodName.forEach(function (name, index) {
            if (index !== data.resolveMethodName.length - 1) {
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
ResolveMethod.prototype.updateResolveMethod = function (data) {
    let cmdText = `UPDATE amazon_service_solutions SET update_by_id = ?, update_by_name = ? `,
        cmdParams = [data.updateByID, data.updateByName];
    if (data.resolveMethodName) {
        cmdText += `, resolve_method_name = ?`;
        cmdParams.push(data.resolveMethodName)
    }
    cmdText += ` WHERE ID = ?`;
    cmdParams.push(data.ID);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 删除数据
ResolveMethod.prototype.deleteResolveMethod = function (data) {
    let cmdText = `UPDATE amazon_service_solutions SET disabled = 0 WHERE ID IN `,
        cmdParams = data.IDS;
    cmdText += this.convertParams(data.IDS);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
module.exports = ResolveMethod;