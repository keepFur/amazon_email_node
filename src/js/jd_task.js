// 京东任务模块
'use strict';
$(function() {
    // 页面入口
    function init() {
        initTab();
    }

    // 初始化页签
    function initTab() {
        var $tabContainer = $('#jdTaskTab');
        var $tab = flyer.tab($tabContainer, {
            tabs: [{
                title: '流量任务',
                url: './html/jd_task_traffic.html',
                cache: true,
            }, {
                title: '收藏任务',
                url: './html/jd_task_collect.html',
                cache: true
            }, {
                title: '店铺关注',
                url: './html/jd_task_attention.html',
                cache: true
            }, {
                title: '加购任务',
                url: './html/jd_task_cart.html',
                cache: true
            }]
        });
    }

    init();
});