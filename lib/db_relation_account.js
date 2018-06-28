/*
* 用于 相关邮箱 模块功能的数据实现
*/
"use strict";
let Core = require("./core"),
    config = require("./config"),
    mysql = require("mysql"),
    EnumStatus = require("./status");
var RelationAccount = function (pool) {
    this.pool = pool;
};
//插入数据库
RelationAccount.prototype.insertRelatedMail = function (obj) {
    let cmdText = `insert into  amazon_service_stored (ID,event,_from,_to,subject,message_attachments,subject_num,campaigns,timer) values('${Core.flyer.getGUID()}','other',${obj.from?mysql.escape(obj.from.text):null},${obj.to?mysql.escape(obj.to.text):null},${mysql.escape(obj.subject)},${mysql.escape(JSON.stringify(obj.attachments))},'${Core.flyer.getGUID()}',${mysql.escape(obj.html)},'${Core.flyer.formatDate('yyyy-mm-dd hh:MM:ss',new Date(obj.date))}')`,
        _this = this;
        return Core.flyer.return_promise(_this.pool, cmdText, []);
    
};
//删除关联邮箱
RelationAccount.prototype.removeRelatedMail = function (data) {
    let cmdText = `delete from amazon_service_stored where event='other' and _to LIKE '%${data}%' or _to LIKE '%aukeys@aukeys.com%' or _to LIKE '%aukeyzl@aukeys.com%'`;
    return Core.flyer.return_promise(this.pool, cmdText, []);
};

module.exports = RelationAccount;
