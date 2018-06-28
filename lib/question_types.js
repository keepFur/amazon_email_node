/*
 * 用于 问题类型表数据的操作
 */
"use strict";
let DB = require("./db");

// 问题类型构造函数
let QuestionType = function () {
};

// 读取数据(不分页)
QuestionType.prototype.readQuestionType = function (req, res, data) {
    DB.dbQuery.questionType.readQuestionType(data).then(result => {
        res.send({
            success: true,
            message: '',
            data: {
                rows: result
            }
        });
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
};

// 读取数据(分页)
QuestionType.prototype.readQuestionTypePage = function (req, res, data) {
    DB.dbQuery.questionType.readQuestionTypePage(data).then(result => {
        DB.dbQuery.questionType.readQuestionTypeTotal(data).then(total => {
            res.send({
                success: true,
                message: '',
                data: {
                    total: total[0].total,
                    rows: result
                }
            });
        }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
    }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
};

// 创建数据
QuestionType.prototype.createQuestionType = function (req, res, data) {
    DB.dbQuery.questionType.createQuestionType(data).then(result => {
        res.send({
            success: result.affectedRows === data.questionTypeName.length,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 更新数据
QuestionType.prototype.updateQuestionType = function (req, res, data) {
    DB.dbQuery.questionType.updateQuestionType(data).then(result => {
        res.send({
            success: result.affectedRows === 1,
            message: ''
        });
        // 同时更新客诉记录中的数据 暂时还没进行权限的限制
        DB.dbQuery.customerComplaintHistory.updateCustomerComplaintForBaseData({
            questionTypeName: data.questionType,
            questionTypeID: data.ID,
            orgGroupIDAll: data.orgGroupIDAll
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};

// 删除数据
QuestionType.prototype.deleteQuestionType = function (req, res, data) {
    DB.dbQuery.questionType.deleteQuestionType(data).then(result => {
        res.send({
            success: result.affectedRows === data.IDS,
            message: ''
        });
    }).catch(err => res.send({ success: false, message: err.message }));
};
module.exports = QuestionType;