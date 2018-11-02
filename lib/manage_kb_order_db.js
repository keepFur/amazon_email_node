/*
 * 用于 空包单号 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 空包单号构造函数
let ManageKbOrder = function (pool) {
    this.pool = pool;
};

// 创建一个空包单号(需要支持批量)
ManageKbOrder.prototype.createKbOrder = function (data) {
    let cmdText = `INSERT INTO yidian_kb_order (number,plant,created_date) VALUES `,
        cmdParams = [];
    if (Array.isArray(data.numbers)) {
        data.numbers.forEach(function (number, index) {
            if (index !== data.numbers.length - 1) {
                cmdText += '(?,?,?),';
            } else {
                cmdText += '(?,?,?)';
            }
            cmdParams.push(number);
            cmdParams.push(data.plant);
            cmdParams.push(new Date());
        });
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(查询条件：id，number,plant 等)
ManageKbOrder.prototype.readKbOrderPage = function (data) {
    let limit = Number(data.limit || 20);
    let offset = Number(data.offset - 1) * limit;
    let cmdText = `SELECT id, number,plant, created_date AS createdDate,update_date AS updateDate 
        ,status FROM yidian_kb_order WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.number) {
        cmdText += ` AND number LIKE '%${data.number}%' `;
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
    cmdText += ` ORDER BY created_date ASC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取总数根据条件
ManageKbOrder.prototype.readKbOrderPageTotal = function (data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_kb_order WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.number) {
        cmdText += ` AND number LIKE '%${data.number}%' `;
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
ManageKbOrder.prototype.readKbOrderById = function (data) {
    let cmdText = `SELECT id, number,plant, created_date AS createdDate,update_date AS updateDate 
    ,status FROM yidian_kb_order WHERE id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
ManageKbOrder.prototype.updateKbOrder = function (data) {
    let cmdText = `UPDATE  yidian_kb_order SET `,
        cmdParams = [];
    if (data.number) {
        cmdText += `, number = ?`;
        cmdParams.push(data.number);
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

// 禁用或启用空包单号
ManageKbOrder.prototype.toggleKbOrder = function (data) {
    let cmdText = `UPDATE  yidian_kb_order SET status = ? WHERE id = ? `,
        cmdParams = [data.status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = ManageKbOrder;