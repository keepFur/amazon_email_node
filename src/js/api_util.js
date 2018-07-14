// api工具类
'use strict';
// 构造函数
var APIUtil = {
    domain: 'http://api.lieliu.com:1024',
    userKey: 'c1e5606f7b40e680d3b5bfc7dbb042ff',
    getServerTimestamp: function(callback) {
        var url = this.domain + '/api/sys_now?format=json';
        callback = callback || function(res) {
            flyer.msg('sys_now==>' + res.data.time);
        };
        $.get(url, function(data) {
            callback(data);
        });
    },
    generateOrderNumer: function() {
        let random = Math.ceil(Math.random() * 1000000);
        let date = new Date();
        let year = date.getFullYear();
        let month = core.padStart((date.getMonth() + 1));
        let day = core.padStart(date.getDate());
        let hours = core.padStart(date.getHours());
        let minutes = core.padStart(date.getMinutes());
        let seconds = core.padStart(date.getSeconds());
        let mill = core.padStart(date.getMilliseconds());
        return '' + year + month + day + hours + minutes + seconds + random;
    },
    signkey: function(apiName, params) {
        var encodeUlr = encodeURIComponent(`${apiName}?${params}&${this.userKey}`);
        return $.md5(encodeUlr);
    },
    createTask: function(params, callback) {
        var url = this.domain + '/ll/task_add';
        var orderNumber = this.generateOrderNumer();
        var _this = this;
        this.getServerTimestamp(function(data) {
            params = $.extend(params, {
                format: 'json',
                ver: 4,
                timestamp: data.data.time,
                id: orderNumber,
                username: 'u_1657222',
            });
            params.signkey = _this.signkey('/ll/task_add', core.objectToString(params));
            $.ajax({
                url: url,
                data: params,
                success: function(res) {
                    res.orderNumber = orderNumber;
                    callback(res);
                },
                error: function(error) {
                    callback({}, error);
                }
            });
            // params = {
            //     count: 24,
            //     begin_time: '2018-7-12',
            //     format: 'json',
            //     goodsBrowsingTime: 100,
            //     hour: new Array(24).fill(1).join(),
            //     id: orderNumber,
            //     keyword: '女装',
            //     target: `https://item.taobao.com/item.htm?spm=a211pk.steins68998.wb-qs-fp-20180312-ruiyu-video-pc6.3.129fjVNljVNl6G&id=39878007598`,
            //     timestamp: data.data.time,
            //     type: 1,
            //     sUrl: 'https://www.taobao.com',
            //     username: 'u_1657222',
            //     ver: 4
            // };
        });
    },
    // 查询任务
    listTask: function(params, callback) {
        var url = this.domain + '/ll/task_list';
        var orderNumber = this.generateOrderNumer();
        var signKey = '';
        var _this = this;
        this.getServerTimestamp(function(data) {
            params = $.extend(params, {
                format: 'json',
                timestamp: data.data.time,
                username: 'u_1657222',
                ver: 4
            });
            params.signkey = _this.signkey('/ll/task_list', core.objectToString(params));
            $.ajax({
                url: 'http://api.lieliu.com:1024/ll/task_list',
                data: params,
                success: function(res) {
                    callback(res);
                },
                error: function(error) {
                    flyer.msg(error.message)
                }
            });
        });
    },
    // 取消任务
    cancelTask: function(orderNumber, callback) {
        var url = this.domain + '/ll/task_cancel';
        var signKey = '';
        var _this = this;
        this.getServerTimestamp(function(data) {
            var params = {
                format: 'json',
                timestamp: data.data.time,
                username: 'u_1657222',
                ver: 4,
                id: orderNumber
            };
            params.signkey = _this.signkey('/ll/task_cancel', core.objectToString(params));
            $.ajax({
                url: url,
                data: params,
                success: function(res) {
                    callback(res);
                },
                error: function(error) {
                    flyer.msg(error.message)
                }
            });
        });
    }
};

// // 获取服务端的时间戳
// APIUtil.prototype.getServerTimestamp = function(callback) {
//     var url = this.domain + '/api/sys_now?format=json';
//     callback = callback || function(res) {
//         flyer.msg('sys_now==>' + res.data.time);
//     };
//     $.get(url, function(data) {
//         callback(data);
//     });
// };

