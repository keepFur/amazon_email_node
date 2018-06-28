/*
* 用于 内容模板 模块功能的数据实现
*/
"use strict";
let EnumStatus = require("./status"),
  Core = require("./core");
var Order = function (orderPool, updatePool) {
  this.pool = orderPool;
  this.updatePool = updatePool;
};
//获取相关订单(根据邮件)
Order.prototype.getOrder = function (data) {
  data.email = data.email.split('@')[0].split('+')[0] + '@' + data.email.split('@')[1];
  let cmdParam = [],
    hasOrder = data.order ? `and fba.amazon_order_id ='${data.order}'` : ``,
    cmdText = `select * from amazon_order as ord inner join amazon_order_item as fba on (ord.amazon_order_id=fba.amazon_order_id and ord.account_id=fba.account_id) where buyer_email='${data.email}' ${hasOrder}`;
  return Core.flyer.return_promise(this.pool, cmdText, cmdParam);
};

//更新分组信息
Order.prototype.updateGroup = function (update_name, update_id, mail_address) {
  let address = '(', cmdParam = [update_name, Number(update_id)]
  mail_address.forEach(function (ele, index) {
    cmdParam.push(ele);
    if (index !== mail_address.length - 1) {
      address += "?,";
    } else {
      address += "?)";
    }
  });
  //总数据
  let cmdText = "update amazon_service_accounts set depa_name=?,depa_id=? where  mail_address in " + address;
  return Core.flyer.return_promise(this.updatePool, cmdText, cmdParam);
};
module.exports = Order;

