"use strict";
$(function() {
    // 页面入口
    function init() {
        initTab();
    }

    // 初始化页签
    function initTab() {
        var $tabContainer = $('#homeTabContainer');
        var $tab = flyer.tab($tabContainer, {
            tabs: [{
                title: '账号概览',
                url: './html/home_account_view.html',
                cache: true,
            }, {
                title: '每日电商资讯',
                url: './html/home_dayday_news.html',
                cache: true
            }, {
                title: '今日头条',
                url: './html/home_today_top_news.html',
                cache: true
            }, {
                title: '内涵段子',
                url: './html/home_duanzi_news.html',
                cache: true
            }, {
                title: '开心一刻',
                url: './html/home_happy_news.html'
            }]
        });
    }

    init();
});