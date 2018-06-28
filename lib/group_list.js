/*
* 用于 内容模板 模块功能的业务实现
*/
"use strict";
var DB = require("./db");
let Core = require('./core');
var groupList = function () {
  this.tpl = DB.dbQuery.groupList;
};
//添加模板
groupList.prototype.getGroupList = function (res, offset, names) {
  //存入数据库模板
  let promise = this.tpl.getGroupList(offset, names);
  promise.then(function (data) {
    var Data = {};
    Data.total = data[0][0]['count'];
    Data.rows = data[1]
    res.send(Data);
  }).catch(err => {
    Core.flyer.log('获取分组数据出错：' + err.message);
    res.send({
      total: 0,
      rows: []
    });
  });
};
module.exports = groupList;