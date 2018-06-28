/*
 * 用于 店铺表数据的操作
 */
"use strict";
let Core = require("./core"),
    Status = require("./status");

// 店铺构造函数
let ShopManage = function (pool, groupPool) {
    this.pool = pool;
    this.groupPool = groupPool;
};
// 转换查询参数，传入一个数组，返回字符串
ShopManage.prototype.convertParams = function (arr) {
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
//判断该店铺是否存在
ShopManage.prototype.justifyData = function (data) {
    let cmdText = `select count(store_name) as 'count' from amazon_service_stores where store_name='${data.store_name}'
    `,
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
// 创建店铺（批量）
ShopManage.prototype.createStore = function (data) {
    let cmdText = `INSERT INTO amazon_service_stores  (store_name,create_by_id,create_by_name,company_org_id,company_org_name) VALUES`,
        cmdParams = [];
    if (Array.isArray(data.storeName)) {
        data.storeName.forEach(function (name, index) {
            if (index !== data.storeName.length - 1) {
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
//读取店铺数据（分页）
ShopManage.prototype.readStorePage = function (data) {
    let offset = Number(data.pageNumber - 1) * data.limit,
        limit = Number(data.limit),
        cmdText = `SELECT COUNT(ID) AS count FROM amazon_service_stores WHERE disabled = 1 AND company_org_id = ?;
                   SELECT ID,store_name AS storeName,company_org_id AS companyOrgID,company_org_name AS companyOrgName,
                   create_by_name AS createByName,create_by_id AS createByID ,update_by_id AS updateByID, update_by_name AS updateByName 
                   FROM amazon_service_stores WHERE disabled = 1 AND company_org_id = ? ORDER BY CONVERT(store_name USING gb2312) ASC LIMIT ?,?`,
        cmdParams = [data.companyOrgID, data.companyOrgID, offset, limit];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
// 读取店铺数据（不分页）
ShopManage.prototype.readStoreNoPage = function (data) {
    let cmdText = `SELECT ID,store_name AS storeName,company_org_id AS companyOrgID,company_org_name AS companyOrgName,
                   create_by_name AS createByName,create_by_id AS createByID ,update_by_id AS updateByID, update_by_name AS updateByName
                FROM amazon_service_stores WHERE disabled = 1 `,
        cmdParams = [];
    if (data.companyOrgID) {
        cmdText += ` AND company_org_id = ? `;
        cmdParams.push(data.companyOrgID);
    }
    if (data.storeName) {
        cmdText += ` AND store_name = ? `;
        cmdParams.push(data.storeName);
    }
    cmdText += ` ORDER BY CONVERT(store_name USING gb2312) ASC`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//编辑店铺
ShopManage.prototype.updateStore = function (data) {
    let cmdText = `UPDATE amazon_service_stores SET store_name = ?,update_by_name = ?,update_by_id = ? WHERE ID = ?`,
        cmdParams = [data.storeName, data.updateByName, data.updateByID, data.ID];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//删除店铺
ShopManage.prototype.deleteStore = function (data) {
    let cmdText = `UPDATE amazon_service_stores SET disabled = 0 WHERE ID IN `,
        cmdParams = data.IDS;
    cmdText += this.convertParams(data.IDS);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//获取所有部门
ShopManage.prototype.showCompanylist = function (data) {
    let offset = Number(data.pageNumber - 1) * 8,
        keyword = ``;
    data.keyword.length && data.keyword.forEach(function (obj, index) {
        keyword += ` and name like '%${obj}%'`;
    });
    let cmdText = `select count(*) as 'count' from company_org where parent_id=${Status.groupId.value};
    select * from company_org where parent_id=${Status.groupId.value} ${keyword}  limit ${offset},8
    `,
        cmdParams = [];
    return Core.flyer.return_promise(this.groupPool, cmdText, cmdParams);
};

module.exports = ShopManage;