"use strict";
layui.use(['util'], function() {
    var util = layui.util;
    var API_YT_KB = {
        domain: 'http://csapi.4-38.com/TAp',
        appkey: '1',
        appsecret: '123#asd12c1e5606f7b40e680d3b5bfc7dbb042ff',
        // 获取签名
        signkey: function(params) {
            console.log('原串：' + params);
            var encodeUlr = encodeURIComponent(`${this.appsecret.split('#')[0]}${params}${this.appsecret.split('#')[0]}`);
            console.log('encodeurl之后：' + encodeUlr);
            return $.md5(encodeUlr);
        },
        // 对象转字符串
        objectToString: function(obj, result) {
            result = result || ``;
            if (typeof obj !== 'object') {
                $.writeLog('core-objectToString', '参数错误');
                return result;
            }
            var keys = Object.keys(obj);
            keys = keys.sort();
            console.log(keys);
            for (var i = 0; i < keys.length; i++) {
                result += keys[i] + obj[keys[i]];
            }
            return result;
        },
        // 创建空包
        generateYtKbNumber: function(params, callback) {
            debugger
            var _this = this;
            params = $.extend(params, {
                format: 'json',
                Client_id: _this.Client_id,
                Clinet_secret: _this.Clinet_secret,
                type: 'buy.empty',
                Kb_type: 8,
                send_time: Date.now(),
            });
            params.sign = _this.signkey(_this.objectToString(params));
            console.log('MD5之后：' + params.sign);
            console.log('发送给服务器的参数：' + _this.objectToString(params));
            $.ajax({
                url: '/ytkbApi/generateYtKbNumber',
                data: params,
                type: 'post',
                dataType: 'json',
                success: function(res) {
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
    window.APIYTKB = API_YT_KB;
});

// 圆通空包接口对接
// 步骤
// 1，判断空包类型是否是圆通
// 2，获取空包单号
// 3，根据获取到的空包单号，将订单写入到本地中
// 4，完事