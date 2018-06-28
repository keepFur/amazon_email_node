"use strict";
/*
*状态字典表
*/
let EnumStatus = {
  active: {
    text: "激活",
    value: 1
  },
  inActive: {
    text: "未激活",
    value: 2
  },
  sent: {
    text: "发送件",
    value: 3
  },
  receive: {
    text: "收取件",
    value: 4
  },
  assigned: {
    text: "已分派",
    value: 5
  },
  unassigned: {
    text: "未分派",
    value: 6
  },
  disposed: {
    text: "已回复",
    value: 7
  },
  undisposed: {
    text: "未处理",
    value: 8
  },
  resolved: {
    text: "已解决",
    value: 9
  },
  groupId:{
    value:4
  }
};
module.exports = EnumStatus;
