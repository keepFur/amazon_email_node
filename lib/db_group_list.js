/*
* 用于 内容模板 模块功能的数据实现
*/
"use strict";
let EnumStatus = require("./status"),
  Core = require("./core");
var groupList = function (pool) {
  this.pool = pool;
};
//获取相关订单
groupList.prototype.getGroupList = function (Offset, names) {
  var offset = (Offset - 1) * 8,
    cmdText = ``,
    cmdParam = [], namesLength = `(`;
  if (names) {
    if (names.length === 1) {
      cmdText = `select count(ID) as count from org_group where org_category_id = 91 and name LIKE '%${names[0]}%';select * from org_group where org_category_id = 91 and name LIKE '%${names[0]}%' limit ?,8`;
    } else {
      names.forEach(function (name, index) {
        if (index !== names.length - 1) {
          namesLength += '?,';
        } else {
          namesLength += '?)';
        }
      }, this);
      cmdParam = cmdParam.concat(names).concat(names);
      cmdText = `select count(ID) as count from org_group where org_category_id = 91 and name in ` + namesLength + `;select * from org_group where org_category_id = 91  AND name IN ` + namesLength + ` limit ?,8`;
    }
  } else {
    cmdText = `select count(ID) as count from org_group where org_category_id = 91;select * from org_group where org_category_id = 91  limit ?,8`;
  }
  cmdParam.push(offset);
  //总数据
  return Core.flyer.return_promise(this.pool, cmdText, cmdParam);
};
module.exports = groupList;
