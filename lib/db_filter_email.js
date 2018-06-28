/*
 * 用于 邮件过滤 模块功能的数据实现
 */
"use strict";
let Core = require("./core"),
    EnumStatus = require("./status");
// 构建函数
let filterEmail = function (groupPool, pool) {
    this.pool = pool;
    this.groupPool = groupPool;
};
//获取小组数据
filterEmail.prototype.getAssigners = function (data) {
    let cmdParams = [data.org_category_id, data.org_group_id],
        cmdText = `select * from user u
    inner join user_org_micro ur on u.user_id = ur.user_id
    where org_category_id = ? and org_group_id = ? and org_id = 40`;
    return Core.flyer.return_promise(this.groupPool, cmdText, cmdParams);
};
//过滤邮件数据(分派、未分派、处理、未处理)
filterEmail.prototype.filterEmail = function (data) {
    const start = (Number(data.pageNumber) - 1) * (Number(data.pageSize) || 20);
    const end = Number(data.pageSize) || 20; //每页显示条数
    let cmdParams = [start, end],
        //筛选条件
        emails = data.email && data.email.map(function (obj, index) { return "'" + obj + "'" }).join(","),
        emailArr = data.email ? `(${emails})` : '(select mail_address from amazon_service_accounts where depa_id=' + data.orgGroupId + ')',
        assigner = data.assigner && data.assigner.map(function (obj, index) { return "'" + obj + "'" }).join(","),
        assignerArr = data.assigner ? `and assigned_id in (${assigner})` : '',
        paperStatu = data.disposed_status_id ? 'and disposed_status_id=' + data.disposed_status_id : data.status_id ? 'and disposed_status_id=${EnumStatus.undisposed.value} and status_id=' + data.status_id : '',
        isManager = data.orgCode === '9101' ? ' and assigned_id=' + data.user_id : '',
        cmdText = `
    select count(ID) as 'count' from (select * from amazon_service_stored 
    where (_from in ${emailArr}
    or _to in ${emailArr}) ${paperStatu} ${isManager} ${assignerArr} group by SUBJECT_NUM) as temp_table;
    select *,SUM(num) as count,MAX(timer) as max_time,MAX(has_attachments) as has_attachments from amazon_service_stored
    where (_from in ${emailArr} 
    or _to in ${emailArr}) ${paperStatu} ${isManager} ${assignerArr} group by SUBJECT_NUM order by timer desc limit ?,?
    `;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//过滤邮件数据(已发送邮件)(跟上面的查询语句出入太大故分开写)
filterEmail.prototype.filterSentEmail = function (data) {
    const start = (Number(data.pageNumber) - 1) * (Number(data.pageSize) || 20);
    const end = Number(data.pageSize) || 20;//每页显示条数
    let cmdParams = [data.user_id, data.user_id, start, end],
        //筛选条件
        emails = data.email && data.email.map(function (obj, index) { return "'" + obj + "'" }).join(","),
        emailArr = data.email ? `(${emails})` : '(SELECT mail_address FROM amazon_service_accounts WHERE depa_id=' + data.orgGroupId + ')',
        cmdText = `
        SELECT count(ID) as 'count' FROM amazon_service_emails 
        WHERE
            _from IN ${emailArr}
            AND user_id= ? 
            AND DATE(date_time)>='${data.startDate}'
            AND DATE(date_time)<= '${data.endDate}'
            AND (
                _from LIKE '%${data.keyword}%'
                OR _to LIKE '%${data.keyword}%'
                OR _subject LIKE '%${data.keyword}%'
                OR user_name LIKE '%${data.keyword}%'
            );
        SELECT * FROM amazon_service_emails 
        WHERE
            _from IN ${emailArr}
            AND user_id=? 
            AND DATE(date_time)>='${data.startDate}'
            AND DATE(date_time)<= '${data.endDate}'
            AND (
                _from LIKE '%${data.keyword}%'
                OR _to LIKE '%${data.keyword}%'
                OR _subject LIKE '%${data.keyword}%'
                OR user_name LIKE '%${data.keyword}%'
            )
            ORDER BY date_time DESC LIMIT ?,?;
    `;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
module.exports = filterEmail;