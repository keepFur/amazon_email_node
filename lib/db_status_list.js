"use strict";
let DB = require("./db"),
  Core = require("./core"),
  Status = require("./status"),
  status_list = function (pool) {
    this.pool = pool;
  };
//客服数据
status_list.prototype.getStateList = function (data) {
  let cmdText = `select count(*) as 'undisposed' from (select _to,_from,subject_num,disposed_status_id,status_id,assigned_id,type_id from amazon_service_stored st
      inner join (select mail_address,depa_id,status_id as status from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address ) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and assigned_id=? and st.disposed_status_id=? and  st.type_id=0 group by SUBJECT_NUM) as tpl;
      select count(*) as 'disposed' from (select _to,_from,subject_num,disposed_status_id,status_id,assigned_id,type_id from amazon_service_stored st
      inner join (select mail_address,depa_id,status_id as status from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and assigned_id=? and st.disposed_status_id=? and st.type_id=0 group by SUBJECT_NUM) as tpl;
      select count(*) as 'unassigned' from (select _to,_from,subject_num,disposed_status_id,status_id,assigned_id,type_id from amazon_service_stored st
      inner join (select mail_address,depa_id,status_id as status from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and assigned_id=? and st.status_id=? and st.disposed_status_id=? and st.type_id=0 group by SUBJECT_NUM) as tpl;
      select count(*) as 'assigned' from (select _to,_from,subject_num,disposed_status_id,status_id,assigned_id,type_id from amazon_service_stored st
      inner join (select mail_address,depa_id,status_id as status from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and assigned_id=? and st.status_id=? and st.disposed_status_id=? and st.type_id=0 group by SUBJECT_NUM) as tpl;
      select count(*) as 'resolved' from (select _to,_from,subject_num,disposed_status_id,status_id,assigned_id,type_id from amazon_service_stored st
      inner join (select mail_address,depa_id,status_id as status from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and assigned_id=? and st.disposed_status_id=? and st.type_id=0 group by SUBJECT_NUM) as tpl;
    `,
    //五个状态名
    cmdParams = [data.user_id, Status.undisposed.value,
    data.user_id, Status.disposed.value,
    data.user_id, Status.unassigned.value, Status.undisposed.value,
    data.user_id, Status.assigned.value, Status.undisposed.value,
    data.user_id, Status.resolved.value
    ];
  return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}

