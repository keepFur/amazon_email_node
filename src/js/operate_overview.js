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
        getAllData();
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
     */
    function getTodayData() {
        $.get('/api/getTodayData', function (res) {
            if (res.success) {
                //负值
                var data = res.data;
                $('.js-user-today-add-score').text(core.fenToYuan(data.todayAddSumMoney || 0) + '元/' + data.todayAddMoneyCount + '笔');
                $('.js-user-today-add-count').text(data.todayAddUserCount);
                $('.js-user-today-kb-count').text(core.fenToYuan(data.todayAddKbOrderSumMoney || 0) + '元/' + data.todayAddKbOrderCount + '笔');
                $('.js-user-today-task-count').text(core.fenToYuan(data.todayAddTaskOrderSumMoney || 0) + '元/' + data.todayAddTaskOrderCount + '笔');
            } else {
                layer.msg(res.message);
            }
        }, 'json');
    }

    /**
     *获取全部的网站数据
     *
     */
    function getAllData() {
        $.get('/api/getAllData', function (res) {
            if (res.success) {
                //负值
                var data = res.data;
                $('.js-user-all-add-score').text(core.fenToYuan(data.allAddSumMoney || 0) + '元/' + data.allAddMoneyCount + '笔');
                $('.js-user-all-add-count').text(data.allAddUserCount);
                $('.js-user-all-kb-count').text(core.fenToYuan(data.allAddKbOrderSumMoney || 0) + '元/' + data.allAddKbOrderCount + '笔');
                $('.js-user-all-task-count').text(core.fenToYuan(data.allAddTaskOrderSumMoney || 0) + '元/' + data.allAddTaskOrderCount + '笔');
            } else {
                layer.msg(res.message);
            }
        }, 'json');
    }

    /**
     * 获取余额充值的数据
     * 
     * @param {any} day
     */
    function getAddMoney(day) {
        day = day || 7;
        $.get('/api/getAddMoney', {
            day: day
        }, function (res) {
            if (res.success) {
                //负值
                var data = res.data;
                $('.js-user-add-score').text(core.fenToYuan(data.addSumMoney || 0) + '元/' + data.addMoneyUserCount + '笔');
                $('.js-user-sub-score').text(core.fenToYuan(data.subSumMoney || 0) + '元/' + data.subMoneyUserCount + '笔');
            } else {
                layer.msg(res.message);
            }
        }, 'json');
    }

    /**
     *获取某一个时间段的订单数据
     *
     */
    function getOrderData(day) {
        day = day || 7;
        $.get('/api/getOrderData', {
            day: day
        }, function (res) {
            if (res.success) {
                //负值
                var data = res.data;
                $('.js-user-kb-order').text(core.fenToYuan(data.kbOrderSumMoney || 0) + '元/' + data.kbOrderCount + '笔');
                $('.js-user-task-order').text(core.fenToYuan(data.taskOrderSumMoney || 0) + '元/' + data.taskOrderCount + '笔');
            } else {
                layer.msg(res.message);
            }
        }, 'json');
    }

    /**
     *获取某一个时间的用户数据
     *
     */
    function getUserData(day) {
        day = day || 7;
        $.get('/api/getUserData', {
            day: day
        }, function (res) {
            if (res.success) {
                //负值
                var data = res.data;
                $('.js-user-add-count').text(data.addUserCount);
                $('.js-user-gold-count').text(data.goldUserCount);
                $('.js-user-common-count').text(data.commonUserCount);
                $('.js-user-inner-count').text(data.innerUserCount);
            } else {
                layer.msg(res.message);
            }
        }, 'json');
    }
});