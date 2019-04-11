/*
 * 用于 礼品订单 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 礼品订单构造函数
let PresentPurchase = function(pool) {
    this.pool = pool;
};

// 读礼品列表
PresentPurchase.prototype.readPresent = function(data) {
    let cmdText = `SELECT id,pid,name,price,img, created_date AS createdDate,update_date AS updateDate 
    ,status FROM yidian_present WHERE 1 = 1 `,
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

// 通过id获取一个礼品
PresentPurchase.prototype.readPresentById = function(data) {
    let cmdText = `SELECT id,pid,name,price,img, created_date AS createdDate,update_date AS updateDate 
    ,status FROM yidian_present WHERE id =  ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读仓库列表
PresentPurchase.prototype.readFromStock = function(data) {
    let cmdText = `SELECT id,name,address,created_date AS createdDate,update_date AS updateDate 
    ,status FROM yidian_present_stock WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.name) {
        cmdText += ` AND name LIKE '%${data.name}%' `;
    }
    if (data.address) {
        cmdText += ` AND address LIKE '%${data.address}%' `;
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
    cmdText += ` ORDER BY created_date ASC`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取仓库信息通过id
PresentPurchase.prototype.readFromStockById = function(data) {
    let cmdText = `SELECT id,name,address,created_date AS createdDate,update_date AS updateDate 
    ,status FROM yidian_present_stock WHERE id = ? `,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 保存发货人信息
PresentPurchase.prototype.saveFromUserInfoById = function(data) {
    let cmdText = `INSERT INTO yidian_present_set
        (user_id,from_name, from_phone,created_date) VALUES (?,?,?,?)`,
        cmdParams = [data.userId, data.fromName, data.fromPhone, new Date()];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取发货人信息
PresentPurchase.prototype.readFromUserInfoById = function(data) {
    let cmdText = `SELECT id,from_name AS fromName,user_id AS userId,from_phone AS fromPhone,created_date AS createdDate,update_date AS updateDate 
    FROM yidian_present_set WHERE user_id = ? `,
        cmdParams = [Number(data.userId)]
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 修改发货人信息
PresentPurchase.prototype.updateFromUserInfoById = function(data) {
    let cmdText = `UPDATE  yidian_present_set SET from_name = ?,from_phone = ? WHERE user_id = ?`,
        cmdParams = [data.fromName, data.fromPhone, Number(data.userId)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 创建礼品订单
PresentPurchase.prototype.createPresentOrder = function(data) {
    let cmdText = `INSERT INTO yidian_present_order
        (remark,user_id,order_number,from_stock_id, address_from_name, address_to, address_to_pca, address_from_phone,to_name,to_phone,pid,count, total,taskid,created_date) VALUES `,
        cmdParams = [];
    if (Array.isArray(data.addressTo)) {
        data.addressTo.forEach(function(number, index) {
            if (index !== data.addressTo.length - 1) {
                cmdText += '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),';
            } else {
                cmdText += '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
            }
            cmdParams.push(data.remark);
            cmdParams.push(data.userId);
            cmdParams.push(Core.flyer.getGUID());
            cmdParams.push(data.fromStockId);
            cmdParams.push(data.addressFromName);
            cmdParams.push(data.addressTo[index]);
            cmdParams.push(data.addressToPca[index]);
            cmdParams.push(data.addressFromPhone);
            cmdParams.push(data.addressTo[index].split(/，|,/)[0]);
            cmdParams.push(data.addressTo[index].split(/，|,/)[1]);
            cmdParams.push(data.pid);
            cmdParams.push(data.count);
            cmdParams.push(data.price);
            cmdParams.push(data.taskid);
            cmdParams.push(new Date());
        });
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取礼品订单记录(没有出物流单号的)
PresentPurchase.prototype.readPresentOrderNoKdNumber = function() {
    let cmdText = `SELECT id,order_number AS orderNumber,user_id AS userId,taskid,created_date AS createdDate FROM yidian_present_order WHERE kd_number = '000000' AND status = 1 ORDER BY created_date ASC`,
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新礼品订单信息更加id
PresentPurchase.prototype.updatePresentOrderById = function(data) {
    let cmdText = `UPDATE  yidian_present_order SET kd_number = ? ,update_date = ?,status = 2 WHERE id = ? AND taskid = ?`,
        cmdParams = [data.kdNumber, new Date(), data.id, data.taskid];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取礼品订单记录(需要分页,查询条件：id，plantname 等)
PresentPurchase.prototype.readPresentOrderPage = function(data) {
    let limit = Number(data.limit || 20);
    let offset = Number(data.offset - 1) * limit;
    let cmdText = `SELECT o.id,o.order_number AS orderNumber,remark,o.taskid, o.kd_number AS kdNumber, address_from_name AS addressFromName,address_to AS addressTo, address_to_pca AS addressToPca, address_from_phone AS addressFromPhone,to_name AS toName ,to_phone AS toPhone, total,pid ,o.count, s.name,s.address,o.created_date AS createdDate,o.update_date AS updateDate 
    ,o.status,u.username AS userName,u.id AS userId, o.total FROM yidian_present_order o INNER JOIN yidian_user u  INNER JOIN yidian_present_stock s ON o.user_id = u.id AND s.id=o.from_stock_id WHERE 1 = 1 `,
        cmdParams = [];
    if (data.orderNumber) {
        cmdText += ` AND order_number LIKE '%${data.orderNumber}%' `;
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
    if (data.addressTo) {
        cmdText += ` AND address_to LIKE '%${data.addressTo}%' `;
    }
    if (data.addressFrom) {
        cmdText += ` AND ( address_from_name LIKE '%${data.addressFrom}%' OR address_from_phone LIKE '%${data.addressFrom}%' )`;
    }
    if (data.kdNumber) {
        cmdText += ` AND kd_number = ? `;
        cmdParams.push(data.kdNumber);
    }
    if (data.stockFromId) {
        cmdText += ` AND from_stock_id = ? `;
        cmdParams.push(data.stockFromId);
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

// 读取礼品订单总数根据条件
PresentPurchase.prototype.readPresentOrderTotal = function(data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_present_order WHERE 1 = 1 `,
        cmdParams = [];
    if (data.orderNumber) {
        cmdText += ` AND order_number LIKE '%${data.orderNumber}%' `;
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
    if (data.addressTo) {
        cmdText += ` AND address_to LIKE '%${data.addressTo}%' `;
    }
    if (data.kdNumber) {
        cmdText += ` AND kd_number = ? `;
        cmdParams.push(data.kdNumber);
    }
    if (data.stockFromId) {
        cmdText += ` AND from_stock_id = ? `;
        cmdParams.push(data.stockFromId);
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

// 读取一条礼品订单记录通过ID
PresentPurchase.prototype.readPresentOrderById = function(data) {
    let cmdText = `SELECT o.id,o.order_number AS orderNumber,remark,o.taskid, o.kd_number AS kdNumber, address_from_name AS addressFromName,address_to AS addressTo, address_to_pca AS addressToPca, address_from_phone AS addressFromPhone,to_name AS toName ,to_phone AS toPhone, total,pid ,o.count, from_stock_id AS fromStockId, o.created_date AS createdDate,o.update_date AS updateDate 
    ,o.status,u.username AS userName,u.id AS userId, o.total FROM yidian_present_order o INNER JOIN yidian_user u ON o.user_id = u.id WHERE o.id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用礼品订单记录
PresentPurchase.prototype.togglePresentOrder = function(data) {
    let cmdText = `UPDATE  yidian_present_order SET status = ? WHERE id IN ${Core.flyer.convertParams(data.id)} `,
        cmdParams = [data.status, ...data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
PresentPurchase.prototype.updatePresentOrder = function(data) {
    let cmdText = `UPDATE  yidian_present_order SET `,
        cmdParams = [];
    if (data.fromStockId) {
        cmdText += `, from_stock_id = ?`;
        cmdParams.push(data.fromStockId);
    }
    if (data.addressTo) {
        cmdText += `,address_to = ?`;
        cmdParams.push(data.addressTo);
    }
    if (data.addressToPca) {
        cmdText += `,address_to_pca = ?`;
        cmdParams.push(data.addressToPca);
    }
    cmdText += `,update_date = ?`;
    cmdParams.push(new Date());
    cmdText += ` WHERE id = ?`;
    cmdParams.push(data.id);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
PresentPurchase.prototype.setPresentKdNumber = function(data) {
    let cmdText = `UPDATE  yidian_present_order SET kd_number = ?,update_date = ?, status = 2 WHERE id = ? AND taskid = ?`,
        cmdParams = [data.kdNumber, new Date(), data.id, data.taskid];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = PresentPurchase;