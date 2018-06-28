"use strict"
let config = {
    "acs_db": {
        "host": "10.1.1.86",
        "port": "3306",
        "user": "amazon_cs",
        "password": "amazon_cs@aukey2017",
        "database": "amazon_customer_service",
        "multipleStatements": true
        // "host": "172.16.24.243",
        // "port": "3306",
        // "user": "root",
        // "password": "123456",
        // "database": "me",
        // "multipleStatements": true
    },
    "order_db": {
        "host": "10.1.1.86",
        "user": "datareader",
        "password": "Qwetremd",
        "database": "fba_stock",
        "port": 3306,
        "multipleStatements": true
    },
    "cas_db": {
        "host": "10.1.1.86",
        "user": "datareader",
        "password": "Qwetremd",
        "port": 3306,
        "database": "cas",
        "multipleStatements": true
    },
    "mailgun": {
        // "privateKey": "key-7a4626ad7302b79c764f2f16637b0212",
        // "publicKey": "pubkey-8647767b90f87bc080bef00c66a2284b",
        // "domain": "it.flyerui.com"
        "privateKey": "key-78mhse86jrhi-89bwhxelfe-lzcgfkc1",
        "publicKey": "pubkey-3xbdt7ze72oj--bk5o4xujr4sng95ta3",
        "domain": "m.sellertool.com"
    },
    "url_list": {
        "redirect_logout": "http://cas.qa.aukeyit.com/login?logout",
        "permission_url": "cas.qa.aukeyit.com",
        "baiyi_home": "http://cas.qa.aukeyit.com/user/content"
        // "redirect_logout": "http://www.aukeyit.com/login?logout",
        // "permission_url": "www.aukeyit.com",
        // "baiyi_home": "http://www.aukeyit.com/user/content"
    },
    "const": {
        "managerCode": "9102",
        "adminCode": "9103"
    },
    "iterance": {

        //站内信5分间隔收一次
        "stored": 1000 * 60 * 2,

        //站内信详情间隔5分钟收取一次
        "message": 1000 * 60 * 2,

        //关联邮箱间隔 20分钟 收取一次
        "other": 1000 * 60 * 2,

        //收取站内信的区间是8小时内的邮件
        "time": 1000 * 60 * 60 * 8,

        //数据库对比的间隔区间是8小时内的
        "sql_minute": 60 * 8,

        // 满意度调查的时间间隔
        "satisfaction": 1000 * 10 * 10,

        // 满意度调查的邮件时间 10天,在已解决时间的10天之后
        "beforeday": 10
    },
    "collect": false,
    "filterDoMain": "sandbox3d390fea777441cb8283b0ed5ffcfe61.mailgun.org",
    "supportApiHostName": "http://sendmail.qa.aukeyit.com",
    "serviceDomain": 'http://acs.qa.aukeyit.com'
    // "supportApiHostName": "192.168.29.94"
}
module.exports = config;