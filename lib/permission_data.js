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
        tb_task: {
            url: "tb_task.html",
            pageName: "淘宝任务",
            hash: "tb_task",
            icons: "add_shopping_cart",
            hasTag: false,
            isMenu: true
        },
        jd_task: {
            url: "jd_task.html",
            pageName: "京东任务",
            hash: "jd_task",
            icons: "shopping_cart",
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
        order_manage: {
            url: "manage_order.html",
            pageName: "订单管理",
            hash: "manage_order",
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