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
        (number,remark, plant,user_id,kb_number,kb_company, address_from, address_to, address_to_pca, address_from_pca,to_name,to_phone,kb_weight,price, total,created_date) VALUES `,
        cmdParams = [];
    if (Array.isArray(data.kbNumber)) {
        data.kbNumber.forEach(function (number, index) {
            if (index !== data.kbNumber.length - 1) {
                cmdText += '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),';
            } else {
                cmdText += '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            }
            cmdParams.push(data.plant === 'PDD' ? data.addressTo[index].split(/，|,/)[3].replace(/\s/, '') : data.number);
            cmdParams.push(data.remark);
            cmdParams.push(data.plant);
            cmdParams.push(data.userId);
            cmdParams.push(number.number);
            cmdParams.push(number.company);
            cmdParams.push(data.addressFrom);
            cmdParams.push(data.addressTo[index]);
            cmdParams.push(data.addressToPca[index]);
            cmdParams.push(data.addressFromPca);
            cmdParams.push(data.addressTo[index].split(/，|,/)[0]);
            cmdParams.push(data.addressTo[index].split(/，|,/)[1]);
            cmdParams.push(data.kbWeight);
            cmdParams.push(data.price);
            cmdParams.push(data.total);
            cmdParams.push(new Date());
        });
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(需要分页,查询条件：id，plantname 等)
KbOrderManage.prototype.readKbOrderPage = function (data) {
    let limit = Number(data.limit || 20);
    let offset = Number(data.offset - 1) * limit;
    let cmdText = `SELECT o.id,o.number,remark,plant, address_from AS addressFrom,address_to AS addressTo, address_to_pca AS addressToPca, address_from_pca AS addressFromPca,to_name AS toName ,to_phone AS toPhone, kb_weight AS kbWeight, total,kb_number AS kbNumber,kb_company AS kbCompany, o.created_date AS createdDate,o.update_date AS updateDate 
    ,o.status,u.username AS userName,u.id AS userId, o.price, FROM yidian_kb_order o INNER JOIN yidian_user u ON o.user_id = u.id WHERE 1 = 1 `,
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
    if (data.number) {
        cmdText += ` AND number = ? `;
        cmdParams.push(data.number);
    }
    if (data.kbCompany) {
        cmdText += ` AND kb_company = ? `;
        cmdParams.push(data.kbCompany);
    }
    if (data.createdDateStart) {
        cmdText += ` AND o.created_date >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND o.created_date < ? `;
        cmdParams.push(data.createdDateEnd);
    }
    cmdText += ` ORDER BY o.created_date DESC LIMIT ?,?`;
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
    if (data.number) {
        cmdText += ` AND number = ? `;
        cmdParams.push(data.number);
    }
    if (data.kbCompany) {
        cmdText += ` AND kb_company = ? `;
        cmdParams.push(data.kbCompany);
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
    let cmdText = `SELECT o.id,o.number,remark,plant, address_from AS addressFrom,address_to AS addressTo, to_name AS toName ,to_phone AS toPhone, address_to_pca AS addressToPca,  address_from_pca AS addressFromPca,total, kb_weight AS kbWeight, kb_number AS kbNumber,kb_company AS kbCompany,o.created_date AS createdDate,o.update_date AS updateDate 
    ,o.status, u.username AS userName,u.id AS userId, o.price FROM yidian_kb_order o INNER JOIN yidian_user u ON o.user_id = u.id WHERE id = ?`,
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
    if (data.addressFromPca) {
        cmdText += `, address_from_pca = ?`;
        cmdParams.push(data.addressFromPca);
    }
    if (data.addressTo) {
        cmdText += `,address_to = ?`;
        cmdParams.push(data.addressTo);
    }
    if (data.addressToPca) {
        cmdText += `,address_to_pca = ?`;
        cmdParams.push(data.addressToPca);
    }
    if (data.plant) {
        cmdText += `,plant = ?`;
        cmdParams.push(data.plant);
    }
    if (data.kbWeight) {
        cmdText += `,kb_weight = ?`;
        cmdParams.push(data.kbWeight);
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
    let cmdText = `UPDATE  yidian_kb_order SET status = ? WHERE id IN ${Core.flyer.convertParams(data.id)} `,
        cmdParams = [data.status, ...data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = KbOrderManage;