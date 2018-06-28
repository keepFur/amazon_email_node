/*
* 用于 文件夹相关 模块功能的数据实现
*/
"use strict";
let Core = require("./core"),
config = require("./config"),
EnumStatus = require("./status");
var userFiles = function (pool) {
  this.pool = pool;
};
//获取用户文件夹
userFiles.prototype.getFileList = function (data) {
  let offset = (data.pageNumber - 1) * 15,
  hasLimit = data.pageNumber?`limit ${offset},15`:``,
  cmdParam = [data.depa_id,data.depa_id],
  //总数据
  cmdText = `select count(ID) as count from amazon_service_email_types where depa_id = ?;
  select * from amazon_service_email_types where depa_id = ? ${hasLimit};
  `;
  return Core.flyer.return_promise(this.pool, cmdText, cmdParam);
};
//判断用户文件夹是否存在
userFiles.prototype.justifyFile = function (data) {
    let cmdParam = [data.fileName,data.depa_id],
    //总数据
    cmdText = `select count(ID) as 'count' from amazon_service_email_types where type_name=? and depa_id=?`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParam);
};
//新增用户文件夹
userFiles.prototype.addFile = function (data) {
    let cmdParam = [data.type_name,data.depa_id,data.create_by_name,Core.flyer.formatDate('yyyy-mm-dd hh:MM:ss',new Date(Number(data.time)))],
    //总数据
    cmdText = `insert into amazon_service_email_types (type_name,depa_id,created_by_name,create_date) 
    values 
    (?,?,?,?)`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParam);
};
//删除用户文件夹
userFiles.prototype.deleteFile = function (data) {
    let cmdParam = [],
    //总数据(删除文件夹内所有的邮件文件夹状态)
    folders = data.fileID.map(function(obj,index){
        return "'"+obj+"'";
    }).join(","),
    cmdText = `delete from amazon_service_email_types where ID in (${folders});update  amazon_service_stored set type_id=0 where type_id in (${folders})`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParam);
};
//移出文件夹邮件
userFiles.prototype.removeOutEmail = function (data) {
    let cmdParam = [].concat(data.subjects,[data.typ_id]),
    //总数据(删除文件夹内所有的邮件文件夹状态)
    subjects = '(';
    data.subjects.forEach(function(obj,index){
        if(index !== data.subjects.length-1){
            subjects += '?,'
        }else{
            subjects += '?)'
        }
    });
    let cmdText = `update  amazon_service_stored set type_id=0 where subject_num in ${subjects} and type_id=?`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParam);
};
//修改用户文件夹
userFiles.prototype.updateFile = function (data) {
    let cmdParam = [data.type_name,data.update_name,Core.flyer.formatDate('yyyy-mm-dd hh:MM:ss',new Date(Number(data.time))),Number(data.isKpi),data.fileID],
    //总数据
    cmdText = `update amazon_service_email_types set type_name=?,update_by_name=?,update_date=?,is_KPI=? where ID=?;`
    return Core.flyer.return_promise(this.pool, cmdText, cmdParam);
};

//更新邮件类型
userFiles.prototype.updateFileType = function (data) {
    let subs = data.fileID,
    cmdParam = [subs],
    cmdText = `update amazon_service_stored set type_id=${data.type_id} where subject_num in (?)`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParam);
};

//获取各个文件夹内部的邮件
userFiles.prototype.type_number = function (data) {
    let cmdParam = [data.type_id],
    //总数据
    paramMore = data.groupID===config['const']['managerCode']?` type_id=? and (_from in (select mail_address from amazon_service_accounts where depa_id=${data.orgGroupId})
     or _to in (select mail_address from amazon_service_accounts where depa_id=${data.orgGroupId})) group by subject_num) as temp`:` and assigned_id=${data.user_id}`,
    cmdText = `select count(ID) as 'countAll' from (select * from amazon_service_stored where`+ paramMore;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParam);
};
//获取各个文件夹内部的邮件数量
userFiles.prototype.getAccountByname = function (data,queryData) {
    let cmdParam = [],
    //总数据
    cmdText = ``,
    //四种状态合集
    ifManager = queryData.orgCode === '9102'?``:` and assigned_id=${queryData.create_by_id}`,
    groupMap = ` and (_from in (select mail_address from amazon_service_accounts where depa_id=${queryData.orgGroupId}) or 
    _to in (select mail_address from amazon_service_accounts where depa_id=${queryData.orgGroupId}))`,
    statusArr = [
        `and disposed_status_id=${EnumStatus.undisposed.value} ${ifManager}`,
        `and disposed_status_id=${EnumStatus.disposed.value} ${ifManager}`,
        `and disposed_status_id=${EnumStatus.undisposed.value} ${ifManager} and status_id=${EnumStatus.unassigned.value}`,
        `and disposed_status_id=${EnumStatus.undisposed.value} ${ifManager} and status_id=${EnumStatus.assigned.value}`,
        ``,
        `and disposed_status_id=${EnumStatus.resolved.value} ${ifManager}`
    ];
    data.forEach(function(obj,index){
        for(let i=0;i<6;i++){
            cmdText += `
            select count(*) as '${obj.ID}' from (select * from amazon_service_stored
           where type_id=${obj.ID} ${statusArr[i]} ${groupMap} group by subject_num) as tpl
            ;`;
        }
    })
    return Core.flyer.return_promise(this.pool, cmdText, cmdParam);
};
module.exports = userFiles;
