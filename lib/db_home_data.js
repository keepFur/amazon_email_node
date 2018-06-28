/*
* 用于 内容模板 模块功能的数据实现
*/
"use strict";
let EnumStatus = require("./status"),
    Core = require("./core"),
    Status = require("./status");
let Home = function (pool, groupPool) {
    this.pool = pool;
    this.groupPool = groupPool;
};
Home.prototype.getAccountManager = function (data) {
    let orgGroupIds = data.orgGroupIds.map(function (obj, index) {
        return "'" + obj + "'";
    }).join(","),
        hasTime = data.startDate && data.endDate ? ` having Max(timer) BETWEEN '${data.startDate}' and
     '${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date(data.endDate).getTime() + 24*60*60*1000)))}'` : data.startDate && !data.endDate ? ` having Max(timer) BETWEEN '${data.startDate}' and
      '${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date().getTime() + 24*60*60*1000)))}'` : !data.startDate && data.endDate ? ` having Max(timer) BETWEEN '${Core.flyer.formatDate('yyyy-mm-dd', new Date('2017-09-30'))}' and
      '${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date(data.endDate).getTime() + 24*60*60*1000)))}'` : ``,
        cmdText =
            `select count(*) as 'count',tpl.depa_id from (select count(DISTINCT subject_num) as 'undisposed',ac.depa_id from (select _to,_from,subject_num,disposed_status_id,status_id,timer,type_id from amazon_service_stored) as mail inner join 
        (select depa_id,mail_address,status_id as status from amazon_service_accounts) as ac ON
        (mail._from=ac.mail_address or mail._to=ac.mail_address) where disposed_status_id=${Status.undisposed.value} and ac.depa_id in (${orgGroupIds}) and ac.status=1  and  type_id=0 group by ac.depa_id,mail.subject_num ${hasTime} ORDER BY ac.depa_id) as tpl group by tpl.depa_id ;
        select count(*) as 'count',tpl.depa_id from (select count(DISTINCT subject_num) as 'disposed',ac.depa_id from (select _to,_from,subject_num,disposed_status_id,status_id,timer,type_id from amazon_service_stored) as mail inner join 
        (select depa_id,mail_address,status_id as status from amazon_service_accounts) as ac ON
        (mail._from=ac.mail_address or mail._to=ac.mail_address) where disposed_status_id=${Status.disposed.value} and ac.depa_id in (${orgGroupIds}) and ac.status=1 and  type_id=0 group by ac.depa_id,mail.subject_num ${hasTime} ORDER BY ac.depa_id) as tpl group by tpl.depa_id;
        select count(*) as 'count',tpl.depa_id from (select count(DISTINCT subject_num) as 'unassigned',ac.depa_id from (select _to,_from,subject_num,disposed_status_id,status_id,timer,type_id from amazon_service_stored) as mail inner join 
        (select depa_id,mail_address,status_id as status from amazon_service_accounts) as ac ON
        (mail._from=ac.mail_address or mail._to=ac.mail_address) where disposed_status_id=${Status.undisposed.value} and ac.depa_id in (${orgGroupIds}) and ac.status=1 and  type_id=0 and status_id=${Status.unassigned.value} group by ac.depa_id,mail.subject_num ${hasTime} ORDER BY ac.depa_id) as tpl group by tpl.depa_id;
        select count(*) as 'count',tpl.depa_id from (select count(DISTINCT subject_num) as 'assigned',ac.depa_id from (select _to,_from,subject_num,disposed_status_id,status_id,timer,type_id from amazon_service_stored) as mail inner join 
        (select depa_id,mail_address,status_id as status from amazon_service_accounts) as ac ON
        (mail._from=ac.mail_address or mail._to=ac.mail_address)  where disposed_status_id=${Status.undisposed.value} and ac.depa_id in (${orgGroupIds}) and ac.status=1 and  type_id=0 and status_id=${Status.assigned.value} group by ac.depa_id,mail.subject_num ${hasTime} ORDER BY ac.depa_id) as tpl group by tpl.depa_id;
        select count(*) as 'count',tpl.depa_id from (select count(DISTINCT subject_num) as 'resolved',ac.depa_id from (select _to,_from,subject_num,disposed_status_id,status_id,timer,type_id from amazon_service_stored) as mail inner join 
        (select depa_id,mail_address,status_id as status from amazon_service_accounts) as ac ON
        (mail._from=ac.mail_address or mail._to=ac.mail_address)  where disposed_status_id=${Status.resolved.value} and ac.depa_id in (${orgGroupIds}) and ac.status=1 and type_id=0 group by ac.depa_id,mail.subject_num ${hasTime} ORDER BY ac.depa_id) as tpl group by tpl.depa_id;
        `,
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//获取客服所有账号
Home.prototype.getAccountService = function (data) {
    let orgGroupIds = data.orgGroupIds.map(function (obj, index) {
        return "'" + obj + "'";
    }).join(","),
        hasTime = data.startDate && data.endDate ? ` having Max(timer) BETWEEN '${data.startDate}' and
     '${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date(data.endDate).getTime() + 24*60*60*1000)))}'` : data.startDate && !data.endDate ? ` having Max(timer) BETWEEN '${data.startDate}' and
      '${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date().getTime() + 24*60*60*1000)))}'` : !data.startDate && data.endDate ? ` having Max(timer) BETWEEN '${Core.flyer.formatDate('yyyy-mm-dd', new Date('2017-09-30'))}' and
      '${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date(data.endDate).getTime() + 24*60*60*1000)))}'` : ``,
        hasDateTime = data.startDate && data.endDate ? `date_time >='${data.startDate}' and date_time <='${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date(data.endDate).getTime() + 24*60*60*1000)))}'` : data.startDate && !data.endDate ? `date_time >='${data.startDate}' and
      date_time <='${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date().getTime() + 24*60*60*1000)))}'` : !data.startDate && data.endDate ? `date_time >='${Core.flyer.formatDate('yyyy-mm-dd', new Date('2017-09-30'))}' and
      date_time <='${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date(data.endDate).getTime() + 24*60*60*1000)))}'` : ``,
        cmdText =
            `select count(*) as 'count',tpl.depa_id from (select count(DISTINCT subject_num) as 'undisposed',ac.depa_id from amazon_service_stored as mail left join 
        amazon_service_accounts as ac ON
        (mail._from=ac.mail_address or mail._to=ac.mail_address) where disposed_status_id=${Status.undisposed.value} and ac.depa_id in (${orgGroupIds}) and ac.status_id=1 and assigned_id=${data.user_id} and type_id=0 group by ac.depa_id,mail.subject_num ${hasTime} ORDER BY ac.depa_id) as tpl group by tpl.depa_id;
        select count(*) as 'count',aco.depa_id from amazon_service_emails ems left join amazon_service_accounts aco on (ems._from=aco.mail_address) where user_id=${data.user_id} and aco.status_id=1 and ${hasDateTime} group by aco.depa_id;
        select count(*) as 'count',tpl.depa_id from (select count(DISTINCT subject_num) as 'resolved',ac.depa_id from amazon_service_stored as mail left join 
        amazon_service_accounts as ac ON
        (mail._from=ac.mail_address or mail._to=ac.mail_address)  where disposed_status_id=${Status.resolved.value} and ac.depa_id in (${orgGroupIds}) and ac.status_id=1 and assigned_id=${data.user_id} and type_id=0 group by ac.depa_id,mail.subject_num ${hasTime} ORDER BY ac.depa_id) as tpl group by tpl.depa_id;
        `,
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//获取小组人员信息
Home.prototype.getGroupdata = function (data) {
    let orgGroupIds = data.orgGroupIds,
        orgGroupIds_length = `(`;
    orgGroupIds.forEach(function (obj, index) {
        if (index !== orgGroupIds.length - 1) {
            orgGroupIds_length += '?,'
        } else {
            orgGroupIds_length += '?'
        }
    });
    orgGroupIds_length += ')';
    let cmdText = `select * from user u
    inner join user_org_micro ur on u.user_id = ur.user_id
    where org_category_id = ? and org_group_id in ${orgGroupIds_length} and org_id = 40 and u.func_state=1 group by ur.user_id;
    `,
        cmdParams = [data.org_category_id].concat(orgGroupIds)
    return Core.flyer.return_promise(this.groupPool, cmdText, cmdParams);
};

Home.prototype.getServicedata = function (data, orgGroupIds, rqData) {
    let orgGroupIdsArr = orgGroupIds.map(function (obj, index) {
        return "'" + obj + "'";
    }).join(','),
        users = data.map(function (obj, index) {
            return "'" + obj.user_id + "'";
        }).join(','),
        hasTimeStored = rqData.startDate && rqData.endDate ? ` having MAX(timer) BETWEEN '${rqData.startDate}' and
    '${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date(rqData.endDate).getTime() + 24*60*60*1000)))}'` : rqData.startDate && !rqData.endDate ? ` having MAX(timer) BETWEEN '${rqData.startDate}' and
     '${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date().getTime() + 24*60*60*1000)))}'` : !rqData.startDate && rqData.endDate ? ` having MAX(timer) BETWEEN '${Core.flyer.formatDate('yyyy-mm-dd', new Date('2017-09-30'))}' and
     '${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date(rqData.endDate).getTime() + 24*60*60*1000)))}'` : ``,
        hasTime = rqData.startDate && rqData.endDate ? `mail.date_time >='${rqData.startDate}' and mail.date_time <='${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date(rqData.endDate).getTime() + 24*60*60*1000)))}'` : rqData.startDate && !rqData.endDate ? `mail.date_time >='${rqData.startDate}' and
        mail.date_time <='${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date().getTime() + 24*60*60*1000)))}'` : !rqData.startDate && rqData.endDate ? `mail.date_time >='${Core.flyer.formatDate('yyyy-mm-dd', new Date('2017-09-30'))}' and
        mail.date_time <='${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date(rqData.endDate).getTime() + 24*60*60*1000)))}'` : ``;
    let cmdText = `select count(*) as 'count',tpl.assigned_id as 'user_id' from (select count(DISTINCT subject_num) as 'undisposed',mail.assigned_id from amazon_service_stored as mail left join 
    amazon_service_accounts as ac ON
    (mail._from=ac.mail_address or mail._to=ac.mail_address) where disposed_status_id=${Status.undisposed.value} and ac.depa_id in (${orgGroupIdsArr}) and ac.status_id=1 and  type_id=0 group by mail.assigned_id,mail.subject_num ${hasTimeStored} ORDER BY mail.assigned_id) as tpl group by tpl.assigned_id ;
    select count(*) as 'count',mail.user_id from amazon_service_emails mail left join (select mail_address,status_id from amazon_service_accounts) as acc ON mail._from=acc.mail_address where ${hasTime} and acc.status_id=1 and mail.user_id in (${users}) group by mail.user_id;
    select count(*) as 'count',tpl.assigned_id as 'user_id' from (select count(DISTINCT subject_num) as 'resolved',ac.depa_id,mail.assigned_id from amazon_service_stored as mail left join 
    amazon_service_accounts as ac ON
    (mail._from=ac.mail_address or mail._to=ac.mail_address)  where disposed_status_id=${Status.resolved.value} and ac.depa_id in (${orgGroupIdsArr}) and ac.status_id=1 and  type_id=0 group by mail.assigned_id,mail.subject_num ${hasTimeStored} ORDER BY mail.assigned_id) as tpl group by tpl.assigned_id;`,
        cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
//获取客服单个账号下的相应时间区间的往来邮件
Home.prototype.getServiceAllMails = function (data) {
    let cmdParams = [],
        cmdText = ``,
        hasTimeStored = data.start_time && data.end_time ? ` and timer BETWEEN '${data.start_time}' and
    '${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date(data.end_time).getTime() + 24*60*60*1000)))}'` : data.start_time && !data.end_time ? ` and timer BETWEEN '${data.start_time}' and
     '${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date().getTime() + 24*60*60*1000)))}'` : !data.start_time && data.end_time ? ` and timer BETWEEN '${Core.flyer.formatDate('yyyy-mm-dd', new Date('2017-09-30'))}' and
     '${Core.flyer.formatDate('yyyy-mm-dd', new Date(new Date().setTime(new Date(data.end_time).getTime() + 24*60*60*1000)))}'` : ``;
    data.services instanceof Array && data.services.forEach(function (obj, index) {
        cmdText += `select timer,event,subject_num from amazon_service_stored sto left join amazon_service_email_types tps on sto.type_id=tps.ID inner join (select depa_id,status_id,mail_address from amazon_service_accounts)
        ac on (ac.mail_address=sto._from or ac.mail_address=sto._to) where ac.status_id=1 and assigned_id=${obj} ${hasTimeStored} and  (tps.is_KPI=1 or tps.is_KPI is null)  order by timer;`
    });
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}

module.exports = Home;
