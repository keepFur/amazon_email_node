"use strict";
//模块集
let modules = {
        home: {
            url: "home.html",
            pageName: "首页",
            hash: "home",
            icons: "icon-home",
            hasTag: false,
            isMenu: true
        },
        order_manage: {
            url: "order_manage.html",
            pageName: "订单管理",
            hash: "templates",
            icons: "icon-templates",
            hasTag: false,
            isMenu: true
        },
        plant_manage: {
            url: "plant_manage.html",
            pageName: "平台管理",
            hash: "plant_manage",
            icons: "icon-add-template",
            hasTag: false,
            isMenu: true
        },
        user_manage: {
            url: "user_manage.html",
            pageName: "用户管理",
            hash: "user_manage",
            icons: "icon-send",
            hasTag: true,
            isMenu: true
        },
        tb_task: {
            url: "tb_task.html",
            pageName: "淘宝任务",
            hash: "tb_task",
            icons: "icon-sent-mails",
            hasTag: false,
            isMenu: true
        },
        jd_task: {
            url: "jd_task.html",
            pageName: "京东任务",
            hash: "jd_task",
            icons: "icon-sent-mails",
            hasTag: false,
            isMenu: true
        },
        money_manage: {
            url: "money_manage.html",
            pageName: "财务管理",
            hash: "money_manage",
            icons: "icon-unfinish",
            hasTag: true,
            isMenu: true
        },
        task_template: {
            url: "task_template.html",
            pageName: "任务模版",
            hash: "task_template",
            icons: "icon-my-folder",
            hasTag: false,
            isMenu: true
        }
    },
    //用户角色集
    roles = {
        // 管理员
        9103: ["home", "order_manage", "plant_manage", "user_manage", "tb_task", "jd_task", "money_manage", "task_template"],
        // 普通用户
        9102: ["home", "order_manage", "plant_manage", "user_manage", "tb_task", "jd_task", "money_manage", "task_template"],
    }

exports.roles = roles;
exports.modules = modules;