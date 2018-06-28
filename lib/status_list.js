"use strict";
/*
* 用于 状态数据获取 模块功能的业务实现
*/
let DB = require("./db"),
    Config = require("./config"),
    Core = require('./core');
let status_list = function () {
    this.tpl = DB.dbQuery.status_list;
};
status_list.prototype.getStateList = function (res, data) {
    var promise;
    if (data.orgCode === Config.const.managerCode) {
        //主管
        promise = this.tpl.getStateListManager(data);
    } else {
        //客服
        promise = this.tpl.getStateList(data);
    }
    promise.then(function (data) {
        let Data = {
            response: 'OK',
            undisposed: data[0][0]['undisposed'],
            disposed: data[1][0]['disposed'],
            unassigned: data[2][0]['unassigned'],
            assigned: data[3][0]['assigned'],
            resolved: data[4][0]['resolved']
        };
        res.send(Data);
    }).catch(err => {
        res.send({
            response: 'Bad'
        });
        Core.flyer.log('获取文件夹气泡数量出错：' + err.message);
    });
};
//获取文件夹气泡参数
status_list.prototype.getFolderStateList = function (res, data) {
    var promise;
    if (data.orgCode === Config.const.managerCode) {
        //主管
        promise = this.tpl.getFolderStateListManager(data);
    } else {
        //客服
        promise = this.tpl.getFolderStateList(data);
    }
    promise.then(function (data) {
        let Data = {
            response: 'OK',
            undisposed: data[0][0]['undisposed'],
            disposed: data[1][0]['disposed'],
            unassigned: data[2][0]['unassigned'],
            assigned: data[3][0]['assigned'],
            resolved: data[4][0]['resolved']
        };
        res.send(Data);
    }).catch(err => {
        res.send({
            response: 'bad'
        });
        Core.flyer.log('获取文件夹气泡数量出错：' + err.message);
    });
};

module.exports = status_list;


