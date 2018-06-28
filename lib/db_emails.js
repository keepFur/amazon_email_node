/*
 * 用于 邮件 模块功能的数据实现
 */
"use strict";
let EnumStatus = require("./status"),
    Core = require("./core");

let Email = function (pool) {
    this.pool = pool;
};
// 转换查询参数，传入一个数组，返回字符串
function convertParams(arr) {
    let str = '(';
    if (Array.isArray(arr) && arr.length) {
        arr.forEach(function (ele, index) {
            if (index !== arr.length - 1) {
                str += '?,';
            } else {
                str += '?)';
            }
        });
    }
    return str;
}
Email.prototype.insert = function (data) {
    //"insert into amazon_service_emails(_from,_to,_subject,html,status_id,status_name) values(?,?,?,?,?,?)",
    let cmdText =
        "insert into amazon_service_emails(ID,_from,_to,_subject,html,text,status_id,status_name,date_time,user_id,user_name,attachment) values(?,?,?,?,?,?,?,?,?,?,?,?)",
        cmdParams = [
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
};

//通过ID得到单条邮件详情
Email.prototype.getStoredMessageDetailsByID = function (data) {
    let cmdText = "select * from amazon_service_emails where ID = ?",
        cmdParams = [data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//获取已发送邮件
Email.prototype.select_post_email = function (data) {
    const offset = (Number(data.pageNumber) - 1) * (Number(data.pageSize) || 20);
    const limit = Number(data.pageSize) || 20;//每页显示条数
    let cmdTextOfTotal = `
                SELECT count(ase.ID) AS 'count' FROM amazon_service_emails ase 
                INNER JOIN amazon_service_accounts asa ON ase._from = asa.mail_address
                WHERE
                    user_id = ?
                AND depa_id = ?
                AND asa.status_id = 1
                `,
        cmdTextOfRows = `
                SELECT ase.ID,
                    _from,
                    _to,
                    _subject,
                    ase.status_id,
                    status_name,
                    date_time,
                    user_id,
                    attachment,
                    user_name
                FROM
                    amazon_service_emails ase
                INNER JOIN amazon_service_accounts asa ON ase._from = asa.mail_address
                WHERE
                    user_id = ?
                AND depa_id = ?
                AND asa.status_id = 1
                `,
        cmdText = ``,
        cmdParamsOfTotal = [
            data.user_id,
            data.orgGroupId
        ], cmdParamsOfRows = [
            data.user_id,
            data.orgGroupId
        ], cmdParams = [];
    // 判断查询条件
    if (data.email && Array.isArray(data.email) && data.email.length) {
        if (data.email.length === 1) {
            cmdTextOfTotal += ` AND _from = ? `;
            cmdTextOfRows += ` AND _from = ? `;
            cmdParamsOfTotal.push(data.email[0]);
            cmdParamsOfRows.push(data.email[0]);
        } else {
            cmdTextOfTotal += ` AND _from IN ${convertParams(data.email)}`;
            cmdTextOfRows += ` AND _from IN ${convertParams(data.email)}`;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.email);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.email);
        }
    }
    if (data.keyword) {
        cmdTextOfTotal += ` AND (
                               _from LIKE ?
                            OR _to LIKE ?
                            OR _subject LIKE ?
                            OR user_name LIKE ?
                            )`;
        cmdTextOfRows += ` AND (
                                _from LIKE ?
                            OR  _to LIKE ?
                            OR  _subject LIKE ?
                            OR  user_name = ?
                            )`;
        cmdParamsOfTotal.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
        cmdParamsOfRows.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
    }
    if (data.startDate) {
        cmdTextOfTotal += ` AND DATE(date_time)>= ? `;
        cmdTextOfRows += ` AND DATE(date_time)>= ? `;
        cmdParamsOfTotal.push(data.startDate);
        cmdParamsOfRows.push(data.startDate);
    }
    if (data.endDate) {
        cmdTextOfTotal += ` AND DATE(date_time) <= ? `;
        cmdTextOfRows += ` AND DATE(date_time) <= ? `;
        cmdParamsOfTotal.push(data.endDate);
        cmdParamsOfRows.push(data.endDate);
    }
    cmdTextOfTotal += `;`;
    cmdTextOfRows += ` ORDER BY date_time DESC LIMIT ?,?;`;
    cmdParamsOfRows.push(offset, limit);
    cmdParams = cmdParamsOfTotal.concat(cmdParamsOfRows);
    cmdText = cmdTextOfTotal + cmdTextOfRows;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//获取客服未处理邮件
Email.prototype.select_unfinish_email = function (data) {
    const offset = (Number(data.pageNumber) - 1) * (data.pageSize || 20);
    const limit = Number(data.pageSize) || 20; //每页显示条数
    const type_id = data.filterFold !== 'false' ? data.filterFold : Core.flyer.getEmailDefaultType();
    let cmdTextOfTotal = `
            SELECT COUNT(DISTINCT _tabTotal.subject_num) as count FROM (SELECT * FROM  ( SELECT
                ass.ID,
                ass.subject_num,
                max(ass.timer) AS maxTimer
            FROM
                amazon_service_stored ass
            INNER JOIN amazon_service_accounts asa ON 
                ass._from = asa.mail_address
                OR ass._to = asa.mail_address
                OR ass.message_recipients = asa.mail_address
            WHERE
                asa.depa_id = ?
                AND ass.disposed_status_id = ?
                AND ass.type_id = ?
                AND assigned_id = ? 
                AND asa.status_id = ?`,
        cmdTextOfRows = `
            SELECT
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
                    AND type_id = ?
                    AND assigned_id = ?
                    AND
                    (
                        _from IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR _to IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR message_recipients IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                    ) `,
        cmdText = ``,
        cmdParams = [],
        cmdParamsOfTotal = [
            data.orgGroupId,
            EnumStatus.undisposed.value,
            type_id,
            data.user_id,
            1
        ], cmdParamsOfRows = [
            EnumStatus.undisposed.value,
            type_id,
            data.user_id,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1
        ];
    // 判断查询条件
    if (data.email && Array.isArray(data.email) && data.email.length) {
        if (data.email.length === 1) {
            cmdTextOfTotal += ` AND (
                                   ass._from = ?
                                OR ass._to = ?
                                OR ass.message_recipients = ?
                                )`;
            cmdTextOfRows += ` AND (
                                    _from  = ?
                                OR  _to  = ?
                                )`;
            cmdParamsOfTotal.push(data.email[0], data.email[0]);
            cmdParamsOfRows.push(data.email[0], data.email[0]);
        } else {
            cmdTextOfTotal += ` AND (
                                   ass._from IN ${convertParams(data.email)}
                                OR ass._to IN ${convertParams(data.email)}
                                )`;
            cmdTextOfRows += ` AND (
                                    _from IN ${convertParams(data.email)}
                                OR  _to IN ${convertParams(data.email)}
                                )`;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.email).concat(data.email);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.email).concat(data.email);
        }
    }
    if (data.keyword) {
        cmdTextOfTotal += ` AND (
                                ass._from LIKE ?
                            OR ass._to LIKE ?
                            OR ass.subject LIKE ?
                                )`;
        cmdTextOfRows += ` AND (
                                _from LIKE ?
                            OR _to LIKE ?
                            OR subject LIKE ?
                               )`;
        cmdParamsOfTotal.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
        cmdParamsOfRows.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
    }
    cmdTextOfTotal += ` GROUP BY ass.subject_num ) _tableTotal WHERE 1=1 `;
    cmdTextOfRows += `    GROUP BY SUBJECT_NUM
                        ) sm JOIN amazon_service_stored s ON s.subject_num = sm.subject_num
                        AND s.timer = sm.maxTimer
                        LEFT JOIN amazon_service_customer_complaint ct ON ct.ID = sm.subject_num WHERE 1=1 `;
    if (data.startDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer)>= ?`;
        cmdTextOfRows += ` AND DATE(sm.maxTimer)>= ? `;
        cmdParamsOfTotal.push(data.startDate);
        cmdParamsOfRows.push(data.startDate);
    }
    if (data.endDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer) <= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer) <= ? `;
        cmdParamsOfTotal.push(data.endDate);
        cmdParamsOfRows.push(data.endDate);
    }
    cmdTextOfTotal += `) _tabTotal;`;
    cmdTextOfRows += ` GROUP BY s.subject_num
                       ORDER BY sm.maxTimer ASC LIMIT ?,?;`;
    cmdParamsOfRows.push(offset, limit);
    cmdParams = cmdParamsOfTotal.concat(cmdParamsOfRows);
    cmdText = cmdTextOfTotal + cmdTextOfRows;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//获取主管未处理数据
