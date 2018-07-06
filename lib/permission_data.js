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
        templates: {
            url: "templates.html",
            pageName: "订单管理",
            hash: "templates",
            icons: "icon-templates",
            hasTag: false,
            isMenu: true
        },
        add_template: {
            url: "add_template.html",
            pageName: "添加模板",
            hash: "add_template",
            icons: "icon-add-template",
            hasTag: false,
            isMenu: true
        },
        send_email: {
            url: "send_email.html",
            pageName: "发送邮件",
            hash: "send_email",
            icons: "icon-send",
            hasTag: false,
            isMenu: true
        },
        frame: {
            url: "frame.html",
            pageName: "邮件详情",
            hash: "frame",
            icons: "",
            hasTag: false,
            isMenu: false
        },
        sent_emails: {
            url: "sent_emails.html",
            pageName: "已发邮件记录",
            hash: "sent_emails",
            icons: "icon-sent-mails",
            hasTag: false,
            isMenu: true
        },
        unfinish: {
            url: "unfinish.html",
            pageName: "未处理邮件",
            hash: "unfinish",
            icons: "icon-unfinish",
            hasTag: true,
            isMenu: true
        },
        finish: {
            url: "finish.html",
            pageName: "已回复邮件",
            hash: "finish",
            icons: "icon-finish",
            hasTag: true,
            isMenu: true
        },
        unassigned: {
            url: "unassigned.html",
            pageName: "未分派邮件",
            hash: "unassigned",
            icons: "icon-unassigned",
            hasTag: true,
            isMenu: true
        },
        assigned: {
            url: "assigned.html",
            pageName: "已分派邮件",
            hash: "assigned",
            icons: "icon-assigned",
            hasTag: true,
            isMenu: true
        },
        resolved: {
            url: "resolved.html",
            pageName: "已解决邮件",
            hash: "resolved",
            icons: "icon-resolved",
            hasTag: true,
            isMenu: true
        },
        add_account: {
            url: "add_account.html",
            pageName: "添加用户账号",
            hash: "add_account",
            icons: "icon-add-account",
            hasTag: false,
            isMenu: true
        },
        account_list: {
            url: "account_list.html",
            pageName: "用户账号管理",
            hash: "account_list",
            icons: "icon-account-list",
            hasTag: false,
            isMenu: true
        },
        add_domain: {
            url: "add_domain.html",
            pageName: "添加邮件域",
            hash: "add_domain",
            icons: "fa fa-cloud",
            hasTag: false,
            isMenu: true
        },
        domain_list: {
            url: "domain_list.html",
            pageName: "邮件域管理",
            hash: "domain_list",
            icons: "fa fa-sellsy",
            hasTag: false,
            isMenu: true
        },
        route_list: {
            url: "route_list.html",
            pageName: "邮箱路由管理",
            hash: "route_list",
            icons: "fa fa-random",
            hasTag: false,
            isMenu: true
        },
        add_route: {
            url: "add_route.html",
            pageName: "添加路由配置",
            hash: "add_route",
            icons: "fa fa-share-alt",
            hasTag: false,
            isMenu: true
        },
        frame_details: {
            url: "frame_details.html",
            pageName: "邮件详情",
            hash: "frame_details",
            icons: "",
            hasTag: false,
            isMenu: false
        },
        search_result: {
            url: "search_result.html",
            pageName: "查询结果展示",
            hash: "search_result",
            icons: "",
            hasTag: false,
            isMenu: false
        },
        search_result_detail: {
            url: "search_result_detail.html",
            pageName: "查询结果展示",
            hash: "search_result_detail",
            icons: "",
            hasTag: false,
            isMenu: false
        },
        sensitive_word: {
            url: "sensitive_word.html",
            pageName: "敏感词管理",
            hash: "sensitive_word",
            icons: "icon-sensitive-word",
            hasTag: false,
            isMenu: true
        },
        email_classifying: {
            url: "email_classifying.html",
            pageName: "邮件分类",
            hash: "email_classifying",
            icons: "fa fa-tags",
            hasTag: false,
            isMenu: true
        },
        change_signs: {
            url: "change_signs.html",
            pageName: "切换角色",
            hash: "change_signs",
            icons: "icon-change-signs",
            hasTag: false,
            isMenu: true
        },
        receiving_email_rules: {
            url: "receiving_email_rules.html",
            pageName: "收信规则",
            hash: "receiving_email_rules",
            icons: "icon-receiving-rules",
            hasTag: false,
            isMenu: true
        },
        creat_receiving_email_rule: {
            url: "creat_receiving_email_rule.html",
            pageName: "创建收信规则",
            hash: "creat_receiving_email_rule",
            icons: "",
            hasTag: false,
            isMenu: false
        },
        my_folder: {
            url: "my_folder.html",
            pageName: "我的文件夹",
            hash: "my_folder",
            icons: "icon-my-folder",
            hasTag: false,
            isMenu: false
        },
        other_email: {
            url: "other_email.html",
            pageName: "其他邮箱",
            hash: "other_email",
            icons: "icon-other-email",
            hasTag: false,
            isMenu: true
        },
        folder_detail: {
            url: "folder_detail.html",
            pageName: "文件夹详情",
            hash: "other_email",
            icons: "",
            hasTag: false,
            isMenu: false
        },
        other_email_detail: {
            url: "other_email_detail.html",
            pageName: "其他邮箱",
            hash: "other_email",
            icons: "",
            hasTag: false,
            isMenu: false
        },
        email_detail_two: {
            url: "email_detail_two.html",
            pageName: "邮件详情",
            hash: "email_detail_two",
            icons: "",
            hasTag: false,
            isMenu: true
        },
        customer_complaint_list: {
            url: "customer_complaint_list.html",
            pageName: "客诉记录",
            hash: "customer_complaint_list",
            icons: "icon-customer-complaint",
            hasTag: false,
            isMenu: true
        },
        customer_complaint_form: {
            url: "customer_complaint_form.html",
            pageName: "客诉记录",
            hash: "customer_complaint_form",
            icons: "",
            hasTag: false,
            isMenu: false
        },
        base_data: {
            url: 'base_data.html',
            pageName: '基础配置',
            hash: 'base_data',
            icons: 'icon-base-data',
            hasTag: false,
            isMenu: true
        },
        store_manage: {
            url: 'store_manage.html',
            pageName: '店铺管理',
            hash: 'store_manage',
            icons: 'fa fa-th-large',
            hasTag: false,
            isMenu: true
        },
        shop_manage: {
            url: 'shop_manage.html',
            pageName: '店铺列表',
            hash: 'shop_manage',
            icons: 'fa fa-th-large',
            hasTag: false,
            isMenu: true
        },
        language_manage: {
            url: 'language_manage.html',
            pageName: '语言管理',
            hash: 'language_manage',
            icons: 'fa fa-th-large',
            hasTag: false,
            isMenu: true
        },
        email_send_abnormal: {
            url: "email_send_abnormal.html",
            pageName: "邮件发送异常",
            hash: "email_send_abnormal",
            icons: "icon-email-send-abnormal",
            hasTag: false,
            isMenu: false
        },
        maillog: {
            url: "maillog.html",
            pageName: "邮件发送日志",
            hash: "maillog",
            icons: "icon-email-send-abnormal",
            hasTag: false,
            isMenu: true
        },
        satisfaction: {
            url: "satisfaction.html",
            pageName: "满意度",
            hash: "satisfaction",
            icons: "fa fa-comment",
            hasTag: false,
            isMenu: true
        }
    },
    //用户角色集
    roles = {
        //管理员
        9103: ["home", "add_account", "account_list", "change_signs", "language_manage", "maillog"],
        //主管
        9102: ["home", "templates", "add_template", "send_email", "sent_emails", "unfinish", "finish",
            "unassigned", "assigned", "resolved", "frame", "frame_details", "search_result", "search_result_detail",
            "sensitive_word", "change_signs", "my_folder", "receiving_email_rules", "creat_receiving_email_rule", "base_data",
            "customer_complaint_list", "customer_complaint_form", "folder_detail", "email_send_abnormal"
        ],
        //客服
        9101: ["home", "send_email", "sent_emails", "unfinish", "finish", "resolved", "frame", "frame_details", "search_result", "search_result_detail",
            "change_signs", "folder_detail", "customer_complaint_list", "customer_complaint_form", "email_send_abnormal"
        ]
    }

exports.roles = roles;
exports.modules = modules;