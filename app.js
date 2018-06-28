"use strict";
let express = require("express"),
    path = require("path"),
    app = express(),
    Emails = require("./lib/emails"),
    Templates = require("./lib/templates"),
    Order = require("./lib/order"),
    Status_list = require("./lib/status_list"),
    Group_list = require("./lib/group_list"),
    Turn_status = require("./lib/turn_status"),
    Home = require("./lib/home_data"),
    Filter_email = require("./lib/filter_email"),
    Manage_file = require("./lib/manage_file"),
    RelationAccount = require("./lib/relation_account"),
    bodyParser = require("body-parser"),
    url = require('url'),
    upload = require('./lib/upload'),
    download = require('./lib/download'),
    Config = require("./lib/config"),
    session = require("express-session"),
    md5 = require("blueimp-md5"),
    Permission = require("./lib/permission"),
    Package = require("./package"),
    Core = require("./lib/core"),
    OtherAccount = require("./lib/other_account"),
    SensitiveWord = require('./lib/sensitive_word'),
    Cookie = require('cookie-parser'),
    ReceivingEmailRules = require('./lib/receiving_email_rules'),
    CustomerComplaintHistory = require('./lib/customer_complaint_history'),
    Countries = require('./lib/countries'),
    ProductType = require('./lib/product_types'),
    QuestionType = require('./lib/question_types'),
    ProductGroup = require('./lib/product_group'),
    ShopManage = require('./lib/shop_manage'),
    StoreRelation = require('./lib/store_relation'),
    Product = require('./lib/product'),
    Language = require('./lib/language'),
    ResolveMethod = require('./lib/resolve_method'),
    Statistic = require('./lib/statistic'),
    // StoreRelation = require('./lib/store_relation');
    EmailSendAbnormal = require('./lib/email_send_abnormal'),
    Maillog = require('./lib/maillog');
app.use(session({
    secret: `${Math.random(10)}`, //secret的值建议使用随机字符串
    cookie: { maxAge: 60 * 1000 * 60 }, // 过期时间（毫秒）
    proxy: true,
    resave: true,
    saveUninitialized: false,
    rolling: true
}));
app.use(Cookie());
app.use(express.static("src"));
//app.use(express.bodyParser());
app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: '15mb'
    })
);

var email = new Emails(),
    templates = new Templates(),
    order = new Order(),
    turn_status = new Turn_status(),
    status_list = new Status_list(),
    group_list = new Group_list(),
    home = new Home(),
    filter_email = new Filter_email(),
    manage_file = new Manage_file(),
    other_account = new OtherAccount(),
    sensitiveWord = new SensitiveWord(),
    receivingEmailRules = new ReceivingEmailRules(),
    relationAccount = new RelationAccount(),
    customerComplaintHistory = new CustomerComplaintHistory(),
    countries = new Countries(),
    productType = new ProductType(),
    questionType = new QuestionType(),
    productGroup = new ProductGroup(),
    product = new Product(),
    shopManage = new ShopManage(),
    resolveMethod = new ResolveMethod(),
    language = new Language(),
    storeRelation = new StoreRelation(),
    emailSendAbnormal = new EmailSendAbnormal(),
    maillog = new Maillog();
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs');
app.set('src', path.join('src'));
//发送邮件
app.post("/sendEmail/", function (req, res, next) {
    try {
        email.send(req, res, next);
    } catch (err) {
        Core.flyer.log(err);
    }
});

//收取邮件
app.get("/receive/", function (req, res, next) {
    try {
        email.receive(req, res, next);
    } catch (err) {
        Core.flyer.log(err);
    }
});