Email.prototype.select_unfinish_email_manager = function (data) {
    const offset = (Number(data.pageNumber) - 1) * (data.pageSize || 20);
    const limit = Number(data.pageSize) || 20; //每页显示条数
    const type_id = data.filterFold !== 'false' ? data.filterFold : Core.flyer.getEmailDefaultType();
    let cmdText = ``,
        cmdTextOfTotal = `
            SELECT COUNT(DISTINCT _tabTotal.subject_num) as count FROM (SELECT * FROM ( SELECT
                ass.ID,
                ass.subject_num,
                max(ass.timer) AS maxTimer
            FROM
                amazon_service_stored ass
            INNER JOIN amazon_service_accounts asa ON 
                ass._from = asa.mail_address
                OR ass._to = asa.mail_address
                OR ass.message_recipients = asa.mail_address
            WHERE
                asa.depa_id = ?
            AND ass.disposed_status_id = ?
            AND ass.type_id = ? 
            AND asa.status_id = ?`,
        cmdTextOfRows = `
            SELECT
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
                    AND type_id = ?
                    AND
                    (
                        _from IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR _to IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR message_recipients IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                    ) `,
        cmdParamsOfTotal = [
            data.orgGroupId,
            EnumStatus.undisposed.value,
            type_id,
            1
        ], cmdParamsOfRows = [
            EnumStatus.undisposed.value,
            type_id,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1
        ], cmdParams = [];
    // 判断查询条件
    if (data.email && Array.isArray(data.email) && data.email.length) {
        if (data.email.length === 1) {
            cmdTextOfTotal += ` AND (
                ass._from = ?
             OR ass._to = ?
             )`;
            cmdTextOfRows += ` AND (
                _from  = ?
             OR _to  = ?
             )`;
            cmdParamsOfTotal.push(data.email[0], data.email[0]);
            cmdParamsOfRows.push(data.email[0], data.email[0]);
        } else {
            cmdTextOfTotal += ` AND (
                 ass._from IN ${convertParams(data.email)}
              OR ass._to IN ${convertParams(data.email)}
            )`;
            cmdTextOfRows += ` AND (
                 _from IN ${convertParams(data.email)}
              OR _to IN ${convertParams(data.email)}
            )`;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.email).concat(data.email);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.email).concat(data.email);
        }
    }
    if (data.assigner && Array.isArray(data.assigner) && data.assigner.length) {
        if (data.assigner.length === 1) {
            cmdTextOfTotal += ` AND ass.assigned_id = ? `;
            cmdTextOfRows += ` AND assigned_id = ? `;
            cmdParamsOfTotal.push(data.assigner[0]);
            cmdParamsOfRows.push(data.assigner[0]);
        } else {
            cmdTextOfTotal += ` AND ass.assigned_id IN ${convertParams(data.assigner)} `;
            cmdTextOfRows += ` AND assigned_id IN ${convertParams(data.assigner)} `;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.assigner);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.assigner);
        }
    }
    if (data.keyword) {
        cmdTextOfTotal += ` AND (
              ass._from LIKE ?
           OR ass._to LIKE ?
           OR ass.subject LIKE ?
        )`;
        cmdTextOfRows += ` AND (
              _from LIKE ?
           OR _to LIKE ?
           OR subject LIKE ?
        )`;
        cmdParamsOfTotal.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
        cmdParamsOfRows.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
    }
    cmdTextOfTotal += ` GROUP BY ass.subject_num ) _tableTotal WHERE 1=1 `;
    cmdTextOfRows += `  GROUP BY SUBJECT_NUM
                        ) sm JOIN amazon_service_stored s ON s.subject_num = sm.subject_num
                            AND s.timer = sm.maxTimer
                        LEFT JOIN amazon_service_customer_complaint ct ON ct.ID = sm.subject_num WHERE 1=1 `;
    if (data.startDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer)>= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer)>= ? `;
        cmdParamsOfTotal.push(data.startDate);
        cmdParamsOfRows.push(data.startDate);
    }
    if (data.endDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer) <= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer) <= ? `;
        cmdParamsOfTotal.push(data.endDate);
        cmdParamsOfRows.push(data.endDate);
    }
    cmdTextOfTotal += `) _tabTotal;`;
    cmdTextOfRows += ` GROUP BY s.subject_num
                       ORDER BY sm.maxTimer ASC LIMIT ?,?;`;
    cmdParamsOfRows.push(offset, limit);
    cmdParams = cmdParamsOfTotal.concat(cmdParamsOfRows);
    cmdText = cmdTextOfTotal + cmdTextOfRows;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//获取客服已回复邮件
