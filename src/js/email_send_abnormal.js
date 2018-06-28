"use strict";
flyer.define("emailSendAbnormal", function (exports, module) {
    var emailSendAbnormalData= {
        clickNum: 0,
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
        var $tabContainer = $('#emailAbnormal');
        var $tab = flyer.tab($tabContainer, {
            tabs: [{
                title: flyer.i18n.initTitle('邮件发送异常'),
                url: './html/abnormal-send.html',
                cache: true,
            }, {
                title: flyer.i18n.initTitle('不再提示'),
                url: './html/abnormal-no-tips.html',
                cache: true
            }],
            click: function (elm) {
                emailSendAbnormalData.clickNum++;
                var indexOfLi = $(elm).index();
                if (indexOfLi !== 0 && emailSendAbnormalData.clickNum !== 0) {
                    $(".flyer-tab-content").find(".flyer-tab-item").eq(0).hide();
                } else {
                    $(".flyer-tab-content").find(".flyer-tab-item").eq(0).show();
                }
            }
        });
    }
    init();
})