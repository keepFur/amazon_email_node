"use strict";
/*
* 用于 状态数据获取 模块功能的业务实现
*/
let DB = require("./db"),
    Config = require("./config"),
    Core = require('./core');
let language = function () {
};

//新增语言
language.prototype.createType = function (data, res) {
    var reqData = data;
    // 判重
    DB.dbQuery.language.justifyData(data).then(function (data) {
        if (data[0]['count']) {
            res.send({
                status: true
            });
        } else {
            //插入数据
            DB.dbQuery.language.createType(reqData).then(function (data) {
                res.send(data);
            }).catch(err => {
                Core.flyer.log('新增出错：' + err.message);
            });
        }
    }).catch(err => {
        Core.flyer.log('语言判重出错：' + err.message);
    });
};
//修改语言名称
language.prototype.updateName = function (data, res) {
    var reqData = data;
    // 判重
    DB.dbQuery.language.justifyData(data).then(function (data) {
        if (data[0]['count']) {
            res.send({
                status: true
            });
        } else {
            //更新数据
            DB.dbQuery.language.updateName(reqData).then(function (data) {
                res.send(data);
            }).catch(err => {
                Core.flyer.log('修改语言名称出错：' + err.message);
            });
        }
    }).catch(err => {
        Core.flyer.log('语言判重出错：' + err.message);
    });
};
//修改语言可用状态
language.prototype.updateStatus = function (data, res) {
    var reqData = data;
    DB.dbQuery.language.updateStatus(data).then(function (data) {
        res.send(data);
    }).catch(err => {
        Core.flyer.log('修改语言状态出错：' + err.message);
    });
};
//获取所有语言
language.prototype.show = function (data, res) {
    var reqData = data;
    DB.dbQuery.language.show(data).then(function (data) {
        res.send({
            rows: data[1],
            total: data[0][0]['count']
        });
    }).catch(err => {
        Core.flyer.log('获取所有语言出错：' + err.message);
    });
};
//新增语言键值
language.prototype.createKey = function (data, res) {
    var reqData = data;
    DB.dbQuery.language.justifyKeyData(data).then(function (data) {
        if (data[0]['count']) {
            res.send({
                status: true
            });
        } else {
            //插入数据
            DB.dbQuery.language.createKey(reqData).then(function (data) {
                res.send(data);
            }).catch(err => {
                Core.flyer.log('新增语言Key出错：' + err.message);
            });
        }
    }).catch(err => {
        Core.flyer.log('语言判重出错：' + err.message);
    });
};
//改变键值可用状态
language.prototype.updateKeyStatus = function (data, res) {
    var reqData = data;
    DB.dbQuery.language.updateKeyStatus(data).then(function (data) {
        res.send(data);
    }).catch(err => {
        Core.flyer.log('修改语言键值状态出错：' + err.message);
    });
};
//改变键值
language.prototype.updateKey = function (data, res) {
    var reqData = data;
    DB.dbQuery.language.updateKey(reqData).then(function (data) {
        res.send(data);
    }).catch(err => {
        Core.flyer.log('修改语言键值出错：' + err.message);
    });
};
//删除键值
language.prototype.deleteKey = function (data, res) {
    var reqData = data;
    DB.dbQuery.language.deleteKey(reqData).then(function (data) {
        res.send(data);
    }).catch(err => {
        Core.flyer.log('删除语言键值出错：' + err.message);
    });
};
//获取所有单个语言的键值
language.prototype.showKey = function (data, res) {
    var reqData = data;
    DB.dbQuery.language.showKey(reqData).then(function (data) {
        res.send({
            rows: data[1],
            total: data[0][0]['count']
        });
    }).catch(err => {
        Core.flyer.log('获取语言所有的键值出错：' + err.message);
    });
};
module.exports = language;


