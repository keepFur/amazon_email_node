"use strict";
flyer.define("change_email", function (exports, module) {
    function init() {
        initFoldContainer();
        initPage();
    }
    
    /**
   *初始化页面 
   * 
   */
    function initPage() {
        var $tabContainer = $('#changeEmailTab');
        var $tab = flyer.tab($tabContainer, {
            tabs: [{
                title: '收信设置',
                url: './html/incoming_mail_settings.html',
                cache: true,
            }, {
                title: '发信设置',
                url: './html/mail_settings.html',
                cache: true,
            }]
                // if (flyer.exports.other_email.isUpdate) {
                //     initFormData();
                // }
        });
    }
    //点击展开更多
    function initFoldContainer() {
        $(".change-email-checkedBox .flyer-radio").on("click", function () {
            if ($("#change-email-checked").is(":checked")) {
                $(".change-email-otrherSend").show();
            } else {
                $(".change-email-otrherSend").hide();
            }
        })
    }
    init();
})
