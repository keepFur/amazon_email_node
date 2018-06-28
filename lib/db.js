/*
* 数据层的工厂
*/
"use strict";
let mysql = require("mysql"),
  Email = require("./db_emails"),
  Template = require("./db_templates"),
  Order = require("./db_order"),
  Receive = require("./db_receive"),
  Turn_status = require("./db_turn_status"),
  Status_list = require("./db_status_list"),
  GroupList = require("./db_group_list"),
  Home = require("./db_home_data"),
  Config = require("./config"),
  UserFiles = require("./db_manage_file"),
  SensitiveWord = require("./db_sensitive_word"),
  FilterEmail = require("./db_filter_email"),
  OtherAccount = require("./db_other_account"),
  ReceivingEmailRules = require('./db_receiving_email_rules'),
  RelationAccount = require('./db_relation_account'),
  CustomerComplaintHistory = require('./db_customer_complaint_history'),
  Countries = require('./db_countries'),
  ProductType = require('./db_product_types'),
  QuestionType = require('./db_question_types'),
  ProductGroup = require('./db_product_group'),
  Product = require('./db_products'),
  ResolveMethod = require('./db_resolve_method'),
  StoreRelation = require('./db_store_relation'),
  ShopManage = require('./db_shop_manage'),
  Language = require('./db_language'),
  Statistic = require('./db_statistic'),
  EmailSendAbnormal = require('./db_email_send_abnormal'),
  Maillog = require('./db_maillog'),
  Satisfaction = require('./db_satisfaction'),
  orderPool = mysql.createPool({
    host: Config.order_db.host,
    user: Config.order_db.user,
    password: Config.order_db.password,
    database: Config.order_db.database,
    port: Config.order_db.port,
    multipleStatements: Config.order_db.multipleStatements
  }),
  groupPool = mysql.createPool({
    host: Config.cas_db.host,
    user: Config.cas_db.user,
    password: Config.cas_db.password,
    database: Config.cas_db.database,
    port: Config.cas_db.port,
    multipleStatements: Config.cas_db.multipleStatements
  }),
  pool = mysql.createPool({
    host: Config.acs_db.host,
    user: Config.acs_db.user,
    password: Config.acs_db.password,
    database: Config.acs_db.database,
    port: Config.acs_db.port,
    multipleStatements: Config.acs_db.multipleStatements
  }),
  slice = Array.prototype.slice;

let dbQuery = {};
(dbQuery.email = new Email(pool));
(dbQuery.template = new Template(pool));
(dbQuery.order = new Order(orderPool, pool));
(dbQuery.receive = new Receive(pool));
(dbQuery.turn_status = new Turn_status(pool, groupPool));
(dbQuery.status_list = new Status_list(pool));
(dbQuery.groupList = new GroupList(groupPool));
(dbQuery.home = new Home(pool, groupPool));
(dbQuery.sensitiveWord = new SensitiveWord(pool));
(dbQuery.filterEmail = new FilterEmail(groupPool, pool));
(dbQuery.userFiles = new UserFiles(pool));
(dbQuery.otherAccount = new OtherAccount(pool));
(dbQuery.receivingEmailRules = new ReceivingEmailRules(pool, dbQuery.receive));
(dbQuery.relationAccount = new RelationAccount(pool));
(dbQuery.customerComplaintHistory = new CustomerComplaintHistory(pool));
(dbQuery.countries = new Countries(pool));
(dbQuery.productType = new ProductType(pool));
(dbQuery.questionType = new QuestionType(pool));
(dbQuery.productGroup = new ProductGroup(pool));
(dbQuery.product = new Product(pool));
(dbQuery.resolveMethod = new ResolveMethod(pool));
(dbQuery.storeRelation = new StoreRelation(pool));
(dbQuery.shopManage = new ShopManage(pool, groupPool));
(dbQuery.language = new Language(pool, groupPool));
(dbQuery.emailSendAbnormal = new EmailSendAbnormal(pool));
(dbQuery.statistic = new Statistic(pool));
(dbQuery.maillog = new Maillog(pool));
(dbQuery.satisfaction = new Satisfaction(pool));
module.exports.dbQuery = dbQuery;
