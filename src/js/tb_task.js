// 淘宝任务模块
'use strict';
$(function() {
    // 页面入口
    function init() {
        initTab();
    }

    // 初始化页签
    function initTab() {
        var $tabContainer = $('#tbTaskTab');
        var $tab = flyer.tab($tabContainer, {
            tabs: [{
                title: '流量任务',
                url: './html/tb_task_traffic.html',
                cache: true,
            }, {
                title: '收藏任务',
                url: './html/tb_task_collect.html',
                cache: true
            }, {
                title: '加购任务',
                url: './html/tb_task_cart.html',
                cache: true
            }, {
                title: '淘宝直播',
                url: './html/tb_task_live.html',
                cache: true
            }]
        });
    }

    init();
});