/*
 * 用于 空包地址 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 空包地址构造函数
let ManageKbAddress = function (pool) {
    this.pool = pool;
};

// 创建一个空包地址(需要支持批量)
ManageKbAddress.prototype.createKbAddress = function (data) {
    let cmdText = `INSERT INTO yidian_kb_address (detail,email, contact,phone,user_id,remark,p_code,c_code,a_code,pca,created_date) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
        cmdParams = [];
    cmdParams.push(data.detail);
    cmdParams.push(data.email);
    cmdParams.push(data.contact);
    cmdParams.push(data.phone);
    cmdParams.push(data.userId);
    cmdParams.push(data.remark);
    cmdParams.push(data.pCode);
    cmdParams.push(data.cCode);
    cmdParams.push(data.aCode);
    cmdParams.push(data.pca);
    cmdParams.push(new Date());
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(查询条件：id，number,plant 等)
ManageKbAddress.prototype.readKbAddress = function (data) {
    let cmdText = `SELECT id, detail,email, contact,phone,remark, p_code AS pCode,c_code AS cCode ,a_code AS aCode, pca,created_date AS createdDate,update_date AS updateDate 
        ,status FROM yidian_kb_address WHERE 1 = 1 `,
        cmdParams = [];
    if (!data.isSuper) {
        cmdText += ` AND user_id = ?`;
        cmdParams.push(data.userId);
    }
    if (data.phone) {
        cmdText += ` AND phone = ?`;
        cmdParams.push(data.phone);
    }
    if (data.contact) {
        cmdText += ` AND contact LIKE '%${data.contact}%'`;
    }
    if (data.detail) {
        cmdText += ` AND detail LIKE '%${data.detail}%' `;
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
    cmdText += ` ORDER BY created_date ASC`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取总数根据条件
ManageKbAddress.prototype.readKbAddressPageTotal = function (data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_kb_address WHERE 1 = 1 `,
        cmdParams = [];
    if (!data.isSuper) {
        cmdText += ` AND user_id = ?`;
        cmdParams.push(data.userId);
    }
    if (data.phone) {
        cmdText += ` AND phone = ?`;
        cmdParams.push(data.phone);
    }
    if (data.contact) {
        cmdText += ` AND contact LIKE '%${data.contact}%'`;
    }
    if (data.detail) {
        cmdText += ` AND detail LIKE '%${data.detail}%' `;
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
ManageKbAddress.prototype.readKbAddressById = function (data) {
    let cmdText = `SELECT id, detail,email , contact,phone,remark, p_code AS pCode,c_code AS cCode ,a_code AS aCode,pca,created_date AS createdDate,update_date AS updateDate 
    ,status FROM yidian_kb_address WHERE id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
ManageKbAddress.prototype.updateKbAddress = function (data) {
    let cmdText = `UPDATE  yidian_kb_address SET `,
        cmdParams = [];
    if (data.detail) {
        cmdText += `, detail = ?`;
        cmdParams.push(data.detail);
    }
    if (data.pCode) {
        cmdText += `, p_code = ?`;
        cmdParams.push(data.pCode);
    }
    if (data.cCode) {
        cmdText += `, c_code = ?`;
        cmdParams.push(data.cCode);
    }
    if (data.aCode) {
        cmdText += `, a_code = ?`;
        cmdParams.push(data.aCode);
    }
    if (data.pca) {
        cmdText += `, pca = ?`;
        cmdParams.push(data.pca);
    }
    if (data.contact) {
        cmdText += `,contact = ?`;
        cmdParams.push(data.contact);
    }
    if (data.phone) {
        cmdText += `,phone = ?`;
        cmdParams.push(data.phone);
    }
    if (data.remark) {
        cmdText += `,remark = ?`;
        cmdParams.push(data.remark);
    }
    if (data.email) {
        cmdText += `,email = ?`;
        cmdParams.push(data.email);
    }
    cmdText += `,update_date = ?`;
    cmdParams.push(new Date());
    cmdText += ` WHERE id = ?`;
    cmdParams.push(data.id);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用空包地址
ManageKbAddress.prototype.toggleKbAddress = function (data) {
    let cmdText = `UPDATE  yidian_kb_address SET status = ? WHERE id = ? `,
        cmdParams = [data.status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = ManageKbAddress;