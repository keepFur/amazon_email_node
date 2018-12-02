"use strict";
layui.use(['util'], function() {
    var util = layui.util;
    var API_YT_KB = {
        domain: 'http://api.lieliu.com:1024',
        userKey: 'c1e5606f7b40e680d3b5bfc7dbb042ff#asd12c1e5606f7b40e680d3b5bfc7dbb042ff',
        // 获取签名
        signkey: function(apiName, params) {
            console.log('原串：' + params);
            var encodeUlr = encodeURIComponent(`${apiName}?${params}&${this.userKey.split('#')[0]}`);
            console.log('encodeurl之后：' + encodeUlr);
            return $.md5(encodeUlr);
        },
        // 创建空包
        createKB: function(params, callback) {
            params = $.extend(params, {
                format: 'json',
                ver: 4,
                timestamp: data.data.time,
                id: orderNumber,
                username: 'u_1657222',
            });
            params.signkey = _this.signkey('/ll/task_add', core.objectToString(params));
            console.log('MD5之后：' + params.signkey);
            console.log('发送给服务器的参数：' + core.objectToString(params));
            $.ajax({
                url: '/lieliuApi/createTask',
                data: params,
                success: function(res) {
                    res.orderNumber = orderNumber;
                    callback(res);
                },
                error: function(error) {
                    callback({}, error);
                }
            });
        },
        // 用户余额查询
        searchMoney: function(params, callback) {

        }
    };
});