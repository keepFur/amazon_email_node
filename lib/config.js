"use strict"
let config = {
    yidian_db_dev: {
        host: "localhost",
        port: "3306",
        user: "yidiankj",
        password: "srly1108520bao@",
        database: "yidian",
        multipleStatements: true
    },
    yidian_db: {
        host: "127.0.0.1",
        port: "3306",
        user: "root",
        password: "root",
        database: "yidian",
        multipleStatements: true
    },
    pay_api: {
        client_id: 'fb5aab6a0ec368e540',
        client_secret: 'b844285953636e707ea34b386686f039',
        kdt_id: '41135783'
    },
    url_list: {
        baiyi_home: "/"
    },
    const: {
        managerCode: "9102",
        adminCode: "9103"
    },
    iterance: {
        //数据库对比的间隔区间是8小时内的
        sql_minute: 60 * 8
    }
}
module.exports = config;