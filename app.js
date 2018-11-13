"use strict";
let express = require("express"),
    path = require("path"),
    app = express(),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    permissionData = require("./lib/permission_data"),
    Package = require("./package"),
    Core = require("./lib/core"),
    userMiddleware = require('./lib/middleware/user'),
    favicon = require('serve-favicon'),
    upload = require('./lib/upload'),
    Cookie = require('cookie-parser');


// 业务逻辑模块
let UserManage = require('./lib/manage_user_service');
let userManage = new UserManage();
let PlantManage = require('./lib/manage_kb_type_service');
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
let ManageTaskType = require('./lib/manage_task_type_service');
let manageTaskType = new ManageTaskType();
let ManageKbType = require('./lib/manage_kb_type_service');
let manageKbType = new ManageKbType();
let ManageKbNumber = require('./lib/manage_kb_number_service');
let manageKbNumber = new ManageKbNumber();
let ManageKbOrder = require('./lib/manage_kb_order_service');
let manageKbOrder = new ManageKbOrder();
let ManageKbAddress = require('./lib/manage_kb_address_service');
let manageKbAddress = new ManageKbAddress();
let APIUtil = require('./lib/api_util');
let APIPay = require('./lib/api_pay');
let APIArea = require('./lib/api_area');
let LieliuApi = require('./lib/lieliu_api');
let TenMessageApi = require('./lib/ten_message_api');
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

// 过滤未登录的用户
app.all('/api/*', function (req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
});

