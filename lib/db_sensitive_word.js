/*
 * 用于 敏感词 模块功能的数据实现
 */
"use strict";
let Core = require("./core");
// 构建函数
let SensitiveWord = function (pool) {
    this.pool = pool;
};
// 转换查询参数，传入一个数组，返回字符串
SensitiveWord.prototype.convertParams = function (arr) {
    var str = '(';
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
};
// 获取所有的敏感词(通过敏感字,单个的话，支持模糊，多个查询的话，只能是精确查询)，类型查询
SensitiveWord.prototype.get = function (params) {
    let cmd = `SELECT id,type_name,name,weight FROM amazon_service_sensitivewords WHERE depa_id = ${params.orgGroupId} `, cmdParams = [], names = '';
    if (typeof params === 'object') {
        // 如果有敏感词
        if (Array.isArray(params.name) && params.name.length) {
            // 单个模糊
            if (params.name.length === 1) {
                if (params.isExact) {
                    cmd += ` AND name = '${params.name[0]}' `;
                } else {
                    cmd += ` AND  name LIKE '%${params.name[0]}%' `;
                }
            } else {
                // 多个精确查询
                names = this.convertParams(params.name);
                cmd += `AND  name IN ` + names;
                cmdParams = cmdParams.concat(params.name);
            }
        }
        // 如果选择了类型查询
        if (params.type_id && params.type_id !== 'all') {
            cmd += ` AND type_id = ? `;
            cmdParams.push(params.type_id);
        }
        cmd += ` ORDER BY id DESC `;
    }
    return Core.flyer.return_promise(this.pool, cmd, cmdParams);
};
// 新增敏感词（支持批量）
SensitiveWord.prototype.add = function (params) {
    let cmd = `INSERT INTO amazon_service_sensitivewords (type_name,type_id,name,create_id,depa_id) VALUES`, cmdParams = [];
    if (typeof params === 'object') {
        params.names.forEach(function (name, index) {
            if (index !== params.names.length - 1) {
                cmd += '(?,?,?,?,?),';
            } else {
                cmd += '(?,?,?,?,?)';
            }
            // 先使用默认的类型
            cmdParams.push('默认' || params.type_name);
            cmdParams.push('1' || params.type_id);
            cmdParams.push(name);
            cmdParams.push(params.createId);
            cmdParams.push(params.orgGroupId);
        });
        return Core.flyer.return_promise(this.pool, cmd, cmdParams);
    }
    return;
};
// 删除敏感词（支持批量）
SensitiveWord.prototype.delete = function (params) {
    let cmd = `DELETE FROM amazon_service_sensitivewords WHERE id IN `, ids = '', cmdParams = [];
    if (Array.isArray(params.ids) && params.ids.length) {
        ids = this.convertParams(params.ids);
        cmd += ids;
        cmdParams = params.ids;
        return Core.flyer.return_promise(this.pool, cmd, cmdParams);
    }
    return;
};
// 编辑敏感词（单个操作）
SensitiveWord.prototype.edit = function (params) {
    let cmd = ``, cmdParams = [];
    if (typeof params === 'object') {
        if (params.name && params.id) {
            cmd = `update amazon_service_sensitivewords set name= ? where id=?`;
            cmdParams = [params.name, params.id];
            return Core.flyer.return_promise(this.pool, cmd, cmdParams);
        }
        return;
    }
    return;
};
// 编辑敏感词类型（支持批量）
SensitiveWord.prototype.editType = function (params) {
    let cmd = ``, cmdParams = [], ids = ``;
    if (typeof params === 'object') {
        if (params.type_name && Array.isArray(params.ids) && params.ids.length) {
            ids = this.convertParams(params.ids);
            cmd = `update amazon_service_sensitivewords set type_name= ? where id IN ` + ids;
            cmdParams = [params.type_name].concat(params.ids);
            return Core.flyer.return_promise(this.pool, cmd, cmdParams);
        }
        return;
    }
    return;
};
// 获取所有的类型(支持类型名称搜索)
SensitiveWord.prototype.getType = function (params) {
    let _this = this, cmd = 'select * from amazon_service_sensitivewords_type where  depa_id = ? order by id desc', cmdParams = [params.orgGroupId], names = '';
    if (typeof params === 'object') {
        if (params.name) {
            names = _this.convertParams(params.name);
            cmd = `select * from amazon_service_sensitivewords_type where depa_id = ? and  name in ` + names;
            cmdParams = [params.orgGroupId].concat(params.name);
        }
        return Core.flyer.return_promise(this.pool, cmd, cmdParams);
    }
    return;
};
// 新增类型（支持批量）
SensitiveWord.prototype.addType = function (params) {
    let cmd = 'INSERT INTO amazon_service_sensitivewords_type (name,create_id,depa_id) VALUES', cmdParams = [];
    if (typeof params === 'object' && params.names.length) {
        params.names.forEach(function (name, index) {
            if (index !== params.names.length - 1) {
                cmd += '(?,?,?),';
            } else {
                cmd += '(?,?,?)';
            }
            cmdParams.push(name);
            cmdParams.push(params.createId);
            cmdParams.push(params.orgGroupId);
        });
        return Core.flyer.return_promise(this.pool, cmd, cmdParams);
    }
    return;
};
// 通过id删除类型（支持批量）
SensitiveWord.prototype.deleteBatchType = function (ids) {
    let _this = this, cmd = '', cmdParams = [], str = '';
    if (Array.isArray(ids) && ids.length) {
        str = _this.convertParams(ids);
        cmdParams = ids;
        cmd = 'delete from amazon_service_sensitivewords_type where id in ' + str + ';delete from amazon_service_sensitivewords where type_id in ' + str + ';';
        return Core.flyer.return_promise(this.pool, cmd, cmdParams);
    }
    return;
};
// 修改类型名称（支持批量）parmas={ids:[],newType:'A'}
SensitiveWord.prototype.editTypeName = function (params) {
    let _this = this, cmd = '', cmdParams = [], ids = '';
    if (typeof params === 'object' && params.ids.length && params.newType) {
        ids = this.convertParams(params.ids);
        cmd = `update amazon_service_sensitivewords_type set name = ? where id IN ` + ids;
        cmdParams = [params.newType].concat(params.ids);
        return Core.flyer.return_promise(this.pool, cmd, cmdParams);
    }
    return;
};
// 暴露接口
module.exports = SensitiveWord;