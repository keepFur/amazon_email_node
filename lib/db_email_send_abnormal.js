/*
 * 用于 产品 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 产品构造函数
let EmailSendAbnormal = function (pool) {
    this.pool = pool;
};
// 转换查询参数，传入一个数组，返回字符串
EmailSendAbnormal.prototype.convertParams = function (arr) {
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

// 读取记录(需要分页,查询条件：ID，分组)
EmailSendAbnormal.prototype.readEmailSendAbnormal = function (data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit||0,
        cmdText = `SELECT ID , address , code , error ,created_at AS createdAt , 
                           message_hash AS messageHash , notice , domain , 
                           from_address AS fromAddress
                           FROM amazon_service_bounces WHERE notice=1 `,
        cmdParams = [];
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.fromAddress) {
        cmdText += ` AND from_address = ?`;
        cmdParams.push(data.fromAddress);
    }
    cmdText += ` ORDER BY ID DESC LIMIT ?,? `;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};



// 读取发送异常邮件总数根据条件
EmailSendAbnormal.prototype.readEmailSendAbnormalTotal = function (data) {
    let cmdText = `SELECT COUNT(ID) as total FROM amazon_service_bounces WHERE notice=1 `,
        cmdParams = [];
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 不再提示（设置notice为0，支持批量操作）
EmailSendAbnormal.prototype.updateEmailSendAbnormal = function (data) {
    let cmdText = `UPDATE  amazon_service_bounces SET notice = 0 `,
        cmdParams = data.ID;
    cmdText += ` WHERE ID IN `+ this.convertParams(data.ID);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 不再提示读取(需要分页,查询条件：notice)
EmailSendAbnormal.prototype.readAbnormalNoTips = function (data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit||0,
        cmdText = `SELECT id , address , code , error ,created_at AS createdAt , 
                           message_hash AS messageHash , notice , domain , 
                           from_address AS fromAddress
                           FROM amazon_service_bounces WHERE notice=0 `,
        cmdParams = [];
    if (data.fromAddress) {
        cmdText += ` AND from_address = ?`;
        cmdParams.push(data.fromAddress);
    }
    cmdText += ` ORDER BY ID DESC LIMIT ?,? `;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
// 读取不再提示邮件总数根据条件
EmailSendAbnormal.prototype.readAbnormalNoTipsTotal = function (data) {
    let cmdText = `SELECT COUNT(ID) as total FROM amazon_service_bounces WHERE notice=0 `,
        cmdParams = [];
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = EmailSendAbnormal;