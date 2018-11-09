/*
 * 用于 空包单号 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 空包单号构造函数
let ManageKbNumber = function (pool) {
    this.pool = pool;
};

// 转换查询参数，传入一个数组，返回字符串
ManageKbNumber.prototype.convertParams = function (arr) {
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

// 创建空包单号(需要支持批量)
ManageKbNumber.prototype.createKbNumber = function (data) {
    let cmdText = `INSERT INTO yidian_kb_number (number,plant,company, created_date) VALUES `,
        cmdParams = [];
    if (Array.isArray(data.numbers)) {
        data.numbers.forEach(function (number, index) {
            if (index !== data.numbers.length - 1) {
                cmdText += '(?,?,?,?),';
            } else {
                cmdText += '(?,?,?,?)';
            }
            cmdParams.push(number);
            cmdParams.push(data.plant);
            cmdParams.push(data.company);
            cmdParams.push(new Date());
        });
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 通过excel导入空包单号
ManageKbNumber.prototype.createKbNumberByExcel = function (data) {
    let cmdText = `INSERT INTO yidian_kb_number (number,plant,company, created_date) VALUES `,
        cmdParams = [];
    if (Array.isArray(data.numbers)) {
        data.numbers.forEach(function (number, index) {
            if (index !== data.numbers.length - 1) {
                cmdText += '(?,?,?,?),';
            } else {
                cmdText += '(?,?,?,?)';
            }
            cmdParams.push(number.number);
            cmdParams.push(number.plant);
            cmdParams.push(number.company);
            cmdParams.push(new Date());
        });
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(查询条件：id，number,plant 等)
ManageKbNumber.prototype.readKbNumberPage = function (data) {
    let limit = Number(data.limit || 20);
    let offset = Number(data.offset - 1) * limit;
    let cmdText = `SELECT id, number,company,plant, created_date AS createdDate,update_date AS updateDate 
        ,status FROM yidian_kb_number WHERE 1 = 1 `,
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
    if (data.company) {
        cmdText += ` AND company = ? `;
        cmdParams.push(data.company);
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
ManageKbNumber.prototype.readKbNumberPageTotal = function (data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_kb_number WHERE 1 = 1 `,
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
    if (data.company) {
        cmdText += ` AND company = ? `;
        cmdParams.push(data.company);
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
ManageKbNumber.prototype.readKbNumberById = function (data) {
    let cmdText = `SELECT id, number,plant,company, created_date AS createdDate,update_date AS updateDate 
    ,status FROM yidian_kb_number WHERE id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
ManageKbNumber.prototype.updateKbNumber = function (data) {
    let cmdText = `UPDATE  yidian_kb_number SET `,
        cmdParams = [];
    if (data.number) {
        cmdText += `, number = ?`;
        cmdParams.push(data.number);
    }
    if (data.plant) {
        cmdText += `,plant = ?`;
        cmdParams.push(data.plant);
    }
    if (data.company) {
        cmdText += `,company = ?`;
        cmdParams.push(data.company);
    }
    cmdText += `,update_date = ?`;
    cmdParams.push(new Date());
    cmdText += ` WHERE id = ?`;
    cmdParams.push(data.id);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用空包单号
ManageKbNumber.prototype.toggleKbNumber = function (data) {
    let cmdText = `UPDATE  yidian_kb_number SET status = ? WHERE id IN ${this.convertParams(data.id)}`,
        cmdParams = [data.status, ...data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 根据空包单号查询
ManageKbNumber.prototype.readKbNumberByNumber = function (data) {
    let cmdText = `SELECT * FROM  yidian_kb_order  WHERE status = 1 AND number IN ${Core.flyer.convertParams(data.numbers)} `,
        cmdParams = [...data.numbers];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 查询各个平台的单号库存
ManageKbNumber.prototype.readKbNumberStock = function (data) {
    let cmdText = `select  count(id) AS total ,company from yidian_kb_number where status=? AND  plant=? group by company`,
        cmdParams = [data.status, data.plant];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}

module.exports = ManageKbNumber;