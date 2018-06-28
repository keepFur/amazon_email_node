"use strict";
flyer.define("customer_complaint_history", function (exports, module) {
  var baseData = {
    // 邮件信息
    emailInfo: flyer.exports.frame ? flyer.exports.frame.emailInfo : JSON.parse(window.decodeURIComponent(flyer.getQueryString('emailInfo'))) || {},
    // 主题id
    subjectNumber: flyer.getQueryString('subject_num'),
    // 当前所在组
    orgGroupID: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
    // 部门信息
    companyOrgID: Number(core.getUserGroups().parentId ? core.getUserGroups().parentId.split(',')[1] : 0),
    companyOrgName: core.getUserGroups().parentName ? core.getUserGroups().parentName.split(',')[1] : '无组织',
    // 下拉框实例对象
    newGroupSelect: null,
    productTypeSelect: null,
    questionSelect: null,
    countriesSelect: null,
    resolveMethodSelect: null,
    storeSelect: null,
    // 当网络请求出错误的时候，提示用户的消息
    errorMsg: flyer.i18n.initTitle('网络错误，请刷新页面重试'),
    paramErrMsg: flyer.i18n.initTitle('参数错误，请刷新页面重试'),
    // ajax请求超时
    ajaxTimeOut: 1000 * 60 * 3,
    // 当前用户信息
    userID: $("#__userid").val().trim(),
    userName: $('#__username').val().trim(),
    // 基础数据下拉框初始化方法
    initBaseDataSelect: new flyer.exports.init_base_data_select.InitBaseDataSelect()
  };

  /**
   * 页面初始化函数
   * 
   */
  function init() {
    // 初始化页面
    initPage();
    // 初始化事件
    initEvents();
  }

  /**
   * 初始化订单日期选择框
   * 
   */
  function initOrderTimePicker() {
    var orderTime = flyer.date($('#orderTimeEmail'), {
      isTime: false,
      format: 'yyyy/mm/dd',
      choose: function () {
        setFormDatasToStorage(baseData.subjectNumber, getFormDatas());
      }
    });
  }

  /**
   * 初始化页面事件
   * 
   */
  function initEvents() {
    // 显示或隐藏更多的信息
    $('#toggleSwitch').on('click', toggleSwitchHandle);
    // 创建一条客诉记录
    $('#createCustomerComplaint').on('click', createCustomerComplaintHandle);
    // 监听输入框的change事件
    $('.history-text input.flyer-input,.history-text textarea').on('keyup', inputKeyupHandle);
    // 返回
    $('#cancelCreate').on('click', cancelCreateHandle);
  }

  /**
   * 显示或隐藏更多的信息点击事件处理函数
   * 
   * @param {any} events 
   */
  function toggleSwitchHandle(events) {
    if ($('.toggel-container').is(':hidden')) {
      $('#toggleIcon').removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
    } else {
      $('#toggleIcon').removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
    }
    $('.toggel-container').toggle();
    return false;
  }

  /**
   * 返回按钮点击事件处理函数，点击返回之后，回到相关订单页签
   * 
   * @param {any} events 
   */
  function cancelCreateHandle(events) {
    $('#flyerEmailDetailTab li[data-index=0]').trigger('click');
    return false;
  }

  /**
   * 创建客诉记录处理事件
   * 
   * @param {any} events 
   */
  function createCustomerComplaintHandle(events) {
    var formDatas = getFormDatas(), url = '/create_customer_complaint';
    // 验证表单数据(暂时只验证店铺名称不为空就可以)
    validFormDatas({ storeName: formDatas.storeName, number: formDatas.number }, function (err) {
      if (err) {
        flyer.msg(err.message);
        return;
      }
      // 判断是否存在客诉记录
      readCustomerComplaintByID(baseData.subjectNumber, function (data, err) {
        if (err) {
          flyer.msg(err.message);
          return;
        }
        // 存在客诉记录,则进行更新操作
        if (data.length) {
          url = '/update_customer_complaint';
        }
        $.ajax({
          url: core.url + url,
          type: 'POST',
          data: formDatas,
          timeout: baseData.ajaxTimeOut,
          beforeSend: function (jqXHR, settings) {
            core.lockedBtn($(events.target), true, flyer.i18n.initTitle('保存中'));
          },
          success: function (data, jqXHR, textStatus) {
            if (data.success) {
              flyer.msg(flyer.i18n.initTitle('操作成功'));
              // 清空缓存
              removeFormDatasStorage(baseData.subjectNumber);
            } else {
              flyer.msg(data.message);
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            flyer.msg(baseData.errorMsg);
          },
          complete: function (jqXHR, textStatus) {
            core.unlockBtn($(events.target), flyer.i18n.initTitle('保存'));
          }
        });
      });
      // 判断是否存在这个商品，不存在则创建
      hasProductBySKU(formDatas.SKU, function (data, err) {
        if (err) {
          flyer.msg(baseData.errorMsg);
          return;
        }
        if (!data.has) {
          formDatas.companyOrgID = baseData.companyOrgID;
          formDatas.companyOrgName = baseData.companyOrgName;
          createProduct(formDatas);
        }
      });
    });
    return false;
  }

  /**
   * 输入框和输入域的change事件处理函数
   * 
   * @param {any} events 
   */
  function inputKeyupHandle(events) {
    var formatDatas = getFormDatas(), timer;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      setFormDatasToStorage(baseData.subjectNumber, formatDatas);
    }, 500);
  }

  /**
   * 通过主题号获取一个客诉记录
   * 
   */
  function readCustomerComplaintByID(ID, next) {
    if (ID) {
      $.ajax({
        url: core.url + '/read_customer_complaint_by_id',
        data: {
          ID: ID,
          nocache: window.Date.now()
        },
        success: function (data, jqXHR, textStatus) {
          if (data.success) {
            next(data.data.rows);
          } else {
            next(null, {
              message: data.message
            });
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          flyer.msg(baseData.errorMsg);
        }
      });
    } else {
      flyer.msg(baseData.paramErrMsg);
    }
  }

  /**
   * 初始化页面,
   * 取值方式：
   * 先从本地缓存中取值，如果本地缓存没有值的话，就从数据库中读取，
   * 如果数据库没有客诉记录的话，就从相关订单中取值，如果都没有的话，就不赋值
   * 
   */
  function initPage() {
    // 判断是否存在客诉记录
    readCustomerComplaintByID(baseData.subjectNumber, function (data, err) {
      var selectValues = {
        productTypeValue: '',
        storeValue: '',
        newGroupValue: '',
        countriesValue: '',
        questionTypeValue: '',
        resolveMethodValue: '',
      },
        formDatasOfStorage = getFormDatasStorage(baseData.subjectNumber);   // 先从缓存中取值
      if (err) {
        flyer.msg(err.message);
        return;
      }
      selectValues = getDefaultSelectValue(formDatasOfStorage, selectValues);
      setFormDatas(formDatasOfStorage);
      // 存在才需要赋值
      if (data.length) {
        data = data[0];
        selectValues = getDefaultSelectValue(data, selectValues);
        setFormDatas(data);
      } else {
        // 判断是否有相关订单
        hasOrderWithEmail(baseData.emailInfo, function (data, err) {
          if (err) {
            flyer.msg(baseData.errorMsg);
            return;
          }
          // 有订单
          if (data.has) {
            // 判断是否存在这个产品
            hasProductBySKU(data.data.seller_sku, function (productData, err) {
              if (err) {
                flyer.msg(baseData.errorMsg);
                return;
              }
              if (productData.has) {
                var productInfo = productData.data;
                productInfo.orderNumber = data.data.amazon_order_id;
                productInfo.orderTime = flyer.formatDate('yyyy/mm/dd', data.data.purchase_date);
                productInfo.storeName = data.data.account_code;
                productInfo.number = data.data.quantity_ordered;
                productInfo.countriesName = data.data.shipping_address_countryCode;
                setFormDatas(productInfo);
              } else {
                setFormDatas({
                  orderNumber: data.data.amazon_order_id,
                  number: data.data.quantity_ordered,
                  SKU: data.data.seller_sku,
                  ASIN: data.data.asin,
                  storeName: data.data.account_code,
                  countriesName: data.data.shipping_address_countryCode,
                  orderTime: flyer.formatDate('yyyy/mm/dd', data.data.purchase_date)
                });
              }
            });
          }
        });
      }
      initOrderTimePicker();
      // 初始化基础数据下拉框
      baseData.initBaseDataSelect.readAllBaseDatas(baseData.companyOrgID, function (datas) {
        baseData.storeSelect = baseData.initBaseDataSelect.initStoreSelectBox($('#storeSelectContainer'), datas.store, selectValues.storeValue, setFormDatasToStorage);
        baseData.productTypeSelect = baseData.initBaseDataSelect.initProductTypeSelectBox($('#typeSelectContainer'), datas.productType, selectValues.productTypeValue, setFormDatasToStorage);
        baseData.newGroupSelect = baseData.initBaseDataSelect.initNewGroupSelectBox($('#newGroupSelectContainer'), datas.productGroup, selectValues.newGroupValue, setFormDatasToStorage);
        baseData.countriesSelect = baseData.initBaseDataSelect.initCountriesSelectBox($('#countriesSelectContainer'), datas.countries, selectValues.countriesValue, setFormDatasToStorage);
        baseData.questionSelect = baseData.initBaseDataSelect.initQuestionTypeSelectBox($('#questionSelectContainer'), datas.questionType, selectValues.questionTypeValue, setFormDatasToStorage);
        baseData.resolveMethodSelect = baseData.initBaseDataSelect.initResovleMethodSelectBox($('#resolveMethodSelectContainer'), datas.resolveMethod, selectValues.resolveMethodValue, setFormDatasToStorage);
      });
    });
  }

  /**
   * 设置下拉框中的值
   * 
   * @param {Object} data 
   */
  function getDefaultSelectValue(data, selectValues) {
    // 店铺
    if (data.storeName && data.storeID && !selectValues.storeValue) {
      selectValues.storeValue = data.storeID;
    }
    // 品类
    if (data.productTypeID && data.productTypeName && !selectValues.productTypeValue) {
      selectValues.productTypeValue = data.productTypeID;
    }
    // 分组
    if (data.productGroupID && data.productGroupName && !selectValues.newGroupValue) {
      selectValues.newGroupValue = data.productGroupID;
    }
    // 国家
    if (data.countriesID && data.countriesName && !selectValues.countriesValue) {
      selectValues.countriesValue = data.countriesID;
    }
    // 问题分类
    if (data.questionTypeID && data.questionTypeName && !selectValues.questionTypeValue) {
      selectValues.questionTypeValue = data.questionTypeID;
    }
    // 处理方式
    if (data.resolveMethodID && data.resolveMethodName && !selectValues.resolveMethodValue) {
      selectValues.resolveMethodValue = data.resolveMethodID;
    }
    return selectValues;
  }

  /**
   * 设置输入框的值
   * @param {any} productInfo 
   */
  function setFormDatas(productInfo) {
    // 订单号
    if (productInfo.orderNumber && !$('#orderNumber').val().trim()) {
      $('#orderNumber').val(productInfo.orderNumber);
    }
    // 订单日期
    if (!$('#orderTimeEmail').val() && productInfo.orderTime && !productInfo.orderTime.match('1970-01-01')) {
      $('#orderTimeEmail').val(productInfo.orderTime === "1970-01-01T00:00:00.000Z" ? '' : flyer.formatDate('yyyy/mm/dd', productInfo.orderTime));
    }
    // 订单数量
    if (!$('#number').val().trim()) {
      $('#number').val(productInfo.number === 0 ? '' : productInfo.number);
    }
    // SKU
    if (productInfo.SKU && !$('#SKU').val().trim()) {
      $('#SKU').val(productInfo.SKU);
    }
    // 后台ASIN
    if (productInfo.ASIN && !$('#ASIN').val().trim()) {
      $('#ASIN').val(productInfo.ASIN);
    }
    // 产品名称
    if (productInfo.productName && !$('#productName').val().trim()) {
      $('#productName').val(productInfo.productName);
    }
    // 问题描述
    if (!$('#questionDescription').val().trim() && productInfo.description) {
      $('#questionDescription').val(productInfo.description);
    }
    // 备注
    if (!$('#remark').val().trim() && productInfo.remark) {
      $('#remark').val(productInfo.remark);
    }
    // 设置店铺名称
    if (productInfo.storeName && productInfo.storeName !== '-') {
      getStoreByName(productInfo.storeName, function (data) {
        if (data.rows.length && baseData.storeSelect) {
          baseData.storeSelect.setValue({
            fieldKey: data.rows[0].ID,
            fieldValue: productInfo.storeName
          });
        }
      });
    }
    // 设置国家
    if (productInfo.countriesName && productInfo.countriesName !== '-') {
      getCountriesByName(productInfo.countriesName, function (data) {
        if (data.rows.length && baseData.countriesSelect) {
          baseData.countriesSelect.setValue({
            fieldKey: data.rows[0].ID,
            fieldValue: productInfo.countriesName
          });
        }
      });
    }
    // 设置分组
    if (productInfo.productGroupID && productInfo.productGroupName !== '-' && baseData.newGroupSelect) {
      baseData.newGroupSelect.setValue({
        fieldKey: productInfo.productGroupID,
        fieldValue: productInfo.productGroupName
      });
    }
    // 设置品类
    if (productInfo.productTypeID && productInfo.productTypeName !== '-' && baseData.productTypeSelect) {
      baseData.productTypeSelect.setValue({
        fieldKey: productInfo.productTypeID,
        fieldValue: productInfo.productTypeName
      });
    }
  }

  /**
   * 获取表单数据
   * 
   * @returns 返回表单的数据
   */
  function getFormDatas() {
    var d = ' ' + flyer.formatDate('hh:MM:ss'),
      data = {
        ID: baseData.subjectNumber,//主题号
        orgGroupID: baseData.orgGroupID,
        storeName: baseData.storeSelect.getSelectedText(),
        storeID: Number(baseData.storeSelect.getSelectedValue()),
        orderNumber: $('#orderNumber').val().trim(),
        orderTime: $('#orderTimeEmail').val() ? flyer.formatDate("yyyy-mm-dd hh:MM:ss", $('#orderTimeEmail').val() + d) : flyer.formatDate("yyyy-mm-dd hh:MM:ss", '1970-01-01'),
        number: $('#number').val().trim() ? $('#number').val().trim() : 0,
        SKU: $('#SKU').val().trim(),
        ASIN: $('#ASIN').val().trim(),
        productName: $('#productName').val().trim(),
        productGroupID: Number(getSelectedValue(baseData.newGroupSelect)),
        productGroupName: getSelectedText(baseData.newGroupSelect),
        countriesID: Number(getSelectedValue(baseData.countriesSelect)),
        countriesName: getSelectedText(baseData.countriesSelect),
        productTypeID: Number(getSelectedValue(baseData.productTypeSelect)),
        productTypeName: getSelectedText(baseData.productTypeSelect),
        questionTypeID: Number(getSelectedValue(baseData.questionSelect)),
        questionTypeName: getSelectedText(baseData.questionSelect),
        resolveMethodName: getSelectedText(baseData.resolveMethodSelect),
        resolveMethodID: Number(getSelectedValue(baseData.resolveMethodSelect)),
        description: $('#questionDescription').val().trim(),
        resolveTime: flyer.formatDate("yyyy-mm-dd hh:MM:ss"),
        customerComplaintTime: flyer.formatDate("yyyy-mm-dd hh:MM:ss"),
        resolveUserID: Number(baseData.userID),
        resolveUserName: baseData.userName,
        remark: $('#remark').val().trim()
      };
    return data;
  }

  /**
   * 验证表单数据 
   * 
   * @param {any} formDatas 
   * @param {any} next 
   */
  function validFormDatas(formDatas, next) {
    var isPass = true,
      maxNumber = 2147483647,
      message = {
        storeName: flyer.i18n.initTitle('店铺名称不能为空'),
        orderNumber: flyer.i18n.initTitle('订单号不能为空'),
        orderTime: flyer.i18n.initTitle('订单日期不能为空'),
        number: flyer.i18n.initTitle('数量范围：') + '1-' + maxNumber,
        SKU: flyer.i18n.initTitle('SKU 不能为空'),
        ASIN: flyer.i18n.initTitle('ASIN 不能为空'),
        productName: flyer.i18n.initTitle('商品名称不能为空'),
        productTypeName: flyer.i18n.initTitle('商品分类不能为空'),
        productGroupName: flyer.i18n.initTitle('商品分组不能为空'),
        countriesName: flyer.i18n.initTitle('国家不能为空'),
        questionTypeName: flyer.i18n.initTitle('问题类型不能为空'),
        description: flyer.i18n.initTitle('问题描述不能为空'),
        resolveMethodName: flyer.i18n.initTitle('处理方式不能为空'),
      }, selectKeys = ['productTypeName', 'productGroupName', 'countriesName', 'questionTypeName', 'resolveMethodName', 'storeName'];
    for (var key in formDatas) {
      if (formDatas.hasOwnProperty(key)) {
        var element = formDatas[key];
        // 验证不为空
        if (element.length === 0 && key !== 'number' && key !== 'remark' && selectKeys.indexOf(key) === -1) {
          isPass = false;
          next({
            message: message[key]
          });
          break;
        }
        // 订单日期
        if (key === 'orderTime' && $('#orderTimeEmail').val().trim().length === 0) {
          isPass = false;
          next({
            message: message.orderTime
          });
          break;
        }
        // 验证数量
        if (key === 'number' && element) {
          if (element < 1 || isNaN(element) || Number(element) > maxNumber) {
            isPass = false;
            next({
              message: message[key]
            });
            break;
          }
        }
        // 验证下拉框数据
        if (selectKeys.indexOf(key) !== -1) {
          if (element === 'undefined') {
            isPass = false;
            next({
              message: message[key]
            });
            break;
          }
        }
      }
    }
    if (isPass) {
      next();
    }
  }

  /**
   * 判断当前邮件是否有关联的订单
   * 
   * @param {Object} email 邮件对象
   * @param {Function} next 
   */
  function hasOrderWithEmail(email, next) {
    var strEmail = core.isSelfEmail(email._from) ? email._to : email._from,
      orderNumber = '';
    if (email.subject) {
      orderNumber = email.subject.match(/[\d]{1,}-[\d]{1,}-[\d]{1,}/ig);
    }
    if (orderNumber || strEmail) {
      $.ajax({
        url: core.url + '/fba_order_list',
        type: 'GET',
        data: {
          order: orderNumber,
          email: strEmail
        },
        success: function (data, textStatus, jqXHR) {
          if (typeof next === 'function') {
            next({
              has: data.length ? true : false,
              data: data[0]
            });
          } else {
            flyer.msg(baseData.paramErrMsg);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          flyer.msg(baseData.errorMsg);
        }
      });
    }
  }

  /**
   * 通过SKU从数据库获取一个产品信息
   * 
   * @param {string} SKU 产品信息 
   */
  function hasProductBySKU(SKU, next) {
    if (SKU) {
      $.ajax({
        url: core.url + '/read_product_by_sku',
        type: 'GET',
        data: {
          nocache: window.Date.now(),
          SKU: SKU,
          companyOrgID: baseData.companyOrgID
        },
        success: function (data, textStatus, jqXHR) {
          if (typeof next === 'function') {
            next({
              has: data.data.rows.length ? true : false,
              data: data.data.rows[0]
            });
          } else {
            flyer.msg(baseData.paramErrMsg);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          flyer.msg(baseData.errorMsg);
        }
      });
    }
  }

  /**
     * 创建产品
     * 
     * @param {any} params 
     */
  function createProduct(params) {
    if (params.productName) {
      $.ajax({
        url: core.url + '/create_product',
        type: 'POST',
        data: {
          products: [params]
        },
        timeout: baseData.ajaxTimeOut,
        success: function (data, jqXHR, textStatus) {
          if (data.success) {
            // flyer.msg('产品创建成功');
          } else {
            flyer.msg(flyer.i18n.initTitle('操作失败'));
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          flyer.msg(baseData.errorMsg);
        }
      });
    }
  }

  /**
   * 获取一个店铺信息，通过店铺名称
   * 
   * @param {any} storeName 店铺名称
   * @param {any} next 
   */
  function getStoreByName(storeName, next) {
    $.ajax({
      url: core.url + '/read_shop_no_page',
      type: 'GET',
      data: {
        storeName: storeName,
        companyOrgID: baseData.companyOrgID
      },
      timeout: baseData.ajaxTimeOut,
      success: function (data, textStatus, jqXHR) {
        if (data.success) {
          next(data.data);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        flyer.msg(baseData.errorMsg);
      }
    });
  }

  /**
   * 通过名称获取一个国家信息
   * 
   * @param {any} countriesName 
   * @param {any} next 
   */
  function getCountriesByName(countriesName, next) {
    $.ajax({
      url: core.url + '/read_countries',
      type: 'GET',
      data: {
        countriesName: countriesName,
        companyOrgID: baseData.companyOrgID
      },
      timeout: baseData.ajaxTimeOut,
      success: function (data, textStatus, jqXHR) {
        if (data.success) {
          next(data.data);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        flyer.msg(baseData.errorMsg);
      }
    });
  }

  /**
   * 重写flyerui下拉框中获取选中值的方式
   * 
   * @param {any} $select 
   * @returns 如果没有选中的话，直接返回0，选中了的话，返回选中的值
   */
  function getSelectedValue($select) {
    if ($select) {
      return $select.getSelectedValue() === 'undefined' ? 0 : $select.getSelectedValue();
    }
    return 0;
  }

  /**
   * 重写flyerui下拉框中获取选中值的方式
   * 
   * @param {any} $select 
   * @returns 如果没有选中的话，直接返回'-'，选中了的话，返回选中的值
   */
  function getSelectedText($select) {
    if ($select) {
      return $select.getSelectedText() === 'undefined' ? '-' : $select.getSelectedText();
    }
    return '-';
  }

  /**
   * 设置表单的属性存储到本地缓存中
   * 
   * @param {String} key 唯一标识符 
   * @param {Object} formDatas  表单数据 
   */
  function setFormDatasToStorage(key, formDatas) {
    key = key || baseData.subjectNumber;
    formDatas = formDatas || getFormDatas();
    localStorage.setItem(key, JSON.stringify(formDatas || {}));
  }

  /**
   * 通过key值从缓存中取到一条客诉记录信息
   * 
   * @param {any} key 唯一值
   */
  function getFormDatasStorage(key) {
    key = key || baseData.subjectNumber;
    return JSON.parse(localStorage.getItem(key) || '{}');
  }

  /**
   * 清空表单数据从缓存中
   * 
   * @param {any} key 唯一的键
   */
  function removeFormDatasStorage(key) {
    key = key || baseData.subjectNumber;
    localStorage.removeItem(key);
  }
  // 页面入口
  init();
});