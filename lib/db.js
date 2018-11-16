/*
 * 数据层的工厂
 */
"use strict";
let mysql = require("mysql"),
    Config = require('./config'),
    UserManage = require("./manage_user_db"),
    NoticeManage = require("./manage_notice_db"),
    PackageManage = require("./manage_package_db"),
    LogsScoreManage = require("./manage_logs_score_db"),
    TbTask = require("./tb_task_db"),
    TaskKeywordQuantity = require("./task_keyword_quantity_db"),
    AdviceFeedbackManage = require("./manage_advice_feedback_db"),
    HomeAccountView = require("./home_account_view_db"),
    ManageTaskType = require("./manage_task_type_db"),
    ManageKbType = require("./manage_kb_type_db"),
    ManageKbNumber = require("./manage_kb_number_db"),
    ManageKbOrder = require("./manage_kb_order_db"),
    ManageKbAddress = require("./manage_kb_address_db"),
    OperateOverview = require("./operate_overview_db"),
    yidian_db = process.env.NODE_ENV === 'production' ? Config.yidian_db_pro : Config.yidian_db_dev,
    pool = mysql.createPool({
        host: yidian_db.host,
        user: yidian_db.user.replace(/@/g, ''),
        password: yidian_db.password.replace(/#/g, ''),
        database: yidian_db.database.replace(/&/g, ''),
        port: yidian_db.port,
        multipleStatements: yidian_db.multipleStatements
    });

let dbQuery = {};
dbQuery.userManage = new UserManage(pool);
dbQuery.noticeManage = new NoticeManage(pool);
dbQuery.packageManage = new PackageManage(pool);
dbQuery.logsScoreManage = new LogsScoreManage(pool);
dbQuery.tbTask = new TbTask(pool);
dbQuery.taskKeywordQuantity = new TaskKeywordQuantity(pool);
dbQuery.adviceFeedbackManage = new AdviceFeedbackManage(pool);
dbQuery.homeAccountView = new HomeAccountView(pool);
dbQuery.manageTaskType = new ManageTaskType(pool);
dbQuery.manageKbType = new ManageKbType(pool);
dbQuery.manageKbNumber = new ManageKbNumber(pool);
dbQuery.manageKbOrder = new ManageKbOrder(pool);
dbQuery.manageKbAddress = new ManageKbAddress(pool);
dbQuery.operateOverview = new OperateOverview(pool);
module.exports.dbQuery = dbQuery;