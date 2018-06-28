/*
 * 用于 调查问卷数据的操作
 */
"use strict";
let DB = require("./db");
let Core = require('./core');
let Mailgun = require("mailgun-js");
let config = require('./config');
// 满意度问卷调查构造函数
class Satisfaction {

    /**
     * 程序入口
     * 
     * @memberof Satisfaction
     */
    init() {
        setInterval(() => {
            this.getAllNeedCommentEmails({ beforeday: config.iterance.beforeday });
        }, config.iterance.satisfaction);
    }

    /**
     * 获取所有的需要发送问卷调查的有邮件
     * @memberof Satisfaction
     */
    getAllNeedCommentEmails(data) {
        DB.dbQuery.satisfaction.getAllNeedCommentEmails(data).then((result) => {
            if (result && result.length) {
                result.forEach(item => {
                    this.sendCommentFormToCustomer(this.formatterEmailDataOfMailgun(item), Core.flyer.getDomainInEmail(item.from));
                });
            }
        }).catch(err => {
            Core.flyer.log('获取所有的需要发送问卷调查的有邮件出现异常：' + err.message);
        });
    }

    /**
     * 向客人发送一份问卷调查的邮件
     * 
     * @memberof Satisfaction
     */
    sendCommentFormToCustomer(data, domain) {
        let mailgun = new Mailgun({
            apiKey: config.mailgun.privateKey,
            domain: config.mailgun.domain
        }),
            msgDataOfStored = this.formatterEmailDataOfStored(data);
        mailgun.messages().send(data, (err, body) => {
            if (err) {
                Core.flyer.log('邮件发送异常:' + err.message);
                return;
            }
            if (body && body.id) {
                DB.dbQuery.satisfaction.insertToEmails(data).then((insertToEmailsResult) => {
                    if (insertToEmailsResult) {
                        DB.dbQuery.satisfaction.insertToStored(msgDataOfStored);
                    }
                }).catch(err => {
                    Core.flyer.log('写入邮件到数据库出现异常：' + err.message);
                });
            } else {
                Core.flyer.log('邮件发送异常超时');
            }
        });
    }

    /**
     * 格式化写入邮件到stored表中的参数
     * 
     * 
     * @param {any} data 
     * @returns 
     * @memberof Satisfaction
     */
    formatterEmailDataOfStored(data) {
        let msgData = {};
        return msgData;
    }

    /**
     * 格式化发送邮件到mailgun的参数
     * 
     * @param {any} data 
     * @returns 
     * @memberof Satisfaction
     */
    formatterEmailDataOfMailgun(data) {
        let msgData = {
            from: data.from,
            to: data.to,
            subject: data.subject,
            text: data.text
        };
        return msgData;
    }

    /**
     * 设置邮件的状态为 已发送问卷调查，都是在已解决的邮件总进行操作
     * 
     * @param {any} emailID 邮件ID
     * @param {any} subjectNum 邮件主题号
     * @memberof Satisfaction
     */
    setEmailStatusToSendCommnt(emailID, subjectNum) {
        DB.dbQuery.setEmailStatusToSendCommnt(emailID, subjectNum).then(() => {
            Core.flyer.log(`邮件主题号为[${subjectNum}]已成功设置为已发送问卷调查状态`);
        }).catch(err => {
            Core.flyer.log(`邮件主题号为[${subjectNum}]设置为已发送问卷调查状态出现异常：${err.message}`);
        });
    }

    /**
     * 设置邮件的状态为 已发送问卷调查，都是在已解决的邮件总进行操作
     * 
     * @param {any} emailID 邮件ID
     * @param {any} subjectNum  邮件主题号
     * @memberof Satisfaction
     */
    setEmailStatusToFinishCommented(emailID, subjectNum) {
        DB.dbQuery.setEmailStatusToFinishCommented(emailID, subjectNum).then(() => {
            Core.flyer.log(`邮件主题号为[${subjectNum}]已成功设置为已完成问卷调查状态`);
        }).catch(err => {
            Core.flyer.log(`邮件主题号为[${subjectNum}]设置为已完成问卷调查状态出现异常：${err.message}`);
        });
    }
}

module.exports = Satisfaction;