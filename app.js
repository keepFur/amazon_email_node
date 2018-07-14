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
let APIUtil = require('./lib/api_util');

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
        if (true) {
            // let username = req.session.username,
            //     isMulti = req.session.isMulti,
            //     permissionData = req.session.permissionData,
            //     permissionAllData = req.session.permissionAllData,
            //     menus = permissionData.permission.menus[0].menuData,
            //     roles = permissionData.permission.roles[0].rolesData;

            // if (req.cookies["orgGroupId" + username]) {
            //     permissionData = Core.flyer.findPermissionByGroupID(req.cookies["orgGroupId" + username], req.session.permissionData);
            // }
            let modules = permissionData.modules;
            let menus = [];
            for (var key in modules) {
                if (modules.hasOwnProperty(key)) {
                    var element = modules[key];
                    menus.push(element);
                }
            }
            let roles = permissionData.roles;
            res.render("index.ejs", {
                menus: menus.filter(function(item) {
                    return item.isMenu === true;
                }),
                roles: roles,
                logout: Config.url_list.redirect_logout,
                package: Package,
                baiyi_home: Config.url_list.baiyi_home,
                isMulti: false,
                username: 'surong'
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

// 回到首页
app.get('/', function(req, res) {
    try {
        res.render('front.ejs', {
            package: Package
        });
    } catch (error) {
        res.redirect('/error');
    }
});

//开发入口
app.get("/index_dev", function(req, res, next) {
    try {
        if (req.session.hasOwnProperty("sign") && req.session.sign) {
            // let username = req.session.username,
            //     isMulti = req.session.isMulti,
            //     permissionData = req.session.permissionData,
            //     permissionAllData = req.session.permissionAllData,
            //     menus = permissionData.permission.menus[0].menuData,
            //     roles = permissionData.permission.roles[0].rolesData;
            // if (req.cookies["orgGroupId" + username]) {
            //     permissionData = Core.flyer.findPermissionByGroupID(req.cookies["orgGroupId" + username], req.session.permissionData);
            //     menus = permissionData.permission.menus[0].menuData;
            //     roles = permissionData.permission.roles[0].rolesData;
            // }
            try {
                // let data = {
                //     menus: menus.filter(function(item) {
                //         return item.isMenu === true;
                //     }),
                //     roles: roles,
                //     username: permissionData.data.username,
                //     email: permissionData.data.email,
                //     userid: permissionData.data.userId,
                //     groups: permissionData.data.groups,
                //     groupsAll: permissionAllData.data.groups,
                //     logout: Config.url_list.redirect_logout,
                //     package: Package,
                //     baiyi_home: Config.url_list.baiyi_home,
                //     isMulti: isMulti
                // };
                res.render("index_dev.ejs", {});
            } catch (err) {
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
app.get("/auth", function(req, res, next) {
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
            promise.then(function(permissionData) {
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
            }, function(err) {
                Core.flyer.log('权限验证错误:' + err);
                res.redirect("/error");
            });
        } else {
            Core.flyer.log("权限验证失败，现在为你跳转到登录页...");
            res.redirect(
                Config.url_list.redirect_logout
            );
        }
    } catch (err) {
        Core.flyer.log('权限验证发生异常:' + err);
        res.redirect("/error");
    }
});

//开发验证入口
app.get("/auth_dev", function(req, res, next) {
    try {
        let username = req.query.username;
        if (username) {
            req.session.sign = true;
            req.session.username = username;
            let permission = new Permission({ userName: username });
            let promise = permission.getRoles();
            promise.then(function(permissionData) {
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
            }, function(err) {
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

// 退出
app.get("/logout", function(req, res, next) {
    try {
        req.session.sign = false;
        req.session.username = null;
        res.redirect(Config.url_list.redirect_logout);
    } catch (err) {
        Core.flyer.log(err);
    }
});

// 没有权限
app.get("/error", function(req, res, next) {
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
app.listen(Package.webPort, function() {
    Core.flyer.log("已经成功启动服务.....");
});