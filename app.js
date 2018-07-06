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

// 入口
app.get("/", function(req, res, next) {
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