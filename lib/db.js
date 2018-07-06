/*
 * 数据层的工厂
 */
"use strict";
let mysql = require("mysql"),
    Config = require('./config'),
    UserManage = require("./db_user_manage"),
    pool = mysql.createPool({
        host: Config.yidian_db.host,
        user: Config.yidian_db.user,
        password: Config.yidian_db.password,
        database: Config.yidian_db.database,
        port: Config.yidian_db.port,
        multipleStatements: Config.yidian_db.multipleStatements
    });

let dbQuery = {};
dbQuery.userManage = new UserManage(pool);
module.exports.dbQuery = dbQuery;