Email.prototype.select_finish_email = function (data) {
    const offset = (Number(data.pageNumber) - 1) * (data.pageSize || 20);
    const limit = Number(data.pageSize) || 20; //每页显示条数
    const type_id = data.filterFold !== 'false' ? data.filterFold : Core.flyer.getEmailDefaultType();
    let cmdTextOfTotal = `
            SELECT COUNT(DISTINCT _tabTotal.subject_num) as count FROM (SELECT * FROM (SELECT
                ass.ID,
                ass.subject_num,
                max(ass.timer) AS maxTimer
            FROM
                amazon_service_stored ass
            INNER JOIN amazon_service_accounts asa ON 
                ass._from = asa.mail_address
                OR ass._to = asa.mail_address
                OR ass.message_recipients = asa.mail_address
            WHERE
                asa.depa_id = ?
            AND ass.disposed_status_id = ?
            AND ass.type_id = ?
            AND assigned_id = ? 
            AND asa.status_id = ?`,
        cmdTextOfRows = `
            SELECT
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
                    AND type_id = ?
                    AND assigned_id = ?
                    AND
                    (
                        _from IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR _to IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR message_recipients IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                    ) `,
        cmdText = ``,
        cmdParams = [],
        cmdParamsOfTotal = [
            data.orgGroupId,
            EnumStatus.disposed.value,
            type_id,
            data.user_id,
            1
        ],
        cmdParamsOfRows = [
            EnumStatus.disposed.value,
            type_id,
            data.user_id,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1
        ];
    // 判断查询条件
    if (data.email && Array.isArray(data.email) && data.email.length) {
        if (data.email.length === 1) {
            cmdTextOfTotal += ` AND (
                        ass._from = ?
                     OR ass._to = ?
                     )`;
            cmdTextOfRows += ` AND (
                        _from  = ?
                     OR _to  = ?
                     )`;
            cmdParamsOfTotal.push(data.email[0], data.email[0]);
            cmdParamsOfRows.push(data.email[0], data.email[0]);
        } else {
            cmdTextOfTotal += ` AND (
                         ass._from IN ${convertParams(data.email)}
                      OR ass._to IN ${convertParams(data.email)}
                    )`;
            cmdTextOfRows += ` AND (
                         _from IN ${convertParams(data.email)}
                      OR _to IN ${convertParams(data.email)}
                    )`;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.email).concat(data.email);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.email).concat(data.email);
        }
    }
    if (data.keyword) {
        cmdTextOfTotal += ` AND (
                      ass._from LIKE ?
                   OR ass._to LIKE ?
                   OR ass.subject LIKE ?
                )`;
        cmdTextOfRows += ` AND (
                      _from LIKE ?
                   OR _to LIKE ?
                   OR subject LIKE ?
                )`;
        cmdParamsOfTotal.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
        cmdParamsOfRows.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
    }
    cmdTextOfTotal += ` GROUP BY ass.subject_num) _tableTotal WHERE 1=1 `;
    cmdTextOfRows += ` GROUP BY SUBJECT_NUM
                        ) sm JOIN amazon_service_stored s ON s.subject_num = sm.subject_num
                            AND s.timer = sm.maxTimer
                        LEFT JOIN amazon_service_customer_complaint ct ON ct.ID = sm.subject_num WHERE 1=1 `;
    if (data.startDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer)>= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer)>= ? `;
        cmdParamsOfTotal.push(data.startDate);
        cmdParamsOfRows.push(data.startDate);
    }
    if (data.endDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer) <= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer) <= ? `;
        cmdParamsOfTotal.push(data.endDate);
        cmdParamsOfRows.push(data.endDate);
    }
    cmdTextOfTotal += `) _tabTotal;`;
    cmdTextOfRows += ` GROUP BY s.subject_num
                       ORDER BY sm.maxTimer DESC LIMIT ?,?;`;
    cmdParamsOfRows.push(offset, limit);
    cmdParams = cmdParamsOfTotal.concat(cmdParamsOfRows);
    cmdText = cmdTextOfTotal + cmdTextOfRows;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//获取主管已回复邮件
