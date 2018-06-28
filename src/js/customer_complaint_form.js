"use strict";
flyer.define("customer_complaint_history", function (exports, module) {
    var baseData = {
        // 主题id
        subjectNumber: flyer.getQueryString('ID'),
        // 所在组
        orgGroupID: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
        exportKey: flyer.getQueryString('exportKey'),
        curIndex: flyer.getQueryString('curIndex') || 1,
        limit: flyer.getQueryString('limit') || 20,
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
        // 当前操作是否是新建客诉记录
        isCreate: flyer.getQueryString('isCreate') === 'true',
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
        // 左侧菜单高亮显示
        core.menuHeightLightByKey(baseData.exportKey);
        // 初始化订单日期选择框
        initOrderTimePicker();
    }

    /**
     * 初始化订单日期选择框
     * 
    */
    function initOrderTimePicker() {
        var orderTime = flyer.date($('#orderTime'), {
            isTime: false,
            format: 'yyyy/mm/dd',
            choose: function () {
                fnSelected();
            }
        });
    }

    /**
    * 初始化页面，
      如果是新建客诉记录的话，需要从缓存中取数据
    * 
    */
    function initPage() {
        $('.history-text span:not(.checkbox-span)').css({
            width: 76
        });
        $('.history-btnBox button:eq(0)').css({
            marginLeft: 83
        });
        readCustomerComplaintByID(baseData.subjectNumber, function (data, err) {
            var selectValues = {
                productTypeValue: '',
                storeValue: '',
                newGroupValue: '',
                countriesValue: '',
                questionTypeValue: '',
                resolveMethodValue: '',
            },
                formDatasOfStorage = getFormDatasStorage(baseData.subjectNumber);   // 从缓存中取值;
            if (err) {
                flyer.msg(err.message);
                return;
            }
            // 存在才需要赋值
            if (data.length) {
                data = data[0];
                setFormDatas(data);
                selectValues = getDefaultSelectValue(data);
            } else if (baseData.isCreate) {
                // 不存在的话，说明是新建操作，此时从缓存中取数据
                setFormDatas(formDatasOfStorage);
                selectValues = getDefaultSelectValue(formDatasOfStorage);
            }
            // 生成下拉框
            baseData.initBaseDataSelect.readAllBaseDatas(baseData.companyOrgID, function (datas) {
                baseData.storeSelect = baseData.initBaseDataSelect.initStoreSelectBox($('#storeSelectContainer'), datas.store, selectValues.storeValue, fnSelected);
                baseData.productTypeSelect = baseData.initBaseDataSelect.initProductTypeSelectBox($('#typeSelectContainer'), datas.productType, selectValues.productTypeValue, fnSelected);
                baseData.newGroupSelect = baseData.initBaseDataSelect.initNewGroupSelectBox($('#newGroupSelectContainer'), datas.productGroup, selectValues.newGroupValue, fnSelected);
                baseData.countriesSelect = baseData.initBaseDataSelect.initCountriesSelectBox($('#countriesSelectContainer'), datas.countries, selectValues.countriesValue, fnSelected);
                baseData.questionSelect = baseData.initBaseDataSelect.initQuestionTypeSelectBox($('#questionSelectContainer'), datas.questionType, selectValues.questionTypeValue, fnSelected);
                baseData.resolveMethodSelect = baseData.initBaseDataSelect.initResovleMethodSelectBox($('#resolveMethodSelectContainer'), datas.resolveMethod, selectValues.resolveMethodValue, fnSelected);
            });
        });
    }

    /**
     * 基础数据下拉框选择之后的处理函数
     * 
     */
    function fnSelected() {
        if (baseData.isCreate) {
            setFormDatasToStorage(baseData.subjectNumber);
        }
    }

    /**
     * 初始化页面事件
     * 
     */
    function initEvents() {
        // 返回
        $('#backToList').on('click', backToListHandle);
        // 保存
        $('#createCustomerComplaint').on('click', createCustomerComplaintHandle);
        // 新建客诉记录的时候，需要为所有的输入框绑定change事件
        if (baseData.isCreate) {
            $('.history-text input.flyer-input,.history-text textarea').on('keyup', inputKeyupHandle);
        }
    }

    /**
     *返回按钮的点击事件处理函数 
     * 
     * @param {any} events 
     */
    function backToListHandle(events) {
        core.loadPage('#customer_complaint_list', '?curIndex=' + baseData.curIndex + '&limit=' + baseData.limit);
        hideDatePanle($('#flyer-date-orderTime'));
        return false;
    }

    /**
     * 创建客诉记录处理事件,如果某一个订单号存在客诉记录了，则不需要再创建客诉记录了
     * 
     * @param {any} events 
     */
    function createCustomerComplaintHandle(events) {
        var formDatas = getFormDatas(),
            url = baseData.isCreate ? '/create_customer_complaint' : '/update_customer_complaint',
            postServerFn = function () {
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
                            core.loadPage('#customer_complaint_list', '?curIndex=' + baseData.curIndex + '&limit=' + baseData.limit);
                            hideDatePanle($('#flyer-date-orderTime'));
                            // 如果是新建的话，需要清空缓存
                            if (baseData.isCreate) {
                                removeFormDatasStorage(baseData.subjectNumber);
                            }
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
            };
        // 验证表单数据(暂时只验证店铺名称不为空就可以)
        validFormDatas({ storeName: formDatas.storeName, number: formDatas.number }, function (err) {
            if (err) {
                flyer.msg(err.message);
                return;
            }
            core.lockedBtn($(events.target), true, flyer.i18n.initTitle('保存中'));
            if (baseData.isCreate) {
                // 如果某一个订单存在客诉记录的话，就提示用户这个客诉记录存在了，让用户自己选择是继续创建还是终止创建的
                readCustomerComplaintByOrderNumber(formDatas.orderNumber, function (result, err) {
                    if (result.length) {
                        flyer.open({
                            title: flyer.i18n.initTitle('询问框'),
                            content: '<div>此订单已经有客服「' + result.map(function (item) { return item.resolveUserName }).join(',') + '」创建过客诉记录了，'
                                + '确定要继续创建吗?</div>',
                            area: [400, 300],
                            isModal: true,
                            cancel: function () {
                                core.unlockBtn($(events.target), flyer.i18n.initTitle('保存'));
                            },
                            btns: [{
                                text: flyer.i18n.initTitle('确定'),
                                click: function (elm) {
                                    if (typeof postServerFn === 'function') {
                                        postServerFn();
                                        this.close();
                                    }
                                }
                            }, {
                                text: flyer.i18n.initTitle('关闭'),
                                click: function (elm) {
                                    this.close();
                                    core.unlockBtn($(events.target), flyer.i18n.initTitle('保存'));
                                }
                            }]
                        });
                    } else {
                        postServerFn();
                    }
                });
            } else {
                postServerFn();
            }
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
        setTimeout(function () {
            setFormDatasToStorage(baseData.subjectNumber, formatDatas);
        }, 500);
    }

    /**
     * 通过客诉记录ID获取一个客诉记录
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
     * 通过订单号判断是否存在一个客诉记录
     * 
     */
    function readCustomerComplaintByOrderNumber(orderNumber, next) {
        if (orderNumber) {
            $.ajax({
                url: core.url + '/read_customer_complaint_by_order_number',
                data: {
                    orderNumber: orderNumber,
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
     * 设置输入框的值
     * 
     * @param {any} datas 
     */
    function setFormDatas(customerComplaint) {
        // 订单号
        $('#orderNumber').val(customerComplaint.orderNumber);
        // 订单日期
        if (customerComplaint.orderTime && !customerComplaint.orderTime.match('1970-01-01')) {
            $('#orderTime').val(customerComplaint.orderTime === "1970-01-01T00:00:00.000Z" ? '' : flyer.formatDate('yyyy/mm/dd', customerComplaint.orderTime));
        }
        // 数量
        $('#number').val(customerComplaint.number === 0 ? '' : customerComplaint.number);
        // SKU
        $('#SKU').val(customerComplaint.SKU);
        // 后台ASIN
        $('#ASIN').val(customerComplaint.ASIN);
        // 产品名称
        $('#productName').val(customerComplaint.productName);
        // 问题描述
        if (customerComplaint.description) {
            $('#questionDescription').val(customerComplaint.description);
        }
        // 备注
        if (customerComplaint.remark) {
            $('#remark').val(customerComplaint.remark);
        }
    }

    /**
      * 设置下拉框中的值
      * 
      * @param {Object} data 
      */
    function getDefaultSelectValue(data) {
        var selectValues = {
            productTypeValue: '',
            storeValue: '',
            newGroupValue: '',
            countriesValue: '',
            questionTypeValue: '',
            resolveMethodValue: '',
        };
        // 店铺
        if (data.storeName && data.storeID) {
            selectValues.storeValue = data.storeID;
        }
        // 品类
        if (data.productTypeID && data.productTypeName) {
            selectValues.productTypeValue = data.productTypeID;
        }
        // 分组
        if (data.productGroupID && data.productGroupName) {
            selectValues.newGroupValue = data.productGroupID;
        }
        // 国家
        if (data.countriesID && data.countriesName) {
            selectValues.countriesValue = data.countriesID;
        }
        // 问题分类
        if (data.questionTypeID && data.questionTypeName) {
            selectValues.questionTypeValue = data.questionTypeID;
        }
        // 处理方式
        if (data.resolveMethodID && data.resolveMethodName) {
            selectValues.resolveMethodValue = data.resolveMethodID;
        }
        return selectValues;
    }

    /**
     * 获取表单数据
     * 
     * @returns 返回表单的数据
     */
    function getFormDatas() {
        var d = ' ' + flyer.formatDate('hh:MM:ss'),
            dy = flyer.formatDate('yyyy-mm-dd'),
            data = {
                ID: baseData.subjectNumber,//主题号
                orgGroupID: baseData.orgGroupID,
                storeName: baseData.storeSelect.getSelectedText(),
                storeID: Number(baseData.storeSelect.getSelectedValue()),
                orderNumber: $('#orderNumber').val().trim(),
                orderTime: $('#orderTime').val() ? flyer.formatDate("yyyy-mm-dd hh:MM:ss", $('#orderTime').val() + d) : flyer.formatDate("yyyy-mm-dd hh:MM:ss", '1970-01-01'),
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
                resolveMethodName: flyer.i18n.initTitle('处理方式不能为空')
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
                if (key === 'orderTime' && $('#orderTime').val().trim().length === 0) {
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
     * 关闭日期选择控件面板
     * 
     */
    function hideDatePanle($datePanle) {
        $datePanle = $datePanle || $('#flyer-date-orderTime');
        if (!$datePanle.is('hidden')) {
            $datePanle.hide();
        }
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