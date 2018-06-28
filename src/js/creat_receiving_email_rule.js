"use strict";
flyer.define("creat_email_rule", function (exports, module) {
  var baseData = {
    editor: '',//编辑器实例
    accountCombobox: null,
    startTimeCombobox: null,
    endTimeCombobox: null,
    typeCombobox: null,
    assingedCombobox: null,
    languageCombobox: null,
    languages: [
      {
        ID: 'unknown',
        languageName: '默认'
      },
      {
        ID: 'zh',
        languageName: '汉语'
      }, {
        ID: 'en',
        languageName: '英语'
      }, {
        ID: 'de',
        languageName: '德语'
      }, {
        ID: 'fr',
        languageName: '法语'
      }, {
        ID: 'ja',
        languageName: '日语'
      }, {
        ID: 'es',
        languageName: '西班牙语'
      }, {
        ID: 'it',
        languageName: '意大利语'
      }
    ]
  };

  /**
   * 页面初始化函数
   * 
   */
  function init() {
    // 初始化富文本编辑器
    initEdit();
    // 初始化所有的下拉框
    initSelectBox();
    // 初始化页面，判断是修改还是新增
    setTimeout(function () {
      initPage();
    }, 500);
    // 初始化事件
    initEvents();
    // 高亮左侧菜单
    core.menuHeightLightByKey('receiving_email_rules');
  }

  /**
   * 
   *初始化富文本编辑器 
   */
  function initEdit() {
    var $editContainer = $('.flyer-textarea');
    baseData.editor = flyer.edit($editContainer);
    // 暂时通过脚本移除附件和模板功能
    $('.flyer-edit-tool').find('span:eq(2)').remove();
  }

  /**
   * 初始化页面中的下拉框
   * 
   */
  function initSelectBox() {
    //账号下拉框
    var $accountSelectContainer = $('#accountSelectContainer'),
      //收件时间开始下拉框
      $startTimeSelectConainer = $('#startTimeSelectConainer'),
      //收件时间结束下拉框
      $endTimeSelectConainer = $('#endTimeSelectConainer'),
      //归类为下拉框（数据取的是发送邮件的时候的地址）
      $replySelectContainer = $('#replySelectContainer'),
      //分派为下拉框（数据取的是分配邮件的地址）
      $assingedSelectContainer = $('#assingedSelectContainer'),
      //语种选择下拉框
      $languageSelectConainer = $('#languageSelectConainer'),
      timeArr = generateTime(),
      id = flyer.getQueryString('ID'),
      operatorType = id ? 'update' : 'create';//带了id参数的话是修改，否则的话是新增
    // 账号
    baseData.accountCombobox = flyer.combobox($accountSelectContainer, generateOptions({
      fnDataProcessing: function () {
        this.data = this.data;
        if (this.data.length) {
          if (operatorType === 'create') {
            this.defaultValue = this.data[0].mail_address;
          }
        }
      },
      allValue: 'All',
      multipleSeparator: ',',
      isMulti: false,
      placeholder: flyer.i18n.initTitle('请选择邮箱'),
      fieldKey: 'mail_address',
      fieldValue: 'mail_address',
      url: '/email_list?depa_id=' + core.getUserGroups().orgGroupId + '&nocache=' + new Date().getTime()
    }));
    // 开始时间
    baseData.startTimeCombobox = flyer.combobox($startTimeSelectConainer, generateOptions({ data: timeArr }));
    // 结束时间
    baseData.endTimeCombobox = flyer.combobox($endTimeSelectConainer, generateOptions({ data: timeArr }));
    if (operatorType === 'create') {
      baseData.startTimeCombobox.setValue({ fieldKey: timeArr[0].key, fieldValue: timeArr[0].value });
      baseData.endTimeCombobox.setValue({ fieldKey: timeArr[timeArr.length - 1].key, fieldValue: timeArr[timeArr.length - 1].value });
    }
    // 归类为
    initTypeCombobox($replySelectContainer);
    // 分派为
    baseData.assingedCombobox = flyer.combobox($assingedSelectContainer, generateOptions({
      url: getGroupListUrl(),
      placeholder: flyer.i18n.initTitle('分派账号'),
      isMulti: false,
      fieldKey: 'user_id',
      fieldValue: 'account',
      fnDataProcessing: function () {
        this.data = this.data.rows;
      }
    }));
    // 语种选择
    baseData.languageCombobox = flyer.combobox($languageSelectConainer, {
      placeholder: flyer.i18n.initTitle('选择语种'),
      isMulti: false,
      fieldKey: 'ID',
      fieldValue: 'languageName',
      allowSearch: false,
      data: baseData.languages
    });
  }



  /**
   * 初始化归类为下拉框
   * 
   * @param {any} $selector 下拉框容器
   */
  function initTypeCombobox($selector, defaultValue) {
    if ($selector.length) {
      baseData.typeCombobox = flyer.combobox($selector, generateOptions({
        fnDataProcessing: function () {
          this.data = this.data.rows;
          this.data.push({
            ID: 'add',
            type_name: flyer.i18n.initTitle('新建文件夹'),
          });
        },
        fnSelected: function (item, elm, items) {
          // 选中的是新建文件夹
          if (item.fieldKey === 'add') {
            addFolderClient();
          }
          return false;
        },
        defaultValue: defaultValue || '',
        isMulti: false,
        placeholder: flyer.i18n.initTitle('归类名称'),
        fieldKey: 'ID',
        fieldValue: 'type_name',
        url: '/file_list?pageNumber=1&depa_id=' + core.getUserGroups().orgGroupId + '&orgGroupId=' + core.getUserGroups().orgGroupId + '&orgCode=' + core.getUserGroups().orgCode + '&nocache=' + new Date().getTime()
      }));
    }
  }

  /**
   * 初始化页面事件
   * 
   */
  function initEvents() {
    // 保存收信规则
    $('#flyerCreateBtn').on('click', createRuleHandle);
    // 取消收信规则
    $('#flyerCancelBtn').on('click', cancelCreateRuleHandle);
    // 标记为已处理checkbox的点击事件
    //$('input[type=checkbox][name=flyer-finish-checkbox]').on('click', markedFinishhandle);
  }

  /**
   * 初始化页面，判断是修改还是新增
   * 
   */
  function initPage() {
    var id = flyer.getQueryString('ID'),
      operatorType = id ? 'update' : 'create';//带了id参数的话是修改，否则的话是新增
    $('a[data-href="receiving_email_rules.html"]').addClass('flyer-layout-linkActive');
    if (operatorType === 'update') {
      $('.flyer-layout-previewTitle span').text(flyer.i18n.initTitle('修改收信规则'));
      // 通过id获取一条记录
      $.ajax({
        url: '/get_receiving_email_rule_by_id',
        type: 'get',
        data: {
          id: id
        },
        success: function (res) {
          if (res.success) {
            var rule = res.data[0],
              mailAddressId = rule.mail_address_id.split(','),
              timeObj = JSON.parse(rule.time),
              typeObj = JSON.parse(rule.email_type_rule),
              assingedObj = JSON.parse(rule.assigned_rule),
              replyObj = JSON.parse(rule.reply_rule),
              languageObj = JSON.parse(rule.mail_language || "{}")
              ;
            baseData.selectedDataOfType = typeObj;
            // 条件
            // 使用规则邮箱
            baseData.accountCombobox.setValues(mailAddressId.map(function (item) {
              if (item) {
                return {
                  fieldKey: item,
                  fieldValue: item
                }
              }
            }));
            // 是否启用
            $('input[name=flyer-active-radio]').attr('checked', rule.active === '0' ? false : true);
            // 发件人
            setInputValueByName('from', rule._from);
            // 发件域
            setInputValueByName('domain', rule.domain);
            // 收件人
            setInputValueByName('to', rule._to);
            // 主题
            setInputValueByName('subject', rule._subject);
            // 邮件大小
            setInputValueByName('size', rule.size);
            // 接收时间
            setInputValueByName('time', rule.time);
            // 内容语种
            setInputValueByName('language', rule.mail_language);
            if (timeObj.isChecked) {
              baseData.startTimeCombobox.setValue({
                fieldKey: timeObj.startTime,
                fieldValue: timeObj.startTime
              });
              baseData.endTimeCombobox.setValue({
                fieldKey: timeObj.endTime,
                fieldValue: timeObj.endTime
              });
            }
            // 语种
            if (languageObj.isChecked) {
              baseData.languageCombobox.setValue({
                fieldKey: languageObj.languageID,
                fieldValue: languageObj.languageName
              });
            }
            // 结果
            // 处理方式
            // $('input[name=handleType]').val(rule.handle_type);
            if (rule.handle_type === '1') {
              // 归类为
              if (typeObj.isChecked) {
                $('input[name=flyer-type-checkbox]').attr('checked', true);
                setTimeout(function () {
                  baseData.typeCombobox.setValue({
                    fieldKey: typeObj.typeId,
                    fieldValue: typeObj.typeName
                  });
                }, 1000);
              }
              // 分派为
              if (assingedObj.isChecked) {
                $('input[name=flyer-assinged-checkbox]').attr('checked', true);
                setTimeout(function () {
                  baseData.assingedCombobox.setValue({
                    fieldKey: assingedObj.assingedEmailId,
                    fieldValue: assingedObj.assingedEmailName
                  });
                }, 1000);
              }
              // 标记为已处理
              if (rule.finish_rule === '1') {
                $('input[name=flyer-finish-checkbox]').attr('checked', true);
                //$('input[name=flyer-reply-checkbox]').prop({ checked: true, disabled: true });
              }
              // 自动回复
              if (replyObj.isChecked) {
                $('input[name=flyer-reply-checkbox]').attr('checked', true);
                // 设置编辑器的文本内容，此处取得是，格式化后的文本 formatContent
                baseData.editor.setContent(JSON.parse(replyObj.body).formatContent || '');
              }
            }
          } else {
            flyer.msg(flyer.i18n.initTitle('收信不存在，请刷新页面重试'));
          }
        },
        error: function (err) {
          flyer.msg(flyer.i18n.initTitle('网络出现异常，请刷新页面重试'));
        }
      });
    }
  }

  /**
   * 保存收信规则处理函数
   * 
   * @param {any} event 事件触发对象 
   */
  function createRuleHandle(event) {
    var e = event || window.event,
      formDatas = getFormDatas(),
      timeObj = JSON.parse(formDatas.time),
      sizeObj = JSON.parse(formDatas.size),
      replyObj = JSON.parse(formDatas.replyRule);
    if (!formDatas.mailAddressName) {
      flyer.msg(flyer.i18n.initTitle('请选择使用规则邮箱'));
      return false;
    }
    // 判断时间
    if (timeObj.isChecked && compareTime(timeObj.startTime, timeObj.endTime)) {
      flyer.msg(flyer.i18n.initTitle('请选择正确的收件时间范围'));
      return false;
    }
    // 判断字节
    if (sizeObj.isChecked && isNaN(sizeObj.text)) {
      flyer.msg(flyer.i18n.initTitle('邮件大小只能是数字类型'));
      $('input[name=flyer-size-text]').focus();
      return false;
    }
    // 判断自动回复的内容是否为空并且是否含有敏感词汇
    if (replyObj.isChecked) {
      var content = baseData.editor.getContent();
      if (!content) {
        flyer.msg(flyer.i18n.initTitle('自动回复的内容不能为空'));
        return false;
      } else {
        flyer.sensitive.filterSensitive(content, function (sensitives) {
          if (sensitives.length) {
            flyer.msg(flyer.i18n.initTitle("自动回复的内容包含下列敏感词汇") + '[ ' + sensitives.join('、') + ' ]');
            return false;
          }
        });
      }
    }
    if (!checkEmptyCondition()) {
      flyer.msg(flyer.i18n.initTitle('还未制定任何规则'));
      return false;
    }
    // 锁定按钮
    core.lockedBtn($(e.target), true, flyer.i18n.initTitle('正在保存'));
    $.ajax({
      url: '/add_receiving_email_rule?nocache=' + new Date().getTime(),
      type: 'post',
      data: formDatas,
      success: function (res) {
        if (res && res.success) {
          flyer.msg(flyer.i18n.initTitle("操作成功"));
          // 回到列表页面
          $('a[data-href="receiving_email_rules.html"]').trigger('click');
        } else {
          flyer.msg(flyer.i18n.initTitle("操作失败"));
        }
      },
      error: function (err) {
        flyer.msg(flyer.i18n.initTitle('网络出现异常，请刷新页面重试'));
      },
      complete: function () {
        core.unlockBtn($(e.target), flyer.i18n.initTitle('保存'));
      }
    });

  }

  /**
   * 取消创建收信规则处理函数
   * 
   * @param {any} event 
   */
  function cancelCreateRuleHandle(event) {
    var e = event || window.event;
    $('a[data-href="receiving_email_rules.html"]').trigger('click');
    return false;
  }

  /**
   * 标记为已处理按钮的点击事件处理函数
   * 选中为已处理的时候，自动回复必须自动勾选上去，并且自动回复按钮不能点击
   * @param {any} event 
   */
  function markedFinishhandle(event) {
    var e = event || window.event, $this = $(this);
    if ($this.is(':checked')) {
      $('input[type=checkbox][name=flyer-reply-checkbox]').prop({ 'checked': true, 'disabled': true });
    } else {
      $('input[type=checkbox][name=flyer-reply-checkbox]').prop({ 'checked': false, 'disabled': false });
    }
  }



  /**
   * 生成一个一天的时间数组,例如[{key:1,value:'1:00'},...{key:24,value:'24:00'}]
   * 
   */
  function generateTime() {
    var timeArr = [];
    for (var i = 0; i < 25; i++) {
      timeArr[i] = {
        key: i + ':00',
        value: i + ':00'
      };
    }
    return timeArr;
  }

  /**
   * 生成下拉框的配置参数
   * 
   * @param {any} extends 需要扩展的配置参数
   * @returns 返回生成的配置参数
   */
  function generateOptions(extendOptions) {
    var options = {
      isMulti: false,
      required: false,
      allowSearch: false,
      fieldKey: 'key',
      fieldValue: 'value'
    };
    if (extendOptions && typeof extendOptions === 'object') {
      for (var key in extendOptions) {
        if (extendOptions.hasOwnProperty(key)) {
          options[key] = extendOptions[key];
        }
      }
    }
    return options;
  }

  /**
   * 获取查询分派组的url
   * 
   * @returns 查询地址 
   */
  function getGroupListUrl() {
    var accountData = {
      org_category_id: JSON.parse(window.unescape($("#__groups").val()))[0]['categoryId'],
      org_group_id: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
      org_id: JSON.parse(window.unescape($("#__groups").val()))[0]['orgId']
    }, time = new Date().getTime(), url = '/assign_group_list?nocache=' + time + '&pageNumber=1&data=' + JSON.stringify(accountData);
    return url;
  }

  /**
   * 获取表单数据
   * 
   * @returns 返回表单的数据
   */
  function getFormDatas() {
    var datas = {
      active: 0,//是否启用
      from: '',// 发件人
      domain: '',//域名
      to: '',//收件人
      subject: '',//主题
      size: 0,//大小
      mailAddress: '',//邮件地址
      emailTypeRule: '',// 归类为
      assignedRule: '',// 分派为
      replyRule: '',// 自动回复
      finishRule: '',// 已处理
      orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],//组id
      createdById: $("#__userid").val().trim(),//用户id
      createdByName: $('#__username').val().trim(),//更新用户
      time: '',//收件时间
      language: '',//邮件内容语种
      handleType: '1',
      id: flyer.getQueryString('ID')//根据是否有id进行判断是修改还是新增操作
    },
      isTimeChecked = $('input[name=flyer-time-checkbox]').is(':checked'),
      isTypeChecked = $('input[name=flyer-type-checkbox]').is(':checked'),
      isAssingedChecked = $('input[name=flyer-assinged-checkbox]').is(':checked'),
      isReplyChecked = $('input[name=flyer-reply-checkbox]').is(':checked'),
      isLanguageChecked = $('input[name=flyer-language-checkbox]').is(':checked')
      ;

    // 条件
    datas.active = $('input[name=flyer-active-radio]').is(':checked') ? 1 : 0;
    datas.from = getInputValueByName('from');
    datas.domain = getInputValueByName('domain');
    datas.to = getInputValueByName('to');
    datas.subject = getInputValueByName('subject');
    datas.size = getInputValueByName('size');
    datas.mailAddressId = baseData.accountCombobox.getSelectedValue();
    datas.mailAddressName = baseData.accountCombobox.getSelectedText();
    datas.time = JSON.stringify({
      isChecked: isTimeChecked,
      startTime: isTimeChecked ? baseData.startTimeCombobox.getSelectedText() : '',
      endTime: isTimeChecked ? baseData.endTimeCombobox.getSelectedText() : ''
    });
    datas.language = JSON.stringify({
      isChecked: isLanguageChecked,
      languageID: isLanguageChecked ? baseData.languageCombobox.getSelectedValue() : '',
      languageName: isLanguageChecked ? baseData.languageCombobox.getSelectedText() : ''
    });
    // 规则
    // 归类为
    var selectedDatas = baseData.typeCombobox.options.data.filter(function (item) {
      return String(item.ID) === baseData.typeCombobox.getSelectedValue();
    }), userId = '';
    if (selectedDatas.length) {
      userId = String(selectedDatas[0].create_by_id) || '';
    }
    datas.emailTypeRule = JSON.stringify({
      isChecked: isTypeChecked,
      typeName: isTypeChecked ? baseData.typeCombobox.getSelectedText() : '',
      typeId: isTypeChecked ? baseData.typeCombobox.getSelectedValue() : '',
      userId: userId,
      depaId: core.getUserGroups().orgGroupId || ''
    });
    // 分派为
    datas.assignedRule = JSON.stringify({
      isChecked: isAssingedChecked,
      assingedEmailName: isAssingedChecked ? baseData.assingedCombobox.getSelectedText() : '',
      assingedEmailId: isAssingedChecked ? baseData.assingedCombobox.getSelectedValue() : ''
    });
    // 已处理
    datas.finishRule = $('input[name=flyer-finish-checkbox]').is(':checked') ? 1 : 0;
    // 自动回复 （获取用户输入的内容和上传的附件以及模板）
    datas.replyRule = JSON.stringify({
      isChecked: isReplyChecked,
      body: isReplyChecked ? JSON.stringify({
        content: baseData.editor.getText().replace(/<.*?>/g, ' ').replace(/&nbsp;/g, ' '),//文本内容未经格式化的
        formatContent: baseData.editor.getContent(),//文本内容经过格式化的
        attachments: '',//附件 暂时不需要
        template: ''//模板，暂时不需要
      }) : JSON.stringify({})
    });
    // 处理方式1是执行用户自定义的操作，0是直接删除邮件
    datas.handleType = $('input[name=flyer-handle-type-checkbox]:checked').val();
    return datas;
  }

  /**
   * 根据输入框的名称，获取一组数据
   * 
   * @param {any} inputName 输入框名称，此处只需要传入一个简称即可，例如 <input name="flyer-from-radio"> 传入from即可
   * @returns 返回一个json字符串
   */
  function getInputValueByName(shortName) {
    var obj = {
      isChecked: false,
      isContainer: false,
      text: ''
    }, longName = "";
    if (shortName) {
      longName = 'flyer-' + shortName;
      var text = $('input[name="' + longName + '-text' + '"]').val().trim();
      if (text) {
        obj.isChecked = $('input[name="' + longName + '-checkbox' + '"]').is(':checked');
        obj.isContainer = $('input[name="' + longName + '-radio' + '"]').is(':checked');
        obj.text = obj.isChecked ? text : '';
      }
    }
    return JSON.stringify(obj);
  }

  /**
   * 根据输入框的名称和值，设置成相应的值
   * 
   * @param {any} shortName 输入框名称，此处只需要传入一个简称即可，例如 <input name="flyer-from-radio"> 传入from即可
   * @param {any} valObj 新的值
   */
  function setInputValueByName(shortName, valObj) {
    var longName = '';
    if (valObj && shortName) {
      longName = 'flyer-' + shortName;
      valObj = JSON.parse(valObj);
      if (valObj.isChecked) {
        $('input[name="' + longName + '-checkbox' + '"]').attr('checked', true);
        $('input[name="' + longName + '-radio' + '"]').attr('checked', valObj.isContainer);
        $('input[name="' + longName + '-text' + '"]').val(valObj.text);
      }
    }
  }

  /**
   * 比较两个时间字符串的大小，参数格式是'1:00'，。。。,'24:00'
   * 
   * @param {any} startTime 开始时间
   * @param {any} endTime 结束时间
   * @returns 如果是开始时间大于或等于结束时间，返回true。否则返回false
   */
  function compareTime(startTime, endTime) {
    var result = true;
    if (startTime && endTime) {
      result = parseInt(startTime) >= parseInt(endTime);
      return result;
    }
    return;
  }
  /**
   * 判断用户是否所有条件都没选择
   * 
   * @returns 如果一个都没有选中的话，那么返回false
   */
  function checkEmptyCondition() {
    return $('.flyer-conditions-box .creat-rules-choose').find('div.creat-rules-if').find('input[type=checkbox]').is(':checked');
  }


  /**
   * 新增文件夹，客户端
   * 
   */
  function addFolderClient() {
    flyer.open({
      pageUrl: core.url + '/html/add_folder.html',
      isModal: true,
      area: [400, 120],
      title: flyer.i18n.initTitle("新建文件夹"),
      btns: [
        {
          click: function () {
            var floderName = $(".folder_name").val().trim(),
              depa_id = JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'];//组id;
            //提交文件名
            if (floderName.length > 10 || floderName === 0) {
              flyer.msg(((flyer.i18n && flyer.i18n.initTitle("文件夹名称长度在10个字符以内且不为空")) || "文件夹名称长度在10个字符以内且不为空"));
              $(".folder_name").focus();
            } else {
              addFolderServer(floderName, depa_id, this);
            }
          },
          text: flyer.i18n.initTitle('确定')
        },
        {
          click: function () {
            if (!flyer.getQueryString('ID')) {
              baseData.typeCombobox.empty();
            } else {
              baseData.typeCombobox.setValue({
                fieldKey: baseData.selectedDataOfType.typeId,
                fieldValue: baseData.selectedDataOfType.typeName
              });
            }
            this.close();
          },
          text: flyer.i18n.initTitle('关闭')
        }
      ]
    });
  }

  /**
   * 新增文件夹，服务端
   * 
   * @param {str} floderName 文件夹名称
   * @param {str} user_id 用户id
   */
  function addFolderServer(floderName, depa_id, windowObj) {
    $.ajax({
      url: core.url + '/ifContainFile',
      data: {
        fileName: floderName,//新的名称
        depa_id: depa_id
      },
      success: function (data) {
        if (data['count'] === 0) {
          $.ajax({
            url: core.url + '/add_filetype',
            method: 'get',
            data: {
              type_name: floderName,
              depa_id: depa_id,
              time: window.Date.parse(new Date())
            },
            success: function (data) {
              if (data.affectedRows === 1) {
                flyer.msg(flyer.i18n.initTitle("文件夹新建成功"));
                // 赋值给下拉框
                initTypeCombobox($('#replySelectContainer'), data.insertId.toString());
                if (windowObj && windowObj.close) {
                  windowObj.close();
                }
                //刷新左侧菜单
                window.getFolder();
              } else {
                flyer.msg(flyer.i18n.initTitle('创建失败'));
              }
            },
            error: function (err) {
              flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试'));
            }
          });
        } else {
          flyer.msg(flyer.i18n.initTitle("已存在同名文件夹"));
          $(".folder_name").focus();
        }
      },
      error: function (err) {
        flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试'));
      }
    });
  }
  // 页面入口
  init();
});