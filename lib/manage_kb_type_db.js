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
ManageKbType.prototype.createKbType = function (data) {
    let cmdText = `INSERT INTO yidian_kb_type
        (name,description,price,plant,code,created_date)
        VALUES (?,?,?,?,?,?)`,
        cmdParams = [];
    cmdParams.push(data.name);
    cmdParams.push(data.description);
    cmdParams.push(data.price);
    cmdParams.push(data.plant);
    cmdParams.push(data.code);
    cmdParams.push(new Date());
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(查询条件：id，plantname 等)
ManageKbType.prototype.readKbType = function (data) {
    let cmdText = `SELECT id,code, name,description,price,plant, created_date AS createdDate,update_date AS updateDate 
        ,status FROM yidian_kb_type WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.name) {
        cmdText += ` AND name LIKE '%${data.name}%' `;
    }
    if (data.description) {
        cmdText += ` AND description LIKE '%${data.description}%' `;
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.plant) {
        cmdText += ` AND plant = ? `;
        cmdParams.push(data.plant);
    }
    if (data.code) {
        cmdText += ` AND code = ? `;
        cmdParams.push(data.code);
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
ManageKbType.prototype.readKbTypePageTotal = function (data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_kb_type WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.name) {
        cmdText += ` AND name LIKE '%${data.name}%' `;
    }
    if (data.description) {
        cmdText += ` AND description LIKE '%${data.description}%' `;
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.plant) {
        cmdText += ` AND plant = ? `;
        cmdParams.push(data.plant);
    }
    if (data.code) {
        cmdText += ` AND code = ? `;
        cmdParams.push(data.code);
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
ManageKbType.prototype.readKbTypeById = function (data) {
    let cmdText = `SELECT id, name,description,price,plant, created_date AS createdDate,update_date AS updateDate 
    ,status FROM yidian_kb_type WHERE id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
ManageKbType.prototype.updateKbType = function (data) {
    let cmdText = `UPDATE  yidian_kb_type SET `,
        cmdParams = [];
    if (data.name) {
        cmdText += `, name = ?`;
        cmdParams.push(data.name);
    }
    if (data.description) {
        cmdText += `,description = ?`;
        cmdParams.push(data.description);
    }
    if (data.price) {
        cmdText += `,price = ?`;
        cmdParams.push(data.price);
    }
    if (data.plant) {
        cmdText += `,plant = ?`;
        cmdParams.push(data.plant);
    }
    if (data.code) {
        cmdText += `,code = ?`;
        cmdParams.push(data.code);
    }
    cmdText += `,update_date = ?`;
    cmdParams.push(new Date());
    cmdText += ` WHERE id = ?`;
    cmdParams.push(data.id);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用空包类型
ManageKbType.prototype.toggleKbType = function (data) {
    let cmdText = `UPDATE  yidian_kb_type SET status = ? WHERE id = ? `,
        cmdParams = [data.status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = ManageKbType;