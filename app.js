"use strict";
let express = require("express"),
    path = require("path"),
    app = express(),
    bodyParser = require("body-parser"),
    url = require('url'),
    Config = require("./lib/config"),
    session = require("express-session"),
    md5 = require("blueimp-md5"),
    permissionData = require("./lib/permission_data"),
    Package = require("./package"),
    Core = require("./lib/core"),
    userMiddleware = require('./lib/middleware/user'),
    favicon = require('serve-favicon'),
    Cookie = require('cookie-parser');


// 业务逻辑模块
let UserManage = require('./lib/manage_user_service');
let userManage = new UserManage();
let PlantManage = require('./lib/manage_plant_service');
let plantMange = new PlantManage();
let NoticeManage = require('./lib/manage_notice_service');
let noticeMange = new NoticeManage();
let TbTask = require('./lib/tb_task_service');
let tbTask = new TbTask();
let PackageManage = require('./lib/manage_package_service');
let packageManage = new PackageManage();
let LogsScoreManage = require('./lib/manage_logs_score_service');
let logsScoreManage = new LogsScoreManage();
let AdviceFeedbackManage = require('./lib/manage_advice_feedback_service');
let advicFeedbackManage = new AdviceFeedbackManage();
let HomeAccountView = require('./lib/home_account_view_service');
let homeAccountView = new HomeAccountView();
let APIUtil = require('./lib/api_util');
let APIPay = require('./lib/api_pay');

app.use(session({
    secret: `${Math.random(10)}`, //secret的值建议使用随机字符串
    cookie: { maxAge: 60 * 1000 * 60 }, // 过期时间（毫秒）
    proxy: true,
    resave: true,
    saveUninitialized: false,
    rolling: true
}));

app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(Cookie());
app.use(express.static("src"));
app.use(userMiddleware);
app.use('/html', express.static("src/html"));
app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: '15mb'
    })
);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('src', path.join('src'));


/************* 首页账号预览模块*************/