// // 生成数字签名（signkey）
// APIUtil.prototype.generateSignkey = function(apiName, params, callback) {
//     $.post(`/api/generateSignKey`, {
//         apiName: apiName,
//         params: params,
//         urlEncode: params
//     }, function(res) {
//         callback(res);
//     });
// };

// // 生成订单号(取系统时间+随机6位数数字相连)
// APIUtil.prototype.generateOrderNumer = function() {
//     let random = Math.ceil(Math.random() * 1000000);
//     let date = new Date();
//     let year = date.getFullYear();
//     let month = core.padStart((date.getMonth() + 1));
//     let day = core.padStart(date.getDate());
//     let hours = core.padStart(date.getHours());
//     let minutes = core.padStart(date.getMinutes());
//     let seconds = core.padStart(date.getSeconds());
//     let mill = core.padStart(date.getMilliseconds());
//     return '' + year + month + day + hours + minutes + seconds + random;
// };

// //  生成签名
// APIUtil.prototype.signkey = function(apiName, params) {
//     var encodeUlr = encodeURIComponent(`${apiName}?${params}&${this.userKey}`);
//     console.log(encodeUlr);
//     return $.md5(encodeUlr);
// };

// //  创建任务
// APIUtil.prototype.createTask = function(params, callback) {
//     var url = this.domain + '/ll/task_add';
//     var orderNumber = this.generateOrderNumer();
//     var _this = this;
//     this.getServerTimestamp(function(data) {
//         params = $.extend(params, {
//             format: 'json',
//             ver: 4,
//             timestamp: data.data.time,
//             id: orderNumber,
//             username: 'u_1657222',
//         });
//         params.signkey = _this.signkey('/ll/task_add', core.objectToString(params));
//         $.ajax({
//             url: url,
//             data: params,
//             success: function(res) {
//                 callback(res);
//             },
//             error: function(error) {
//                 callback({}, error);
//             }
//         });
//         // params = {
//         //     count: 24,
//         //     begin_time: '2018-7-12',
//         //     format: 'json',
//         //     goodsBrowsingTime: 100,
//         //     hour: new Array(24).fill(1).join(),
//         //     id: orderNumber,
//         //     keyword: '女装',
//         //     target: `https://item.taobao.com/item.htm?spm=a211pk.steins68998.wb-qs-fp-20180312-ruiyu-video-pc6.3.129fjVNljVNl6G&id=39878007598`,
//         //     timestamp: data.data.time,
//         //     type: 1,
//         //     sUrl: 'https://www.taobao.com',
//         //     username: 'u_1657222',
//         //     ver: 4
//         // };
//     });
// };

// APIUtil.prototype.listTask = function(params, callback) {
//     var url = this.domain + '/ll/task_list';
//     var orderNumber = this.generateOrderNumer();
//     var signKey = '';
//     var _this = this;
//     this.getServerTimestamp(function(data) {
//         params = {
//             format: 'json',
//             timestamp: data.data.time,
//             username: 'u_1657222',
//             ver: 4
//         };
//         params.signkey = _this.signkey('/ll/task_list', core.objectToString(params));
//         $.ajax({
//             url: 'http://api.lieliu.com:1024/ll/task_list',
//             data: params,
//             success: function(res) {
//                 if (res.data.status === '1') {
//                     console.log('socre==>' + res.data.score);
//                     console.log('socre2==>' + res.data.score2);
//                     console.log('price==>' + res.data.preice);
//                     console.log('tips==>' + res.data.tips);
//                 } else {
//                     flyer.msg(res.data.tips);
//                 }
//             }
//         });
//     });
// };

function test() {
    // var util = new APIUtil();
    // flyer.msg('orderNumber==>' + util.generateOrderNumer());
    // util.generateSignkey('/ll/add_task', core.objectToString({
    //     a: '123',
    //     k: '123',
    //     g: 'buzhidao'
    // }));
    // util.getServerTimestamp();
    // util.createTask();

    // util.listTask();
}

// test();