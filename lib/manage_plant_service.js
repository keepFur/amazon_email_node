/*
 * 用于 平台管理 模块功能的数据实现
 */
"use strict";
let DB = require("./db");
// 平台构造函数
let PlantManage = function() {};

// 创建平台
PlantManage.prototype.createPlant = function(req, res, data) {
    DB.dbQuery.plantManage.createPlant(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: '平台创建成功'
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 读取记录(需要分页,查询条件：id，Plantname,status等)
PlantManage.prototype.readPlantPage = function(req, res, data) {
    DB.dbQuery.plantManage.readPlantPage(data).then(result => {
        DB.dbQuery.plantManage.readPlantPageTotal(data).then(total => {
            res.send({
                success: true,
                message: '',
                data: {
                    total: total[0].total,
                    rows: result,
                },
            });
        }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
};

// 读取一条记录通过id
PlantManage.prototype.readPlantById = function(req, res, data) {
    DB.dbQuery.plantManage.readPlantById(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            },
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};

// 更新
PlantManage.prototype.updatePlant = function(req, res, data) {
    DB.dbQuery.plantManage.updatePlant(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 禁用或启用平台
PlantManage.prototype.togglePlant = function(req, res, data) {
    DB.dbQuery.plantManage.togglePlant(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

module.exports = PlantManage;