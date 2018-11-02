/*
 * 用于 空包订单 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 空包订单构造函数
let KbOrderManage = function (pool) {
    this.pool = pool;
};

// 创建一个空包订单
KbOrderManage.prototype.createKbOrder = function (data) {
    let cmdText = `INSERT INTO yidian_kb_order
        (number,remark, plant,user_id,kb_number,address_from, address_to, total,created_date)
        VALUES (?,?,?,?,?,?,?,?,?)`,
        cmdParams = [];
    cmdParams.push(data.number);
    cmdParams.push(data.remark);
    cmdParams.push(data.plant);
    cmdParams.push(data.userId);
    cmdParams.push(data.kbNumber);
    cmdParams.push(data.addressFrom);
    cmdParams.push(data.addressTo);
    cmdParams.push(data.total);
    cmdParams.push(new Date());
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(需要分页,查询条件：id，plantname 等)
KbOrderManage.prototype.readKbOrderPage = function (data) {
    let limit = Number(data.limit || 20);
    let offset = Number(data.offset - 1) * limit;
    let cmdText = `SELECT 0.id,o.number,remark,plant, address_from AS addressFrom,address_to AS addressTo, total,kb_number AS kbNumber,o.created_date AS createdDate,o.update_date AS updateDate 
    ,o.status FROM yidian_kb_order o INNER JOIN yidian_user u ON o.user_id = u.id WHERE 1 = 1 `,
        cmdParams = [];
    if (data.number) {
        cmdText += ` AND number LIKE '%${data.number}%' `;
    }
    // 普通用户只能看自己的任务
    if (!data.isSuper) {
        cmdText += ` AND user_id = ?`;
        cmdParams.push(data.userId);
    }
    if (data.status) {
        cmdText += ` AND o.status = ? `;
        cmdParams.push(data.status);
    }
    if (data.plant) {
        cmdText += ` AND plant = ? `;
        cmdParams.push(data.plant);
    }
    if (data.addressFrom) {
        cmdText += ` AND address_from LIKE '%${data.addressFrom}%' `;
    }
    if (data.addressTo) {
        cmdText += ` AND address_to LIKE '%${data.addressTo}%' `;
    }
    if (data.kbNumber) {
        cmdText += ` AND kb_number = ? `;
        cmdParams.push(data.kbNumber);
    }
    if (data.createdDateStart) {
        cmdText += ` AND o.created_date >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND o.created_date < ? `;
        cmdParams.push(data.createdDateEnd);
    }
    cmdText += ` ORDER BY o.created_date ASC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取总数根据条件
KbOrderManage.prototype.readKbOrderPageTotal = function (data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_kb_order WHERE 1 = 1 `,
        cmdParams = [];
    if (data.number) {
        cmdText += ` AND number LIKE '%${data.number}%' `;
    }
    // 普通用户只能看自己的任务
    if (!data.isSuper) {
        cmdText += ` AND user_id = ?`;
        cmdParams.push(data.userId);
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.plant) {
        cmdText += ` AND plant = ? `;
        cmdParams.push(data.plant);
    }
    if (data.addressFrom) {
        cmdText += ` AND address_from LIKE '%${data.addressFrom}%' `;
    }
    if (data.addressTo) {
        cmdText += ` AND address_to LIKE '%${data.addressTo}%' `;
    }
    if (data.kbNumber) {
        cmdText += ` AND kb_number = ? `;
        cmdParams.push(data.kbNumber);
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
KbOrderManage.prototype.readKbOrderById = function (data) {
    let cmdText = `SELECT 0.id,o.number,remark,plant, address_from AS addressFrom,address_to AS addressTo, total,kb_number AS kbNumber,o.created_date AS createdDate,o.update_date AS updateDate 
    ,o.status FROM yidian_kb_order o INNER JOIN yidian_user u ON o.user_id = u.id WHERE id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
KbOrderManage.prototype.updateKbOrder = function (data) {
    let cmdText = `UPDATE  yidian_kb_order SET `,
        cmdParams = [];
    if (data.addressFrom) {
        cmdText += `, address_from = ?`;
        cmdParams.push(data.addressFrom);
    }
    if (data.addressTo) {
        cmdText += `,address_to = ?`;
        cmdParams.push(data.addressTo);
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

// 禁用或启用空包订单
KbOrderManage.prototype.toggleKbOrder = function (data) {
    let cmdText = `UPDATE  yidian_kb_order SET status = ? WHERE id = ? `,
        cmdParams = [data.status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = KbOrderManage;