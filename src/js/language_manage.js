"use strict";
flyer.define("baseData", function (exports, module) {
    var baseDatas = {
        clickNum: 0
    };

    /**
     *页面入口函数 
     * 
     */
    function init() {
        // 初始化页面
        initPage();
    }

    /**
     *初始化页面 
     * 
     */
    function initPage() {
        var $tabContainer = $('#baseDataTab');
        var $tab = flyer.tab($tabContainer, {
            tabs: [{
                title: flyer.i18n.initTitle('语言列表'),
                url: './html/language_list.html',
                cache: false,
                i18n:'LanguageList'
            }, {
                title: flyer.i18n.initTitle('语言配置'),
                url: './html/language_key_manage.html',
                cache: false,
                i18n:'LanguageConfig'
            }],
            click: function (elm) {
                baseDatas.clickNum++;
                var indexOfLi = $(elm).index();
                if (indexOfLi !== 0 && baseDatas.clickNum !== 0) {
                    $(".flyer-tab-content").find(".flyer-tab-item").eq(0).hide();
                } else {
                    $(".flyer-tab-content").find(".flyer-tab-item").eq(0).show();
                }
            }
        });
    }
    // 页面入口
    init();
});