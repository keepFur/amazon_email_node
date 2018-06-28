/**
 * 收集规则模块
 */
"use strict";
let Core = require("./core"),
    EnumStatus = require("./status"),
    MailgunES6 = require("mailgun-es6"),
    Emails = require("./db_emails"),
    Receive = require("./db_receive"),
    guesslanguage = require("guesslanguage").guessLanguage,
    Config = require("./config");

let AutoEmailRules = function (pool, receive) {
    this.pool = pool;
    this.emails = new Emails(this.pool);
    this.receive = receive;
};

AutoEmailRules.prototype = {
    //得到所有启用状态的收集规则
    getAllEmailRules: function () {
        let cmdText = `select * from amazon_service_email_rules where active = 1;`,
            cmdParams = [];
        return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
    },

    //通过ID得到现有的规则
    getEmailRulesByID: function (data) {
        let cmdText = `select * from amazon_service_email_rules where active = 1 and ID = ?`,
            cmdParams = [data.id];
        return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
    },

    //得到该组要执行规则的数据
    getStoredByGroupID: function (data) {

        let cmdText = `select * from amazon_service_stored
        where _from in (
        select mail_address from amazon_service_accounts
        where depa_id = ?) 
        or _to in (select mail_address from amazon_service_accounts
        where depa_id = ?) group by subject_num`,
            cmdParams = [data.orgGroupId, data.orgGroupId];

        return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
    },

    //根据一条规则去匹配所有的现有邮箱
    toCurrentEmailsByRule: function (data) {
        let _this = this;
        return new Promise(function (resolve, reject) {
            try {
                _this.getEmailRulesByID(data).then(function (rule) {
                    _this.getStoredByGroupID(data).then(function (items) {
                        items.forEach(function (item) {
                            _this.checkEmailRulesByItem(rule, item);
                        });
                        resolve({
                            code: 200
                        })
                    }).catch(err => {
                        Core.flyer.log('根据一条规则去匹配所有的现有邮箱出现异常：' + err.message);
                    });
                }).catch(err => {
                    Core.flyer.log('根据一条规则去匹配所有的现有邮箱出现异常：' + err.message);
                });
            } catch (err) {
                reject(err);
            }
        });
    },

    //匹配邮箱数据
    checkEmailRulesByItem: function (rules, item) {
        let _this = this;

        if (!(rules instanceof Array)) {
            rules = [];
        }

        //所有的收件规则
        rules.forEach(function (rule) {
            let mailAddressName = rule["mail_address_name"] && rule["mail_address_name"].split(",");
            let index = mailAddressName.findIndex(function (emailAddress) {
                return (item._to || item.to) === emailAddress;
            });

            if (index >= 0) {

                let fromResult = true, domainResult = true, subjectResult = true, toResult = true, sizeResult = true, timeResult = true, langResult = true;
                item.from = item["_from"] || item["from"];
                item.to = item["to"] || item["_to"];

                fromResult = _this.checkFrom(rule, item);
                domainResult = _this.checkDoMain(rule, item);
                toResult = _this.checkTo(rule, item);
                subjectResult = _this.checkSubject(rule, item);
                sizeResult = _this.checkSize(rule, item);
                timeResult = _this.checkTime(rule, item);
                langResult = _this.checkLang(rule, item);

                if (fromResult && domainResult && toResult && subjectResult && sizeResult && timeResult && langResult) {
                    _this.toMotion(rule, item);
                    _this.toAssign(rule, item);
                    _this.toResolved(rule, item);
                    _this.toReturn(rule, item);
                }
            }
        });

    },

    //检测发件人
    checkFrom: function (rule, item) {

        let fromRule = rule["_from"] && JSON.parse(rule["_from"]),
            from = item.from,
            has = -1;

        if (fromRule && fromRule.isChecked === true) {

            has = from.indexOf(fromRule.text.toString().trim());

            if (fromRule.isContainer === true) {
                return has >= 0 ? true : false;
            } else {
                return has >= 0 ? false : true;
            }

        } else {
            return true;
        }

    },

    //检测发件域
    checkDoMain: function (rule, item) {
        let domainRule = rule["domain"] && JSON.parse(rule["domain"]),
            from = item.from,
            formDomain = from.substring(from.indexOf("@")),
            has = -1;

        if (domainRule && domainRule.isChecked === true) {

            has = formDomain.indexOf(domainRule.text.toString().trim());

            if (domainRule.isContainer === true) {
                return has >= 0 ? true : false;
            } else {
                return has >= 0 ? false : true;
            }

        } else {
            return true;
        }
    },

    //检测收件人
    checkTo: function (rule, item) {

        let toRule = rule["_to"] && JSON.parse(rule["_to"]),
            to = item.to,
            has = -1;

        if (toRule && toRule.isChecked === true) {

            has = to.indexOf(toRule.text.toString().trim());

            if (toRule.isContainer === true) {
                return has >= 0 ? true : false;
            } else {
                return has >= 0 ? false : true;
            }

        } else {
            return true;
        }
    },

    //检测主题 
    checkSubject: function (rule, item) {
        let subjectRule = rule["_subject"] && JSON.parse(rule["_subject"]),
            subject = item["subject"],
            has = -1;

        if (subjectRule && subjectRule.isChecked === true) {

            has = subject.toLowerCase().indexOf(subjectRule.text.toString().trim().toLowerCase());

            if (subjectRule.isContainer === true) {
                return has >= 0 ? true : false;
            } else {
                return has >= 0 ? false : true;
            }

        } else {
            return true;
        }
    },

    //检测邮件大小
    checkSize: function (rule, item) {
        let sizeRule = rule["size"] && JSON.parse(rule["size"]),
            size = item["message_size"] || item.message.size,
            has = false;

        if (sizeRule && sizeRule.isChecked === true) {

            //has = parseFloat(sizeRule.size) >= parseFloat(size);

            if (sizeRule.isContainer === true) {
                return parseFloat(size) >= parseFloat(sizeRule.text);
            } else {
                return parseFloat(size) < parseFloat(sizeRule.text)
            }

        } else {
            return true;
        }
    },

    //检测收件时间
    checkTime: function (rule, item) {
        let timeRule = rule["time"] && JSON.parse(rule["time"]),
            timerHours = new Date(item["timer"] || Core.flyer.getStoredTimer(item.timestamp)).getHours(),
            startTime = parseInt(timeRule.startTime),
            endTime = parseInt(timeRule.endTime);

        if (timeRule && timeRule.isChecked) {
            if (startTime <= timerHours && timerHours <= endTime) {
                return true;
            }
            return false;
        } else {
            return true;
        }

    },

    //检测语言的种类
    checkLang: function (rule, item) {
        let langRule = rule["mail_language"] && JSON.parse(rule["mail_language"]),
            result = true;
        if (langRule && langRule.isChecked) {
            guesslanguage.detect(item.text || item.subject, function (language) {
                if (langRule.languageID === language) {
                    result = true;
                } else {
                    result = false;
                }
            });
        } else {
            result = true;
        }
        return result;
    },

    //执行归类为
    toMotion: function (rule, item) {
        //Core.flyer.log("执行归类为...");
        let email_type_rule = rule.email_type_rule && JSON.parse(rule.email_type_rule), _this = this;
        if (email_type_rule && email_type_rule.isChecked === true) {
            email_type_rule.userId = rule.created_by_id;

            let cmdText = "UPDATE amazon_service_stored SET type_id = ? WHERE subject_num = ? ",
                cmdParams = [email_type_rule.typeId, item.subject_num];

            Core.flyer.return_promise(this.pool, cmdText, cmdParams);

            //以上的代码,由于变更数据表,去掉了amazon_service_email_types_recored表,增加了amazon_service_stored中的type_id,所以不再需要 郑鹏飞 2017-12-02
            // this.hasEmailType(email_type_rule, item).then(function (result) {
            //     if (result.length === 0) {
            //         let cmdText = "insert into amazon_service_email_types_recored (type_id,type_name,subject_number,user_id,user_name,depa_id) values(?,?,?,?,?,?)",
            //             cmdParams = [email_type_rule.typeId, email_type_rule.typeName, item.subject_num, rule.created_by_id, rule.created_by_name,email_type_rule.depaId];
            //         Core.flyer.return_promise(_this.pool, cmdText, cmdParams);
            //     }else{
            //         let cmdText = "update amazon_service_email_types_recored set type_id=?,type_name=?,subject_number=?,user_id=?,user_name=?,depa_id=? where ID=?",
            //         cmdParams = [email_type_rule.typeId, email_type_rule.typeName, item.subject_num, rule.created_by_id, rule.created_by_name,email_type_rule.depaId,result[0].ID];
            //         Core.flyer.return_promise(_this.pool, cmdText, cmdParams);
            //     }
            // });
        }
    },

    //执行分派为
    toAssign: function (rule, item) {
        let assigned_rule = rule.assigned_rule && JSON.parse(rule.assigned_rule), _this = this;
        if (assigned_rule && assigned_rule.isChecked === true) {
            let cmdText = "update amazon_service_stored set assigned_id=?,assigned_name=?,status_id=?,status_name=? where subject_num = ?",
                cmdParams = [assigned_rule.assingedEmailId, assigned_rule.assingedEmailName, EnumStatus.assigned.value, EnumStatus.assigned.text, item.subject_num];
            Core.flyer.return_promise(_this.pool, cmdText, cmdParams);
        }
    },

    //执行为已解决
    toResolved: function (rule, item) {
        let finish_rule = rule.finish_rule, _this = this;
        if (finish_rule && parseInt(finish_rule) === 1) {
            let cmdText = "update amazon_service_stored set disposed_status_id=?,disposed_status_name=? where subject_num = ?",
                cmdParams = [EnumStatus.resolved.value, EnumStatus.resolved.text, item.subject_num];
            Core.flyer.return_promise(_this.pool, cmdText, cmdParams);
        }
    },

    //执行回复
    toReturn: function (rule, item) {
        let reply_rule = rule.reply_rule && JSON.parse(rule.reply_rule), _this = this;
        if (reply_rule && reply_rule.isChecked === true) {
            item.body = reply_rule.body && JSON.parse(reply_rule.body).content;
            item.user_id = 0;
            item.user_name = "system";
            this.sendEmail(rule, item);
        }
    },

    //判断是否已经创建过
    // hasEmailType: function (data, item) {
    //     let cmdText = "select ID from amazon_service_email_types_recored where type_id = ? and type_name = ? and subject_number = ? and user_id = ?",
    //         cmdParams = [data.typeId, data.typeName, item.subject_num, data.userId];
    //     return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
    // },

    //写入到已发送邮件表，并发送邮件
    sendEmail: function (rule, data) {
        let msgData = {
            id: Core.flyer.getGUID(),
            from: data.to,
            to: data.from,
            subject: data.subject,
            html: data.body,
            user_id: data.user_id,
            attachment: [],
            attachments: [],
            user_name: decodeURIComponent(data.user_name)
        }, mailgun = new MailgunES6({
            privateApi: Config.mailgun.privateKey,
            publicApi: Config.mailgun.publicKey,
            domainName: Config.mailgun.domain
        }),
            _this = this,
            domain = Core.flyer.getDomainInEmail(msgData.from);
        mailgun.sendEmail(msgData, domain).then(function (result) {
            msgData.html = encodeURIComponent(msgData.html);
            _this.emails.insert(msgData).then(function (affected) {
                msgData.subject_num = data.subject_num;
                _this.insertStored(rule, msgData);
            }, function (err) {
                Core.flyer.log(err);
            });
        }).catch(err => {
            Core.flyer.log('自动收信中发送邮件发生异常：' + err.message);
        });
    },

    //写入邮件列表
    insertStored: function (rule, data) {
        let storedData = {
            tags: [],
            timestamp: new Date().getTime(),
            storage: {
                url: "",
                key: ""
            },
            log_level: 0,
            campaigns: [],
            user_variables: [],
            flags: [],
            message: {
                headers: {
                    to: data.from,
                    from: data.to,
                    subject: data.subject
                },
                attachments: [],
                recipients: data.from,
                size: 0
            },
            event: "send",
            subject_num: data.subject_num,
            timer: Core.flyer.formatDate("yyyy-mm-dd hh:MM:ss")
        },
            _this = this;

        storedData.id = data.id;
        storedData.from = Core.flyer.getEmailAddress(String(storedData.message.headers.from))[0];
        storedData.to = Core.flyer.getEmailAddress(String(storedData.message.headers.to))[0];
        storedData.subject = String(storedData.message.headers.subject).replace(/^[re:]+/ig, "").trim();
        storedData.subject_num = data.subject_num;
        this.receive.insertStored(storedData).then(function (result) {
            if (result.affectedRows > 0) {

                if (rule.finish_rule && parseInt(rule.finish_rule) === 1) {
                    storedData.disposed_status_id = EnumStatus.resolved.value;
                    storedData.disposed_status_name = EnumStatus.resolved.text;
                } else {
                    storedData.disposed_status_id = EnumStatus.disposed.value;
                    storedData.disposed_status_name = EnumStatus.disposed.text;
                }

                //需要自动副带勾选已解决
                let otData = {
                    id: storedData.id,
                    //被分派人的ID
                    assigned_id: 0,
                    //被分派人的姓名
                    assigned_name: "system",
                    //分派状态ID
                    status_id: EnumStatus.unassigned.value,
                    //分派状态文本
                    status_name: EnumStatus.unassigned.text,
                    //凡是自动回复的都改成已回复，如果勾选了已解决则状态为已解决.
                    disposed_status_id: storedData.disposed_status_id,
                    disposed_status_name: storedData.disposed_status_name,
                    subject_num: storedData.subject_num
                };
                _this.receive.setStoredStatusById(otData).then(function () { }, function (err) { Core.flyer.log(err) });
            }
        }, function (err) {
            Core.flyer.log(err);
        });
    }
}

module.exports = AutoEmailRules;