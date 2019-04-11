"use strict";
layui.use(['util'], function() {
    var util = layui.util;
    var APIUtil = {
        domain: 'http://api.lieliu.com:1024',
        userKey: 'c1e5606f7b40e680d3b5bfc7dbb042ff#asd12c1e5606f7b40e680d3b5bfc7dbb042ff',
        getServerTimestamp: function(callback) {
            var url = this.domain + '/api/sys_now?format=json';
            callback = callback || function(res) {
                layer.msg('sys_now==>' + res.data.time);
            };
            $.get(url, function(data) {
                callback(data);
            });
        },
        generateOrderNumer: function() {
            let random = util.digit(Math.ceil(Math.random() * 1000000), 6);
            let date = new Date();
            let year = date.getFullYear();
            let month = core.padStart((date.getMonth() + 1));
            let day = core.padStart(date.getDate());
            let hours = core.padStart(date.getHours());
            let minutes = core.padStart(date.getMinutes());
            let seconds = core.padStart(date.getSeconds());
            let mill = util.digit(date.getMilliseconds(), 4);
            return '' + year + month + day + hours + minutes + seconds + mill + random;
        },
        signkey: function(apiName, params) {
            console.log('原串：' + params);
            var encodeUlr = encodeURIComponent(`${apiName}?${params}&${this.userKey.split('#')[0]}`);
            console.log('encodeurl之后：' + encodeUlr);
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
            });
        },
        // 查询任务
        listTask: function(params, callback) {
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
                    url: '/lieliuApi/listTask',
                    data: params,
                    success: function(res) {
                        callback(res);
                    },
                    error: function(error) {
                        layer.msg(error.message)
                    }
                });
            });
        },
        // 取消任务
        cancelTask: function(orderNumber, callback) {
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
                    url: '/lieliuApi/cancelTask',
                    data: params,
                    success: function(res) {
                        callback(res);
                    },
                    error: function(error) {
                        layer.msg(error.message)
                    }
                });
            });
        },
        // 暂停或者恢复任务
        pauseAndResumeTask: function(orderNumber, status, callback) {
            var _this = this;
            this.getServerTimestamp(function(data) {
                var params = {
                    format: 'json',
                    timestamp: data.data.time,
                    username: 'u_1657222',
                    ver: 4,
                    id: orderNumber,
                    status: status
                };
                params.signkey = _this.signkey('/ll/task_pause', core.objectToString(params));
                $.ajax({
                    url: '/lieliuApi/pauseAndResumeTask',
                    data: params,
                    success: function(res) {
                        callback(res);
                    },
                    error: function(error) {
                        layer.msg(error.message)
                    }
                });
            });
        },
        // 获取礼品列表
        readPresentList: function(params, callback) {
            $.ajax({
                url: '/lieliuApi/readPresentList',
                data: params,
                success: function(res) {
                    callback(res);
                },
                error: function(error) {
                    callback({}, error);
                }
            });
        },
        // 读取发货仓库列表
        readFromStock: function(params, callback) {
            $.ajax({
                url: '/lieliuApi/readFromStock',
                data: params,
                success: function(res) {
                    callback(res);
                },
                error: function(error) {
                    callback({}, error);
                }
            });
        },
        // 创建礼品订单
        createPresentOrder: function(params, callback) {
            $.ajax({
                url: '/lieliuApi/createPresentOrder',
                data: params,
                success: function(res) {
                    callback(res);
                },
                error: function(error) {
                    callback({}, error);
                }
            });
        },
        // 获取快递单号
        getPresentKdNumber: function(params, callback) {
            $.ajax({
                url: '/lieliuApi/getPresentKdNumber',
                data: params,
                success: function(res) {
                    callback(res);
                },
                error: function(error) {
                    callback({}, error);
                }
            });
        },
        // 查看账户余额
        viewLipindaoAccountMoney: function(params, callback) {
            $.ajax({
                url: '/lieliuApi/viewLipindaoAccountMoney',
                data: params,
                success: function(res) {
                    callback(res);
                },
                error: function(error) {
                    callback({}, error);
                }
            });
        }
    };
    window.APIUtil = APIUtil;
});