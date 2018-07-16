/*
 * 数据层的工厂
 */
"use strict";
let mysql = require("mysql"),
    Config = require('./config'),
    UserManage = require("./manage_user_db"),
    PlantManage = require("./manage_plant_db"),
    NoticeManage = require("./manage_notice_db"),
    PackageManage = require("./manage_package_db"),
    LogsScoreManage = require("./manage_logs_score_db"),
    TbTask = require("./tb_task_db"),
    TaskKeywordQuantity = require("./task_keyword_quantity_db"),
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
dbQuery.plantManage = new PlantManage(pool);
dbQuery.noticeManage = new NoticeManage(pool);
dbQuery.packageManage = new PackageManage(pool);
dbQuery.logsScoreManage = new LogsScoreManage(pool);
dbQuery.tbTask = new TbTask(pool);
dbQuery.taskKeywordQuantity = new TaskKeywordQuantity(pool);
module.exports.dbQuery = dbQuery;