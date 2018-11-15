'use strict';
layui.use(['element', 'layer'], function () {
    var element = layui.element;
    var layer = layui.layer;

    /**
     * 入口函数
     * 
     */
    (function init() {
        getTodayData();
        getAddMoney();
        getOrderData();
        getUserData();
        initEvent();
    })()

    /**
     * 事件初始化
     * 
     */
    function initEvent() {
        // 切换日期
        $('.js-home-toggle-date').on('click', 'a', function (event) {
            var day = $(this).data('day');
            $(this).parents('.js-home-toggle-date').find('a').removeClass('layui-btn-normal').addClass('layui-btn-primary');
            $(this).addClass('layui-btn-normal').removeClass('layui-btn-primary');
            getAddMoney(day);
            getOrderData(day);
            getUserData(day);
            return false;
        });
    }


    /**
     *获取今日的网站数据
     *
     * @param {*} date
     */
    function getTodayData(date) {
        date = date || 7;
        var numDayDate = getNumDayDate(date);
        var createdDateStart = numDayDate[0];
        var createdDateEnd = numDayDate[date - 1];

    }

    /**
     * 获取余额充值的数据
     * 
     * @param {any} date 
     */
    function getAddMoney(date) {
        date = date || 7;
        var numDayDate = getNumDayDate(date);
        var createdDateStart = numDayDate[0];
        var createdDateEnd = numDayDate[date - 1];
        $.get('/api/readAddMoneyOfInTime', {
            createdDateStart: createdDateStart,
            createdDateEnd: createdDateEnd
        }, function (res) {
            var rows = res.data.rows;
            numDayDate.forEach(function (item) {
                if (!hasContainerEle(item, rows)) {
                    rows.push({
                        createdDate: $.formatDate('yyyy/mm/dd', item),
                        count: 0
                    });
                }
            });
            rows = rows.map(function (item, index) {
                return {
                    createdDate: $.formatDate('yyyy/mm/dd', item.createdDate),
                    count: item.count
                };
            });
            rows.sort(function (item1, item2) {
                return new Date(item1.createdDate).getTime() - new Date(item2.createdDate).getTime();
            });
        });
    }

    /**
     *获取某一个时间段的订单数据
     *
     */
    function getOrderData(date) {
        date = date || 7;
        var numDayDate = getNumDayDate(date);
        var createdDateStart = numDayDate[0];
        var createdDateEnd = numDayDate[date - 1];
    }

    /**
     *获取某一个时间的用户数据
     *
     */
    function getUserData(date) {
        date = date || 7;
        var numDayDate = getNumDayDate(date);
        var createdDateStart = numDayDate[0];
        var createdDateEnd = numDayDate[date - 1];
    }

    /**
     * 获取最近num天的日期
     * 并返回一个数组
     * 
     * @param {any} num 最近的天数 默认是七天
     */
    function getNumDayDate(num) {
        num = num || 7;
        if (isNaN(num)) {
            console.log(num);
            return [];
        }
        // 根据时间戳来计算
        var todayTime = new Date().getTime();
        var sumTime = num * 24 * 60 * 60 * 1000;
        var startTime = todayTime - sumTime;
        var oneDayTime = 24 * 60 * 60 * 1000;
        var result = [];
        for (var i = 0; i < num; i++) {
            result[i] = $.formatDate('yyyy/mm/dd', new Date(startTime + (i + 1) * oneDayTime));
        }
        return result;
    }

    /**
     * 判断某一个元素是否在数组中
     * 
     * @param {any} ele 
     * @param {any} arr 
     */
    function hasContainerEle(ele, arr) {
        var has = false;
        if (ele && arr && Array.isArray(arr)) {
            arr.forEach(function (element) {
                if ($.formatDate('yyyy/mm/dd', element.createdDate) === ele) {
                    has = true;
                    return false;
                }
            }, this);
        }
        return has;
    }
});