// 获取每天的流量购买数量
app.get('/api/readTaskCountOfInTime', function (req, res) {
    try {
        homeAccountView.readTaskCountOfInTime(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取每天的空包购买数量
app.get('/api/readKbCountOfInTime', function (req, res) {
    try {
        homeAccountView.readKbCountOfInTime(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取每天的创建流量类型
app.get('/api/readTaskTypeOfInTime', function (req, res) {
    try {
        homeAccountView.readTaskTypeOfInTime(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取每天的购买空包类型
app.get('/api/readKbTypeOfInTime', function (req, res) {
    try {
        homeAccountView.readKbTypeOfInTime(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取每天的充值金额
app.get('/api/readAddMoneyOfInTime', function (req, res) {
    try {
        homeAccountView.readAddMoneyOfInTime(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/************* 用户管理模块*************/

// 获取用户列表，支持分页
app.get('/api/readUserPage', function (req, res) {
    try {
        userManage.readUserPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取用户
app.get('/api/readUserById', function (req, res) {
    try {
        userManage.readUserById(req, res, { id: req.user.id });
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 创建用户
app.post('/front/createUser', function (req, res) {
    try {
        userManage.createUser(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 用户登录（后台）
app.post('/api/userLogin', function (req, res) {
    try {
        userManage.userLogin(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 用户登录（前端）
app.post('/front/userLogin', function (req, res) {
    try {
        userManage.userLogin(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 退出登录
app.get('/api/logout', function (req, res) {
    try {
        req.session.destroy(function (err) {
            if (err) throw err;
            res.redirect('/');
        });
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换用户状态
app.post('/api/toggleUser', function (req, res) {
    try {
        userManage.toggleUser(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 用户升级 
app.post('/api/updateLevelUser', function (req, res) {
    try {
        userManage.updateLevelUser(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 用户充值
app.post('/api/userAddMoney', function (req, res) {
    try {
        userManage.addMoneyUser(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 用户信息修改
app.post('/api/updateUser', function (req, res) {
    try {
        userManage.updateUser(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取用户的登录状态
app.get('/front/getUserLoginStatus', function (req, res) {
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

// 获取验证码
app.get('/front/getVerfiyCode', function (req, res) {
    try {
        if (!req.query.userPhone || req.query.userPhone.length !== 11) {
            res.send({
                code: '',
                success: false
            });
        }
        TenMessageApi.getVerfiyCode(req, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 重置密码（后台）
app.post('/api/setUserPassword', function (req, res) {
    try {
        userManage.setUserPassword(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 重置密码（前台）
app.post('/front/setUserPassword', function (req, res) {
    try {
        userManage.setUserPassword(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 根据手机号和用户名获取用户信息
app.get('/front/getUserInfoByPhone', function (req, res) {
    try {
        userManage.getUserInfoByPhone(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/***************平台管理模块路由*************/
// 获取平台列表，支持分页
app.get('/api/readPlantPage', function (req, res) {
    try {
        plantMange.readPlantPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取平台信息
app.get('/api/readPlantById', function (req, res) {
    try {
        plantMange.readPlantById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 创建平台
app.post('/api/createPlant', function (req, res) {
    try {
        plantMange.createPlant(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换平台状态
app.post('/api/togglePlant', function (req, res) {
    try {
        plantMange.togglePlant(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 修改平台信息
app.post('/api/updatePlant', function (req, res) {
    try {
        plantMange.updatePlant(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/***************通知管理模块路由*************/
// 获取通知列表，支持分页
app.get('/front/readNoticePage', function (req, res) {
    try {
        noticeMange.readNoticePage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取通知列表，支持分页(后台使用)
app.get('/api/readNoticePage', function (req, res) {
    try {
        noticeMange.readNoticePage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取通知信息
app.get('/api/readNoticeById', function (req, res) {
    try {
        noticeMange.readNoticeById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 创建通知
app.post('/api/createNotice', function (req, res) {
    try {
        noticeMange.createNotice(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换通知状态
app.post('/api/toggleNotice', function (req, res) {
    try {
        noticeMange.toggleNotice(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 修改通知信息
app.post('/api/updateNotice', function (req, res) {
    try {
        noticeMange.updateNotice(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/***********************淘宝任务模块**********************/
// 创建任务 
app.post('/api/createTask', function (req, res) {
    try {
        tbTask.createTask(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 创建任务,提交到列流
app.get('/lieliuApi/createTask', function (req, res) {
    try {
        LieliuApi.createTask(req, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过列流查询任务
app.get('/lieliuApi/listTask', function (req, res) {
    try {
        LieliuApi.listTask(req, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过列流取消任务
app.get('/lieliuApi/cancelTask', function (req, res) {
    try {
        LieliuApi.cancelTask(req, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过列流暂停或启动任务
app.get('/lieliuApi/pauseAndResumeTask', function (req, res) {
    try {
        LieliuApi.pauseAndResumeTask(req, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取任务列表，支持分页
app.get('/api/readTaskPage', function (req, res) {
    try {
        tbTask.readTaskPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取所有的未处理任务
app.get('/api/readAllProcessTask', function (req, res) {
    try {
        tbTask.readAllProcessTask(req, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取任务信息
app.get('/api/readTaskById', function (req, res) {
    try {
        tbTask.readTaskById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换任务状态
app.post('/api/toggleTask', function (req, res) {
    try {
        tbTask.toggleTask(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 根据任务订单号，奖任务标记为已完成
app.post('/api/maskCompleteTask', function (req, res) {
    try {
        tbTask.maskCompleteTask(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 修改任务信息
app.post('/api/updateTask', function (req, res) {
    try {
        tbTask.updateTask(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取淘宝详情
app.get('/api/getTbDetail', function (req, res) {
    try {
        tbTask.getTbDetail(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/***********************空包模块**********************/
// 创建空包 
app.post('/api/createKbOrder', function (req, res) {
    try {
        manageKbOrder.createKbOrder(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取空包订单列表，支持分页
app.get('/api/readKbOrderPage', function (req, res) {
    try {
        manageKbOrder.readKbOrderPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取订单信息
app.get('/api/readKbOrderById', function (req, res) {
    try {
        manageKbOrder.readKbOrderById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换订单状态
app.post('/api/toggleKbOrder', function (req, res) {
    try {
        manageKbOrder.toggleKbOrder(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 修改订单信息
app.post('/api/updateKbOrder', function (req, res) {
    try {
        manageKbOrder.updateKbOrder(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 导出空包
app.get('/api/exportKbOrderToExcel', function (req, res) {
    try {
        manageKbOrder.exportKbOrderToExcel(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 拼多多批量发货导出空包
app.get('/api/pddBatch', function (req, res) {
    try {
        manageKbOrder.pbbBtach(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 导出待扫描空包
app.get('/api/downloadKbOrderToExcel', function (req, res) {
    try {
        manageKbOrder.downloadKbOrderToExcel(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 下载发货地址模版
app.get('/api/downloadTemplate', function (req, res) {
    try {
        manageKbOrder.downloadTemplate(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过excel导入发货地址
app.post('/api/importAddressExcel', function (req, res) {
    try {
        upload(req, res).then((file) => {
            manageKbOrder.importAddressExcel(req, res, file);
        });
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过excel导入空包单号
app.post('/api/importKbNumberExcel', function (req, res) {
    try {
        upload(req, res).then((file) => {
            manageKbOrder.importKbNumberExcel(req, res, file);
        });
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 下载空包单号模版
app.get('/api/downloadKbNumberTemplate', function (req, res) {
    try {
        manageKbOrder.downloadKbNumberTemplate(req, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/***********************空包地址模块**********************/
// 创建空包地址
app.post('/api/createKbAddress', function (req, res) {
    try {
        manageKbAddress.createKbAddress(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取空包地址列表
app.get('/api/readKbAddress', function (req, res) {
    try {
        manageKbAddress.readKbAddress(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取空包地址信息
app.get('/api/readKbAddressById', function (req, res) {
    try {
        manageKbAddress.readKbAddressById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换空包地址状态
app.post('/api/toggleKbAddress', function (req, res) {
    try {
        manageKbAddress.toggleKbAddress(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 修改空包地址信息
app.post('/api/updateKbAddress', function (req, res) {
    try {
        manageKbAddress.updateKbAddress(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});


/***********************充值套餐模块**********************/
// 创建套餐
app.post('/api/createPackage', function (req, res) {
    try {
        packageManage.createPackage(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取套餐列表，支持分页
app.get('/api/readPackagePage', function (req, res) {
    try {
        packageManage.readPackagePage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取套餐信息
app.get('/api/readPackageById', function (req, res) {
    try {
        packageManage.readPackageById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换套餐状态
app.post('/api/togglePackage', function (req, res) {
    try {
        packageManage.togglePackage(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 修改套餐信息
app.post('/api/updatePackage', function (req, res) {
    try {
        packageManage.updatePackage(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 生成付款二维码
app.post('/api/createQrCode', function (req, res) {
    try {
        APIPay.checkStandCreateQr(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取某一个二维码的支付状态
app.get('/api/getQrCodePayStatus', function (req, res) {
    try {
        APIPay.getPayStatus(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

//  接收付款有赞推送的消息
app.post('/api/getYouzanPushMessgae', function (req, res) {
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

/* *****************钱包日志类****************** */
// 创建钱包日志
app.post('/api/createLogsScore', function (req, res) {
    try {
        logsScoreManage.createLogsScore(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取日志金额列表，支持分页
app.get('/api/readLogsScorePage', function (req, res) {
    try {
        logsScoreManage.readLogsScorePage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取日志金额信息
app.get('/api/readLogsScoreById', function (req, res) {
    try {
        logsScoreManage.readLogsScoreById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换日志金额状态
app.post('/api/toggleLogsScore', function (req, res) {
    try {
        logsScoreManage.toggleLogsScore(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});


/* *****************用户意见反馈****************** */
// 创建反馈意见
app.post('/api/createAdviceFeedback', function (req, res) {
    try {
        advicFeedbackManage.createAdviceFeedback(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取意见反馈列表列表，支持分页
app.get('/api/readAdviceFeedbackPage', function (req, res) {
    try {
        advicFeedbackManage.readAdviceFeedbackPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 通过id获取反馈信息
app.get('/api/readAdviceFeedbackById', function (req, res) {
    try {
        advicFeedbackManage.readAdviceFeedbackById(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换反馈信息状态
app.post('/api/toggleAdviceFeedback', function (req, res) {
    try {
        advicFeedbackManage.toggleAdviceFeedback(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/* *****************基础数据之任务类型****************** */
// 创建任务类型
app.post('/api/createTaskType', function (req, res) {
    try {
        manageTaskType.createTaskType(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取任务类型（不分页）
app.get('/api/readTaskType', function (req, res) {
    try {
        manageTaskType.readTaskType(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 修改任务类型
app.post('/api/updateTaskType', function (req, res) {
    try {
        manageTaskType.updateTaskType(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换任务类型状态
app.post('/api/toggleTaskType', function (req, res) {
    try {
        manageTaskType.toggleTaskType(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/* *****************基础数据之空包类型****************** */
// 创建空包类型
app.post('/api/createKbType', function (req, res) {
    try {
        manageKbType.createKbType(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取空包类型（不分页）
app.get('/api/readKbType', function (req, res) {
    try {
        manageKbType.readKbType(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 修改空包类型
app.post('/api/updateKbType', function (req, res) {
    try {
        manageKbType.updateKbType(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换空包类型状态
app.post('/api/toggleKbType', function (req, res) {
    try {
        manageKbType.toggleKbType(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

/* *****************基础数据之空包单号****************** */
// 创建空包单号
app.post('/api/createKbNumber', function (req, res) {
    try {
        manageKbNumber.createKbNumber(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取空包单号
app.get('/api/readKbNumberPage', function (req, res) {
    try {
        manageKbNumber.readKbNumberPage(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});

//修改空包单号
app.post('/api/updateKbNumber', function (req, res) {
    try {
        manageKbNumber.updateKbNumber(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 切换空包单号状态
app.post('/api/toggleKbNumber', function (req, res) {
    try {
        manageKbNumber.toggleKbOrder(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取空包单号使用情况
app.get('/api/readKbNumberStock', function (req, res) {
    try {
        manageKbNumber.readKbNumberStock(req, res, req.query);
    } catch (error) {
        Core.flyer.log(error);
    }
});
/* *****************API工具类****************** */
//生成signkey签名
app.post('/api/generateSignKey', function (req, res) {
    try {
        APIUtil.generateSignkey(req, res, req.body);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 获取所有的省份
app.get('/api/getProvince', function (req, res) {
    try {
        APIArea.getProvince(req, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 根据省份code获取城市
app.get('/api/getCityByCode', function (req, res) {
    try {
        APIArea.getCityByCode(req, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 根据城市code获取区
app.get('/api/getAreaByCode', function (req, res) {
    try {
        APIArea.getAreaByCode(req, res);
    } catch (error) {
        Core.flyer.log(error);
    }
});

// 入口
app.get("/console", function (req, res, next) {
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
                menus: menus.filter(function (item) {
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
app.get('/', function (req, res) {
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
app.get("/error", function (req, res, next) {
    try {
        res.render("error.ejs", {
            package: Package,
            user: res.locals.user
        });
    } catch (err) {
        Core.flyer.log(err);
    }
});

// 捕获所有的异常(必须放到最后)
app.all('*', function (req, res, next) {
    res.redirect('/error');
});

// 启动服务
app.listen(Package.webPort, function () {
    Core.flyer.log("已经成功启动服务.....");
});