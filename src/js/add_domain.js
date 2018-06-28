"use strict";
flyer.define("add_domain", function () {
  function init() {
    initValid();
    initEvent();
  }
  //表单验证
  function initValid() {
    var form = flyer.form($(".flyer-input-block"), {}, function () {
      var domain = $('input[name="title"]').val().trim();
      if (domain.indexOf('@') !== -1) {
        flyer.msg(((flyer.i18n && flyer.i18n.initTitle("域名不能包含@符号"))|| "域名不能包含@符号"));
        $('input[name="title"]').focus();
        return;
      }
      // 锁定按钮，防止多次提交
      core.lockedBtn($("button.submit"), true, '创建中');
      $.ajax({
        type: "post",
        url: "/addDomain",
        timeout: 1000 * 30,
        data: {
          newDomain: this.getData(),
          time:window.Date.parse(new Date())
        },
        success: function (data) {
          if (data === 'OK') {
            flyer.msg(((flyer.i18n && flyer.i18n.initTitle("创建成功"))|| "创建成功"));
            setTimeout(function () {
              $('[data-href="domain_list.html"]').click();
              $(".flyer-dialog-content").remove();
            }, 600);
          }
        },
        error: function () {
          flyer.msg(((flyer.i18n && flyer.i18n.initTitle("网络错误，请刷新页面重试"))|| "网络错误，请刷新页面重试"));
        },
        complete: function () {
          // 解锁按钮
          core.unlockBtn($("button.submit"), '创建');
        }
      });
    });
  }

  function initEvent() {
    $('.cancel').on("click", function () {
      //取消的时候跳转账号管理
      $('[data-href="account_list.html"]').click();
    });
  }
  init();
});
