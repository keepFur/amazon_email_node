/*
 * 用于 其它邮件的数据管理
 */
"use strict";
let Core = require("./core"),
crypto = require('crypto'),
key=new Buffer("aukey-hj-amazon"),
crypted;
let OtherAccount = function (pool) {
    this.pool = pool;
};
//写入数据
OtherAccount.prototype.addInsert = function (data) {
    crypted = crypto.createCipher('aes-256-cbc',key);
    var crypted_smtp = crypto.createCipher('aes-256-cbc',key);
    let cmdParams = [
        data.account_name || null,
        data.account || null,
        crypted.update(data.password,'utf8','hex')+crypted.final('hex') || null,
        data.imap || null,
        data.imap_port || null,
        data.auto || null,
        data.proxy_send || null,
        data.smtp || null,
        data.smtp_port || null,
        data.safe_type_id || null,
        crypted_smtp.update(data.smtp_password,'utf8','hex')+crypted_smtp.final('hex') || null,
        data.user_id || null,
        data.depa_id,
        data.account,
        data.account,
        Core.flyer.formatDate("yyyy-mm-dd hh:MM:ss",new Date()),
        data.account.split('@')[1],
        1
    ],
        cmdText = `insert into amazon_service_other_accounts(account_name,account,password,imap,imap_port,auto,proxy_send,smtp,smtp_port,safe_type_id,smtp_password,user_id,depa_id)
                values(?,?,?,?,?,?,?,?,?,?,?,?,?);
                delete from amazon_service_accounts where mail_address = ?;
                insert into amazon_service_accounts(mail_address,created_at,domain,status_id) values(?,?,?,?)`;


    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}
//判断数据是否已经存在
OtherAccount.prototype.justifyCount = function (data) {
    let cmdText = `select count(*) as 'count' from amazon_service_other_accounts where account_name = ? and user_id = ?`,
        cmdParams = [data.account_name, data.user_id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}
//修改数据
OtherAccount.prototype.update = function (data) {
    crypted = crypto.createCipher('aes-256-cbc',key);
    var crypted_smtp = crypto.createCipher('aes-256-cbc',key);
    let cmdParams = [
        data.account_name || null,
        data.account || null,
        crypted.update(data.password,'utf8','hex')+crypted.final('hex') || null,
        data.imap || null,
        data.imap_port || null,
        data.auto || null,
        data.proxy_send || null,
        data.smtp || null,
        data.smtp_port || null,
        data.safe_type_id || null,
        crypted_smtp.update(data.smtp_password,'utf8','hex')+crypted_smtp.final('hex') || null,
        data.user_id || null,
        data.depa_id,
        data.ID,
        data.account,
        Core.flyer.formatDate("yyyy-mm-dd hh:MM:ss",new Date()),
        data.account.split('@')[1],
        1,
        data.ID
    ],
        cmdText = `update amazon_service_other_accounts set account_name=?,account=?,password=?,imap=?,imap_port=?,auto=?,proxy_send=?,smtp=?,smtp_port=?,safe_type_id=?,smtp_password=?,user_id=?,depa_id=? where ID=?;
        update amazon_service_accounts set mail_address=?,created_at=?,domain=?,status_id=? where mail_address=(select account from amazon_service_other_accounts where ID=?) `;

    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}
OtherAccount.prototype.updateStatus = function (data) {
    let cmdParams = [0,data.ID],
    cmdText = `
    update amazon_service_accounts set status_id=? where mail_address=(select account from amazon_service_other_accounts where ID=?);
    `;
return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}
//删除数据
OtherAccount.prototype.delete = function (data) {
    let cmdParams = [data.ID,0,data.ID],
        cmdText = `
        update amazon_service_accounts set status_id=? where mail_address=(select account from amazon_service_other_accounts where ID=?);
        delete from amazon_service_other_accounts where ID=?;
        DELETE FROM amazon_service_stored WHERE event='other' and _to LIKE '%${data.account}%';
        `;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}
//查询
OtherAccount.prototype.select = function (data) {
    let hasPage = data.pageNumber ? ` limit ${(data.pageNumber - 1) * 15},15` : ``,
    depa_ids = data.query.depa_ids.map(function(obj,index){
        return "'"+ obj +"'";
    }).join(','),
        cmdText = `select count(*) as 'count' from amazon_service_other_accounts where depa_id in (${depa_ids});
    select * from amazon_service_other_accounts where depa_id in (${depa_ids}) ${hasPage}`;
    return Core.flyer.return_promise(this.pool, cmdText, []);
}
//查询单个关联邮箱内的邮件
OtherAccount.prototype.getOtherEmailall = function (data) {
    let cmdText = `select count(*) as 'total' from amazon_service_stored  where event='other' and _to LIKE '%${data.email}%';
    select * from amazon_service_stored where event='other' and _to LIKE '%${data.email}%' order by timer desc limit ${(data.pageNumber - 1) * 15},15`;
    return Core.flyer.return_promise(this.pool, cmdText, []);
}
//查询邮件未读数量
OtherAccount.prototype.selectCount = function (data) {
    let cmdText = ``;
    data.forEach(function (obj, index) {
        cmdText += `select count(*) as '${obj.account}' from amazon_service_stored where event='other' and _to='${obj.account}';`;
    })
    return Core.flyer.return_promise(this.pool, cmdText, []);
}
//查询单封邮件详情
OtherAccount.prototype.getOtherEmailsingle = function (data) {
    let cmdText = `select * from amazon_service_stored where event='other' and subject_num='${data.ID}';`;
    return Core.flyer.return_promise(this.pool, cmdText, []);
}
//获取单封邮件
OtherAccount.prototype.selectSingleOther = function (data) {
    let cmdText = `select * from amazon_service_other_accounts where account='${data.account}' and user_id=${data.user_id};`;
    return Core.flyer.return_promise(this.pool, cmdText, []);
}

//根据邮件名称判断是否是关联邮箱发送
OtherAccount.prototype.IsOtherAccount = function(account){
    let cmdText = `select * from amazon_service_other_accounts where account = ?`,
        cmdParams = [account];
    return Core.flyer.return_promise(this.pool,cmdText,cmdParams);
}

module.exports = OtherAccount;