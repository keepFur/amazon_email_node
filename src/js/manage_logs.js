// 操作日志查询模块
'use strict';
$(function() {
    // 页面入口
    function init() {
        initTab();
    }

    // 初始化页签
    function initTab() {
        var $tabContainer = $('#manageLogsTab');
        var $tab = flyer.tab($tabContainer, {
            tabs: [{
                title: '任务日志',
                url: './html/manage_logs_task.html',
                cache: true,
            }, {
                title: '财务日志',
                url: './html/manage_logs_money.html',
                cache: true
            }, {
                title: '积分日志',
                url: './html/manage_logs_score.html',
                cache: true
            }, {
                title: '金币日志',
                url: './html/manage_logs_glod.html',
                cache: true
            }]
        });
    }

    init();
});