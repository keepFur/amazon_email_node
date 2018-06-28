"use strict";
flyer.define("add_template", function (exports, module) {
  var editor, updateData;
  function init() {
    initEdit();
    initValid();
    initEvent();
  }
  //加载编辑器
  function initEdit() {
    editor = flyer.edit($(".flyer-textarea"), {
      tools: [{
        name: "document",
        groups: [
          "bold",
          "italic",
          "underline",
          "strike",
          "sub",
          "super",
        ]
      },
      {
        name: "typeset",
        groups: [
          "left",
          "center",
          "right"
        ]
      },
      {
        name: "insert",
        groups: [
          "pagerclip", ""
        ]
      }]
    });
  }
  //表单验证
  function initValid() {
    var form = flyer.form($("#form"), {
      validBefore: function () {
        $(".flyer-textarea").val(encodeURIComponent(editor.getContent()));
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
      // 验证通过更新数据（处于更新状态下）
      // 锁定按钮，防止多次提交表单
      var $this = this;
      core.lockedBtn($('.submit'), true, flyer.i18n.initTitle('提交中'));
      flyer.sensitive.filterSensitive($('[name="title"]').val(), function (titleSensitive) {
        if (!titleSensitive.length) {
          // 通过模板的title去数据库查找模板，防止重复提交的模板
          flyer.sensitive.filterSensitive(editor.getContent(), function (contentSensitive) {
            if (contentSensitive.length) {
              flyer.msg(flyer.i18n.initTitle("邮件内容含有以下敏感词汇") + ' [ \' ' + contentSensitive.join(',') + ' \'],' + flyer.i18n.initTitle("请删除后再发送"));
              core.unlockBtn($('.submit'), flyer.i18n.initTitle('提交'));
            } else if (updateData) {
              $.post(core.url + "/updateTemplate",
                {
                  data: $this.getData(),
                  time: JSON.stringify(flyer.formatDate('yyyy-mm-dd hh:MM:ss', new Date())),
                  tempID: updateData['ID'],
                  attachment: JSON.stringify((flyer.exports.Upload && flyer.exports.Upload.fileData)) || '',
                  update_by_name: $("#__username").val(),
                  update_by_id: $("#__userid").val(),
                  orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId']
                },
                function (data) {
                  if (data.response === "OK") {
                    //跳转模板管理
                    flyer.msg(flyer.i18n.initTitle("操作成功"));
                    setTimeout(function () {
                      $('[data-href="templates.html"]').click();
                      $(".flyer-dialog-content").remove();
                    }, 600);
                  } else {
                    // 解锁按钮
                    core.unlockBtn($('.submit'), flyer.i18n.initTitle('提交'));
                    flyer.msg(flyer.i18n.initTitle("操作失败"));
                  }
                });
            } else {
              // 新增模板的话，需要做判重
              $.ajax({
                type: 'get',
                url: core.url + '/get_template_by_title',
                data: {
                  title: $('[name="title"]').val().trim(),
                  createId: $("#__userid").val().trim()
                },
                success: function (data) {
                  if (data.success) {
                    if (data.data.length) {
                      flyer.msg(flyer.i18n.initTitle('模板已经存在'));
                      $('[name="title"]').focus();
                      return false;
                    } else {
                      //验证通过提交数据
                      $.post(core.url + "/addTemplate", {
                        data: $this.getData(),
                        time: JSON.stringify(flyer.formatDate('yyyy-mm-dd hh:MM:ss', new Date())),
                        attachment: JSON.stringify((flyer.exports.Upload && flyer.exports.Upload.fileData)) || '',
                        create_by_name: $("#__username").val(),
                        create_by_id: $("#__userid").val(),
                        orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId']
                      },
                        function (data) {
                          if (data.response === "OK") {
                            //跳转模板管理
                            flyer.msg(flyer.i18n.initTitle("操作成功"));
                            SaveTpl.delete();
                            setTimeout(function () {
                              $('[data-href="templates.html"]').click();
                              $(".flyer-dialog-content").remove();
                            }, 600);
                          } else {
                            flyer.msg(flyer.i18n.initTitle("操作失败"));
                            // 解锁按钮
                            core.unlockBtn($('.submit'), flyer.i18n.initTitle('提交'));
                          }
                        });
                    }
                  } else {
                    flyer.msg(flyer.i18n.initTitle('网络发生异常，请刷新页面重试'));
                    return;
                  }
                },
                error: function (err) {
                  flyer.msg(err);
                },
                complete: function () {
                  core.unlockBtn($('.submit'), flyer.i18n.initTitle('提交'));
                }
              });
            }
          });
        } else {
          flyer.msg(flyer.i18n.initTitle("邮件标题含有以下敏感词汇") + '[ \' ' + titleSensitive.join(',') + ' \'],' + flyer.i18n.initTitle("请删除后再发送"));
          $('[name="title"]').focus();
          core.unlockBtn($('.submit'), flyer.i18n.initTitle('提交'));
        }
      });
    });
  }

  //初始化事件
  function initEvent() {
    //给附件赋值
    flyer.exports.Upload = {
      insertedData: [],
      fileData: []
    }
    //隐藏创建人以及时间
    showMessage();
    // //判断是否填充草稿
    // if(localStorage.Template_draft){
    //   $('[name="title"]').val(JSON.parse(localStorage.Template_draft).title);
    // }

    //pop upload
    $(".pagerclip").on("click ", function () {
      flyer.open({
        pageUrl: "/html/upload.html",
        isModal: true,
        area: [600, 300],
        title: flyer.i18n.initTitle("选择附件"),
        btns: [{
          text: flyer.i18n.initTitle('确定'),
          click: function () {
            //更新气泡
            uploadBubble();
            //关闭弹窗
            //添加附件显示结构
            showAttachment();
            this.close();
          }
        }]
      });
    });

    //是否为编辑模板
    if (flyer.getQueryString("exportKey") && flyer.getQueryString("exportKey") === 'templates') {
      $.ajax({
        url: core.url + "/editorData",
        method: "get",
        data: {
          ID: flyer.getQueryString("id"),
          time: window.Date.parse(new Date())
        },
        success: function (result) {
          updateData = result;
          //插入数据
          $('[name="title"]').val(updateData.title);
          editor.setContent(decodeURIComponent(updateData.content));
          $(".flyer-input-block button:last-child").remove();
          $(".flyer-form .flyer-textarea").val(updateData.content);
          //隐藏暂存按钮
          $("#saveTempMail").remove();
          if (updateData.attachment !== 'null') {
            flyer.exports.Upload.fileData = JSON.parse(updateData.attachment);
            JSON.parse(updateData.attachment).forEach(function (obj, index) {
              var fileObj = {
                Name: '<div style="white-space: nowrap;text-overflow:ellipsis;overflow:hidden" title="' + obj.fileName + '">'
                + obj.fileName + '</div>',
                Size: core.getAttachSize(obj.fileSize / 1000),
                Delete: "<div class='delect-file-btn fa fa-times' onclick='flyer.Upload.deleteFile(this)' style='cursor:pointer' id='" + obj.fileMD5Name + "' data-index='" + index + "'></div>"
              };
              flyer.exports.Upload.insertedData.push(fileObj);
            });
          }
          uploadBubble();
          //展示附件
          showAttachment()
          //展示创建人时间
          showMessage(result);
        },
        error: function (err) {
          throw new Error(err);
        }
      });
    } else {
      SaveTpl.get();
    }
  }
  function uploadBubble() {
    if (flyer.exports.Upload && flyer.exports.Upload.fileData) {
      var fileLength = flyer.exports.Upload.fileData.length;
      if (fileLength !== 0) {
        $('#addFile span.fileNum').html(fileLength).css('display', 'inline-block');
      } else {
        $('#addFile span.fileNum').hide();
      }
    }
  }
  //暂储功能
  var SaveTpl = (function () {
    //private
    var ls = window.localStorage,
      timer,
      handleTime,
      noHandleTime, autoSaveTime = 1000 * 60 * 5;
    if (!ls) { return; }
    //获取mail信息
    function getTplData() {
      var tplSubject = $("#form input[name=title]").val(),//标题内容
        tplContent = editor.getContent(),//编辑框内容
        tplAttachment = (flyer.exports.Upload && flyer.exports.Upload.insertedData) || [],
        tplFileData = (flyer.exports.Upload && flyer.exports.Upload.fileData) || [];
      return {
        tplSubject: tplSubject,//标题
        tplContent: tplContent,//编辑框
        tplAttachment: tplAttachment,//附件列表
        tplFileData: tplFileData//附件上传用
      };
    }
    //从localstorge获取信息
    function getTpl() {
      return {
        tplSubject: ls.getItem(generateTemlateLocalStorageKey('tplSubject')),//标题缓存
        tplContent: ls.getItem(generateTemlateLocalStorageKey('tplContent')),//编辑框缓存
        tplAttachment: JSON.parse(ls.getItem(generateTemlateLocalStorageKey('tplAttachment'))),
        tplFileData: JSON.parse(ls.getItem(generateTemlateLocalStorageKey('tplAttachment')))
      };
    }
    //保存mail到localStorage
    function saveTpl() {
      var tpl = getTplData(), getTplfromLS = getTpl();
      //内容没改变不保存      
      if (getTplfromLS.tplSubject === tpl.tplSubject && getTplfromLS.tplContent === tpl.tplContent && getTplfromLS.tplAttachment === tpl.tplAttachment && getTplfromLS.tplFileData === tpl.tplFileData) {
        clearTimeout(flyer.timer);
        return;
      }
      ls.setItem(generateTemlateLocalStorageKey('tplSubject'), tpl.tplSubject || '');
      ls.setItem(generateTemlateLocalStorageKey('tplContent'), tpl.tplContent || '');
      ls.setItem(generateTemlateLocalStorageKey('tplAttachment'), JSON.stringify(tpl.tplAttachment) || null);
      ls.setItem(generateTemlateLocalStorageKey('tplFileData'), JSON.stringify(tpl.tplFileData) || null);
      flyer.msg(flyer.i18n.initTitle("已为你暂存到草稿中"));
    }
    //删除localStoraega中mail信息
    function deleteTpl() {
      ls.removeItem(generateTemlateLocalStorageKey('tplAttachment'));
      ls.removeItem(generateTemlateLocalStorageKey('tplSubject'));
      ls.removeItem(generateTemlateLocalStorageKey('tplContent'));
      ls.removeItem(generateTemlateLocalStorageKey('tplFileData'));
    }

    function timerStart() {
      flyer.timer = setInterval(function () {
        saveTpl();
      }, autoSaveTime);
    }

    function autosaveTpl() {
      $(document).on("input", function () {
        clearTimeout(flyer.timer);
        timerStart();
      });
    }

    function timerFun() {
      deleteTpl();
      saveTpl();
    }

    //public method 
    autosaveTpl();
    return {
      autoSave: function () {
        timerStart();
      },
      save: function () {
        saveTpl();
      },
      delete: function () {
        deleteTpl();
      },
      get: function () {
        $("#form input[name=title]").val(ls.getItem(generateTemlateLocalStorageKey('tplSubject'))); //标题
        editor.setContent(ls.getItem(generateTemlateLocalStorageKey('tplContent')));//内容
        if (flyer.exports.Upload && flyer.exports.Upload.insertedData && ls.getItem(generateTemlateLocalStorageKey('tplAttachment')) && JSON.parse(ls.getItem(generateTemlateLocalStorageKey('tplAttachment'))).length !== 0) {
          flyer.exports.Upload.insertedData = JSON.parse(ls.getItem(generateTemlateLocalStorageKey('tplAttachment')));//用于展示
        }
        if (flyer.exports.Upload && flyer.exports.Upload.fileData && ls.getItem(generateTemlateLocalStorageKey('tplFileData')) && JSON.parse(ls.getItem(generateTemlateLocalStorageKey('tplFileData'))).length !== 0) {
          flyer.exports.Upload.fileData = JSON.parse(ls.getItem(generateTemlateLocalStorageKey('tplFileData')));//用于提交
        }
        //调整气泡数量
        uploadBubble();
        //展示附件
        showAttachment();
      }
    };
  })();

  //点击暂存按钮立即暂存邮件
  $(".submit").next().on("click", function () {
    SaveTpl.delete();
    SaveTpl.save();
    return false;
  });
  //已添加附件展示
  function showAttachment() {
    //重置结构
    $('.attachments').remove();
    //添加附件展示
    if (flyer.exports.Upload && flyer.exports.Upload.fileData && flyer.exports.Upload.fileData.length !== 0) {
      flyer.exports.Upload.fileData.forEach(function (obj, index) {
        var fileName = obj.fileName;
        var byte = core.getAttachSize(obj.fileSize / 1024);
        var fileMD5Name = obj.fileMD5Name;
        //生成附件结构
        var _hasPreview = /jpg|jpeg|png|pdf|txt|html|docx|doc|xls|xlsx|ppt|pptx/gi.test(obj.fileMD5Name.split('.')[1].toLowerCase()) ? '<i class="fa fa-eye" style="display: inline-block;position:absolute;right:22px;top:10px;" title="' + flyer.i18n.initTitle("预览") + '" data-md5name="' + obj.fileMD5Name + '" onclick="window.previewFile(this)"></i>' : '';
        var attachment = $('<div class = "attachments" data-fileMD5Name="' + fileMD5Name + '">(' + byte + ') ' + fileName + '<i class = "fa icon-remove"></i>' + _hasPreview + '</div>');
        $(".flyer-edit").append(attachment);
        attachment.find('i:not(".fa-eye")').on("click", function () {
          var index = $(this).parent().index() - 2;
          var fileMD5NamePath = $(this).parent().attr('data-fileMD5Name');
          var _this = $(this)
          $.ajax({
            type: "post",
            url: "/upload",
            data: 'method=delete&fileName=' + fileMD5NamePath + '&time=' + window.Date.parse(new Date()),
            dataType: "text",
            success: function (data) {
              if (data === 'success') {
                _this.parent().remove();
                flyer.exports.Upload.fileData.splice(index, 1);
                flyer.exports.Upload.insertedData.splice(index, 1);
                uploadBubble();
                //重置file
                $('[target="flyer_upload_iframe"]').get(0).reset();
              }
            }
          })
        });
        //删除附件按钮
      })
    } else {
      $('.attachments').remove();
    }
  }
  //展示模板创建人时间
  function showMessage(data) {
    var result = data || {}, create_by_name = (result.create_by_name && $('.flyer-template-datil p:first').show().find('span').html(result.create_by_name)) || $('.flyer-template-datil p:first').hide(),
      create_date = (result.create_date && $('.flyer-template-datil p:last').show().find('span').html(result.create_date)) || $('.flyer-template-datil p:last').hide();
  }
  /**
   * 生成一个暂存模板功能的key，根据不同的名称
   * 生成的规则是，userId+hostname+name
   * 
   * @param {string} name 
   */
  function generateTemlateLocalStorageKey(name) {
    var userId = $("#__userid").val(),
      hostname = window.location.hostname;
    return userId + hostname + name;
  }
  init();
});


