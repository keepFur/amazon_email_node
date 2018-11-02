/*
 * 用于 空包类型 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 空包类型构造函数
let ManageKbType = function (pool) {
    this.pool = pool;
};

// 创建一个空包类型
ManageKbType.prototype.createkbType = function (data) {
    let cmdText = `INSERT INTO yidian_kb_type
        (name,desc,price,plant,created_date)
        VALUES (?,?,?,?,?)`,
        cmdParams = [];
    cmdParams.push(data.name);
    cmdParams.push(data.desc);
    cmdParams.push(data.price);
    cmdParams.push(data.plant);
    cmdParams.push(new Date());
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(查询条件：id，plantname 等)
ManageKbType.prototype.readkbTypePage = function (data) {
    let cmdText = `SELECT id, name,desc,price,plant, created_date AS createdDate,update_date AS updateDate 
        ,status FROM yidian_kb_type WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.name) {
        cmdText += ` AND name LIKE '%${data.name}%' `;
    }
    if (data.desc) {
        cmdText += ` AND desc LIKE '%${data.desc}%' `;
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.plant) {
        cmdText += ` AND plant = ? `;
        cmdParams.push(data.plant);
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
ManageKbType.prototype.readkbTypePageTotal = function (data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_kb_type WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.name) {
        cmdText += ` AND name LIKE '%${data.name}%' `;
    }
    if (data.desc) {
        cmdText += ` AND desc LIKE '%${data.desc}%' `;
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.plant) {
        cmdText += ` AND plant = ? `;
        cmdParams.push(data.plant);
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
ManageKbType.prototype.readkbTypeById = function (data) {
    let cmdText = `SELECT id, name,desc,price,plant, created_date AS createdDate,update_date AS updateDate 
    ,status FROM yidian_kb_type WHERE id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
ManageKbType.prototype.updatekbType = function (data) {
    let cmdText = `UPDATE  yidian_kb_type SET `,
        cmdParams = [];
    if (data.name) {
        cmdText += `, name = ?`;
        cmdParams.push(data.name);
    }
    if (data.desc) {
        cmdText += `,desc = ?`;
        cmdParams.push(data.desc);
    }
    if (data.price) {
        cmdText += `,price = ?`;
        cmdParams.push(data.price);
    }
    if (data.plant) {
        cmdText += `,plant = ?`;
        cmdParams.push(data.plant);
    }
    cmdText += `,update_date = ?`;
    cmdParams.push(new Date());
    cmdText += ` WHERE id = ?`;
    cmdParams.push(data.id);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用空包类型
ManageKbType.prototype.togglekbType = function (data) {
    let cmdText = `UPDATE  yidian_kb_type SET status = ? WHERE id = ? `,
        cmdParams = [data.status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = ManageKbType;