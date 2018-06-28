"use strict";
let Core = require("./core");
let EnumStatus = require('./status');
/**
 * 满意度调查表数据的操作
 * 
 * @class Satisfaction
 */
class Satisfaction {

    /**
     * Creates an instance of Satisfaction.
     * @param {any} pool 
     * @memberof Satisfaction
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * 获取所有的需要发送问卷调查的有邮件,找出所有已解决的邮件，时间是 加入解决
     * @memberof Satisfaction
    */
    getAllNeedCommentEmails(data) {
        let cmdParams = [
            EnumStatus.resolved.value,
        ];
        let cmdText = `SELECT
            s.*, s.timer AS max_time,
            sm.count,
            ct.store_id
            FROM
                (
                SELECT
                subject_num,
                max(timer) AS maxTimer,
                SUM(num) AS 'count'
                FROM
                amazon_service_stored
                WHERE
                        disposed_status_id = ?
                    AND type_id = 0
                    AND comment_status = 1 GROUP BY SUBJECT_NUM
                ) sm JOIN amazon_service_stored s ON s.subject_num = sm.subject_num
                    AND s.timer = sm.maxTimer
                LEFT JOIN amazon_service_customer_complaint ct ON ct.ID = sm.subject_num WHERE 1=1 `;
        if (data.beforeDay) {
            cmdText += ` AND DATE(sm.maxTimer)> DATE_SUB(DATE(sm.maxTimer),INTERVAL ? DAY) `;
            cmdParams.push(data.beforeDay);
        }
        cmdText += ` GROUP BY s.subject_num ORDER BY sm.maxTimer DESC`;
        return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
    }

    /**
     * 写入一条邮件记录到列表中(emails表)
     * 
     * @param {any} data 
     * @memberof Satisfaction
     */
    insertToEmails(data) {
        let cmdText = `insert into amazon_service_emails(ID,_from,_to,_subject,html,text,status_id,status_name,date_time,user_id,user_name,attachment) values(?,?,?,?,?,?,?,?,?,?,?,?)`;
        let cmdParams = [
            data.id,
            data.from,
            data.to,
            data.subject,
            data.html,
            data.text,
            EnumStatus.sent.value,
            EnumStatus.sent.text,
            Core.flyer.formatDate(),
            data.user_id,
            data.user_name,
            String(JSON.stringify(data.attachments))
        ];
        return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
    }

    /**
     *      * 写入一条邮件记录到列表中(stored表)
     * 
     * @param {any} data 
     * @memberof Satisfaction
     */
    insertToStored(data) {
        let arry = new Array(34),
            strIndex = arry.join("?,");
        strIndex = strIndex.substring(0, strIndex.length - 1);
        let cmdText = "insert into amazon_service_stored values(" + strIndex + ")",
            cmdParams = [
                String(data.id),
                JSON.stringify(data.tags),
                String(data.timestamp),
                String(data.storage.url),
                String(data.storage.key),
                String(data.log_level),
                String(data.campaigns),
                String(data.user_variables),
                JSON.stringify(data.flags),
                String(data.message.headers.to),
                String(data.message.headers.from),
                String(data.message.headers["message-id"]),
                String(data.message.headers.subject).substr(0, 998),
                String(JSON.stringify(data.message.attachments)),
                String(data.message.recipients),
                String(data.message.size),
                String(data.event),
                EnumStatus.unassigned.value,
                EnumStatus.unassigned.text,
                EnumStatus.undisposed.value,
                EnumStatus.undisposed.text,
                data.from,
                data.to,
                data.timer || Core.flyer.getStoredTimer(data.timestamp),
                '',
                0,
                data.subject.substr(0, 998),
                1,
                (data.message.attachments.length > 0 ? 1 : 0),
                '',
                data.subject_num,
                0,
                'stored'
            ];
        return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
    }

    /**
     * 向客人发送一份问卷调查的邮件
     * 
     * @memberof Satisfaction
     */
    sendCommentFormToCustomer(data) {
        return this.insertEmail(data);
    }

    /**
     * 设置邮件的状态为 已发送问卷调查，都是在已解决的邮件总进行操作
     * 
     * @param {any} emailID 邮件ID
     * @param {any} subjectNum 邮件主题号
     * @memberof Satisfaction
     */
    setEmailStatusToSendCommnt(emailID, subjectNum) {
        let cmdText = `UPDATE  amazon_service_stored SET comment_status = 1 WHERE subject_num = ? AND disposed_status_id = 9 `;
        let cmdParams = [1, subjectNum];
        return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
    }

    /**
     * 设置邮件的状态为 已完成问卷调查，都是在已解决的邮件总进行操作
     * 
     * @param {any} emailID 邮件ID
     * @param {any} subjectNum  邮件主题号
     * @memberof Satisfaction
     */
    setEmailStatusToFinishCommented(emailID, subjectNum) {
        let cmdText = `UPDATE  amazon_service_stored SET comment_status = 2 WHERE subject_num = ? AND disposed_status_id = 9 `;
        let cmdParams = [1, subjectNum];
        return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
    }
}

module.exports = Satisfaction;