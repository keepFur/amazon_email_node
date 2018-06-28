"use strict";
/*
* 用于 状态修改 模块功能的业务实现
*/
let DB = require("./db");
let Core = require('./core');
let turn_status = function () {
    this.tpl = DB.dbQuery.turn_status;
};
turn_status.prototype.updateDisposedState = function (res, data) {
    let promise = this.tpl.updateDisposedState(data);
    promise.then(function (data) {
        data.response = 'OK'
        res.send(data);
    }).catch(err => {
        res.send({
            response: 'bad'
        });
        Core.flyer.log('更新Disposed状态出错：' + err.message);
    });
};
//转为已分派
turn_status.prototype.updateState = function (res, data) {
    let promise = this.tpl.updateState(data);
    promise.then(function (data) {
        data.response = 'OK'
        res.send(data);
    }).catch(err => {
        res.send({
            response: 'bad'
        });
        Core.flyer.log('转为已分派出错：' + err.message);
    });
};
//将已发送的邮件转为已分派
turn_status.prototype.updateStateById = function (res, data) {
    let promise = this.tpl.updateStateById(data);
    promise.then(function (data) {
        data.response = 'OK'
        res.send(data);
    }).catch(err => {
        res.send({
            response: 'bad'
        });
        Core.flyer.log('将已发送转为已分派出错：' + err.message);
    });
};
//将已发送的邮件转为已解决
turn_status.prototype.updatedisposeById = function (res, data) {
    let promise = this.tpl.updatedisposeById(data);
    promise.then(function (data) {
        data.response = 'OK'
        res.send(data);
    }).catch(err => {
        res.send({
            response: 'bad'
        });
        Core.flyer.log('将已发送转为已解决出错：' + err.message);
    });
};
turn_status.prototype.getGroupList = function (res, data) {
    let promise = this.tpl.getGroupList(data);
    promise.then(function (data) {
        var Data = {
            total: data[0][0]['count'],
            rows: data[1],
            response: 'OK'
        }
        res.send(Data);
    }).catch(err => {
        res.send({
            total: 0,
            rows: [],
            response: 'bad'
        });
        Core.flyer.log('获取所有的组信息出错：' + err.message);
    });
};
module.exports = turn_status;

