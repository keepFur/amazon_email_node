/*
 * 用于 平台 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 平台构造函数
let PlantManage = function(pool) {
    this.pool = pool;
};

// 创建一个平台
PlantManage.prototype.createPlant = function(data) {
    let cmdText = `INSERT INTO yidian_plant
        (plantname,description,created_date)
        VALUES (?,?,?)`,
        cmdParams = [];
    cmdParams.push(data.plantName);
    cmdParams.push(data.description);
    cmdParams.push(new Date());
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(需要分页,查询条件：id，plantname 等)
PlantManage.prototype.readPlantPage = function(data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit,
        cmdText = `SELECT id, plantname AS plantName,description,created_date AS createdDate,update_date AS updateDate 
        ,status FROM yidian_plant WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.plantName) {
        cmdText += ` AND plantname LIKE '%${data.plantName}%' `;
    }
    if (data.description) {
        cmdText += ` AND description LIKE '%${data.description}%' `;
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
    cmdText += ` ORDER BY CONVERT(plantname USING gb2312) ASC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取总数根据条件
PlantManage.prototype.readPlantPageTotal = function(data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_plant WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.plantName) {
        cmdText += ` AND plantname LIKE '%${data.plantName}%' `;
    }
    if (data.description) {
        cmdText += ` AND description LIKE '%${data.description}%' `;
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
PlantManage.prototype.readPlantById = function(data) {
    let cmdText = `SELECT id, plantname AS plantName,created_date AS createdDate,update_date AS updateDate 
        ,status,description FROM yidian_plant WHERE id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
PlantManage.prototype.updatePlant = function(data) {
    let cmdText = `UPDATE  yidian_plant SET `,
        cmdParams = [];
    if (data.plantName) {
        cmdText += `, plantname = ?`;
        cmdParams.push(data.plantName);
    }
    if (data.description) {
        cmdText += `,description = ?`;
        cmdParams.push(data.description);
    }
    cmdText += `,update_date = ?`;
    cmdParams.push(new Date());
    cmdText += ` WHERE id = ?`;
    cmdParams.push(data.id);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用平台
PlantManage.prototype.togglePlant = function(data) {
    let cmdText = `UPDATE  yidian_plant SET status = ? WHERE id = ? `,
        cmdParams = [data.status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = PlantManage;