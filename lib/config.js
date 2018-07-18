"use strict"
let config = {
    yidian_db: {
        host: "localhost",
        port: "3306",
        user: "yidiankj",
        password: "srly1108520bao@",
        database: "yidian",
        multipleStatements: true
    },
    yidian_db_dev: {
        host: "127.0.0.1",
        port: "3306",
        user: "root",
        password: "root",
        database: "yidian",
        multipleStatements: true
    },
    url_list: {
        redirect_logout: "http://cas.qa.aukeyit.com/login?logout",
        permission_url: "cas.qa.aukeyit.com",
        baiyi_home: "http://cas.qa.aukeyit.com/user/content"
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