Email.prototype.select_finish_email_manager = function (data) {
    const offset = (Number(data.pageNumber) - 1) * (data.pageSize || 20);
    const limit = Number(data.pageSize) || 20; //每页显示条数
    const type_id = data.filterFold !== 'false' ? data.filterFold : Core.flyer.getEmailDefaultType();
    let cmdTextOfTotal = `
            SELECT COUNT(DISTINCT _tabTotal.subject_num) as count FROM (SELECT * FROM (SELECT
                ass.ID,
                ass.subject_num,
                max(ass.timer) AS maxTimer
            FROM
                amazon_service_stored ass
            INNER JOIN amazon_service_accounts asa ON 
                ass._from = asa.mail_address
                OR ass._to = asa.mail_address
                OR ass.message_recipients = asa.mail_address
            WHERE
                asa.depa_id = ?
            AND ass.disposed_status_id = ?
            AND ass.type_id = ?
            AND asa.status_id = ?`,
        cmdTextOfRows = `
            SELECT
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
                    AND type_id = ?
                    AND
                    (
                        _from IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR _to IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR message_recipients IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                    ) `,
        cmdText = ``,
        cmdParams = [],
        cmdParamsOfTotal = [
            data.orgGroupId,
            EnumStatus.disposed.value,
            type_id,
            1
        ],
        cmdParamsOfRows = [
            EnumStatus.disposed.value,
            type_id,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1
        ];
    // 判断查询条件
    if (data.email && Array.isArray(data.email) && data.email.length) {
        if (data.email.length === 1) {
            cmdTextOfTotal += ` AND (
                                ass._from = ?
                             OR ass._to = ?
                             )`;
            cmdTextOfRows += ` AND (
                                _from  = ?
                             OR _to  = ?
                             )`;
            cmdParamsOfTotal.push(data.email[0], data.email[0]);
            cmdParamsOfRows.push(data.email[0], data.email[0]);
        } else {
            cmdTextOfTotal += ` AND (
                                 ass._from IN ${convertParams(data.email)}
                              OR ass._to IN ${convertParams(data.email)}
                              )`;
            cmdTextOfRows += ` AND (
                                 _from IN ${convertParams(data.email)}
                              OR _to IN ${convertParams(data.email)}
                              )`;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.email).concat(data.email);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.email).concat(data.email);
        }
    }
    if (data.assigner && Array.isArray(data.assigner) && data.assigner.length) {
        if (data.assigner.length === 1) {
            cmdTextOfTotal += ` AND ass.assigned_id = ? `;
            cmdTextOfRows += ` AND assigned_id = ? `;
            cmdParamsOfTotal.push(data.assigner[0]);
            cmdParamsOfRows.push(data.assigner[0]);
        } else {
            cmdTextOfTotal += ` AND ass.assigned_id IN ${convertParams(data.assigner)} `;
            cmdTextOfRows += ` AND assigned_id IN ${convertParams(data.assigner)} `;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.assigner);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.assigner);
        }
    }
    if (data.keyword) {
        cmdTextOfTotal += ` AND (
                              ass._from LIKE ?
                           OR ass._to LIKE ?
                           OR ass.subject LIKE ?
                        )`;
        cmdTextOfRows += ` AND (
                              _from LIKE ?
                           OR _to LIKE ?
                           OR subject LIKE ?
                        )`;
        cmdParamsOfTotal.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
        cmdParamsOfRows.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
    }
    cmdTextOfTotal += ` GROUP BY ass.subject_num) _tableTotal WHERE 1=1 `;
    cmdTextOfRows += ` GROUP BY SUBJECT_NUM
                        ) sm JOIN amazon_service_stored s ON s.subject_num = sm.subject_num
                            AND s.timer = sm.maxTimer
                        LEFT JOIN amazon_service_customer_complaint ct ON ct.ID = sm.subject_num WHERE 1=1 `;
    if (data.startDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer)>= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer)>= ? `;
        cmdParamsOfTotal.push(data.startDate);
        cmdParamsOfRows.push(data.startDate);
    }
    if (data.endDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer) <= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer) <= ? `;
        cmdParamsOfTotal.push(data.endDate);
        cmdParamsOfRows.push(data.endDate);
    }
    cmdTextOfTotal += `) _tabTotal;`;
    cmdTextOfRows += ` GROUP BY s.subject_num
                       ORDER BY sm.maxTimer DESC LIMIT ?,?;`;
    cmdParamsOfRows.push(offset, limit);
    cmdParams = cmdParamsOfTotal.concat(cmdParamsOfRows);
    cmdText = cmdTextOfTotal + cmdTextOfRows;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//获取主管已解决邮件
