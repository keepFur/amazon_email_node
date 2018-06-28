/*
* 用于 内容模板 模块功能的数据实现
*/
"use strict";
let EnumStatus = require("./status"),
  Core = require("./core");
let Template = function (pool) {
  this.pool = pool;
};
//添加模板
Template.prototype.insert = function (data, time, attachment) {
  let cmdText =
    "insert into amazon_service_templates(title,content,create_date,update_date,status_id,status_name,attachment,create_by_name,create_by_id,orgGroupId) values(?,?,?,?,?,?,?,?,?,?)",
    cmdParams = [
      data.data.title,
      data.data.body,
      JSON.parse(data.time),
      JSON.parse(data.time),
      EnumStatus.active.value,
      EnumStatus.active.text,
      data.attachment,
      data.create_by_name,
      data.create_by_id,
      data.orgGroupId
    ];
  return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//展示模板
Template.prototype.select = function (data, res) {
  let cmdText =
    "select count(ID) as 'count' from amazon_service_templates where orgGroupId=?;" +
    "select * from amazon_service_templates where orgGroupId=? order by update_date desc limit ?,?",
    start = Number(data.pageNumber - 1) * 15,
    end = 15,
    cmdParams = [data.orgGroupId, data.orgGroupId, start, end];
  return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//引用模板
Template.prototype.listTpl = function (data, res) {
  let cmdText = "select * from amazon_service_templates where orgGroupId=? order by ID",
    cmdParams = [data.orgGroupId];
  return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//更新模板
Template.prototype.update = function (data) {
  let cmdParams = [
    data.data.title,
    data.data.body,
    JSON.parse(data.time),
    data.attachment,
    data.update_by_name,
    data.update_by_id,
    data.orgGroupId,
    Number(data.tempID)
  ];
  var cmdText = "update amazon_service_templates set title=?,content=?,update_date=?,attachment=?,update_by_name=?,update_by_id=?,orgGroupId=? where ID=?";
  return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//删除模板
Template.prototype.delete = function (data) {
  let cmdParams = data,
    paramLength = [];
  paramLength.push("(");
  cmdParams.forEach(function (ele, index) {
    if (index !== cmdParams.length - 1) {
      paramLength.push("?,");
    } else {
      paramLength.push("?)");
    }
  });
  let cmdText = "delete from amazon_service_templates where ID in" + paramLength.join("");
  return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//编辑模板
Template.prototype.editor = function (data) {
  let cmdParams = [data.ID],
    cmdText = "select * from amazon_service_templates where ID=?";
  return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
// 获取模板信息，通过模板的标题
Template.prototype.getTemplateByTitle = function (data) {
  let cmdParams = [data.createId, data.title], cmdText = 'select * from amazon_service_templates where create_by_id = ? and title=?';
  return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
module.exports = Template;
