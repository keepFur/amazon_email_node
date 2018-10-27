'use strict';
/**
 * jquery的扩展方法，集合
 */
(function ($) {
    $ = window.jQuery || mdui.JQ;
    // 定义一些常量
    var paramError = '缺少参数';
    /**
     * 像指定容器中添加一个loading
     * @param {jqobj} $container 生成loading的容器，默认是内容区域
     * @param {boolean} options 可选参数，预留
     */
    $.addLoading = function ($container, options) {
        var $loadingEle = $('<div class= "loading-backgroud" style="position:fixed;top:50%;left:50%;width:80px;height:80px;z-index:1000;"><i class="layui-icon layui-icon-loading"></i></div>');
        $container = $container || $('.flyer-layout-content');
        $.removeAllLoading();
        $container.append($loadingEle);
    };

    /**
     * 移除一个loading
     * @param {jqobj} $container 生成loading的容器，默认是内容区域
     */
    $.removeLoading = function ($container) {
        $container = $container || $('.flyer-layout-content');
        $container.find('.loading-backgroud').remove();
    };

    /**
     * 移除所有的loading
     */
    $.removeAllLoading = function () {
        $('.loading-backgroud').remove();
    };

    /**
     * 防止用户操作多次提交方法,锁定操作按钮
     * @param {jqobj} $btn 用户点击的按钮对象
     * @param {boolean} isLoading 是否要添加正在提交的图标 默认是true
     */
    $.lockedBtn = function ($btn, isLoading, btnText) {
        var _isLoading = true;
        if (!$btn.length) {
            $.writeLog('lockedBtn', paramError);
            return;
        }
        if (typeof isLoading !== 'undefined') {
            _isLoading = isLoading;
        }
        if (_isLoading) {
            $btn.html(btnText + '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>').attr('disabled', true);
        } else {
            $btn.attr('disabled', true);
        }
    };

    /**
     * 防止用户操作多次提交方法,解锁操作按钮
     * @param {jqobj} $btn 用户点击的按钮对象
     * @param {string} btnText 用户点击的按钮的文本，默认为保存
     */
    $.unlockBtn = function ($btn, btnText) {
        if (!$btn.length) {
            $.writeLog('unlockBtn', paramError);
            return;
        }
        $btn.html(btnText || '保存').attr('disabled', false);
    };

    /**
     * 格式化日期
     * @param {string} format 格式化日期的字符串
     * @param {date} date 日期字符串，默认时间是当前时间
     */
    $.formatDate = function (format, date) {
        if (typeof format !== "string") {
            format = "yyyy-mm-dd hh:MM:ss";
        }
        var getDate = function (date) {
            date = isString(date) ? new Date(date) : (date || new Date());
            return {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
                hours: date.getHours(),
                minutes: date.getMinutes(),
                seconds: date.getSeconds()
            };
        };
        var isString = function (obj) {
            return typeof obj === "string";
        };
        var fullTime = function (time) {
            return time >= 10 ? time : ("0" + time);
        };
        date = getDate(date);
        return format
            .replace(/yyyy/gi, date.year)
            .replace(/mm/, fullTime(date.month))
            .replace(/dd/gi, fullTime(date.day))
            .replace(/hh/gi, fullTime(date.hours))
            .replace(/MM/, fullTime(date.minutes))
            .replace(/ss/gi, fullTime(date.seconds));
    };

    /**
     * 输出错误日志 格式是 某某时间 某某方法 发生某某错误
     * @param {string} fn 日志发生的方法名称
     * @param {string} msg 日志内容
     * @param {object} options 可选参数，保留
     */
    $.writeLog = function (fn, msg, options) {
        console.error('错误时间：' + new Date() + '\n错误来源：' + fn + '\n错误消息：' + msg);
    };

    // 去除字符串两头的空格
    $.trim = function (str) {
        str = str || '';
        return str.replace(/^\s*|\s*$/g, '');
    };

    // 生成一个随机值
    $.genGUID = function () {
        return flyer.formatDate("yyyymmddhhMMss") + Math.floor(Math.random() * 10000000);
    }
})(window.jQuery);