Email.prototype.resolved_email_list_manager = function (data) {
    const offset = (Number(data.pageNumber) - 1) * (data.pageSize || 20);
    const limit = Number(data.pageSize) || 20; //每页显示条数
    const type_id = data.filterFold !== 'false' ? data.filterFold : Core.flyer.getEmailDefaultType();
    let cmdTextOfTotal = `
            SELECT COUNT(DISTINCT _tabTotal.subject_num) as count FROM (SELECT * FROM (SELECT
                ass.ID,
                ass.subject_num,
                max(ass.timer) AS maxTimer
            FROM
                amazon_service_stored ass
            INNER JOIN amazon_service_accounts asa ON 
                ass._from = asa.mail_address
                OR ass._to = asa.mail_address
                OR ass.message_recipients = asa.mail_address
            WHERE
                asa.depa_id = ?
            AND ass.disposed_status_id = ?
            AND ass.type_id = ? 
            AND asa.status_id = ?`,
        cmdTextOfRows = `
            SELECT
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
                    AND type_id = ?
                    AND
                    (
                        _from IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR _to IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR message_recipients IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                    ) `,
        cmdText = ``,
        cmdParams = [],
        cmdParamsOfTotal = [
            data.orgGroupId,
            EnumStatus.resolved.value,
            type_id,
            1
        ],
        cmdParamsOfRows = [
            EnumStatus.resolved.value,
            type_id,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1
        ];
    // 判断查询条件
    if (data.email && Array.isArray(data.email) && data.email.length) {
        if (data.email.length === 1) {
            cmdTextOfTotal += ` AND (ass._from = ? OR ass._to = ? )`;
            cmdTextOfRows += ` AND (_from  = ? OR _to  = ?)`;
            cmdParamsOfTotal.push(data.email[0], data.email[0]);
            cmdParamsOfRows.push(data.email[0], data.email[0]);
        } else {
            cmdTextOfTotal += ` AND (
                                    ass._from IN ${convertParams(data.email)}
                                OR  ass._to IN ${convertParams(data.email)}
                                    )`;
            cmdTextOfRows += ` AND (
                                    _from IN ${convertParams(data.email)}
                                OR  _to IN ${convertParams(data.email)}
                                    )`;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.email).concat(data.email);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.email).concat(data.email);
        }
    }
    if (data.assigner && Array.isArray(data.assigner) && data.assigner.length) {
        if (data.assigner.length === 1) {
            cmdTextOfTotal += ` AND ass.assigned_id = ? `;
            cmdTextOfRows += ` AND assigned_id = ? `;
            cmdParamsOfTotal.push(data.assigner[0]);
            cmdParamsOfRows.push(data.assigner[0]);
        } else {
            cmdTextOfTotal += ` AND ass.assigned_id IN ${convertParams(data.assigner)} `;
            cmdTextOfRows += ` AND assigned_id IN ${convertParams(data.assigner)} `;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.assigner);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.assigner);
        }
    }
    if (data.keyword) {
        cmdTextOfTotal += ` AND (
                               ass._from LIKE ?
                            OR ass._to LIKE ?
                            OR ass.subject LIKE ?
                                )`;
        cmdTextOfRows += ` AND (
                               _from LIKE ?
                            OR _to LIKE ?
                            OR subject LIKE ?
                               )`;
        cmdParamsOfTotal.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
        cmdParamsOfRows.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
    }
    cmdTextOfTotal += ` GROUP BY ass.subject_num) _tableTotal WHERE 1=1 `;
    cmdTextOfRows += ` GROUP BY SUBJECT_NUM
                        ) sm JOIN amazon_service_stored s ON s.subject_num = sm.subject_num
                            AND s.timer = sm.maxTimer
                        LEFT JOIN amazon_service_customer_complaint ct ON ct.ID = sm.subject_num WHERE 1=1 `;
    if (data.startDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer)>= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer)>= ? `;
        cmdParamsOfTotal.push(data.startDate);
        cmdParamsOfRows.push(data.startDate);
    }
    if (data.endDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer) <= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer) <= ? `;
        cmdParamsOfTotal.push(data.endDate);
        cmdParamsOfRows.push(data.endDate);
    }
    cmdTextOfTotal += `) _tabTotal;`;
    cmdTextOfRows += `  GROUP BY s.subject_num
                        ORDER BY sm.maxTimer DESC LIMIT ?,?;`;
    cmdParamsOfRows.push(offset, limit);
    cmdParams = cmdParamsOfTotal.concat(cmdParamsOfRows);
    cmdText = cmdTextOfTotal + cmdTextOfRows;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//获取客服已解决邮件
Email.prototype.resolved_email_list = function (data) {
    const offset = (Number(data.pageNumber) - 1) * (data.pageSize || 20);
    const limit = Number(data.pageSize) || 20; //每页显示条数
    const type_id = data.filterFold !== 'false' ? data.filterFold : Core.flyer.getEmailDefaultType();
    let cmdTextOfTotal = `
            SELECT COUNT(DISTINCT _tabTotal.subject_num) as count FROM (SELECT * FROM (SELECT
                ass.ID,
                ass.subject_num,
                max(ass.timer) AS maxTimer
            FROM
                amazon_service_stored ass
            INNER JOIN amazon_service_accounts asa ON 
                ass._from = asa.mail_address
                OR ass._to = asa.mail_address
                OR ass.message_recipients = asa.mail_address
            WHERE
                asa.depa_id = ?
            AND ass.disposed_status_id = ?
            AND ass.type_id = ?
            AND assigned_id = ? 
            AND asa.status_id = ?`,
        cmdTextOfRows = `
        SELECT
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
                AND type_id = ?
                AND assigned_id = ?
                AND
                (
                    _from IN (
                        SELECT
                        mail_address
                        FROM
                        amazon_service_accounts
                        WHERE
                        depa_id = ?
                        AND status_id = ?
                    )
                    OR _to IN (
                        SELECT
                        mail_address
                        FROM
                        amazon_service_accounts
                        WHERE
                        depa_id = ?
                        AND status_id = ?
                    )
                    OR message_recipients IN (
                        SELECT
                        mail_address
                        FROM
                        amazon_service_accounts
                        WHERE
                        depa_id = ?
                        AND status_id = ?
                    )
                )  `,
        cmdText = ``,
        cmdParams = [],
        cmdParamsOfTotal = [
            data.orgGroupId,
            EnumStatus.resolved.value,
            type_id,
            data.user_id,
            1
        ],
        cmdParamsOfRows = [
            EnumStatus.resolved.value,
            type_id,
            data.user_id,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1
        ];
    // 判断查询条件
    if (data.email && Array.isArray(data.email) && data.email.length) {
        if (data.email.length === 1) {
            cmdTextOfTotal += ` AND (ass._from = ? OR ass._to = ? )`;
            cmdTextOfRows += ` AND (_from  = ? OR _to  = ?)`;
            cmdParamsOfTotal.push(data.email[0], data.email[0]);
            cmdParamsOfRows.push(data.email[0], data.email[0]);
        } else {
            cmdTextOfTotal += ` AND (
                                    ass._from IN ${convertParams(data.email)}
                                OR  ass._to IN ${convertParams(data.email)}
                                    )`;
            cmdTextOfRows += ` AND (
                                    _from IN ${convertParams(data.email)}
                                OR  _to IN ${convertParams(data.email)}
                                    )`;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.email).concat(data.email);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.email).concat(data.email);
        }
    }
    if (data.keyword) {
        cmdTextOfTotal += ` AND (
                               ass._from LIKE ?
                            OR ass._to LIKE ?
                            OR ass.subject LIKE ?
                                )`;
        cmdTextOfRows += ` AND (
                               _from LIKE ?
                            OR _to LIKE ?
                            OR subject LIKE ?
                                )`;
        cmdParamsOfTotal.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
        cmdParamsOfRows.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
    }
    cmdTextOfTotal += ` GROUP BY ass.subject_num) _tableTotal WHERE 1=1 `;
    cmdTextOfRows += ` GROUP BY SUBJECT_NUM
                        ) sm JOIN amazon_service_stored s ON s.subject_num = sm.subject_num
                            AND s.timer = sm.maxTimer
                        LEFT JOIN amazon_service_customer_complaint ct ON ct.ID = sm.subject_num WHERE 1=1 `;
    if (data.startDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer)>= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer)>= ? `;
        cmdParamsOfTotal.push(data.startDate);
        cmdParamsOfRows.push(data.startDate);
    }
    if (data.endDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer) <= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer) <= ? `;
        cmdParamsOfTotal.push(data.endDate);
        cmdParamsOfRows.push(data.endDate);
    }
    cmdTextOfTotal += `) _tabTotal;`;
    cmdTextOfRows += ` GROUP BY s.subject_num
                       ORDER BY sm.maxTimer DESC LIMIT ?,?;`;
    cmdParamsOfRows.push(offset, limit);
    cmdParams = cmdParamsOfTotal.concat(cmdParamsOfRows);
    cmdText = cmdTextOfTotal + cmdTextOfRows;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//获取未分派邮件
