/*
* 用于 敏感词模块功能的业务实现
*/
"use strict";
let DB = require("./db"),
    Segment = require('segment'),// 载入分词模块
    segment = new Segment(),// 创建实例
    SensitiveWord = function () {

    };// 敏感词构造函数
segment.useDefault(); // 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
// 获取所有的敏感词（通过关键字和类型）
SensitiveWord.prototype.get = function (res, params) {
    let promise = DB.dbQuery.sensitiveWord.get(params);
    if (promise && promise.then) {
        promise.then(function (data) {
            res.send({
                total: data.length,
                data: data
            });
        }, function (err) {
            res.send({
                total: 0,
                data: [],
                responseFail: true
            });
        });
    }
};
// 新增（支持批量）
SensitiveWord.prototype.add = function (res, params) {
    DB.dbQuery.sensitiveWord.add(params).then(function (data) {
        res.send({
            success: true
        });
    }).catch(function (err) {
        res.send({
            success: false,
            message: err.message
        });
    })

};
// 删除(批量操作)
SensitiveWord.prototype.delete = function (res, params) {
    DB.dbQuery.sensitiveWord.delete(params).then(function (data) {
        res.send({
            success: true
        });
    }).catch(function (err) {
        res.send({
            success: false,
            message: err.message
        });
    })
};
// 编辑名称（单个操作）
SensitiveWord.prototype.edit = function (res, params) {
    DB.dbQuery.sensitiveWord.edit(params).then(function (data) {
        res.send({
            success: true
        });
    }).catch(function (err) {
        res.send({
            success: false,
            message: err.message
        });
    })
};
// 编辑类型（批量操作）
SensitiveWord.prototype.editType = function (res, params) {
    DB.dbQuery.sensitiveWord.editType(params).then(function (data) {
        res.send({
            success: true
        });
    }).catch(function (err) {
        res.send({
            success: false,
            message: err.message
        });
    })
};
// 获取所有的类型
SensitiveWord.prototype.getType = function (res, params) {
    let promise = DB.dbQuery.sensitiveWord.getType(params);
    promise.then(function (data) {
        res.send({
            success: true,
            data: data
        });
    }).catch(function (err) {
        res.send({
            success: false,
            data: err.message
        });
    });
};
// 新增敏感词类型
SensitiveWord.prototype.addType = function (res, params) {
    DB.dbQuery.sensitiveWord.addType(params).then(function (data) {
        res.send({
            success: true
        });
    }).catch(function (err) {
        res.send({
            success: false,
            message: err.message
        });
    })
};
// 根据用户输入的文本内容进行敏感词的匹配和过滤，使用的是segment分词node模块
SensitiveWord.prototype.filterTextBySensitives = function (res, params) {
    let returnArr = [],//返回结果
        options = {
            simple: true,//不返回词性
            stripPunctuation: false// 去除标点符号
        };//分词可选参数

    if (params && params.text) {
        try {
            returnArr = segment.doSegment(params.text, options);// 执行分词
            res.send({
                success: true,
                message: '分词完成',
                data: returnArr
            });
        } catch (error) {
            res.send({
                success: false,
                message: '分词处理发生异常：' + error.message,
                data: []
            });
        }
    } else {
        res.send({
            success: false,
            data: [],
            message: '文本为空'
        });
    }
};
module.exports = SensitiveWord;
