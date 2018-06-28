"use strict";
flyer.define("send_email", function (exports, module) {
  var editor, emailCombox;
  function init() {
    initEdit();
    initEvent();
    tempSaveEmial.get();
    loadPage();
    initValid();
  }

  //数据加载 
  function loadPage() {
    var exportData = flyer.exports[flyer.getQueryString("exportKey")],
      data = exportData && exportData.data;
    if (!data) {
      data = {
        id: flyer.getQueryString("id")
      }
      if (!data.id) {
        return false;
      }
    }
    $.ajax({
      url: "/get_email_details?time=" + window.Date.parse(new Date()),
      method: "get",
      dataType: "json",
      data: data,
      success: function (data) {
        if (data && data.length && data.length > 0) {
          if (core.isSelfEmail(data[0]._to)) {
            emailCombox.setValue({ fieldKey: data[0]._to });
            $(".flyer-input[name='to']").val(data[0]._from);
          } else if (core.isSelfEmail(data[0]._from)) {
            emailCombox.setValue({ fieldKey: data[0]._from });
            $(".flyer-input[name='to']").val(data[0]._to);
          }

          $(".flyer-input[name='subject']").val(data[0]._subject);
          var readonlyText = core.formatReadonlyText(data[0]);
          $(".flyer-textarea[name='body']").data("readonly", readonlyText);
          editor.setReadonlyText(readonlyText);
          // 拉取订单
          var strEmail = core.isSelfEmail(data[0]['_from']) ? data[0]['_to'] : data[0]['_from']
          var order = data[0]['_subject'].match(/[\d]{1,}-[\d]{1,}-[\d]{1,}/ig);
          if (order || strEmail) {
            core.getOrderInfo(order && order[0].trim(), strEmail);
          }
        }
      },
      error: function (err) {
        flyer.log("error", err);
      }
    });
  }

  //加载编辑器
  function initEdit() {
    editor = flyer.edit($(".flyer-textarea"));

  }

  function initValid() {

    var form = flyer.form($("#form"), {
      validBefore: function () {
        $('input[name=subject]').val(encodeURIComponent($('input[name=subject]').val().trim()));
        $(".flyer-textarea").val(encodeURIComponent(editor.getFullContent()));
        $(".flyer-textarea").data("text", encodeURIComponent(editor.getContent()));
      },
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
      var data = this.getData();
      data.text = $(".flyer-textarea").data("text");
      data.subject = decodeURIComponent(data.subject);
      sendEmail(data);
    });
    //验证邮箱是否符合要求
    $('input[name="subject"]').on("blur", function () {
      var value = $(this).val();
      var order = value.match(/[\d]{1,}-[\d]{1,}-[\d]{1,}/ig);
      var strEmail = $('input[name="to"]').val();
      if (order || strEmail) {
        core.getOrderInfo(order && order[0].trim(), strEmail);
      }
    });
  }
  //发送邮件
  function sendEmail(data) {
    var id = core.getGUID();
    core.createMaillog({
      mailID: id,
      userID: $("#__userid").val(),
      userName: $("#__username").val(),
      content: '开始发送'
    });
    core.lockedBtn($('.submit'), true, flyer.i18n.initTitle('发送中'));
    flyer.sensitive.filterSensitive(data.subject, function (sensitivesOfSubject) {
      // 此处分开进行判断，减少后台请求
      if (sensitivesOfSubject.length === 0) {
        flyer.sensitive.filterSensitive(editor.getContent(), function (sensitivesOfBody) {
          if (sensitivesOfBody.length === 0) {
            //清除缓存
            tempSaveEmial.delete();
            $.ajax({
              url: core.url + "/sendEmail/",
              type: "post",
              timeout: 100000,
              data: {
                id: id,
                from: data.from,
                to: data.to,
                subject: window.encodeURIComponent(data.subject),
                body: data.body || "Hello",
                text: data.text || "hello",
                fileData: flyer.exports.Upload.fileData,
                user_name: window.encodeURIComponent($("#__username").val()),
                user_id: $("#__userid").val(),
                orgCode: core.getUserGroups().orgCode,
                domain: core.findInfoByEmail(data.from).domain,
                time: window.Date.parse(new Date())
              },
              success: function (result) {
                if (result.statuCode === 200) {
                  core.createMaillog({
                    mailID: id,
                    userID: $("#__userid").val(),
                    userName: $("#__username").val(),
                    content: '发送完成且成功'
                  });
                  //切换邮箱状态为已处理
                  flyer.msg(((flyer.i18n && flyer.i18n.initTitle("已经成功为你投递至")) || "已经成功为你投递至") + "[" + data.to + "]" + ((flyer.i18n && flyer.i18n.initTitle("邮箱")) || "邮箱"));
                  turnFinished();
                  core.loadPage("#unfinish");
                } else {
                  core.createMaillog({
                    mailID: id,
                    userID: $("#__userid").val(),
                    userName: $("#__username").val(),
                    content: '发送完成但失败'
                  });
                  flyer.msg(flyer.i18n.initTitle('邮件发送失败') + ':' + flyer.i18n.initTitle(result.message));
                  $('input[name=subject]').val(decodeURIComponent($('input[name=subject]').val().trim()));
                  $(".flyer-textarea").val(decodeURIComponent(editor.getFullContent()));
                  $(".flyer-textarea").data("text", decodeURIComponent(editor.getContent()));
                }
              },
              error: function (text) {
                flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试'));
                core.createMaillog({
                  mailID: id,
                  userID: $("#__userid").val(),
                  userName: $("#__username").val(),
                  content: '发送出现错误'
                });
              },
              complete: function () {
                // 解锁按钮
                core.unlockBtn($('.submit'), '发送邮件');
              }
            });
          } else {
            flyer.msg(((flyer.i18n && flyer.i18n.initTitle("邮件内容含有以下敏感词汇 ")) || "邮件内容含有以下敏感词汇 ") + '[ \' ' + sensitivesOfBody.join(',') + ' \'],' + ((flyer.i18n && flyer.i18n.initTitle("请删除后再发送")) || "请删除后再发送"));
            core.unlockBtn($('.submit'), '发送邮件');
            return;
          }
        });
      } else {
        flyer.msg('邮件主题含有以下敏感词汇 [ \' ' + sensitivesOfSubject.join(',') + ' \'],请删除后再发送');
        core.unlockBtn($('.submit'), '发送邮件');
        $('input[name=subject]').focus();
      }
    });
  }

  //所有的脚本事件
  function initEvent() {
    //给附件赋值
    flyer.exports.Upload = {
      insertedData: [],
      fileData: []
    }

    //pop upload
    $(".pagerclip").on("click ", function () {
      flyer.open({
        content: `<input type="file" multiple="multiple" class="flyer-upload-file" />
                  <div id='filesTable'>
                  </div>
                  <script src="../js/upload.js"></script>`,
        isModal: true,
        area: [600, 300],
        title: ((flyer.i18n && flyer.i18n.initTitle("选择附件")) || "选择附件"),
        btns: [
          {
            text: (flyer.i18n && flyer.i18n.initTitle('确定')) || '确定',
            skin: "",
            click: function () {
              uploadBubble();
              this.close();
              //展示已添加的附件
              showAttachment();
            }
          }
        ]
      });
    });
    //引用模板
    $(".template").on("click", function () {
      flyer.open({
        pageUrl: core.url + "/html/template_choice.html",
        isModal: true,
        area: [600, 400],
        title: flyer.i18n.initTitle("模板"),
        btns: [
          {
            text: (flyer.i18n && flyer.i18n.initTitle('确定')) || '确定',
            skin: "",
            click: function () {
              //填充数据
              if ($(".template-container .active").length === 0) {
                flyer.msg(((flyer.i18n && flyer.i18n.initTitle("请至少选择一项")) || "请至少选择一项"));
                return;
              } else {
                var data = flyer.exports.template_choice.templateChioce[
                  $(".template-container .active").parent().index()
                ];
                //给编辑框赋值
                editor.setContent(core.conpileHtml(decodeURIComponent(data.content)));
                //不需要
                // $('[name="subject"]').val(data.title);
                //给附件赋值
                loadFile(data);
                //展示附件
                showAttachment();
                //关闭弹窗
                this.close();
              }
            }
          }
        ]
      });
    });
    function loadFile(data) {
      if (data.attachment !== 'null') {
        if (flyer.exports.Upload && flyer.exports.Upload.fileData) {
          flyer.exports.Upload.fileData = JSON.parse(data.attachment).concat(flyer.exports.Upload.fileData)
        }
        flyer.exports.Upload.insertedData = [];
        JSON.parse(data.attachment).forEach(function (obj, index) {
          var fileObj = {
            Name: '<div style="white-space: nowrap;text-overflow:ellipsis;overflow:hidden" title="' + obj.fileName + '">'
              + obj.fileName + '</div>',
            Size: core.getAttachSize(obj.fileSize / 1024),
            Delete: "<div class='delect-file-btn fa fa-times' onclick='flyer.Upload.deleteFile(this)' style='cursor:pointer' id='" + obj.fileMD5Name + "' data-index='" + index + "'></div>"
          };
          flyer.exports.Upload.insertedData.push(fileObj);
        });
      }
      //更新附件气泡
      uploadBubble();
    }
    exports.loadFile = loadFile;
    //发件箱实例化
    emailCombox = flyer.combobox($(".emailBox"), {
      isMulti: false,
      required: true,
      allowSearch: false,
      placeholder: ((flyer.i18n && flyer.i18n.initTitle("发件人")) || "发件人"),
      disabled: flyer.getQueryString("id") ? true : false,
      name: "from",
      url: '/email_list?depa_id=' + core.getUserGroups().orgGroupId,
      fnDataProcessing: function () {
        // var supportemail = ['service@support.aukey.com', 'service@supportus.aukey.com', 'service@supporteu.aukey.com', 'service@supportca.aukey.com'];
        // var tensentSupportemail = ['support@aukey.com', 'support.us@aukey.com', 'support.eu@aukey.com', 'support.ca@aukey.com'];
        this.data = this.data;
        // data.filter(function (item) {
        //   var index = supportemail.indexOf(item.mail_address);
        //   if (index === -1) {
        //     item.mail_address = tensentSupportemail[index];
        //     return item
        //   }
        // });
        exports.returnEmail = this.data
        if (!returnEmail(exports.returnEmail)) {
          this.defaultValue = '';
        } else {
          this.defaultValue = returnEmail(exports.returnEmail);
        }
      },
      fieldKey: 'mail_address',
      fieldValue: 'mail_address'
    });
  }
  function returnEmail(data) {
    var hasDraft = localStorage.getItem(window.Number($("#__userid").val()) + window.location.hostname);
    if (hasDraft && JSON.parse(hasDraft)["email_from"]) {
      var result_email = data && data.filter(function (obj, index) {
        return obj.mail_address === JSON.parse(hasDraft)["email_from"]
      })
      if (result_email && result_email.length >= 1) {
        return result_email[0].mail_address
      } else {
        return false
      }
    } else {
      return false
    }
  }
  //暂储功能
  var tempSaveEmial = (function () {
    //private
    var ls = window.localStorage,
      timer,
      handleTime,
      noHandleTime, autoSaveTime = 1000 * 60 * 5;
    if (!ls) {
      return;
    }
    //获取mail信息
    function getMailData() {
      var tempRecive = $("#form input[name=to]").val(),
        tempSubject = $("#form input[name=subject]").val(),
        mailMainContent = editor.getContent(),
        emailAttachment = flyer.exports.Upload.insertedData,
        emailFileData = flyer.exports.Upload.fileData,
        email_from = emailCombox.getSelectedValue()
      return {
        recive: tempRecive,
        subject: tempSubject,
        mailContent: mailMainContent,
        emailAttachment: emailAttachment,
        emailFileData: emailFileData,
        email_from: email_from
      };
    }

    //从localstorge获取信息
    function getTempMail() {
      var user = window.Number($("#__userid").val()) + window.location.hostname;
      return {
        recive: ls.getItem(user) ? ls.getItem(user)['recive'] : '',
        subject: ls.getItem(user) ? ls.getItem(user)['subject'] : '',
        mailContent: ls.getItem(user) ? ls.getItem(user)['mailContent'] : '',
        emailAttachment: ls.getItem(user) ? JSON.parse(ls.getItem(user))['emailAttachment'] : '',
        emailFileData: ls.getItem(user) ? JSON.parse(ls.getItem(user))['emailFileData'] : '',
        email_from: ls.getItem(user) ? ls.getItem(user)['email_from'] : ''
      };
    }

    //保存mail到localStorage
    function saveTempMail() {
      var mail = getMailData(), getMailfromLS = getTempMail();

      //内容没改变不保存      
      if (getMailfromLS.recive === mail.recive && getMailfromLS.subject === mail.subject && getMailfromLS.mailContent === mail.mailContent && getMailfromLS.emailAttachment === mail.emailAttachment && getMailfromLS.emailFileData === mail.emailFileData && getMailfromLS.email_from === mail.email_from) {
        clearTimeout(flyer.timer);
        return;
      }
      //添加当前账号的缓存（修复账号切换数据还在的问题）
      var draftData = {
        "user": mail.recive || "",
        "recive": mail.recive || "",
        "subject": mail.subject || "",
        "mailContent": mail.mailContent || "",
        "emailAttachment": mail.emailAttachment || null,
        "emailFileData": mail.emailFileData || null,
        "email_from": emailCombox.getSelectedValue() === 'undefined' ? "" : emailCombox.getSelectedValue()
      }
      ls.setItem(window.Number($("#__userid").val()) + window.location.hostname, JSON.stringify(draftData));
      flyer.msg(((flyer.i18n && flyer.i18n.initTitle("已为你暂存到草稿中")) || "已为你暂存到草稿中"));

    }

    //删除localStoraega中mail信息
    function deleteTempMail() {
      ls.removeItem(window.Number($("#__userid").val()) + window.location.hostname);
    }

    function timerStart() {
      flyer.timer = setInterval(function () {
        saveTempMail();
      }, autoSaveTime)
    }
    function autoSaveTempMail() {
      $(document).on("input", function () {
        clearTimeout(flyer.timer);
        timerStart();
      });
    }
    function timerFun() {
      deleteTempMail();
      saveTempMail();
    }

    //public method 
    autoSaveTempMail();
    return {
      autoSave: function () {
        timerStart();
      },
      save: function () {
        saveTempMail();
      },
      delete: function () {
        deleteTempMail();
      },
      get: function () {
        var user = window.Number($("#__userid").val()) + window.location.hostname;
        var lg = JSON.parse(ls.getItem(user));
        if (lg) {
          $("#form input[name=to]").val(lg["recive"]);
          $("#form input[name=subject]").val(lg["subject"]);
          if (lg["mailContent"]) {
            setTimeout(function () {
              editor.setContent(core.conpileHtml(decodeURIComponent(lg["mailContent"])));
            }, 11)

          }
          if (lg["emailAttachment"]) {
            flyer.exports.Upload.insertedData = lg["emailAttachment"];//用于展示
          }
          if (lg["emailFileData"]) {
            flyer.exports.Upload.fileData = lg["emailFileData"];//用于提交
          }
          //更新附件气泡
          uploadBubble();
          //更新附件展示
          showAttachment();
        }
      }
    };
  })();

  //点击暂存按钮立即暂存邮件
  $("#saveTempMail").on("click", function () {
    tempSaveEmial.delete();
    tempSaveEmial.save();
    return false;
  });
  //end 暂存功能 

  //点击清除按钮立即清除邮件
  $("#clearTempMail").on("click", function () {
    tempSaveEmial.delete();
  });
  //end 清除功能 

  //附件气泡
  function uploadBubble() {
    if (flyer.exports.Upload && flyer.exports.Upload.fileData) {
      var fileLength = flyer.exports.Upload.fileData.length
      if (fileLength !== 0) {
        $('#addFile span.fileNum').html(fileLength).css('display', 'inline-block');
      } else {
        $('#addFile span.fileNum').hide();
      }
    }
  }
  //已添加附件展示
  function showAttachment() {
    //重置结构
    $('.attachments').remove();
    //添加附件展示
    if (flyer.exports.Upload && flyer.exports.Upload.fileData && flyer.exports.Upload.fileData.length !== 0) {
      flyer.exports.Upload.fileData.forEach(function (obj, index) {
        var fileName = obj.fileName;
        var byte = core.getAttachSize((obj.fileSize / 1024));
        //生成附件结构
        var _hasPreview = /jpg|jpeg|png|pdf|txt|html|docx|doc|xls|xlsx|ppt|pptx/gi.test(obj.fileMD5Name.split('.')[1].toLowerCase()) ? '<i class="fa fa-eye" style="display: inline-block;position:absolute;right:22px;top:10px;" title="' + flyer.i18n.initTitle("预览") + '" data-md5name="' + obj.fileMD5Name + '" onclick="window.previewFile(this)"></i>' : '';
        var attachment = $('<div class = "attachments" title="(' + byte + ')' + fileName + '">(' + byte + ') ' + fileName + '<i class = "fa icon-remove"></i>' + _hasPreview + '</div>');
        $(".flyer-edit").append(attachment);
        attachment.find('i:not(".fa-eye")').on("click", function () {
          var index = $(this).parent().index() - 2;
          $(this).parent().remove();
          flyer.exports.Upload.fileData.splice(index, 1);
          flyer.exports.Upload.insertedData.splice(index, 1);
          uploadBubble();
        });
        //删除附件按钮
      });
    } else {
      $('.attachments').remove();
    }
  }
  //转为已处理
  function turnFinished() {
    $.ajax({
      url: "/turn_disposed_status",
      method: "get",
      data: {
        data: [flyer.getQueryString("subject_num")],
        status: 7, //转为已处理
        name: '已回复',
        time: window.Date.parse(new Date())
      },
      success: function (result) {
        //刷新左侧数量
        window.bubbleData();
      },
      error: function (err) {
        throw new Error(err);
      }
    })
  }
  init();
});