Email.prototype.select_unassigned_email = function (data) {
    const offset = (Number(data.pageNumber) - 1) * (data.pageSize || 20);
    const limit = Number(data.pageSize) || 20; //每页显示条数
    const type_id = data.filterFold !== 'false' ? data.filterFold : Core.flyer.getEmailDefaultType();
    let cmdTextOfTotal = `
            SELECT COUNT(DISTINCT _tabTotal.subject_num) as count FROM (SELECT * FROM (SELECT
                ass.ID,
                ass.subject_num,
                max(ass.timer) AS maxTimer
            FROM
                amazon_service_stored ass
            INNER JOIN amazon_service_accounts asa ON 
                ass._from = asa.mail_address
                OR ass._to = asa.mail_address
                OR ass.message_recipients = asa.mail_address
            WHERE
                asa.depa_id = ?
            AND ass.disposed_status_id = ?
            AND ass.status_id = ?
            AND ass.type_id = ? 
            AND asa.status_id = ?`,
        cmdTextOfRows = `
            SELECT
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
                    AND status_id = ?
                    AND type_id = ?
                    AND
                    (
                        _from IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR _to IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR message_recipients IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                    ) `,
        cmdText = ``,
        cmdParams = [],
        cmdParamsOfTotal = [
            data.orgGroupId,
            EnumStatus.undisposed.value,
            EnumStatus.unassigned.value,
            type_id,
            1
        ],
        cmdParamsOfRows = [
            EnumStatus.undisposed.value,
            EnumStatus.unassigned.value,
            type_id,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1
        ];
    // 判断查询条件
    if (data.email && Array.isArray(data.email) && data.email.length) {
        if (data.email.length === 1) {
            cmdTextOfTotal += ` AND (ass._from = ? OR ass._to = ? )`;
            cmdTextOfRows += ` AND (_from  = ? OR _to  = ?)`;
            cmdParamsOfTotal.push(data.email[0], data.email[0]);
            cmdParamsOfRows.push(data.email[0], data.email[0]);
        } else {
            cmdTextOfTotal += ` AND (
                                    ass._from IN ${convertParams(data.email)}
                                OR  ass._to IN ${convertParams(data.email)}
                                    )`;
            cmdTextOfRows += ` AND (
                                    _from IN ${convertParams(data.email)}
                                OR  _to IN ${convertParams(data.email)}
                                    )`;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.email).concat(data.email);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.email).concat(data.email);
        }
    }
    if (data.assigner && Array.isArray(data.assigner) && data.assigner.length) {
        if (data.assigner.length === 1) {
            cmdTextOfTotal += ` AND ass.assigned_id = ? `;
            cmdTextOfRows += ` AND  assigned_id = ? `;
            cmdParamsOfTotal.push(data.assigner[0]);
            cmdParamsOfRows.push(data.assigner[0]);
        } else {
            cmdTextOfTotal += ` AND ass.assigned_id IN ${convertParams(data.assigner)} `;
            cmdTextOfRows += ` AND  assigned_id IN ${convertParams(data.assigner)} `;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.assigner);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.assigner);
        }
    }
    if (data.keyword) {
        cmdTextOfTotal += ` AND (
                               ass._from LIKE ?
                            OR ass._to LIKE ?
                            OR ass.subject LIKE ?
                                )`;
        cmdTextOfRows += ` AND (
                               _from LIKE ?
                            OR _to LIKE ?
                            OR subject LIKE ?
                                )`;
        cmdParamsOfTotal.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
        cmdParamsOfRows.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
    }
    cmdTextOfTotal += ` GROUP BY ass.subject_num) _tableTotal WHERE 1=1 `;
    cmdTextOfRows += `  GROUP BY SUBJECT_NUM
                        ) sm JOIN amazon_service_stored s ON s.subject_num = sm.subject_num
                            AND s.timer = sm.maxTimer
                        LEFT JOIN amazon_service_customer_complaint ct ON ct.ID = sm.subject_num WHERE 1=1  `;
    if (data.startDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer)>= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer)>= ? `;
        cmdParamsOfTotal.push(data.startDate);
        cmdParamsOfRows.push(data.startDate);
    }
    if (data.endDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer) <= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer) <= ? `;
        cmdParamsOfTotal.push(data.endDate);
        cmdParamsOfRows.push(data.endDate);
    }
    cmdTextOfTotal += ` ) _tabTotal;`;
    cmdTextOfRows += ` GROUP BY s.subject_num
                       ORDER BY sm.maxTimer DESC LIMIT ?,?;`;
    cmdParamsOfRows.push(offset, limit);
    cmdParams = cmdParamsOfTotal.concat(cmdParamsOfRows);
    cmdText = cmdTextOfTotal + cmdTextOfRows;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//获取已分派邮件
