/*
 * 用于 任务类型 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 任务类型构造函数
let TaskTypeManage = function (pool) {
    this.pool = pool;
};

// 创建一个任务类型
TaskTypeManage.prototype.createTaskType = function (data) {
    let cmdText = `INSERT INTO yidian_task_type
        (name,description,plant,in_price,out_price,is_pc,lieliu_code,created_date)
        VALUES (?,?,?,?,?,?,?,?)`,
        cmdParams = [];
    cmdParams.push(data.name);
    cmdParams.push(data.description);
    cmdParams.push(data.plant);
    cmdParams.push(data.inPrice);
    cmdParams.push(data.outPrice);
    cmdParams.push(data.isPc);
    cmdParams.push(data.lieliuCode);
    cmdParams.push(new Date());
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(需要分页,查询条件：id，plantname 等)
TaskTypeManage.prototype.readTaskType = function (data) {
    let cmdText = `SELECT id,name,description,plant, is_pc AS isPc,lieliu_code AS lieliuCode,in_price AS inPrice, out_price AS outPrice,created_date AS createdDate,update_date AS updateDate 
    ,status FROM yidian_task_type WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.name) {
        cmdText += ` AND name LIKE '%${data.name}%' `;
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.isPc) {
        cmdText += ` AND is_pc = ? `;
        cmdParams.push(data.isPc);
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
TaskTypeManage.prototype.readTaskTypePageTotal = function (data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_task_type WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.name) {
        cmdText += ` AND name LIKE '%${data.name}%' `;
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.isPc) {
        cmdText += ` AND is_pc = ? `;
        cmdParams.push(data.isPc);
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
TaskTypeManage.prototype.readTaskTypeById = function (data) {
    let cmdText = `SELECT id, name ,description,isPc, plant,lieliuCode,inPrice,outPrice, created_date AS createdDate,update_date AS updateDate 
    ,status FROM yidian_task_type WHERE id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
TaskTypeManage.prototype.updateTaskType = function (data) {
    let cmdText = `UPDATE  yidian_task_type SET `,
        cmdParams = [];
    if (data.name) {
        cmdText += `, name = ?`;
        cmdParams.push(data.name);
    }
    if (data.description) {
        cmdText += `,description = ?`;
        cmdParams.push(data.description);
    }
    if (data.inPrice) {
        cmdText += `,in_price = ?`;
        cmdParams.push(data.inPrice);
    }
    if (data.outPrice) {
        cmdText += `,out_price = ?`;
        cmdParams.push(data.outPrice);
    }
    if (data.isPc) {
        cmdText += `,is_pc = ?`;
        cmdParams.push(data.isPc);
    }
    cmdText += `,update_date = ?`;
    cmdParams.push(new Date());
    cmdText += ` WHERE id = ?`;
    cmdParams.push(data.id);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用任务类型
TaskTypeManage.prototype.toggleTaskType = function (data) {
    let cmdText = `UPDATE  yidian_task_type SET status = ? WHERE id = ? `,
        cmdParams = [data.status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = TaskTypeManage;