//添加域
app.post("/addDomain", function (req, res, next) {
    try {
        var newDomain = req.body.newDomain.title;
        email.addNewDomain(newDomain, res);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//删除域
app.get("/deleteDomain", function (req, res, next) {
    try {
        let deleteDomain = JSON.parse(req.query.data)
        email.deleteDomain(res, deleteDomain);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//查询域
app.get("/domainList", function (req, res, next) {
    try {
        let offset = (req.query.pageNumber - 1) * 15;
        email.getInformation(res, offset);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//添加账号
app.post("/addAccount", function (req, res, next) {
    try {
        let usename = req.body.data.title,
            password = req.body.data.password,
            create_at = req.body.create_at,
            domain = req.body.domain
        email.addSmtpUsers(req.body, res);
    } catch (err) {
        Core.flyer.log(err);
    }

});
// 获取账号（通过邮箱地址）
app.get("/get_account_by_address/:address", function (req, res) {
    try {
        email.get_account_by_address(res, req.params.address);
    } catch (err) {
        Core.flyer.log(err);
    }

});
//删除账号
app.get("/deleteAccount", function (req, res, next) {
    try {
        var username = JSON.parse(req.query.data);
        email.deleteSmtpUser(username, res);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//查询账号
app.get("/accountList", function (req, res, next) {
    try {
        var offset = (req.query.pageNumber - 1) * 15;
        email.getSmtpUsers(res, offset, req.query.accountName);
    } catch (err) {
        Core.flyer.log(err);
    }
});

//添加模板
app.post("/addTemplate/", function (req, res, next) {
    try {
        //进入添加业务模块
        templates.add(req.body, res);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//展示模板
app.get("/manageTemplate/", function (req, res, next) {
    try {
        //进入展示业务模块
        templates.show(req.query, res);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//引用模板
app.get("/templateList", function (req, res, next) {

    try {
        //进入展示业务模块
        templates.listTpl(req.query, res);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//删除模板
app.get("/deleteTemplate/", function (req, res, next) {
    try {
        //进入删除业务模块
        templates.delete(JSON.parse(req.query.data), res);
    } catch (err) {
        Core.flyer.log(err);
    }
});

//修改模板
app.post("/updateTemplate", function (req, res, next) {
    try {
        templates.update(req.body, res);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//查询模板
app.get("/editorData/", function (req, res, next) {
    try {
        templates.editorData(req.query, res);
    } catch (err) {
        Core.flyer.log(err);
    }
});
// 获取一个模板信息通过模板的title
app.get('/get_template_by_title', function (req, res) {
    try {
        templates.getTemplateByTitle(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//上传
app.post("/upload/", function (req, res, next) {
    try {
        upload(req, res).then(function (data) { res.send(data) });
    } catch (err) {
        Core.flyer.log(err);
    }

});

// 下载附件
app.get('/download/', download);

//获取相关订单
app.get("/fba_order_list", function (req, res) {
    try {
        //进入获取订单业务流程
        order.getOrder(req.query, res);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//获取已发送邮件
app.get("/post_email_list", function (req, res) {
    try {
        //进入获取已发送
        let data = req.query;
        email.get_post_email(res, data);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//获取未处理邮件
app.get("/unfinish_email_list", function (req, res) {
    try {
        //进入获取已发送
        let data = req.query;
        email.get_unfinish_email(res, data);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//获取已回复邮件
app.get("/finish_email_list", function (req, res) {
    try {
        //进入获取已发送
        let data = req.query;
        email.get_finish_email(res, data);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//获取未分派邮件
app.get("/unassigned_email_list", function (req, res) {
    try {
        //进入获取已发送
        let data = req.query;
        email.get_unassigned_email(res, data);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//获取已分派邮件
app.get("/assigned_email_list", function (req, res) {
    try {
        //进入获取已发送
        let data = req.query;
        email.get_assigned_email(res, data);
    } catch (err) {
        Core.flyer.log(err);
    }

});
//获取已解决邮件
app.get("/resolved_email_list", function (req, res) {
    try {
        //进入获取已发送
        let data = req.query;
        email.resolved_email_list(res, data);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//转换处理未处理状态（包括是否解决转换）
app.get("/turn_disposed_status", function (req, res) {
    try {
        //进入获取已发送
        let data = req.query;
        turn_status.updateDisposedState(res, data);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//获取邮件详情
app.get("/get_email_details", function (req, res) {
    try {
        email.getStoredMessageDetailsByID(res, req.query, req.session);
    } catch (err) {
        Core.flyer.log(err);
    }
});


//分派未分派转换
app.get("/turn_status", function (req, res) {
    try {
        //进入获取已发送
        let data = req.query;
        turn_status.updateState(res, data);
    } catch (err) {
        Core.flyer.log(err);
    }

});
// 已发送详情页面的分派转为分派操作
app.get("/turn_status_byid", function (req, res) {
    try {
        //进入获取已发送
        let data = req.query;
        turn_status.updateStateById(res, data);
    } catch (err) {
        Core.flyer.log(err);
    }

});
// 已发送详情页面的分派转已解决操作
app.get("/turn_dispose_byid", function (req, res) {
    try {
        //进入获取已发送
        let data = req.query;
        turn_status.updatedisposeById(res, data);
    } catch (err) {
        Core.flyer.log(err);
    }

});

//气泡参数获取
app.get("/status_data_list", function (req, res) {
    try {
        res.header("Access-Control-Allow-Origin", "*");
        if (req.session.hasOwnProperty("sign") && req.session.sign && req.query.username === req.session.username) {
            status_list.getStateList(res, req.query);
            //正常获取
        } else if (req.session.hasOwnProperty("sign") && req.session.sign) {
            //返回退出状态
            res.send("change");
        } else {
            res.send("logout");
        }
    } catch (err) {
        Core.flyer.log(err);
    }
})
//文件夹气泡参数获取
app.get("/folder_status_data_list", function (req, res) {
    try {
        status_list.getFolderStateList(res, req.query);
    } catch (err) {
        Core.flyer.log(err);
    }
})
//获取账号分组信息
app.get("/group_list", function (req, res) {
    try {
        var offset = req.query.pageNumber, names = req.query.names;
        group_list.getGroupList(res, offset, names);
    } catch (err) {
        Core.flyer.log(err);
    }

})

//更新账号分组信息
app.post("/update_group", function (req, res) {
    try {
        let update_name = req.body.name;
        let update_id = req.body.id;
        let email_address = req.body.email_address;
        order.updateGroup(res, update_name, update_id, email_address);
    } catch (err) {
        Core.flyer.log(err);
    }

})

//获取收件箱
app.get("/email_list", function (req, res) {
    try {
        let data = req.query;
        email.email_list(res, data);
    } catch (err) {
        Core.flyer.log(err);
    }

})
//获取往来邮件列表
app.get("/get_subject", function (req, res) {
    try {
        let data = req.query;
        email.subject_list(res, data);
    } catch (err) {
        Core.flyer.log(err);
    }
})
//获取首页图标数据
app.get("/home_data", function (req, res) {
    try {
        res.header("Access-Control-Allow-Origin", "*");
        let data = req.query || '';
        home.getData(res, data);
    } catch (err) {
        Core.flyer.log(err);
    }
})


//分派列表查询
app.get('/assign_group_list', function (req, res, next) {
    try {
        let userData = req.query;
        turn_status.getGroupList(res, userData);
    } catch (err) {
        Core.flyer.log(err);
    }

});
// 全局搜索功能(通过关键字)
app.get('/get_email_by_keyword', function (req, res) {
    try {
        email.get_email_by_keyword(res, req.query);
    } catch (err) {
        Core.flyer.log(err);
    }

});
// 获取所有的敏感字符(通过关键字，支持批量查询)
app.get('/get_sensitive_word', function (req, res) {
    try {
        sensitiveWord.get(res, req.query);
    } catch (err) {
        Core.flyer.log(err);
    }
});
// 新增敏感词（支持批量）
app.post('/add_sensitive_word', function (req, res) {
    try {
        sensitiveWord.add(res, req.body);
    } catch (err) {
        Core.flyer.log(err)
    }
});
// 删除敏感词（通过id,接口支持批量，但是页面上的功能不支持批量，防止后面提这个要求）
app.post('/delete_sensitive_word', function (req, res) {
    try {
        sensitiveWord.delete(res, req.body);
    } catch (err) {
        Core.flyer.log(err)
    }
});
// 编辑名称（单个操作）
app.post('/edit_sensitive_word', function (req, res) {
    try {
        sensitiveWord.edit(res, req.body);
    } catch (err) {
        Core.flyer.log(err)
    }
});
// 编辑分类（支持批量操作）
app.post('/edit_type_sensitive_word', function (req, res) {
    try {
        sensitiveWord.editType(res, req.body);
    } catch (err) {
        Core.flyer.log(err)
    }
});
// 获取所有的敏感词类型
app.get('/get_sensitive_type', function (req, res) {
    try {
        sensitiveWord.getType(res, req.query);
    } catch (err) {
        Core.flyer.log(err)
    }
});
// 新增敏感词类型
app.post('/add_type', function (req, res) {
    try {
        sensitiveWord.addType(res, req.body);
    } catch (err) {
        Core.flyer.log(err)
    }
});
// 根据用户输入的文本内容进行敏感词的匹配和过滤，使用的是segment分词node模块,此请求使用post方式，防止文本内容过多导致异常
app.post('/filter_text_by_sensitives', function (req, res) {
    try {
        sensitiveWord.filterTextBySensitives(res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//获取所有处理人
app.get('/email_assigner', function (req, res) {
    try {
        filter_email.getAssigners(req.query, res);
    } catch (err) {
        Core.flyer.log(err)
    }
})
//获取过滤后的表格数据
app.get('/filter_email', function (req, res) {
    try {
        filter_email.filterEmail(req.query, res);
    } catch (err) {
        Core.flyer.log(err)
    }
})
//获取所有的文件夹
app.get('/file_list', function (req, res) {
    try {
        manage_file.getFileList(res, req.query);
    } catch (err) {
        Core.flyer.log(err)
    }
})
//判断是否存在文件夹
app.get('/ifContainFile', function (req, res) {
    try {
        manage_file.justifyFile(res, req.query);
    } catch (err) {
        Core.flyer.log(err)
    }
})
//增加文件夹
app.get('/add_filetype', function (req, res) {
    try {
        manage_file.addFile(res, req.query);
    } catch (err) {
        Core.flyer.log(err)
    }
})
//删除文件夹
app.get('/delete_file', function (req, res) {
    try {
        manage_file.deleteFile(res, req.query);
    } catch (err) {
        Core.flyer.log(err)
    }
})
//邮件移除文件夹
app.get('/remove_email_fold', function (req, res) {
    try {
        manage_file.removeOutEmail(res, req.query);
    } catch (err) {
        Core.flyer.log(err)
    }
})
//修改文件夹名称
app.get('/update_filename', function (req, res) {
    try {
        manage_file.updateFile(res, req.query);
    } catch (err) {
        Core.flyer.log(err)
    }
})
//修改邮件所属文件夹名称
app.get('/update_email_file', function (req, res) {
    try {
        manage_file.updateFileType(res, req.query);
    } catch (err) {
        Core.flyer.log(err)
    }
})
//获取单个文件夹邮件
app.get('/file_email', function (req, res) {
    try {
        manage_file.type_number(res, req.query);
    } catch (err) {
        Core.flyer.log(err)
    }
})
//新增一条其它邮箱账号数据
app.post("/add_other_account", function (req, res, next) {
    try {
        other_account.addInsert(req, res, next);
    } catch (err) {
        Core.flyer.log(err);
    }
});
//判断其他邮箱是否已添加
app.post("/justifyCount", function (req, res, next) {
    try {
        other_account.justifyCount(req, res, next);
    } catch (err) {
        Core.flyer.log(err);
    }
});
//修改一条其它邮箱账号数据
app.post('/update_other_account', function (req, res, next) {
    try {
        other_account.update(req, res, next);
    } catch (err) {
        Core.flyer.log(err);
    }
})
//删除一条其它邮箱账号数据
app.get('/delete_other_account', function (req, res, next) {
    try {
        other_account.delete(req, res, next);
    } catch (err) {
        Core.flyer.log(err);
    }
})
//查询其它邮箱数据
app.get("/select_other_account_list", function (req, res, next) {
    try {
        other_account.select(req, res, next);
    } catch (err) {
        Core.flyer.log(err);
    }
});
//获取单个关联邮箱内部邮件
app.get("/other_email_all", function (req, res, next) {
    try {
        other_account.getOtherEmailall(req, res, next);
    } catch (err) {
        Core.flyer.log(err);
    }
});
//更新关联邮箱的邮件
app.post("/update_other_email", function (req, res, next) {
    try {
        relationAccount.updateOtherEmailAll(req, res);
    } catch (err) {
        Core.flyer.log(err);
    }
});
//更新关联邮箱的邮件
app.get("/update_other_email_count", function (req, res, next) {
    try {
        relationAccount.updateOtherEmailCount(req, res);
    } catch (err) {
        Core.flyer.log(err);
    }
});
//获取关联邮箱内的某条邮件
app.get("/other_detail_single", function (req, res, next) {
    try {
        other_account.getOtherEmailsingle(req, res, next);
    } catch (err) {
        Core.flyer.log(err);
    }
});
// 获取所有的收信规则（支持状态、规则模糊匹配）
app.get('/get_receiving_email_rule_list', function (req, res) {
    try {
        receivingEmailRules.getReceivingEmailRuleList(res, req.query);
    } catch (err) {
        Core.flyer.log(err);
    }
});
// 获取一条收信规则通过id
app.get('/get_receiving_email_rule_by_id', function (req, res) {
    try {
        receivingEmailRules.getReceivingEmailRuleById(res, req.query);
    } catch (err) {
        Core.flyer.log(err);
    }
});

// 新增收信规则（单个操作）
app.post('/add_receiving_email_rule', function (req, res) {
    try {
        receivingEmailRules.addReceivingEmailRule(res, req.body);
    } catch (err) {
        Core.flyer.log(err);
    }
});
// 通过收信规则id删除收信规则（支持批量）
app.post('/delete_receiving_email_rules_by_id', function (req, res) {
    try {
        receivingEmailRules.deleteReceivingEmailRulesById(res, req.body);
    } catch (err) {
        Core.flyer.log(err);
    }
});
// 修改状态
app.post('/refresh_receiving_email_rules_by_id', function (req, res) {
    try {
        receivingEmailRules.refreshReceivingEmailRulesById(res, req.body);
    } catch (err) {
        Core.flyer.log(err);
    }
});
// 编辑收信规则（单个操作）
app.post('/edit_receiving_email_rule', function (req, res) {
    try {
        receivingEmailRules.editReceivingEmailRule(res, req.body);
    } catch (err) {
        Core.flyer.log(err);
    }
});
//客服绩效
app.get('/service_performance', function (req, res) {
    try {
        res.header("Access-Control-Allow-Origin", "*");
        home.getServicePerformance(res, req.query);
    } catch (err) {
        Core.flyer.log(err);
    }
});
// 运行收信规则
app.post('/run_receiving_email_rules_by_id', function (req, res) {
    try {
        receivingEmailRules.runReceivingEmailRulesById(res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 创建客诉记录
app.post('/create_customer_complaint', function (req, res) {
    try {
        customerComplaintHistory.createCustomerComplaint(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取客诉记录（支持分页）
app.get('/read_customer_complaint', function (req, res) {
    try {
        customerComplaintHistory.readCustomerComplaint(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取所有的基础数据
app.get('/read_all_base_datas', function (req, res) {
    try {
        customerComplaintHistory.readAllBaseDatas(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 通过id读取一条客诉记录
app.get('/read_customer_complaint_by_id', function (req, res) {
    try {
        customerComplaintHistory.readCustomerComplaintByID(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 通过订单号读取一条客诉记录
app.get('/read_customer_complaint_by_order_number', function (req, res) {
    try {
        customerComplaintHistory.readCustomerComplaintByOrderNumber(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 更新一条客诉记录
app.post('/update_customer_complaint', function (req, res) {
    try {
        customerComplaintHistory.updateCustomerComplaint(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 删除一条客诉记录
app.post('/delete_customer_complaint', function (req, res) {
    try {
        customerComplaintHistory.deleteCustomerComplaint(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 导出为excel文件
app.get('/export_to_excel_customer_complaint', function (req, res) {
    try {
        customerComplaintHistory.exportToExcelCustomerComplaint(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取国家数据（不分页）
app.get('/read_countries', function (req, res) {
    try {
        countries.readCountries(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取国家数据（分页）
app.get('/read_countries_page', function (req, res) {
    try {
        countries.readCountriesPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 创建国家记录(支持批量)
app.post('/create_countries', function (req, res) {
    try {
        countries.createCountries(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 更新国家记录
app.post('/update_countries', function (req, res) {
    try {
        countries.updateCountries(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 删除国家记录
app.post('/delete_countries', function (req, res) {
    try {
        countries.deleteCountries(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取产品类型
app.get('/read_product_type', function (req, res) {
    try {
        productType.readProductType(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取产品类型（分页）
app.get('/read_product_type_page', function (req, res) {
    try {
        productType.readProductTypePage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 创建产品类型
app.post('/create_product_type', function (req, res) {
    try {
        productType.createProductType(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 更新产品类型
app.post('/update_product_type', function (req, res) {
    try {
        productType.updateProductType(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 删除产品类型
app.post('/delete_product_type', function (req, res) {
    try {
        productType.deleteProductType(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 创建问题类型
app.post('/create_question_type', function (req, res) {
    try {
        questionType.createQuestionType(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取问题类型
app.get('/read_question_type', function (req, res) {
    try {
        questionType.readQuestionType(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取问题类型（分页）
app.get('/read_question_type_page', function (req, res) {
    try {
        questionType.readQuestionTypePage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 更新问题类型
app.post('/update_question_type', function (req, res) {
    try {
        questionType.updateQuestionType(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 删除问题类型
app.post('/delete_question_type', function (req, res) {
    try {
        questionType.deleteQuestionType(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 创建店铺(支持批量)
app.post('/create_store', function (req, res) {
    try {
        shopManage.createStore(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取店铺（分页）
app.get('/read_store_page', function (req, res) {
    try {
        shopManage.readStorePage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取所有的店铺（不分页）
app.get('/read_store_no_page', function (req, res) {
    try {
        shopManage.readStoreNoPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 编辑店铺
app.post('/update_store', function (req, res) {
    try {
        shopManage.updateStore(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 删除店铺（支持批量）
app.post('/delete_store', function (req, res) {
    try {
        shopManage.deleteStore(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//获取所有部门
app.get('/company_org_list', function (req, res) {
    try {
        shopManage.showCompanylist(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取店铺数据（不分页）
app.get('/read_shop_no_page', function (req, res) {
    try {
        shopManage.readStoreNoPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 创建产品分组
app.post('/create_product_group', function (req, res) {
    try {
        productGroup.createProductGroup(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取产品分组
app.get('/read_product_group', function (req, res) {
    try {
        productGroup.readProductGroup(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取产品分组（分页）
app.get('/read_product_group_page', function (req, res) {
    try {
        productGroup.readProductGroupPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 更新产品分组
app.post('/update_product_group', function (req, res) {
    try {
        productGroup.updateProductGroup(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 删除产品分组
app.post('/delete_product_group', function (req, res) {
    try {
        productGroup.deleteProductGroup(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取excel文件
app.post('/import_xls_to_database', function (req, res) {
    try {
        product.readXlsFileData(req, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 创建产品
app.post('/create_product', function (req, res) {
    try {
        product.createProduct(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 修正产品数据
app.post('/adjust_product', function (req, res) {
    try {
        product.adjustProduct(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取产品
app.get('/read_product', function (req, res) {
    try {
        product.readProduct(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取产品通过ID
app.get('/read_product_by_id', function (req, res) {
    try {
        product.readProductByID(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取产品通过SKU
app.get('/read_product_by_sku', function (req, res) {
    try {
        product.readProductBySKU(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 更新产品
app.post('/update_product', function (req, res) {
    try {
        product.updateProduct(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 删除产品
app.post('/delete_product', function (req, res) {
    try {
        product.deleteProduct(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 创建处理方式
app.post('/create_resolve_method', function (req, res) {
    try {
        resolveMethod.createResolveMethod(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取处理方式
app.get('/read_resolve_method', function (req, res) {
    try {
        resolveMethod.readResolveMethod(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 读取处理方式(分页)
app.get('/read_resolve_method_page', function (req, res) {
    try {
        resolveMethod.readResolveMethodPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 更新处理方式
app.post('/update_resolve_method', function (req, res) {
    try {
        resolveMethod.updateResolveMethod(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 删除处理方式
app.post('/delete_resolve_method', function (req, res) {
    try {
        resolveMethod.deleteResolveMethod(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
/**
 * 邮件发送异常
 * cy
 */
//读取邮件发送异常表格
app.get('/read_email_send_abnormal', function (req, res) {
    try {
        emailSendAbnormal.readEmailSendAbnormal(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//更新邮件发送异常，转换为不再显示
app.post('/updata_email_send_abnormal', function (req, res) {
    try {
        emailSendAbnormal.updateEmailSendAbnormal(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//读取发送异常邮件的不再提示的邮件
app.get('/read_abnormal_no_tips', function (req, res) {
    try {
        emailSendAbnormal.readAbnormalNoTips(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//分派店铺
app.get('/store_assign', function (req, res) {
    try {
        storeRelation.assignStore(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//店铺列表
app.get('/store_list', function (req, res) {
    try {
        storeRelation.fetchStore(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//获取当前店铺相关的分组
app.get('/target_store_group', function (req, res) {
    try {
        storeRelation.targetGroup(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//创建语言类型
app.get('/create_language_type', function (req, res) {
    try {
        language.createType(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//改变语言可用状态
app.get('/update_language_status', function (req, res) {
    try {
        language.updateStatus(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//改变语言展示名称
app.get('/update_language_name', function (req, res) {
    try {
        language.updateName(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//语言展示
app.get('/language_list', function (req, res) {
    try {
        language.show(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//新增语言键值
app.get('/create_language_key', function (req, res) {
    try {
        language.createKey(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//改变键值可用状态
app.get('/update_key_status', function (req, res) {
    try {
        language.updateKeyStatus(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//改变键值
app.get('/update_language_key', function (req, res) {
    try {
        language.updateKey(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//删除键值
app.get('/delete_language_key', function (req, res) {
    try {
        language.deleteKey(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//获取所有的键值
app.get('/language_key_list', function (req, res) {
    try {
        language.showKey(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});
//获取分时段数据
app.get('/email_time_statistic', function (req, res) {
    try {
        var _statistic = new Statistic().init(req.query, res);
    } catch (error) {
        Core.flyer.log(error);
    }
})
// 读取操作日志
app.get('/read_mail_log_page', function (req, res) {
    try {
        maillog.readMaillogPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
// 创建操作日志
app.post('/create_mail_log', function (req, res) {
    try {
        maillog.createMaillog(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 手动调整拉去邮件的时间间隔
app.get('/adjust_receive_email_time/:time', function (req, res) {
    try {
        email.adjustReceiveEmailTime(req, res, req.params.time);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 入口
app.get("/", function (req, res, next) {
    Core.flyer.log('开始进入项目:' + new Date());
    try {
        if (req.session.hasOwnProperty("sign") && req.session.sign) {

            let username = req.session.username,
                isMulti = req.session.isMulti,
                permissionData = req.session.permissionData,
                permissionAllData = req.session.permissionAllData,
                menus = permissionData.permission.menus[0].menuData,
                roles = permissionData.permission.roles[0].rolesData;

            if (req.cookies["orgGroupId" + username]) {
                permissionData = Core.flyer.findPermissionByGroupID(req.cookies["orgGroupId" + username], req.session.permissionData);
                menus = permissionData.permission.menus[0].menuData;
                roles = permissionData.permission.roles[0].rolesData;
            }

            res.render("index.ejs", {
                menus: menus.filter(function (item) {
                    return item.isMenu === true;
                }),
                roles: roles,
                username: permissionData.data.username,
                email: permissionData.data.email,
                userid: permissionData.data.userId,
                groups: permissionData.data.groups,
                groupsAll: permissionAllData.data.groups,
                logout: Config.url_list.redirect_logout,
                package: Package,
                baiyi_home: Config.url_list.baiyi_home,
                isMulti: isMulti
            });
            Core.flyer.log('已经进入项目:当前路由:"/"' + new Date());
        } else {
            Core.flyer.log("session验证失败" + (req.session.hasOwnProperty("sign") && req.session.sign));
            res.redirect(
                Config.url_list.redirect_logout
            );
        }
    } catch (err) {
        Core.flyer.log('进入项目发生异常:当前路由:"/"' + err);
        res.redirect("/error");
    }

});

//开发入口
app.get("/index_dev", function (req, res, next) {
    try {
        if (req.session.hasOwnProperty("sign") && req.session.sign) {
            let username = req.session.username,
                isMulti = req.session.isMulti,
                permissionData = req.session.permissionData,
                permissionAllData = req.session.permissionAllData,
                menus = permissionData.permission.menus[0].menuData,
                roles = permissionData.permission.roles[0].rolesData;

            if (req.cookies["orgGroupId" + username]) {
                permissionData = Core.flyer.findPermissionByGroupID(req.cookies["orgGroupId" + username], req.session.permissionData);
                menus = permissionData.permission.menus[0].menuData;
                roles = permissionData.permission.roles[0].rolesData;
            }

            try {
                let data = {
                    menus: menus.filter(function (item) {
                        return item.isMenu === true;
                    }),
                    roles: roles,
                    username: permissionData.data.username,
                    email: permissionData.data.email,
                    userid: permissionData.data.userId,
                    groups: permissionData.data.groups,
                    groupsAll: permissionAllData.data.groups,
                    logout: Config.url_list.redirect_logout,
                    package: Package,
                    baiyi_home: Config.url_list.baiyi_home,
                    isMulti: isMulti
                };

                res.render("index_dev.ejs", data);
            } catch (err) {
                //res.cookies["orgGroupId" + username] = null;
                Core.flyer.log(err);
            }


        } else {
            res.redirect(
                Config.url_list.redirect_logout
            );
        }
    } catch (err) {
        Core.flyer.log(err);
    }
});


//生产验证入口
app.get("/auth", function (req, res, next) {
    Core.flyer.log('开始验证权限:' + new Date());
    try {
        let username = req.query.username,
            jsessionId = req.query.JSESSIONID,
            random_stamp = req.query.random_stamp,
            sign = req.query.sign,
            private_key = "a0d7c029c89548afa934f14bb9c22334";

        let comparValue = md5("JSESSIONID=" + jsessionId + "&random_stamp=" + random_stamp + "&username=" + username + private_key);
        if (username && sign === comparValue) {
            req.session.sign = true;
            req.session.username = username;
            let permission = new Permission({ userName: username });
            let promise = permission.getRoles();
            promise.then(function (permissionData) {
                if (permissionData.data.groups.length === 1) {
                    req.session.permissionData = permissionData;
                    req.session.permissionAllData = permissionData;
                    req.session.isMulti = false;
                } else if (permissionData.data.groups.length > 1) {
                    //判断有多个权限，选择一个进入.
                    req.session.permissionData = permissionData;
                    req.session.permissionAllData = permissionData;
                    req.session.isMulti = true;
                }
                res.redirect("/");
                Core.flyer.log('验证权限完成:' + new Date());
            }, function (err) {
                Core.flyer.log('权限验证错误:' + err);
                res.redirect("/error");
            });
        } else {
            Core.flyer.log("权限验证失败，现在为你跳转到登录页...");
            res.redirect(
                Config.url_list.redirect_logout
            );
            //console.log("登录失败...");
        }
    } catch (err) {
        Core.flyer.log('权限验证发生异常:' + err);
        res.redirect("/error");
    }
});

//开发验证入口
app.get("/auth_dev", function (req, res, next) {
    try {
        let username = req.query.username;
        if (username) {
            req.session.sign = true;
            req.session.username = username;
            let permission = new Permission({ userName: username });
            let promise = permission.getRoles();
            promise.then(function (permissionData) {
                if (permissionData.data.groups.length === 1) {
                    req.session.permissionData = permissionData;
                    req.session.permissionAllData = permissionData;
                    req.session.isMulti = false;
                } else if (permissionData.data.groups.length > 1) {
                    //判断有多个权限，选择一个进入.
                    req.session.permissionData = permissionData;
                    req.session.permissionAllData = permissionData;
                    req.session.isMulti = true;
                }
                res.redirect("/index_dev");
            }, function (err) {
                res.redirect("/error");
            });

        } else {
            res.redirect(
                Config.url_list.redirect_logout
            );
        }
    } catch (err) {
        Core.flyer.log(err);
    }
});

//切换分组账号
app.get("/change_group", function (req, res, next) {
    try {
        let orgGroupId = parseInt(req.query.orgGroupId),
            permissionData = req.session.permissionAllData,
            newPermissionData = Core.flyer.findPermissionByGroupID(orgGroupId, permissionData);
        //     newPermissionData = Core.flyer.deepCopy(permissionData),
        //     findGroup = permissionData.data.groups.find(function (group) { return group.orgGroupId === orgGroupId; }),
        //     findMenu = permissionData.permission.menus.find(function (menu) { return menu.orgGroupId === orgGroupId; }),
        //     findRole = permissionData.permission.roles.find(function (role) { return role.orgGroupId === orgGroupId; });
        if (newPermissionData) {
            //     newPermissionData.data.groups = [];
            //     newPermissionData.data.groups.push(findGroup);
            //     newPermissionData.permission.menus = [];
            //     newPermissionData.permission.menus.push(findMenu);
            //     newPermissionData.permission.roles = [];
            //     newPermissionData.permission.roles.push(findRole);
            req.session.permissionData = newPermissionData;
            res.send({
                code: 200
            });
        } else {
            res.send({
                code: 500,
                msg: "未找到相对应ID为[" + orgGroupId + "]的分组"
            });
            Core.flyer.log("未找到相对应ID为[" + orgGroupId + "]的分组")
        }

    } catch (err) {
        Core.flyer.log(err);
    }
});

//退出
app.get("/logout", function (req, res, next) {
    try {
        req.session.sign = false;
        req.session.username = null;
        res.redirect(Config.url_list.redirect_logout);
    } catch (err) {
        Core.flyer.log(err);
    }
});

//没有权限
app.get("/error", function (req, res, next) {
    try {
        res.render("error.ejs", {
            package: Package,
            baiyi_home: Config.url_list.baiyi_home
        });
    } catch (err) {
        Core.flyer.log(err);
    }
});

// 启动服务
app.listen(Package.webPort, function () {
    Core.flyer.log("已经成功启动服务.....");
});