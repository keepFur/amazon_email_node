// 订单管理模块
'use strict';
$(function() {
    // 页面入口
    function init() {
        initTab();
    }

    // 初始化页签
    function initTab() {
        var $tabContainer = $('#manageOrderTab');
        var $tab = flyer.tab($tabContainer, {
            tabs: [{
                title: '淘宝订单',
                url: './html/manage_order_tb.html',
                cache: true,
            }, {
                title: '京东订单',
                url: './html/manage_order_jd.html',
                cache: true
            }]
        });
    }

    init();
});