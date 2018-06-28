"use strict";
flyer.define("send_email", function (exports, module) {
  var editor, emailCombox;
  function init() {
    initEdit();
  }

  //加载编辑器
  function initEdit() {
    editor = flyer.edit($(".flyer-textarea"));
  }
  // 控制email_detail_two的高度
  function emailDetailHeight() {
    var heightO = document.documentElement.clientHeight - 170;
    $('#email_detail_two').height(heightO);
    $('#detail_two_contact').height(heightO - 260);

  }
  window.onload = function () {
    emailDetailHeight();
    $(window).resize(function () {
      emailDetailHeight()
    });
  };

  init();
});