//主管数据
status_list.prototype.getStateListManager = function (data) {
  let cmdText = `call proc_menu_email_total_tips(?,?)`,
    cmdParams = [data.orgGroupId, data.type_id || 0];
  return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
  // let cmdText =`select count(*) as 'undisposed' from (select _to,_from,subject_num,disposed_status_id,status_id,type_id from amazon_service_stored st
  // inner join (select mail_address,depa_id from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address) where ac.depa_id = ${data.orgGroupId} and st.disposed_status_id=? and st.type_id=0 group by SUBJECT_NUM) as tpl;
  // select count(*) as 'disposed' from (select _to,_from,subject_num,disposed_status_id,status_id,type_id from amazon_service_stored st
  // inner join (select mail_address,depa_id from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address) where ac.depa_id = ${data.orgGroupId} and st.disposed_status_id=? and st.type_id=0 group by SUBJECT_NUM) as tpl;
  // select count(*) as 'unassigned' from (select _to,_from,subject_num,disposed_status_id,status_id,type_id from amazon_service_stored st
  // inner join (select mail_address,depa_id from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address) where ac.depa_id = ${data.orgGroupId} and st.status_id=? and st.disposed_status_id=? and st.type_id=0 group by SUBJECT_NUM) as tpl;
  // select count(*) as 'assigned' from (select _to,_from,subject_num,disposed_status_id,status_id,type_id from amazon_service_stored st
  // inner join (select mail_address,depa_id from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address) where ac.depa_id = ${data.orgGroupId} and st.status_id=? and st.disposed_status_id=? and st.type_id=0 group by SUBJECT_NUM) as tpl;
  // select count(*) as 'resolved' from (select _to,_from,subject_num,disposed_status_id,status_id,type_id from amazon_service_stored st
  // inner join (select mail_address,depa_id from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address) where ac.depa_id = ${data.orgGroupId} and st.disposed_status_id=? and st.type_id=0 group by SUBJECT_NUM) as tpl;
  // `,
  // //五个状态名
  // cmdParams = [Status.undisposed.value,
  //               Status.disposed.value,
  //               Status.unassigned.value,Status.undisposed.value,
  //               Status.assigned.value,Status.undisposed.value,
  //               Status.resolved.value
  //             ];
  // return Core.flyer.return_promise(this.pool,cmdText,cmdParams);
}
//文件夹客服气泡数据
status_list.prototype.getFolderStateList = function (data) {
  let cmdText = `select count(*) as 'undisposed' from (select _to,_from,subject_num,disposed_status_id,status_id,assigned_id,type_id from amazon_service_stored st
    inner join (select mail_address,depa_id,status_id as status from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and assigned_id=? and st.disposed_status_id=? and st.type_id=${data.type_id} group by SUBJECT_NUM) as tpl;
    select count(*) as 'disposed' from (select _to,_from,subject_num,disposed_status_id,status_id,assigned_id,type_id from amazon_service_stored st
    inner join (select mail_address,depa_id,status_id as status from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and assigned_id=? and st.disposed_status_id=? and st.type_id=${data.type_id} group by SUBJECT_NUM) as tpl;
    select count(*) as 'unassigned' from (select _to,_from,subject_num,disposed_status_id,status_id,assigned_id,type_id from amazon_service_stored st
    inner join (select mail_address,depa_id,status_id as status from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and assigned_id=? and st.status_id=? and st.disposed_status_id=? and st.type_id=${data.type_id} group by SUBJECT_NUM) as tpl;
    select count(*) as 'assigned' from (select _to,_from,subject_num,disposed_status_id,status_id,assigned_id,type_id from amazon_service_stored st
    inner join (select mail_address,depa_id,status_id as status from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and assigned_id=? and st.status_id=? and st.disposed_status_id=? and st.type_id=${data.type_id} group by SUBJECT_NUM) as tpl;
    select count(*) as 'resolved' from (select _to,_from,subject_num,disposed_status_id,status_id,assigned_id,type_id from amazon_service_stored st
    inner join (select mail_address,depa_id,status_id as status from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and assigned_id=? and st.disposed_status_id=? and st.type_id=${data.type_id} group by SUBJECT_NUM) as tpl;
  `,
    //五个状态名
    cmdParams = [data.user_id, Status.undisposed.value,
    data.user_id, Status.disposed.value,
    data.user_id, Status.unassigned.value, Status.undisposed.value,
    data.user_id, Status.assigned.value, Status.undisposed.value,
    data.user_id, Status.resolved.value
    ];
  return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}

//文件夹主管气泡数据
status_list.prototype.getFolderStateListManager = function (data) {
  let cmdText = `select count(*) as 'undisposed' from (select _to,_from,subject_num,disposed_status_id,status_id,type_id from amazon_service_stored st
inner join (select mail_address,depa_id,status_id as status from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and st.disposed_status_id=? and st.type_id=${data.type_id} group by SUBJECT_NUM) as tpl;
select count(*) as 'disposed' from (select _to,_from,subject_num,disposed_status_id,status_id,type_id from amazon_service_stored st
inner join (select mail_address,depa_id,status_id as status  from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and st.disposed_status_id=? and st.type_id=${data.type_id} group by SUBJECT_NUM) as tpl;
select count(*) as 'unassigned' from (select _to,_from,subject_num,disposed_status_id,status_id,type_id from amazon_service_stored st
inner join (select mail_address,depa_id,status_id as status  from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and st.status_id=? and st.disposed_status_id=? and st.type_id=${data.type_id} group by SUBJECT_NUM) as tpl;
select count(*) as 'assigned' from (select _to,_from,subject_num,disposed_status_id,status_id,type_id from amazon_service_stored st
inner join (select mail_address,depa_id,status_id as status  from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and st.status_id=? and st.disposed_status_id=? and st.type_id=${data.type_id} group by SUBJECT_NUM) as tpl;
select count(*) as 'resolved' from (select _to,_from,subject_num,disposed_status_id,status_id,type_id from amazon_service_stored st
inner join (select mail_address,depa_id,status_id as status  from amazon_service_accounts) ac on (st._to=ac.mail_address or st._from=ac.mail_address or st.message_recipients = ac.mail_address) where ac.depa_id = ${data.orgGroupId} and ac.status = 1 and st.disposed_status_id=? and st.type_id=${data.type_id} group by SUBJECT_NUM) as tpl;
`,
    //五个状态名
    cmdParams = [Status.undisposed.value,
    Status.disposed.value,
    Status.unassigned.value, Status.undisposed.value,
    Status.assigned.value, Status.undisposed.value,
    Status.resolved.value
    ];
  return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}
module.exports = status_list;