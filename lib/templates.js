/*
* 用于 内容模板 模块功能的业务实现
*/
"use strict";
let DB = require("./db");
let Core = require('./core');
let Templates = function () {
  this.tpl = DB.dbQuery.template;
};

//添加模板
Templates.prototype.add = function (data, res) {
  //存入数据库模板
  let promise = this.tpl.insert(data);
  promise.then(function (data) {
    data.response = 'OK'
    res.send(data);
  }).catch(err => {
    Core.flyer.log('新增模板出错：' + err.message);
    res.send({
      response: 'bad'
    });
  });
};

//展示模板
Templates.prototype.show = function (data, res) {
  let promise = this.tpl.select(data, res);
  promise.then(function (data) {
    res.send({
      total: data[0][0].count,
      rows: data[1]
    });
  }).catch(err => {
    Core.flyer.log('展示模板出现异常：' + err.message);
  });
};

//引用模板
Templates.prototype.listTpl = function (data, res) {
  let promise = this.tpl.listTpl(data, res);
  promise.then(function (data) {
    res.send({
      rows: data
    });
  }).catch(err => {
    Core.flyer.log('引用模板出现异常：' + err.message);
  });
};

//删除模板
Templates.prototype.delete = function (data, res) {
  let promise = this.tpl.delete(data);
  promise.then(function (data) {
    res.send(data);
  }).catch(err => {
    Core.flyer.log('删除模板出现异常：' + err.message);
  });
};

//更新模板
Templates.prototype.update = function (data, res) {
  let promise = this.tpl.update(data);
  promise.then(function (data) {
    data.response = 'OK';
    res.send(data);
  }).catch(err => {
    Core.flyer.log('更新模板出现异常：' + err.message);
  });
};

//编辑模板数据获取
Templates.prototype.editorData = function (data, res) {
  let promise = this.tpl.editor(data);
  promise.then(function (data) {
    data.response = 'OK';
    res.send(data[0]);
  }).catch(err => {
    Core.flyer.log('获取模板出现异常：' + err.message);
  });
};

//拉取订单
Templates.prototype.getOrder = function (emailId, res) {
  let promise = this.tpl.getOrder(emailId);
  promise.then(function (data) {
    data.response = 'OK';
    res.send(data);
  }).catch(err => {
    res.send({
      response: 'bad'
    });
    Core.flyer.log('拉去订单出现异常：' + err.message);
  });
};
// 获取模板信息，通过模板的标题
Templates.prototype.getTemplateByTitle = function (data, res) {
  let promise = this.tpl.getTemplateByTitle(data);
  if (promise && promise.then) {
    promise.then(function (result) {
      if (result) {
        res.send({
          success: true,
          data: result
        });
      }
    }).catch(err => {
      res.send({
        success: false
      });
      Core.flyer.log('通过标题获取模板信息出现异常：' + err.message);
    });
  } else {
    res.send({
      success: false,
      data: []
    });
  }
};
module.exports = Templates;
