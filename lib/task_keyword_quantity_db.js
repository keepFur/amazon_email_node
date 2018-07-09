/*
 * 用于 任务关键词和数量 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 任务关键词和数量构造函数
let TaskKeywordQuantityDB = function(pool) {
    this.pool = pool;
};

// 创建一个任务关键词和数量
TaskKeywordQuantityDB.prototype.createTaskKeywordQuantity = function(data) {
    let cmdText = `INSERT INTO yidian_task_keyword_quantity
        (task_id,task_keyword,task_quantity,created_date)
        VALUES `,
        cmdParams = [];
    if (Array.isArray(data.keywordQuantity)) {
        data.keywordQuantity.forEach(function(name, index) {
            if (index !== data.keywordQuantity.length - 1) {
                cmdText += '(?,?,?,?),';
            } else {
                cmdText += '(?,?,?,?)';
            }
            cmdParams.push(data.taskId);
            cmdParams.push(data.taskKeyword);
            cmdParams.push(data.taskQuantity);
            cmdParams.push(new Date());
        });
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(需要分页,查询条件：id等)
TaskKeywordQuantityDB.prototype.readTaskKeywordQuantityPage = function(data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit,
        cmdText = `SELECT id,task_id, task_keyword AS taskKeyword,
        task_quantity AS taskQuantity, task_complete_quantity AS taskCompleteQuantity,
        created_date AS createdDate,update_date AS updateDate 
        FROM yidian_task_keyword_quantity WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.taskId) {
        cmdText += ` AND task_task_id = ?`;
        cmdParams.push(data.taskId);
    }
    if (data.taskKeyword) {
        cmdText += ` AND task_keyword LIKE '%${data.taskKeyword}%' `;
    }
    if (data.taskQuantityMin) {
        cmdText += ` AND ASIN task_quantity >= ? `;
        cmdParams.push(data.taskQuantityMin);
    }
    if (data.taskQuantityMax) {
        cmdText += ` AND ASIN task_quantity < ? `;
        cmdParams.push(data.taskQuantityMax);
    }
    if (data.taskStatus) {
        cmdText += ` AND task_status = ? `;
        cmdParams.push(data.taskStatus);
    }
    cmdText += ` ORDER BY task_id DESC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取总数根据条件
TaskKeywordQuantityDB.prototype.readTaskKeywordQuantityPageTotal = function(data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_task_keyword_quantity WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.taskId) {
        cmdText += ` AND task_task_id = ?`;
        cmdParams.push(data.taskId);
    }
    if (data.taskKeyword) {
        cmdText += ` AND task_keyword LIKE '%${data.taskKeyword}%' `;
    }
    if (data.taskQuantityMin) {
        cmdText += ` AND ASIN task_quantity >= ? `;
        cmdParams.push(data.taskQuantityMin);
    }
    if (data.taskQuantityMax) {
        cmdText += ` AND ASIN task_quantity < ? `;
        cmdParams.push(data.taskQuantityMax);
    }
    if (data.taskStatus) {
        cmdText += ` AND task_status = ? `;
        cmdParams.push(data.taskStatus);
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取一条记录通过ID
TaskKeywordQuantityDB.prototype.readTaskKeywordQuantityById = function(data) {
    cmdText = `SELECT id,task_id, task_keyword AS taskKeyword,
        task_quantity AS taskQuantity, task_complete_quantity AS taskCompleteQuantity,
        created_date AS createdDate,update_date AS updateDate 
        FROM yidian_task_keyword_quantity WHERE id = ? `,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
TaskKeywordQuantityDB.prototype.updateTaskKeywordQuantity = function(data) {
    let cmdText = `UPDATE  yidian_task_keyword_quantity SET `,
        cmdParams = [];
    if (data.taskKeyword) {
        cmdText += `, task_keyword = ?`;
        cmdParams.push(data.taskKeyword);
    }
    if (data.taskQuantity) {
        cmdText += `,task_quantity = ?`;
        cmdParams.push(data.taskQuantity);
    }
    if (data.taskCompleteQuantity) {
        cmdText += `,task_complete_quantity = task_complete_quantity + ? `;
        cmdParams.push(data.taskCompleteQuantity);
    }
    cmdText += `,update_date = ?`;
    cmdParams.push(new Date());
    cmdText += ` WHERE id = ?`;
    cmdParams.push(data.id);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用任务关键词和数量
TaskKeywordQuantityDB.prototype.toggleTaskKeywordQuantity = function(data) {
    let cmdText = `UPDATE  yidian_task_keyword_quantity SET task_status = ? WHERE id = ? `,
        cmdParams = [data.task_status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = TaskKeywordQuantityDB;