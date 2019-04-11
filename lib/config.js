"use strict"
let config = {
    // yidian_db_dev: {
    //     host: "localhost",
    //     port: "3306",
    //     user: "root",
    //     password: "Srly1108520bao@",
    //     database: "yidian",
    //     multipleStatements: true
    // },
    yidian_db_dev: {
        host: "localhost",
        port: "3308",
        user: "root",
        password: "password",
        database: "yidian_keji",
        multipleStatements: true
    },
    // yidian_db_pro: {
    //     host: "localhost",
    //     port: "3306",
    //     user: "yi@dian@kj@",
    //     password: "s#r#l#y#1108#520#bao#@#",
    //     database: "yi&dian&",
    //     multipleStatements: true
    // },
    yidian_db_pro: {
        host: "203.78.140.146",
        port: "3306",
        user: "liulin5508800",
        password: "yGAEHHBzMnYZkLWp@",
        database: "liulin5508800",
        multipleStatements: true
    },
    pay_api: {
        client_id: 'fb5aab6a0ec368e540',
        client_secret: 'b844285953636e707ea34b386686f039',
        kdt_id: '41980836'
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
    },
    lipindao: {
        token: 'e91fe39c-c0a1-489d-b6d8-0977e9061e92',
    }
}
module.exports = config;