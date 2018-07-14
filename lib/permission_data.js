"use strict";
//模块集
let modules = {
        home: {
            url: "home.html",
            pageName: "首页",
            hash: "home",
            icons: "home",
            hasTag: false,
            isMenu: true
        },
        task_create: {
            url: "task_create.html",
            pageName: "创建任务",
            hash: "task_create",
            icons: "add_shopping_cart",
            hasTag: false,
            isMenu: true
        },
        task_template: {
            url: "manage_task_template.html",
            pageName: "任务模版",
            hash: "manage_task_template",
            icons: "book",
            hasTag: false,
            isMenu: true
        },
        manage_logs: {
            url: "manage_logs.html",
            pageName: "日志管理",
            hash: "manage_logs",
            icons: "search",
            hasTag: false,
            isMenu: true
        },
        manage_task: {
            url: "manage_task.html",
            pageName: "任务管理",
            hash: "manage_task",
            icons: "equalizer",
            hasTag: false,
            isMenu: true
        },
        money_manage: {
            url: "manage_money.html",
            pageName: "财务管理",
            hash: "manage_money",
            icons: "attach_money",
            hasTag: true,
            isMenu: true
        },
        user_manage: {
            url: "manage_user.html",
            pageName: "用户管理",
            hash: "manage_user",
            icons: "group",
            hasTag: true,
            isMenu: true
        },
        plant_manage: {
            url: "manage_plant.html",
            pageName: "平台管理",
            hash: "manage_plant",
            icons: "apps",
            hasTag: false,
            isMenu: true
        },
        notice_manage: {
            url: "manage_notice.html",
            pageName: "通知管理",
            hash: "manage_notice",
            icons: "notifications",
            hasTag: false,
            isMenu: true
        }
    },
    //用户角色集
    roles = {
        // 管理员
        9103: ["home", "manage_task", "plant_manage", "notice_manage", "user_manage", "task_create", "manage_logs", "money_manage", "task_template"],
        // 普通用户
        9102: ["home", "manage_task", "plant_manage", "notice_manage", "user_manage", "task_create", "manage_logs", "money_manage", "task_template"],
    }

exports.roles = roles;
exports.modules = modules;