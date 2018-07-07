/*
 * 用于 用户 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 用户构造函数
let UserManage = function(pool) {
    this.pool = pool;
};

// 转换查询参数，传入一个数组，返回字符串
UserManage.prototype.convertParams = function(arr) {
    var str = '(';
    if (Array.isArray(arr) && arr.length) {
        arr.forEach(function(ele, index) {
            if (index !== arr.length - 1) {
                str += '?,';
            } else {
                str += '?)';
            }
        });
    }
    return str;
};

// 创建一个用户
UserManage.prototype.createUser = function(data) {
    let cmdText = `INSERT INTO yidian_user
        (username,password,email,phone,QQ,created_date)
        VALUES (?,?,?,?,?,?)`,
        cmdParams = [];
    cmdParams.push(data.userName);
    cmdParams.push(data.password);
    cmdParams.push(data.email);
    cmdParams.push(data.phone);
    cmdParams.push(data.QQ);
    cmdParams.push(new Date());
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(需要分页,查询条件：id，username level等)
UserManage.prototype.readUserPage = function(data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit,
        cmdText = `SELECT id, username AS userName,level,created_date AS createdDate,update_date AS updateDate 
        ,phone,email,QQ,status,money,is_super AS isSuper FROM yidian_user WHERE status = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.userName) {
        cmdText += ` AND username LIKE '%${data.userName}%' `;
    }
    if (data.level) {
        cmdText += ` AND ASIN level = ? `;
        cmdParams.push(data.level);
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.isSuper) {
        cmdText += ` AND is_super = ? `;
        cmdParams.push(data.isSuper);
    }
    if (data.moneyMin) {
        cmdText += ` AND money >= ?`;
        cmdParams.push(data.moneyMin);
    }
    if (data.moneyMax) {
        cmdText += ` AND money <= ?`;
        cmdParams.push(data.moneyMax);
    }
    if (data.createdDateStart) {
        cmdText += ` AND created_date >= ? `;
        cmdParams.push(data.createdDateStart);
    }
    if (data.createdDateEnd) {
        cmdText += ` AND created_date < ? `;
        cmdParams.push(data.createdDateEnd);
    }
    cmdText += ` ORDER BY CONVERT(username USING gb2312) ASC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取总数根据条件
UserManage.prototype.readUserPageTotal = function(data) {
    let cmdText = `SELECT COUNT(ID) as total FROM yidian_user WHERE status = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.userName) {
        cmdText += ` AND username LIKE '%${data.userName}%' `;
    }
    if (data.level) {
        cmdText += ` AND ASIN level = ? `;
        cmdParams.push(data.level);
    }
    if (data.status) {
        cmdText += ` AND status = ? `;
        cmdParams.push(data.status);
    }
    if (data.isSuper) {
        cmdText += ` AND is_super = ? `;
        cmdParams.push(data.isSuper);
    }
    if (data.moneyMin) {
        cmdText += ` AND money >= ?`;
        cmdParams.push(data.moneyMin);
    }
    if (data.moneyMax) {
        cmdText += ` AND money <= ?`;
        cmdParams.push(data.moneyMax);
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
UserManage.prototype.readUserById = function(data) {
    let cmdText = `SELECT id, username AS userName,level,created_date AS createdDate,update_date AS updateDate 
        ,phone,email,QQ,status,money,is_super AS isSuper FROM yidian_user WHERE id = ?`,
        cmdParams = [data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
UserManage.prototype.updateUser = function(data) {
    let cmdText = `UPDATE  yidian_user SET `,
        cmdParams = [];
    if (data.password) {
        cmdText += `, password = ?`;
        cmdParams.push(data.password);
    }
    if (data.level) {
        cmdText += `,level = ?`;
        cmdParams.push(data.level);
    }
    if (data.status) {
        cmdText += `, status = ?`;
        cmdParams.push(data.status);
    }
    if (data.isSuper) {
        cmdText += `,is_super = ? `;
        cmdParams.push(data.isSuper);
    }
    if (data.phone) {
        cmdText += `, phone = ? `;
        cmdParams.push(data.phone);
    }
    if (data.email) {
        cmdText += `, email = ? `;
        cmdParams.push(data.email);
    }
    if (data.QQ) {
        cmdText += `, QQ = ? `;
        cmdParams.push(data.QQ);
    }
    cmdText += `update_date = ?`;
    cmdParams.push(new Date());
    cmdText += ` WHERE id = ?`;
    cmdParams.push(data.id);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 用户充值
UserManage.prototype.addMoneyUser = function(data) {
    let cmdText = `UPDATE  yidian_user SET money = ? WHERE id = ? `,
        cmdParams = [data.money, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用用户
UserManage.prototype.toggleUser = function(data) {
    let cmdText = `UPDATE  yidian_user SET status = ? WHERE id IN `,
        cmdParams = data.id;
    cmdParams.shift(data.status);
    cmdText += this.convertParams(data.id);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 会员等级修改
UserManage.prototype.updateLevelUser = function(data) {
    let cmdText = `UPDATE  yidian_user SET level = ? WHERE id = ? `,
        cmdParams = [data.level, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 用户权限修改
UserManage.prototype.updateIsSuperUser = function(data) {
    let cmdText = `UPDATE  yidian_user SET is_super = ? WHERE id = ? `,
        cmdParams = [data.isSuper, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 用户登录
UserManage.prototype.userLogin = function(data) {
    let cmdText = `SELECT password FROM yidian_user  WHERE username= ? `,
        cmdParams = [data.userName];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = UserManage;