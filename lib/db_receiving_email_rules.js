/*
 * 用于 收信规则 模块功能的数据实现
 */
"use strict";
let Core = require("./core"),
    EnumStatus = require("./status"),
    Mailgun = require("./mailgun"),
    AutoEmailRules = require("./db_auto_email_rules"),
    Config = require("./config");

// 构建函数
let ReceivingEmailRules = function (pool, receive) {
    this.pool = pool;
    this.receive = receive;
};
// 转换查询参数，传入一个数组，返回字符串
ReceivingEmailRules.prototype.convertParams = function (arr) {
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
// 获取所有的收信规则（支持状态、规则模糊匹配）
ReceivingEmailRules.prototype.getReceivingEmailRuleList = function (params) {
    const start = (Number(params.pageNumber) - 1) * 15;
    const end = 15; //每页显示15条
    let cmd = 'SELECT * FROM amazon_service_email_rules WHERE orgGroupId = ?  ORDER BY ID DESC LIMIT ?,?', cmdParams = [];
    if (typeof params === 'object') {
        cmdParams = [params.orgGroupId, start, end];
        return Core.flyer.return_promise(this.pool, cmd, cmdParams);
    }
    return;
};
// 获取一个收信规则，通过id
ReceivingEmailRules.prototype.getReceivingEmailRuleById = function (params) {
    let cmd = 'SELECT * FROM amazon_service_email_rules WHERE ID = ? ', cmdParams = [];
    if (typeof params === 'object') {
        cmdParams = [params.id];
        return Core.flyer.return_promise(this.pool, cmd, cmdParams);
    }
    return;
};
// 新增收信规则（单个操作）
ReceivingEmailRules.prototype.addReceivingEmailRule = function (params) {
    let cmd = '', cmdParams = [];
    if (params.id) {
        cmd += 'DELETE FROM amazon_service_email_rules  WHERE ID = ?;';
        cmdParams = [params.id];
    }
    cmd += `INSERT INTO amazon_service_email_rules(active,_from,_to,_subject,size,mail_address_id,mail_address_name,email_type_rule,assigned_rule,finish_rule,reply_rule,created_by_id,created_by_name,orgGroupId,domain,time,handle_type,mail_language) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    if (typeof params === 'object') {
        cmdParams = cmdParams.concat([params.active, params.from, params.to, params.subject, params.size, params.mailAddressId, params.mailAddressName, params.emailTypeRule, params.assignedRule, params.finishRule, params.replyRule, params.createdById, params.createdByName, params.orgGroupId, params.domain, params.time, params.handleType,params.language]);
        return Core.flyer.return_promise(this.pool, cmd, cmdParams);
    }
    return;
};
// 通过收信规则id删除收信规则
ReceivingEmailRules.prototype.deleteReceivingEmailRulesById = function (params) {
    let cmd = `DELETE FROM amazon_service_email_rules  WHERE ID IN `, ids = '', cmdParams = [];
    if (Array.isArray(params.ids) && params.ids.length) {
        ids = this.convertParams(params.ids);
        cmd += ids;
        cmdParams = params.ids;
        return Core.flyer.return_promise(this.pool, cmd, cmdParams);
    }
    return;
};
// 通过收信规则id修改收信规则的状态
ReceivingEmailRules.prototype.refreshReceivingEmailRulesById = function (params) {
    let cmd = `UPDATE amazon_service_email_rules SET active = ? WHERE ID IN `, ids = '', cmdParams = [];
    if (Array.isArray(params.ids) && params.ids.length) {
        ids = this.convertParams(params.ids);
        cmd += ids;
        cmdParams = params.ids;
        cmdParams = [params.state].concat(cmdParams);
        return Core.flyer.return_promise(this.pool, cmd, cmdParams);
    }
    return;
};
// 编辑收信规则（单个操作）
ReceivingEmailRules.prototype.editReceivingEmailRule = function (params) {
    let cmd = ``, cmdParams = [];
    if (typeof params === 'object') {
        if (params.name && params.id) {
            cmd = `update amazon_service_email_rules set name= ? where id=?`;
            cmdParams = [params.name, params.id];
            return Core.flyer.return_promise(this.pool, cmd, cmdParams);
        }
        return;
    }
    return;
};
// 运行收信规则 参数 params:{id:123,orgGroupId:123}
ReceivingEmailRules.prototype.runReceivingEmailRulesById = function (params) {
    let autoEmailRules = new AutoEmailRules(this.pool, this.receive);
    return autoEmailRules.toCurrentEmailsByRule(params);
};
// 暴露接口
module.exports = ReceivingEmailRules;