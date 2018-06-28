/*
* 用于 内容模板 模块功能的业务实现
*/
"use strict";
var DB = require("./db");
let Core = require('./core');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

var order = function () {
  this.tpl = DB.dbQuery.order;
};
//添加模板
order.prototype.getOrder = function (data, res) {
  let promise;
  //根据邮件查询
  promise = this.tpl.getOrder(data);
  promise.then(function (data) {
    //地址需要解码
    data.forEach(function (obj, index) {
      data[index].shipping_address_line1 = decoder.write(data[index].shipping_address_line1);
      data[index].shipping_address_line2 = decoder.write(data[index].shipping_address_line2);
      data[index].shipping_address_line3 = decoder.write(data[index].shipping_address_line3);
    })
    res.send(data);
  }).catch(err => {
    res.send([]);
    Core.flyer.log('获取订单信息出错：' + err.message);
  });
};

//更新账号分组信息
order.prototype.updateGroup = function (res, update_name, update_id, email_address) {
  let promise = this.tpl.updateGroup(update_name, update_id, email_address);
  promise.then(function (data) {
    res.send(data);
  }).catch(err => {
    res.send([]);
    Core.flyer.log('更新账号分组信息出错：' + err.message);
  });
};
module.exports = order;