// 获取每天的创建任务数量
app.get('/api/readTaskCountOfInTime', function(req, res) {
    try {
        homeAccountView.readTaskCountOfInTime(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取每天的创建任务类型
app.get('/api/readTaskTypeOfInTime', function(req, res) {
    try {
        homeAccountView.readTaskTypeOfInTime(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取媒体的充值积分
app.get('/api/readAddMoneyOfInTime', function(req, res) {
    try {
        homeAccountView.readAddMoneyOfInTime(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/************* 用户管理模块*************/

// 获取用户列表，支持分页
app.get('/api/readUserPage', function(req, res) {
    try {
        userManage.readUserPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取用户
app.get('/api/readUserById', function(req, res) {
    try {
        userManage.readUserById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 创建用户
app.post('/api/createUser', function(req, res) {
    try {
        userManage.createUser(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 用户登录
app.post('/api/userLogin', function(req, res) {
    try {
        userManage.userLogin(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 退出登录
app.get('/api/logout', function(req, res) {
    try {
        req.session.destroy(function(err) {
            if (err) throw err;
            res.redirect('/');
        });
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换用户状态
app.post('/api/toggleUser', function(req, res) {
    try {
        userManage.toggleUser(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 用户升级 
app.post('/api/updateLevelUser', function(req, res) {
    try {
        userManage.updateLevelUser(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 用户充值
app.post('/api/userAddMoney', function(req, res) {
    try {
        userManage.addMoneyUser(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 用户信息修改
app.post('/api/updateUser', function(req, res) {
    try {
        userManage.updateUser(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取用户的登录状态
app.get('/api/getUserLoginStatus', function(req, res) {
    try {
        if (req.user) {
            res.send({
                status: true
            });
        } else {
            res.send({
                status: false
            });
        }
    } catch (error) {
        Core.flyer.log(error);
    }
});
/***************平台管理模块路由*************/
// 获取平台列表，支持分页
app.get('/api/readPlantPage', function(req, res) {
    try {
        plantMange.readPlantPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取平台信息
app.get('/api/readPlantById', function(req, res) {
    try {
        plantMange.readPlantById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 创建平台
app.post('/api/createPlant', function(req, res) {
    try {
        plantMange.createPlant(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换平台状态
app.post('/api/togglePlant', function(req, res) {
    try {
        plantMange.togglePlant(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 修改平台信息
app.post('/api/updatePlant', function(req, res) {
    try {
        plantMange.updatePlant(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/***************通知管理模块路由*************/
// 获取通知列表，支持分页
app.get('/api/readNoticePage', function(req, res) {
    try {
        noticeMange.readNoticePage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取通知信息
app.get('/api/readNoticeById', function(req, res) {
    try {
        noticeMange.readNoticeById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 创建通知
app.post('/api/createNotice', function(req, res) {
    try {
        noticeMange.createNotice(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换通知状态
app.post('/api/toggleNotice', function(req, res) {
    try {
        noticeMange.toggleNotice(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 修改通知信息
app.post('/api/updateNotice', function(req, res) {
    try {
        noticeMange.updateNotice(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/***********************淘宝任务模块**********************/
// 创建任务 
app.post('/api/createTask', function(req, res) {
    try {
        tbTask.createTask(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取任务列表，支持分页
app.get('/api/readTaskPage', function(req, res) {
    try {
        tbTask.readTaskPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取任务信息
app.get('/api/readTaskById', function(req, res) {
    try {
        tbTask.readTaskById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换任务状态
app.post('/api/toggleTask', function(req, res) {
    try {
        tbTask.toggleTask(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 修改任务信息
app.post('/api/updateTask', function(req, res) {
    try {
        tbTask.updateTask(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/***********************充值套餐模块**********************/
// 创建套餐
app.post('/api/createPackage', function(req, res) {
    try {
        packageManage.createPackage(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取套餐列表，支持分页
app.get('/api/readPackagePage', function(req, res) {
    try {
        packageManage.readPackagePage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取套餐信息
app.get('/api/readPackageById', function(req, res) {
    try {
        packageManage.readPackageById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换套餐状态
app.post('/api/togglePackage', function(req, res) {
    try {
        packageManage.togglePackage(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 修改套餐信息
app.post('/api/updatePackage', function(req, res) {
    try {
        packageManage.updatePackage(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 生成付款二维码
app.post('/api/createQrCode', function(req, res) {
    try {
        // APIPay.createQrCode(req, res, req.body);
        APIPay.checkStandCreateQr(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取某一个二维码的支付状态
app.get('/api/getQrCodePayStatus', function(req, res) {
    try {
        APIPay.getPayStatus(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

//  接收付款有赞推送的消息
app.post('/api/getYouzanPushMessgae', function(req, res) {
    try {
        let message = JSON.parse(req.body);
        // 1. 判断消息是否测试— > 解析 test
        if (!message.test) {
            // 2. 判断消息推送的模式— > 解析 mode
            if (message.mode === 1) {
                // 3. 判断消息是否伪造— > 解析 sign
                // 4. 判断消息版本— > 解析 version
                // 5. 判断消息的业务— > 解析 type
                if (message.type === 'TRADE_ORDER_STATE') {
                    // 6. 处理消息体— > 解码 msg， 反序列化消息结构体
                    res.send({
                        ver: message.version,
                        msg: decodeURIComponent(message.msg)
                    });
                }
            }
        }
        // 7. 返回接收成功标识 { "code": 0, "msg": "success" }
        res.body = { code: 0, msg: 'success' };
    } catch (error) {
        Core.flyer.log(error);
    }
});

/* *****************积分日志类****************** */
// 创建日志积分
app.post('/api/createLogsScore', function(req, res) {
    try {
        logsScoreManage.createLogsScore(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取日志积分列表，支持分页
app.get('/api/readLogsScorePage', function(req, res) {
    try {
        logsScoreManage.readLogsScorePage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取日志积分信息
app.get('/api/readLogsScoreById', function(req, res) {
    try {
        logsScoreManage.readLogsScoreById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换日志积分状态
app.post('/api/toggleLogsScore', function(req, res) {
    try {
        logsScoreManage.toggleLogsScore(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});


/* *****************用户意见反馈****************** */
// 创建反馈意见
app.post('/api/createAdviceFeedback', function(req, res) {
    try {
        advicFeedbackManage.createAdviceFeedback(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取意见反馈列表列表，支持分页
app.get('/api/readAdviceFeedbackPage', function(req, res) {
    try {
        advicFeedbackManage.readAdviceFeedbackPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取反馈信息
app.get('/api/readAdviceFeedbackById', function(req, res) {
    try {
        advicFeedbackManage.readAdviceFeedbackById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换反馈信息状态
app.post('/api/toggleAdviceFeedback', function(req, res) {
    try {
        advicFeedbackManage.toggleAdviceFeedback(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/* *****************API工具类****************** */
//生成signkey签名
app.post('/api/generateSignKey', function(req, res) {
    try {
        APIUtil.generateSignkey(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 入口
app.get("/console", function(req, res, next) {
    Core.flyer.log('开始进入项目:' + new Date());
    try {
        if (res.locals.user) {
            // 第一步：判断用户是否是管理员
            // 第二步：获取用户对应的权限keys
            // 第三步：根据keys过滤出对应的modules，得到menu
            // 第四步：根据menu进行渲染
            let modules = permissionData.modules;
            let roles = permissionData.roles;
            let menus = [];
            let userModuleKeys = res.locals.user.isSuper ? roles['super'] : roles['common'];
            for (var key in modules) {
                if (modules.hasOwnProperty(key)) {
                    var element = modules[key];
                    if (userModuleKeys.indexOf(key) !== -1) {
                        menus.push(element);
                    }
                }
            }
            res.render("index.ejs", {
                menus: menus.filter(function(item) {
                    return item.isMenu === true;
                }),
                package: Package,
                user: res.locals.user
            });
            Core.flyer.log('已经进入项目:当前路由:"/"' + new Date());
        } else {
            Core.flyer.log("用户未登录：" + (req.session.hasOwnProperty("sign") && req.session.sign));
            res.redirect('/');
        }
    } catch (err) {
        Core.flyer.log('进入项目发生异常:当前路由:"/"' + err);
        res.redirect("/error");
    }
});

// 回到首页
app.get('/', function(req, res) {
    try {
        res.render('front.ejs', {
            package: Package,
            user: res.locals.user
        });
    } catch (error) {
        res.redirect('/error');
    }
});

// 没有权限
app.get("/error", function(req, res, next) {
    try {
        res.render("error.ejs", {
            package: Package,
            user: res.locals.user
        });
    } catch (err) {
        Core.flyer.log(err);
    }
});

// 启动服务
app.listen(Package.webPort, function() {
    Core.flyer.log("已经成功启动服务.....");
});