Email.prototype.select_assigned_email = function (data) {
    const offset = (Number(data.pageNumber) - 1) * (data.pageSize || 20);
    const limit = Number(data.pageSize) || 20; //每页显示条数
    const type_id = data.filterFold !== 'false' ? data.filterFold : Core.flyer.getEmailDefaultType();
    let cmdTextOfTotal = `
            SELECT COUNT(DISTINCT _tabTotal.subject_num) as count FROM (SELECT * FROM (SELECT
                ass.ID,
                ass.subject_num,
                max(ass.timer) AS maxTimer
            FROM
                amazon_service_stored ass
            INNER JOIN amazon_service_accounts asa ON 
                ass._from = asa.mail_address
                OR ass._to = asa.mail_address
                OR ass.message_recipients = asa.mail_address
            WHERE
                asa.depa_id = ?
                AND ass.disposed_status_id = ?
                AND ass.status_id = ?
                AND ass.type_id = ? 
                AND asa.status_id = ?`,
        cmdTextOfRows = `
            SELECT
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
                    AND status_id = ?
                    AND type_id = ?
                    AND
                    (
                        _from IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR _to IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                        OR message_recipients IN (
                            SELECT
                            mail_address
                            FROM
                            amazon_service_accounts
                            WHERE
                            depa_id = ?
                            AND status_id = ?
                        )
                    )`,
        cmdText = ``,
        cmdParams = [],
        cmdParamsOfTotal = [
            data.orgGroupId,
            EnumStatus.undisposed.value,
            EnumStatus.assigned.value,
            type_id,
            1
        ], cmdParamsOfRows = [
            EnumStatus.undisposed.value,
            EnumStatus.assigned.value,
            type_id,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1,
            data.orgGroupId,
            1
        ];
    // 判断查询条件
    if (data.email && Array.isArray(data.email) && data.email.length) {
        if (data.email.length === 1) {
            cmdTextOfTotal += ` AND (ass._from = ? OR ass._to = ? )`;
            cmdTextOfRows += ` AND (_from  = ? OR _to  = ?)`;
            cmdParamsOfTotal.push(data.email[0], data.email[0]);
            cmdParamsOfRows.push(data.email[0], data.email[0]);
        } else {
            cmdTextOfTotal += ` AND (
                                    ass._from IN ${convertParams(data.email)}
                                OR  ass._to IN ${convertParams(data.email)}
                                    )`;
            cmdTextOfRows += ` AND (
                                    _from IN ${convertParams(data.email)}
                                OR  _to IN ${convertParams(data.email)}
                                    )`;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.email).concat(data.email);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.email).concat(data.email);
        }
    }
    if (data.assigner && Array.isArray(data.assigner) && data.assigner.length) {
        if (data.assigner.length === 1) {
            cmdTextOfTotal += ` AND ass.assigned_id = ? `;
            cmdTextOfRows += ` AND assigned_id = ? `;
            cmdParamsOfTotal.push(data.assigner[0]);
            cmdParamsOfRows.push(data.assigner[0]);
        } else {
            cmdTextOfTotal += ` AND ass.assigned_id IN ${convertParams(data.assigner)} `;
            cmdTextOfRows += ` AND assigned_id IN ${convertParams(data.assigner)} `;
            cmdParamsOfTotal = cmdParamsOfTotal.concat(data.assigner);
            cmdParamsOfRows = cmdParamsOfRows.concat(data.assigner);
        }
    }
    if (data.keyword) {
        cmdTextOfTotal += ` AND (
                               ass._from LIKE ?
                            OR ass._to LIKE ?
                            OR ass.subject LIKE ?
                                )`;
        cmdTextOfRows += ` AND (
                               _from LIKE ?
                            OR _to LIKE ?
                            OR subject LIKE ?
                                )`;
        cmdParamsOfTotal.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
        cmdParamsOfRows.push(["%" + data.keyword + "%"], ["%" + data.keyword + "%"], ["%" + data.keyword + "%"]);
    }
    cmdTextOfTotal += ` GROUP BY ass.subject_num) _tableTotal WHERE 1=1 `;
    cmdTextOfRows += `  GROUP BY SUBJECT_NUM
                        ) sm JOIN amazon_service_stored s ON s.subject_num = sm.subject_num
                            AND s.timer = sm.maxTimer
                        LEFT JOIN amazon_service_customer_complaint ct ON ct.ID = sm.subject_num WHERE 1=1   `;
    if (data.startDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer)>= ? `;
        cmdTextOfRows += ` AND DATE(sm.maxTimer)>= ? `;
        cmdParamsOfTotal.push(data.startDate);
        cmdParamsOfRows.push(data.startDate);
    }
    if (data.endDate) {
        cmdTextOfTotal += ` AND DATE(_tableTotal.maxTimer) <= ? `;
        cmdTextOfRows += `  AND DATE(sm.maxTimer) <= ? `;
        cmdParamsOfTotal.push(data.endDate);
        cmdParamsOfRows.push(data.endDate);
    }
    cmdTextOfTotal += `) _tabTotal;`;
    cmdTextOfRows += ` GROUP BY s.subject_num
                       ORDER BY sm.maxTimer DESC LIMIT ?,?;`;
    cmdParamsOfRows.push(offset, limit);
    cmdParams = cmdParamsOfTotal.concat(cmdParamsOfRows);
    cmdText = cmdTextOfTotal + cmdTextOfRows;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//添加账号
Email.prototype.addSmtpUser = function (data, mailgun, poccessFun) {
    let cmdText =
        "replace into amazon_service_accounts(mail_address,password,created_at,domain) values(?,?,?,?)",
        cmdParams = [data.data.title.split('@')[0] + '@' + data.domain, 123456, data.create_at, data.domain],
        argument = {
            domain: data.domain,
            mailgun: mailgun,
            poccessFun: poccessFun
        };
    return Core.flyer.return_promise_Transaction(this.pool, cmdText, cmdParams, argument);
};
// 根据邮箱地址获取账户记录（用于判重）
Email.prototype.get_account_by_address = function (email_address) {
    let cmdText = "select * from amazon_service_accounts where mail_address = ?", cmdParams = [email_address];
    if (!email_address) {
        return [];
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//获取账号列表
Email.prototype.getSmtpUsers = function (offset, accountName) {
    const start = offset;
    const end = 15; //每页显示15条
    let cmdText = '';
    let cmdTextOfCount = `SELECT count(ID) as 'count' FROM amazon_service_accounts WHERE 1=1 and status_id = 1`;
    let cmdTextOfData = `SELECT * FROM amazon_service_accounts WHERE 1=1 and status_id = 1`;
    let searchName = '(';
    let cmdParams = [start, end];
    if (accountName.length === 1 && accountName[0]) {
        cmdTextOfCount += ` AND mail_address LIKE '%${accountName[0]}%' OR domain LIKE '%${accountName[0]}%';`;
        cmdTextOfData += ` AND mail_address LIKE '%${accountName[0]}%' OR domain LIKE '%${accountName[0]}%'`
    } else if (accountName.length > 1) {
        accountName.forEach(function (obj, index) {
            if (index !== accountName.length - 1) {
                searchName += `'${accountName[index]}',`;
            } else {
                searchName += `'${accountName[index]}')`;
            }
            // cmdParams.push(accountName[index]);
        });
        cmdTextOfCount += ` and mail_address IN ${searchName} OR domain IN ${searchName} ;`;
        cmdTextOfData += ` and mail_address IN ${searchName} OR domain IN ${searchName}`;

    } else {
        cmdTextOfCount += `;`;
    }

    cmdTextOfData += ` ORDER BY created_at DESC limit ?,?`;
    cmdText = cmdTextOfCount + cmdTextOfData;
    // cmdParams.push(start);
    // cmdParams.push(end);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//删除账号
Email.prototype.deleteSmtpUser = function (username, domain, mailgun, poccessFun) {
    var deleteLength = '(';
    username.forEach(function (obj, index) {
        if (index !== username.length - 1) {
            deleteLength += '?,';
        } else {
            deleteLength += '?)';
        }
    })

    let cmdText =
        "delete from amazon_service_accounts where ID=?",
        cmdParams = username[0]['ID'],
        argument = {
            domain: domain,
            mailgun: mailgun,
            poccessFun: poccessFun,
            user: username[0]['user']
        }
    return Core.flyer.return_promise_Transaction(this.pool, cmdText, cmdParams, argument);
};

//获取发送邮件邮箱选择列表
Email.prototype.email_list = function (data) {
    let cmdText =
        "select * from amazon_service_accounts where depa_id = ? and status_id=1",
        cmdParams = [data.depa_id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
Email.prototype.update = function (data) { };
Email.prototype.delete = function (data) { };
Email.prototype.selecte = function (data) { };

// 获取所有的邮件(通过关键字,需要区分客服和主管，主管可以看到所有组的邮件，客服只能看到自己的)
Email.prototype.get_email_by_keyword = function (params) {
    const offset = (Number(params.pageNumber) - 1) * (Number(params.pageSize) || 20);
    const limit = Number(params.pageSize) || 20;//每页显示条数
    const data = params.keyword.replace(/'|\?/, '');
    const orgCode = params.orgCode,
        userId = params.userId,
        depaId = params.depaId;
    let cmdText = ``, cmdParams = [];
    // 客服
    if (orgCode === '9101') {
        cmdText = `select count(ID) as count from  amazon_service_stored where  assigned_id = ? AND (_from LIKE ? OR _to LIKE ? OR subject LIKE ? OR message_recipients LIKE ? );
        select * from  amazon_service_stored where  assigned_id = ? AND (   _from LIKE ?  OR _to LIKE ? OR subject LIKE ? OR message_recipients LIKE ?) order by timer desc limit ?,?`;
        cmdParams = [userId, ["%" + data + "%"], ["%" + data + "%"], ["%" + data + "%"], ["%" + data + "%"], userId, ["%" + data + "%"], ["%" + data + "%"], ["%" + data + "%"], ["%" + data + "%"], offset, limit];
    } else if (orgCode === '9102') {
        cmdText = ` select count(ID) as count from  amazon_service_stored where (_from in (select mail_address from amazon_service_accounts where depa_id = ?) or message_recipients in (select mail_address from amazon_service_accounts where depa_id = ?) or _to in (select mail_address from amazon_service_accounts where depa_id = ?)) AND (_from LIKE ? OR _to LIKE ? OR subject LIKE ?) ;
         select * from  amazon_service_stored where (_from in (select mail_address from amazon_service_accounts where depa_id = ?) or message_recipients in (select mail_address from amazon_service_accounts where depa_id = ?) or _to in (select mail_address from amazon_service_accounts where depa_id = ?)) 
         AND (_from LIKE ?  OR _to LIKE ? OR subject LIKE ? ) order by timer desc limit ?,?`;
        cmdParams = [depaId, depaId, depaId, ["%" + data + "%"], ["%" + data + "%"], ["%" + data + "%"], depaId, depaId, depaId, ["%" + data + "%"], ["%" + data + "%"], ["%" + data + "%"], offset, limit];
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

//往来邮件
Email.prototype.subject_list = function (data) {
    let cmdText =
        "select * from amazon_service_stored where subject_num = ? order by timer",
        cmdParams = [data.subject_num];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 通过邮件type_id邮件的type数据
Email.prototype.get_type_info_by_id = function (type_id) {
    return Core.flyer.return_promise(this.pool, `SELECT * from amazon_service_email_types WHERE ID = ? `, [type_id]);
};
module.exports = Email;