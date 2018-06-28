"use strict";
let DB = require("./db"),
    Core = require("./core"),
    EnumStatus = require("./status"),
    turn_status = function (pool, groupPool) {
        this.pool = pool;
        this.groupPool = groupPool;
    };
//处理未处理解决转换
turn_status.prototype.updateDisposedState = function (data) {
    let cmdParams = [],
        subs = data.data.map((obj, index) => {
            return "'" + obj + "'";
        }).join(","),
        cmdText = `update amazon_service_stored set disposed_status_id=${data.status},disposed_status_name='${data.name}',finish_time=${Core.flyer.formatDate(data.time, 'yyyy-mm-dd hh:MM:ss')} where subject_num in (${subs})`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}

//分派未分派转换
turn_status.prototype.updateState = function (data) {
    let cmdParams = JSON.parse(data.data),
        upLength = '(';
    cmdParams.forEach(function (ele, index) {
        if (index !== cmdParams.length - 1) {
            upLength += "?,";
        } else {
            upLength += "?)";
        }
    });
    cmdParams.unshift(data.assignName);
    cmdParams.unshift(data.name);
    cmdParams.unshift(data.status);
    cmdParams.unshift(data.assignId);
    let cmdText = "update amazon_service_stored set assigned_id=?, status_id=?,status_name=?,assigned_name=? where subject_num in" + upLength;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}
//将已发送邮件分派或
turn_status.prototype.updateStateById = function (data) {
    let cmdParams = [],
    cmdText = `update amazon_service_stored set assigned_id=${data.assignId}, status_id=${data.status},status_name='${data.name}',assigned_name='${data.assignName}' where subject_num in (select a.subject_num from (select subject_num from amazon_service_stored a where ID='${data.id}') a)`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}
//将已发送邮件转为已解决
turn_status.prototype.updatedisposeById = function (data) {
    let cmdParams = [],
    cmdText = `update amazon_service_stored set disposed_status_id=${data.status},disposed_status_name='${data.name}',finish_time=${Core.flyer.formatDate(data.time, 'yyyy-mm-dd hh:MM:ss')} where subject_num in (select a.subject_num from (select subject_num from amazon_service_stored a where ID='${data.id}') a)`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
}

turn_status.prototype.getGroupList = function (data) {
    let cmdParams = [], cmdText = ``, upLength = `(`;
    if (data.serachInputValue) {
        if (data.serachInputValue.length === 1) {
            cmdText = `select count(*) as count from user u
            inner join user_org_micro ur on u.user_id = ur.user_id
            where org_category_id = ? and org_group_id = ? and org_id = 40  and (account LIKE '%${data.serachInputValue[0]}%' OR email LIKE '%${data.serachInputValue}%' ) and u.func_state=1;select * from user u
            inner join user_org_micro ur on u.user_id = ur.user_id
            where org_category_id = ? and org_group_id = ? and org_id = 40 and (account LIKE '%${data.serachInputValue[0]}%' OR email LIKE '%${data.serachInputValue}%' ) and u.func_state=1 limit ?,?`;
        } else if (data.serachInputValue.length > 1) {
            data.serachInputValue.forEach(function (item, index) {
                if (index !== data.serachInputValue.length - 1) {
                    upLength += `'${item}',`;
                } else {
                    upLength += `'${item}')`;
                }
            });
            cmdText = `select count(*) as count from user u
            inner join user_org_micro ur on u.user_id = ur.user_id
            where org_category_id = ? and org_group_id = ? and org_id = 40  and (account IN ${upLength} OR email IN ${upLength} ) and u.func_state=1;select * from user u
            inner join user_org_micro ur on u.user_id = ur.user_id
            where org_category_id = ? and org_group_id = ? and org_id = 40 and (account IN ${upLength} OR email IN ${upLength} ) and u.func_state=1 limit ?,?`;
        }
    } else {
        cmdText = `select count(*) as count from user u
        inner join user_org_micro ur on u.user_id = ur.user_id
        where org_category_id = ? and org_group_id = ? and org_id = 40 and u.func_state=1;select * from user u
        inner join user_org_micro ur on u.user_id = ur.user_id
        where org_category_id = ? and org_group_id = ? and org_id = 40 and u.func_state=1 limit ?,?`;
    }
    for (let prop in JSON.parse(data.data)) {
        cmdParams.push(JSON.parse(data.data)[prop]);
    }
    cmdParams.pop();
    cmdParams.forEach(function (obj, index) {
        cmdParams.push(obj);
    })
    cmdParams.push((data.pageNumber - 1) * 15);
    cmdParams.push(15);
    return Core.flyer.return_promise(this.groupPool, cmdText, cmdParams);
}

module.exports = turn_status;