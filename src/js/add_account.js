"use strict";
flyer.define("add_account", function () {
  var domaincombobox;
  function init() {
    flyer.loading.init($('.flyer-layout-content')).add();
    initValid();
    initEvent();
  }
  //表单验证
  function initValid() {
    var form = flyer.form($(".flyer-form"), {
      messages: {
        required: flyer.i18n.initTitle("该项为必填项"),
        remote: flyer.i18n.initTitle("请修正该字段"),
        email: flyer.i18n.initTitle("请输入正确格式的电子邮件"),
        url: flyer.i18n.initTitle("请输入合法的网址"),
        date: flyer.i18n.initTitle("请输入合法的日期"),
        dateISO: flyer.i18n.initTitle("请输入合法的日期 (ISO)"),
        number: flyer.i18n.initTitle("请输入合法的数字"),
        digits: flyer.i18n.initTitle("只能输入整数"),
        creditcard: flyer.i18n.initTitle("请输入合法的信用卡号"),
        equalTo: flyer.i18n.initTitle("请再次输入相同的值"),
        accept: flyer.i18n.initTitle("请输入拥有合法后缀名的字符串"),
        maxlength: flyer.i18n.initTitle("请输入一个长度最多是 {0} 的字符串"),
        minlength: flyer.i18n.initTitle("请输入一个长度最少是 {0} 的字符串"),
        rangelength: flyer.i18n.initTitle("请输入一个长度介于 {0} 和 {1} 之间的字符串"),
        range: flyer.i18n.initTitle("请输入一个介于 {0} 和 {1} 之间的值"),
        max: flyer.i18n.initTitle("请输入一个最大为 {0} 的值"),
        min: flyer.i18n.initTitle("请输入一个最小为 {0} 的值")
      }
    }, function () {
      var _this = this;
      let title = $('input[name="title"]').val().trim().split('@')[0],
        domain = domaincombobox.getSelectedData()['fieldValue'],
        address = title + '@' + domain;
      // 锁定按钮，防止多次提交
      core.lockedBtn($("button.submit"), true, ((flyer.i18n && flyer.i18n.initTitle('创建中')) || '创建中'));
      // 后台验证名称是否存在
      $.get('/get_account_by_address/' + address, function (data) {
        if (data.err) {
          flyer.msg(flyer.i18n.initTitle("网络错误，请刷新页面重试"));
          // 解锁按钮
          core.unlockBtn($("button.submit"), flyer.i18n.initTitle('创建'));
          return;
        }
        if (data.length) {
          flyer.msg((flyer.i18n && flyer.i18n.initTitle("账号已经存在")) || "账号已经存在");
          // 解锁按钮
          core.unlockBtn($("button.submit"), ((flyer.i18n && flyer.i18n.initTitle('创建')) || '创建'));
          return;
        }
        // 验证通过提交数据
        $.post('/addAccount', {
          data: _this.getData(),
          create_at: flyer.formatDate('yyyy-mm-dd hh:MM:ss', new Date()),
          domain: domain,
          time: window.Date.parse(new Date())
        }, function (data) {
          //跳转账号管理
          if (data.response) {
            flyer.msg((flyer.i18n && flyer.i18n.initTitle("添加成功")) || "添加成功");
          } else {
            flyer.msg((flyer.i18n && flyer.i18n.initTitle("添加失败")) || "添加失败");
          }
          setTimeout(function () {
            $('[data-href="account_list.html"]').click();
            $(".flyer-dialog-content").remove();
            // 解锁按钮
            core.unlockBtn($("button.submit"), (flyer.i18n && flyer.i18n.initTitle("创建")) || '创建');
          }, 600);
          // $("button.submit").attr("disabled", true);
        });
      });
    });
  };
  //初始化事件
  function initEvent() {
    $('.cancle').on("click", function () {
      //取消的时候跳转账号管理
      $('[data-href="account_list.html"]').click();
    });
    //初始化域下拉框
    domaincombobox = flyer.combobox($(".flyer-input-domain"), {
      isMulti: false,
      required: true,
      allowSearch: false,
      placeholder: ((flyer.i18n && flyer.i18n.initTitle('选择域名')) || '选择域名'),
      url: '/domainList?pageNumber=1',
      fnDataProcessing: function () {
        var names = [], that = this;
        this.data = this.data.items;
        this.data.forEach(function (ele, index) {
          names.push(ele.name);
          if (ele.name === "sandbox3d390fea777441cb8283b0ed5ffcfe61.mailgun.org") {
            that.data.splice(index, 1);
            names.splice(index, 1);
          }
        });
        names.sort();
        this.data = names.map(function (item) {
          return {
            name: item
          }
        });
        this.defaultValue = this.data[0].name;
        // 删除进度条
        flyer.loading.init($('.flyer-layout-content')).delete();
      },
      fieldKey: 'name',
      fieldValue: 'name'
    });
  }
  init();
});
