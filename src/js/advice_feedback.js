// 意见反馈查询模块
'use strict';
$(function() {
    // 页面入口
    function init() {
        initTab();
    }

    // 初始化页签
    function initTab() {
        var $tabContainer = $('#adviceFeedbackTab');
        var $tab = flyer.tab($tabContainer, {
            tabs: [{
                title: '提交反馈',
                url: './html/create_advice_feedback.html',
                cache: true,
            }, {
                title: '我的反馈',
                url: './html/manage_advice_feedback.html',
                cache: false
            }]
        });
    }

    init();
});