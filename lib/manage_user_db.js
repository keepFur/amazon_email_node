/*
 * 用于 用户 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 用户构造函数
let UserManage = function (pool) {
    this.pool = pool;
};

// 创建一个用户
UserManage.prototype.createUser = function (data) {
    let cmdText = `INSERT INTO yidian_user
        (username,password,salt,email,phone,QQ,my_share_code,other_share_code,created_date)
        VALUES (?,?,?,?,?,?,?,?,?)`,
        cmdParams = [];
    cmdParams.push(data.userName);
    cmdParams.push(data.password);
    cmdParams.push(data.salt);
    cmdParams.push(data.email);
    cmdParams.push(data.phone);
    cmdParams.push(data.QQ);
    cmdParams.push(Core.flyer.generateShareCode());
    // 如果是通过别人分享注册的用户，需要将
    if (data.otherShareCode) {
        cmdParams.push(data.otherShareCode);
    } else {
        cmdParams.push('');
    }
    cmdParams.push(new Date());
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(需要分页,查询条件：id，username level等)
UserManage.prototype.readUserPage = function (data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit,
        cmdText = `SELECT id, username AS userName,level,created_date AS createdDate,update_date AS updateDate 
        ,phone,email,QQ,status,money,is_super AS isSuper,my_share_code AS myShareCode,other_share_code AS otherShareCode FROM yidian_user WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.userName) {
        cmdText += ` AND username LIKE '%${data.userName}%'`;
    }
    if (data.keyword) {
        cmdText += ` AND (QQ LIKE '%${data.keyword}%' OR email LIKE '%${data.keyword}%' OR phone LIKE '%${data.keyword}%')`;
    }
    if (data.level) {
        cmdText += ` AND level = ? `;
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
    cmdText += ` ORDER BY created_date DESC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取用户推广记录(需要分页,查询条件：username)
UserManage.prototype.readShareUserPage = function (data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit,
        cmdText = `SELECT username AS userName,level,status,money, created_date AS createdDate FROM yidian_user WHERE other_share_code = ?`,
        cmdParams = [data.myShareCode];
    if (data.userName) {
        cmdText += ` AND username LIKE '%${data.userName}%'`;
    }
    cmdText += ` ORDER BY created_date DESC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取总数根据条件
UserManage.prototype.readUserPageTotal = function (data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_user WHERE 1 = 1 `,
        cmdParams = [];
    if (data.id) {
        cmdText += ` AND id = ?`;
        cmdParams.push(data.id);
    }
    if (data.userName) {
        cmdText += ` AND username LIKE '%${data.userName}%'`;
    }
    if (data.keyword) {
        cmdText += ` AND (QQ LIKE '%${data.keyword}%' OR email LIKE '%${data.keyword}%' OR phone LIKE '%${data.keyword}%')`;
    }
    if (data.level) {
        cmdText += ` AND level = ? `;
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

// 读取推广用户总数根据条件
UserManage.prototype.readShareUserTotal = function (data) {
    let cmdText = `SELECT COUNT(id) as total FROM yidian_user WHERE other_share_code = ? `,
        cmdParams = [data.myShareCode];
    if (data.userName) {
        cmdText += ` AND username LIKE '%${data.userName}%'`;
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取一条记录通过ID
UserManage.prototype.readUserById = function (data) {
    let cmdText = `SELECT id, username AS userName,level,created_date AS createdDate,update_date AS updateDate 
        ,phone,email,QQ,status,money,is_super AS isSuper,my_share_code AS myShareCode,other_share_code AS otherShareCode FROM yidian_user WHERE id = ?`,
        cmdParams = [Number(data.id)];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取一条记录通过分享码
UserManage.prototype.readUserByShareCode = function (data) {
    let cmdText = `SELECT id, username AS userName,level,created_date AS createdDate,update_date AS updateDate 
        ,phone,email,QQ,status,money,is_super AS isSuper,my_share_code AS myShareCode,other_share_code AS otherShareCode FROM yidian_user WHERE my_share_code = ?`,
        cmdParams = [data.otherShareCode];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
UserManage.prototype.updateUser = function (data) {
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
    cmdText += `,update_date = ?`;
    cmdParams.push(new Date());
    cmdText += ` WHERE id = ?`;
    cmdParams.push(data.id);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 用户充值
UserManage.prototype.addMoneyUser = function (data) {
    let cmdText = `UPDATE  yidian_user SET money = money + ? WHERE id = ? `,
        cmdParams = [data.money, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 用户扣除余额
UserManage.prototype.reduceMoneyUser = function (data) {
    let cmdText = `UPDATE  yidian_user SET money = money - ? WHERE id = ? `,
        cmdParams = [data.money, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 禁用或启用用户
UserManage.prototype.toggleUser = function (data) {
    let cmdText = `UPDATE  yidian_user SET status = ? WHERE id = ? `,
        cmdParams = [data.status, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 会员等级修改
UserManage.prototype.updateLevelUser = function (data) {
    let cmdText = `UPDATE  yidian_user SET level = ?, money = money-990 WHERE id = ? `,
        cmdParams = [2, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 用户权限修改
UserManage.prototype.updateIsSuperUser = function (data) {
    let cmdText = `UPDATE  yidian_user SET is_super = ? WHERE id = ? `,
        cmdParams = [data.isSuper, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 用户登录
UserManage.prototype.userLogin = function (data) {
    let cmdText = `SELECT password,salt,id FROM yidian_user  WHERE username = ? `,
        cmdParams = [data.userName];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 重置密码
UserManage.prototype.setUserPassword = function (data) {
    let cmdText = `UPDATE  yidian_user SET salt = ? ,password = ? WHERE username = ? `,
        cmdParams = [data.salt, data.password, data.userName];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 根据用户名和手机获取用户信息
UserManage.prototype.getUserInfoByPhone = function (data) {
    let cmdText = `SELECT username FROM yidian_user  WHERE username = ? AND phone = ?`,
        cmdParams = [data.userName, data.userPhone];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 获取用户推广详情信息 是否是通过别人分享的连接注册的（获取用户的other_share_code 字段，如果有这个字段，说明是通过别分享的连接注册的，通过该字段查询出有my_share_code == other_share_code 的用户信息） 获取佣金的总额 (通过日志查询)
UserManage.prototype.readUserExtendDetailById = function (data) {
    let cmdText = `SELECT username FROM yidian_user  WHERE my_share_code = ?;
                  SELECT SUM(count) AS allExtendSumMoney,COUNT(*) AS allExtendMoneyCount FROM yidian_logs_score WHERE type =5 AND user_id = ?;`,
        cmdParams = [data.otherShareCode, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = UserManage;