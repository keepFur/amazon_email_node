"use strict";
flyer.define("add_route", function () {
    function init() {
        initValid();
    }
    //表单验证
    function initValid() {
        var form = flyer.form($(".flyer-input-block"), {}, function () {
            var formData = this.getData();
            //验证通过提交数据
            $.post('/addRoute',[],
                function (data) {
                    if (data === 'OK') {
                        //跳转模板管理
                        flyer.msg(flyer.i18n.initTitle("提交成功"));
                        setTimeout(function () {
                            $('[data-href="domain_list.html"]').click();
                            $(".flyer-dialog-content").remove();
                        }, 600);
                        $("button.submit").attr("disabled", true);
                    }
                }
            );
        });
    }
    init();
});
