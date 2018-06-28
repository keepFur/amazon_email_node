"use strict";
flyer.define("mail_settings", function (exports, module) {
    /**
     * 模块入口函数
     * 
     */
    var init = function () {
        if(flyer.exports.other_email.isUpdate){
            initFormData();
        }
    };
    //初始化表单内容
    function initFormData() {
        var data = flyer.exports.other_email.row;
        $('input[name="accont_name"]').val(data['account']);
        $('[name="password"]').val(data['password']);
        $('.imap').val(data['imap']);
        $('.imap_port').val(data['imap_port']);
        $('.smtp').val(data['smtp']);
        $('.smtp-port').val(data['smtp_port']);
        $('.smtp_password').val(data['smtp_password']);
    }
    // 页面入口
    var Init = new init();
});