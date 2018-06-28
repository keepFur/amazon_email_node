/*
* 用于 用户收件夹 模块功能的业务实现
*/
"use strict";
var DB = require("./db"),
  Core = require('./core');
var userFiles = function () {
  this.tpl = DB.dbQuery.userFiles;
};
//获取用户所有文件夹
userFiles.prototype.getFileList = function (res, data) {
  let promise = DB.dbQuery.userFiles.getFileList(data),
    _this = this,
    queryData = data;
  promise.then(function (data) {
    var Data = {},
      _index = 0;
    Data.total = data[0][0]['count'];
    Data.rows = data[1];
    var statusObj = {},
      folders = data[1];
    if (Data.rows.length && queryData.isList) {
      data[1].forEach(function (obj, index) {
        var newData = queryData;
        newData.type_id = obj.ID;
        var statusArr = [];
        DB.dbQuery.status_list.getFolderStateListManager(newData).then(function (data) {
          statusArr.push(data[0][0]['undisposed']);
          statusArr.push(data[1][0]['disposed']);
          statusArr.push(data[2][0]['unassigned']);
          statusArr.push(data[3][0]['assigned']);
          statusArr.push(data[4][0]['resolved']);
          statusArr.push((data[0][0]['undisposed'] + data[1][0]['disposed'] + data[4][0]['resolved']));
          statusObj[String(obj.ID)] = statusArr;
          if (++_index === folders.length) {
            Data.Status = statusObj;
            res.send(Data);
          }
        }).catch(err => {
          Core.flyer.log('获取用户所有文件夹出现异常：' + err.message);
        });
      });
    } else {
      res.send(Data);
    }
  }).catch(err => {
    Core.flyer.log('获取所有的文件夹数据出错：' + err.message);
  });
};
//判断用户文件夹是否存在
userFiles.prototype.justifyFile = function (res, data) {
  let promise = DB.dbQuery.userFiles.justifyFile(data).then(function (data) {
    var Data = {
      count: data[0]["count"]
    }
    res.send(Data);
  }).catch(err => {
    Core.flyer.log('判断是否存在某个文件出错：' + err.message);
    res.send({
      count: 1
    });
  });
};
//新增用户文件夹
userFiles.prototype.addFile = function (res, data) {
  let promise = this.tpl.addFile(data);
  promise.then(function (data) {
    res.send(data);
  }).catch(err => {
    Core.flyer.log('新增文件夹出错：' + err.message);
  });
};
//删除用户文件夹
userFiles.prototype.deleteFile = function (res, data) {
  let promise = this.tpl.deleteFile(data);
  promise.then(function (data) {
    res.send(data);
  }).catch(err => {
    Core.flyer.log('删除用户文件夹出错：' + err.message);
  });
};
//修改用户文件夹
userFiles.prototype.updateFile = function (res, data) {
  let promise = this.tpl.updateFile(data);
  promise.then(function (data) {
    res.send(data);
  }).catch(err => {
    Core.flyer.log('修改用户文件夹出错：' + err.message);
  });
};
//移动邮件类型
userFiles.prototype.updateFileType = function (res, data) {
  this.tpl.updateFileType(data).then(function (data) {
    res.send(data);
  }).catch(err => {
    Core.flyer.log('移动邮件类型出错：' + err.message);
  });
};
//查询各个文件夹中邮件的数目
userFiles.prototype.type_number = function (res, data) {
  let promise = this.tpl.type_number(data);
  promise.then(function (data) {
    res.send(data);
  }).catch(err => {
    Core.flyer.log('查询各个文件夹中邮件的数目出错：' + err.message);
  });
};
//移除文件夹中的邮件
userFiles.prototype.removeOutEmail = function (res, data) {
  let promise = this.tpl.removeOutEmail(data);
  promise.then(function (data) {
    res.send(data);
  }).catch(err => {
    Core.flyer.log('移除文件夹中的邮件出错：' + err.message);
  });
};
module.exports = userFiles;