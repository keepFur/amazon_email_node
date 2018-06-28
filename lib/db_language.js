/*
 * 用于 产品类型表数据的操作
 */
"use strict";
let Core = require("./core"),
    Status = require("./status");

//构造函数
let language = function (pool) {
    this.pool = pool;
};
//判断语言是否存在
language.prototype.justifyData = function (data) {
    let cmdText = `select count(language_type_name) as 'count' from amazon_service_language_types where language_type_name='${data.language_type}'
    `,
        //五个状态名
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//新增语言
language.prototype.createType = function (data) {
    let cmdText = `insert into amazon_service_language_types set language_type_name='${data.languageName}',disabled=${data.disabled};
    `,
        //五个状态名
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//改变语言可用状态
language.prototype.updateStatus = function (data) {
    let cmdText = `update amazon_service_language_types set disabled=${data.disabled} where ID=${data.id};
    `,
        //五个状态名
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//改变语言名称（可能不常用）
language.prototype.updateName = function (data) {
    let cmdText = `update amazon_service_language_types set language_type_name='${data.name}' where ID=${data.id};

    `,
        //五个状态名
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//获取所有语言列表
language.prototype.show = function (data) {
    let limit = data.pageNumber ?`limit ${Number(data.pageNumber - 1) * data.limit},${data.limit}`:``;
    let cmdText = `select count(*) as 'count' from amazon_service_language_types;
    select * from amazon_service_language_types order by ID  ${limit};
    `,
        //五个状态名
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//判断键值是否存在
language.prototype.justifyKeyData = function (data) {
    let cmdText = `select count(language_key) as 'count' from amazon_service_languages where language_type_id='${data.language_type_id}' and language_key='${data.language_key}'
    `,
        //五个状态名
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//新增键值
language.prototype.createKey = function (data) {
    let cmdText = `insert into amazon_service_languages set language_key='${data.language_key}',language_text='${data.language_text}',language_type_id=${data.language_type_id},disabled=${data.disabled};
    `,
        //五个状态名
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//改变键值可用状态
language.prototype.updateKeyStatus = function (data) {
    let cmdText = `update amazon_service_languages set disabled=${data.disabled} where ID=${data.id};
    `,
        //五个状态名
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//改变值
language.prototype.updateKey = function (data) {
    let cmdText = `update amazon_service_languages set language_text='${data.language_text}' where ID=${data.id};
    `,
        //五个状态名
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//删除键值
language.prototype.deleteKey = function (data) {
    let cmdText = `delete from amazon_service_languages where ID=${data.id};
    `,
        //五个状态名
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//获取所有单个语言的键值
language.prototype.showKey = function (data) {
    let Targetlanguage = data.target? `where language_type_id =${data.target}`:``,
    offset = data.pageNumber ? ` limit ${Number(data.pageNumber - 1) * data.limit},${data.limit}`:``,
    notList = data.notList ?` and kv.disabled<>0` :``
    let cmdText = `select count(*) as 'count' from amazon_service_languages kv ${Targetlanguage} ${notList};
    select la.ID as 'id',la.language_type_name,kv.* from amazon_service_languages  kv left join amazon_service_language_types la on kv.language_type_id=la.ID ${Targetlanguage} ${notList} order by kv.ID ${offset};
    `,
        //五个状态名
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
module.exports = language;