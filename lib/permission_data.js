"use strict";
//模块集
let modules = {
    home: {
        url: "home.html",
        pageName: "首页",
        hash: "home",
        icons: "layui-icon-home",
        hasTag: false,
        isMenu: true
    },
    task_create: {
        url: "task_create.html",
        pageName: "流量购买",
        hash: "task_create",
        icons: "layui-icon-cart",
        hasTag: false,
        isMenu: true
    },
    manage_task: {
        url: "manage_task.html",
        pageName: "流量订单",
        hash: "manage_task",
        icons: "layui-icon-list",
        hasTag: false,
        isMenu: true
    },
    kb_purchase: {
        url: "kb_purchase.html",
        pageName: "空包购买",
        hash: "kb_purchase",
        icons: "layui-icon-diamond",
        hasTag: false,
        isMenu: true
    },
    manage_kb_order: {
        url: "manage_kb_order.html",
        pageName: "空包订单",
        hash: "manage_kb_order",
        icons: "layui-icon-chart",
        hasTag: false,
        isMenu: true
    },
    manage_basic_data: {
        url: "manage_basic_data.html",
        pageName: "基础数据",
        hash: "manage_basic_data",
        icons: "layui-icon-component",
        hasTag: false,
        isMenu: true
    },
    add_money: {
        url: "add_money.html",
        pageName: "在线充值",
        hash: "add_money",
        icons: "layui-icon-add-circle-fine",
        hasTag: false,
        isMenu: true
    },
    task_template: {
        url: "manage_task_template.html",
        pageName: "任务模版",
        hash: "manage_task_template",
        icons: "layui-icon-template-1",
        hasTag: false,
        isMenu: true
    },
    manage_logs: {
        url: "manage_logs.html",
        pageName: "资金明细",
        hash: "manage_logs",
        icons: "layui-icon-search",
        hasTag: false,
        isMenu: true
    },
    money_manage: {
        url: "manage_money.html",
        pageName: "充值套餐",
        hash: "manage_money",
        icons: "layui-icon-dollar",
        hasTag: true,
        isMenu: true
    },
    user_manage: {
        url: "manage_user.html",
        pageName: "用户管理",
        hash: "manage_user",
        icons: "layui-icon-user",
        hasTag: true,
        isMenu: true
    },

    notice_manage: {
        url: "manage_notice.html",
        pageName: "通知管理",
        hash: "manage_notice",
        icons: "layui-icon-notice",
        hasTag: false,
        isMenu: true
    },
    account_set: {
        url: "account_set.html",
        pageName: "账号设置",
        hash: "account_set",
        icons: "layui-icon-set-sm",
        hasTag: false,
        isMenu: true
    },
    advice_feedback: {
        url: "advice_feedback.html",
        pageName: "意见反馈",
        hash: "advice_feedback",
        icons: "layui-icon-survey",
        hasTag: false,
        isMenu: true
    },
    help_center: {
        url: "help_center.html",
        pageName: "客服中心",
        hash: "help_center",
        icons: "layui-icon-dialogue",
        hasTag: false,
        isMenu: true
    }
},
    //用户角色集
    roles = {
        // 管理员
        super: ["home", "add_money", "task_create", "kb_purchase", "manage_task", "manage_kb_order", "manage_basic_data", "notice_manage", "user_manage", "manage_logs", "money_manage", "account_set", "advice_feedback", "help_center"],
        // 普通用户
        common: ["home", "add_money", "task_create", "kb_purchase", "manage_task", "manage_logs", "manage_kb_order", "advice_feedback", "account_set", "help_center"],
    };
exports.roles = roles;
exports.modules = modules;