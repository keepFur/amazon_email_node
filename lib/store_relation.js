"use strict";
/*
* 用于 状态数据获取 模块功能的业务实现
*/
let DB = require("./db"),
    Config = require("./config"),
    Core = require('./core');
let store_relation = function () {
};
//店铺分派
store_relation.prototype.assignStore = function (data, res) {
    var resultIndex = 0,
        reqData = data;
    data.depa_ids.forEach(function (obj, index) {
        var singleData = {
            store_id: data.store_id,
            store_name: data.store_name,
            depa_id: obj,
            depa_name: data['depa_names'][index],
        };
        DB.dbQuery.storeRelation.assignStore(singleData).then(function (data) {
            if (++resultIndex === reqData.depa_ids.length) {
                res.send(data);
            }
        }, function (err) {
            Core.flyer.log('店铺分派出错：' + err.message);
            if (++resultIndex === reqData.depa_ids.length) {
                res.send(data);
            }
        });
    })

};
//店铺获取
store_relation.prototype.fetchStore = function (data, res) {
    var reqData = data;
    DB.dbQuery.storeRelation.fetchStore(data).then(function (data) {
        res.send({
            rows: data[1],
            total: data[0][0]['count']
        });
    }).catch(err => {
        res.send({
            total: 0,
            rows: []
        });
        Core.flyer.log('获取店铺数据出错：' + err.message);
    });
};
//获取跟当前店铺相关的分组
store_relation.prototype.targetGroup = function (data, res) {
    var reqData = data;
    DB.dbQuery.storeRelation.targetGroup(data).then(function (data) {
        res.send(data);
    }).catch(err => {
        res.send([]);
        Core.flyer.log('获取店铺数据出错：' + err.message);
    });
};
module.exports = store_relation;


