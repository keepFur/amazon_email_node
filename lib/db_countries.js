/*
 * 用于 国家表数据的操作
 */
"use strict";
let Core = require("./core");

// 国家构造函数
let Countries = function (pool) {
    this.pool = pool;
};

// 转换查询参数，传入一个数组，返回字符串
Countries.prototype.convertParams = function (arr) {
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

// 创建数据（支持批量）
Countries.prototype.createCountries = function (data) {
    let cmdText = `INSERT INTO amazon_service_countries(countries_name,create_by_id,create_by_name,company_org_id,company_org_name) VALUES `,
        cmdParams = [];
    if (Array.isArray(data.countriesName)) {
        data.countriesName.forEach(function (name, index) {
            if (index !== data.countriesName.length - 1) {
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

// 读取数据(不分页)
Countries.prototype.readCountries = function (data) {
    let cmdText = `SELECT ID,countries_name AS countriesName,create_by_id AS createByID ,create_by_name AS createByName
     ,update_by_id AS updateByID,update_by_name AS updateByName 
     ,company_org_id AS companyOrgID ,company_org_name AS companyOrgName
     FROM amazon_service_countries WHERE disabled = 1 AND  company_org_id = ?`,
        cmdParams = [data.companyOrgID];
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.countriesName) {
        cmdText += ` AND countries_name = ?`;
        cmdParams.push(data.countriesName);
    }
    if (data.createByID) {
        cmdText += ` AND create_by_id = ?`;
        cmdParams.push(data.createByID);
    }
    cmdText += ` ORDER BY CONVERT(countries_name USING gb2312) ASC`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取数据(分页)
Countries.prototype.readCountriesPage = function (data) {
    let cmdText = `SELECT ID,countries_name AS countriesName,create_by_id AS createByID ,create_by_name AS createByName 
    ,update_by_id AS updateByID,update_by_name AS updateByName 
    ,company_org_id AS companyOrgID ,company_org_name AS companyOrgName
    FROM amazon_service_countries WHERE disabled = 1 AND company_org_id = ? `,
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
        OR countries_name LIKE '%${data.keyword}%') `;
    }
    cmdText += ` ORDER BY CONVERT(countries_name USING gb2312) ASC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取数据(分页)中的总数
Countries.prototype.readCountriesTotal = function (data) {
    let cmdText = `SELECT COUNT(ID) AS total FROM amazon_service_countries WHERE disabled = 1 AND company_org_id = ? `,
        cmdParams = [data.companyOrgID],
        offset = data.offset,
        limit = data.limit;
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.keyword) {
        cmdText += ` AND ( update_by_name LIKE '%${data.keyword}%'
        OR create_by_name LIKE '%${data.keyword}%'
        OR countries_name LIKE '%${data.keyword}%') `;
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新数据
Countries.prototype.updateCountries = function (data) {
    let cmdText = `UPDATE amazon_service_countries SET update_by_id = ?, update_by_name = ? `,
        cmdParams = [data.updateByID, data.updateByName];
    if (data.countriesName) {
        cmdText += `, countries_name = ?`;
        cmdParams.push(data.countriesName);
    }
    cmdText += ` WHERE ID = ?`;
    cmdParams.push(data.ID);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 删除数据
Countries.prototype.deleteCountries = function (data) {
    let cmdText = `UPDATE  amazon_service_countries SET disabled = 0  WHERE ID IN `,
        cmdParams = data.IDS;
    cmdText += this.convertParams(data.IDS);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
module.exports = Countries;