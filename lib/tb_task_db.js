/*
 * 用于 淘宝任务 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 淘宝任务构造函数
let TbTaskDB = function(pool) {
    this.pool = pool;
};

// 创建一个淘宝任务
TbTaskDB.prototype.createTask = function(data) {
    let cmdText = `INSERT INTO yidian_task
        (task_user_id,task_name,task_parent_type,task_plant,task_child_type,
        task_start_date,task_end_date,task_baby_link_token,
        task_unit_price,task_sum_money,created_date)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        cmdParams = [];
    cmdParams.push(data.taskUserId);
    cmdParams.push(data.taskName);
    cmdParams.push(data.taskParentType);
    cmdParams.push(data.taskPlant);
    cmdParams.push(data.taskChildType);
    cmdParams.push(data.taskStartDate);
    cmdParams.push(data.taskEndDate);
    cmdParams.push(data.taskBabyLinkToken);
    cmdParams.push(data.taskUnitPrice);
    cmdParams.push(data.taskSumMoney);
    cmdParams.push(new Date());
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(需要分页,查询条件：id，task_name level等)
TbTaskDB.prototype.readTaskPage = function(data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit,
        cmdText = `SELECT id,task_user_id, task_name AS taskName,task_parent_type AS taskParentType,
        task_plant AS taskPlant,task_child_type AS taskChildType,
        task_start_date AS taskStartDate, task_end_date AS taskEndDate,status,
        task_baby_link_token AS taskBabyLinkToken, task_unit_price AS taskUnitPrice,task_sum_money  AS taskSumMoney,
        created_date AS createdDate,update_date AS updateDate 
        FROM yidian_task WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.taskUserId) {
        cmdText += ` AND task_user_id = ?`;
        cmdParams.push(data.taskUserId);
    }
    if (data.taskName) {
        cmdText += ` AND task_name LIKE '%${data.taskName}%' `;
    }
    if (data.taskParentType) {
        cmdText += ` AND ASIN task_parent_type = ? `;
        cmdParams.push(data.taskParentType);
    }
    if (data.taskChildType) {
        cmdText += ` AND ASIN task_child_type = ? `;
        cmdParams.push(data.taskChildType);
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.taskBabyLinkToken) {
        cmdText += ` AND task_baby_link_token LIKE %${data.taskBabyLinkToken}%`;
    }
    if (data.taskPlant) {
        cmdText += ` AND task_plant =  ?`;
        cmdParams.push(data.taskPlant);
    }
    if (data.createdDateStart) {
        cmdText += ` AND created_date >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND created_date < ? `;
        cmdParams.push(data.createdDateEnd);
    }
    cmdText += ` ORDER BY created_date DESC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取总数根据条件
TbTaskDB.prototype.readTaskPageTotal = function(data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_task WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.taskUserId) {
        cmdText += ` AND task_user_id = ?`;
        cmdParams.push(data.taskUserId);
    }
    if (data.taskName) {
        cmdText += ` AND task_name LIKE '%${data.taskName}%' `;
    }
    if (data.taskParentType) {
        cmdText += ` AND ASIN task_parent_type = ? `;
        cmdParams.push(data.taskParentType);
    }
    if (data.taskChildType) {
        cmdText += ` AND ASIN task_child_type = ? `;
        cmdParams.push(data.taskChildType);
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.taskBabyLinkToken) {
        cmdText += ` AND task_baby_link_token LIKE %${data.taskBabyLinkToken}%`;
    }
    if (data.taskPlant) {
        cmdText += ` AND task_plant =  ?`;
        cmdParams.push(data.taskPlant);
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
TbTaskDB.prototype.readTaskById = function(data) {
    let cmdText = `SELECT id,task_user_id, task_name AS taskName,task_parent_type AS taskParentType,
        task_plant AS taskPlant,task_child_type AS taskChildType,
        task_start_date AS taskStartDate, task_end_date AS taskEndDate,staus,
        task_baby_link_token AS taskBabyLinkToken, task_unit_price AS taskUnitPrice,task_sum_money  AS taskSumMoney,
        created_date AS createdDate,update_date AS updateDate 
        FROM yidian_task WHERE id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
TbTaskDB.prototype.updateTask = function(data) {
    let cmdText = `UPDATE  yidian_task SET `,
        cmdParams = [];
    if (data.task_name) {
        cmdText += `, task_name = ?`;
        cmdParams.push(data.taskName);
    }
    if (data.taskStartDate) {
        cmdText += `,task_start_date = ?`;
        cmdParams.push(data.taskStartDate);
    }
    if (data.taskEndDate) {
        cmdText += `,task_end_date = ?`;
        cmdParams.push(data.taskEndDate);
    }
    if (data.taskBabyLinkToken) {
        cmdText += `, task_baby_link_token = ?`;
        cmdParams.push(data.taskBabyLinkToken);
    }
    if (data.taskChildType) {
        cmdText += `,task_child_type = ? `;
        cmdParams.push(data.taskChildType);
    }
    if (data.taskBabyKeywordQuantityId) {
        cmdText += `, task_baby_keyword_quantity_id = ? `;
        cmdParams.push(data.taskBabyKeywordQuantityId);
    }
    cmdText += `,update_date = ?`;
    cmdParams.push(new Date());
    cmdText += ` WHERE id = ?`;
    cmdParams.push(data.id);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用淘宝任务
TbTaskDB.prototype.toggleTask = function(data) {
    let cmdText = `UPDATE  yidian_task SET status = ? WHERE id = ? `,
        cmdParams = [data.status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = TbTaskDB;