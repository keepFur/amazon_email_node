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
        add_money: {
            url: "add_money.html",
            pageName: "积分充值",
            hash: "add_money",
            icons: "library_add",
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
        },
        create_advice_feedback: {
            url: "create_advice_feedback.html",
            pageName: "意见反馈",
            hash: "create_advice_feedback",
            icons: "feedback",
            hasTag: false,
            isMenu: true
        },
        manage_advice_feedback: {
            url: "manage_advice_feedback.html",
            pageName: "意见管理",
            hash: "manage_advice_feedback",
            icons: "feedback",
            hasTag: false,
            isMenu: true
        }
    },
    //用户角色集
    roles = {
        // 管理员
        super: ["home", "add_money", "manage_task", "plant_manage", "notice_manage", "user_manage", "task_create", "manage_logs", "money_manage", "task_template", "manage_advice_feedback"],
        // 普通用户
        common: ["home", "add_money", "manage_task", "task_create", "manage_logs", "create_advice_feedback"],
    };
exports.roles = roles;
exports.modules = modules;