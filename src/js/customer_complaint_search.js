"use strict";
flyer.define("customer_complaint_search", function (exports, module) {
    var AdvancedSearch = function () {
        this.orderDate = {};
        this.resolveDate = {};
        this.serverDate = {};
    };
    var baseData = {
        productTypeSelect: null,
        newGroupSelect: null,
        questionSelect: null,
        countriesSelect: null,
        resolveMethodSelect: null,
        storeSelect: null,
        // 部门信息
        companyOrgID: Number(core.getUserGroups().parentId ? core.getUserGroups().parentId.split(',')[1] : 0),
        companyOrgName: core.getUserGroups().parentName ? core.getUserGroups().parentName.split(',')[1] : '无组织',
        // 基础数据下拉框初始化方法
        initBaseDataSelect: new flyer.exports.init_base_data_select.InitBaseDataSelect(),
    };

    // 模块入口
    AdvancedSearch.prototype.init = function () {
        this.initPage();
    };

    //  初始化页面元素
    AdvancedSearch.prototype.initPage = function () {
        baseData.initBaseDataSelect.readAllBaseDatas(baseData.companyOrgID, function (datas) {
            // 店铺
            baseData.storeSelect = baseData.initBaseDataSelect.initStoreSelectBox($('#storeSelectContainer'), datas.store);
            // 商品品类
            baseData.productTypeSelect = baseData.initBaseDataSelect.initProductTypeSelectBox($('#productTypeSelect'), datas.productType);
            // 商品分组
            baseData.newGroupSelect = baseData.initBaseDataSelect.initNewGroupSelectBox($('#productGroupSelect'), datas.productGroup);
            // 国家
            baseData.countriesSelect = baseData.initBaseDataSelect.initCountriesSelectBox($('#countriesSelect'), datas.countries);
            // 问题类型
            baseData.questionSelect = baseData.initBaseDataSelect.initQuestionTypeSelectBox($('#questionTypeSelect'), datas.questionType);
            // 处理方式
            baseData.resolveMethodSelect = baseData.initBaseDataSelect.initResovleMethodSelectBox($('#resolveMethodSelect'), datas.resolveMethod);
        });
        // 订单时间
        this.orderDate.startDate = this.initDatePicker($('#orderStartTime'));
        this.orderDate.endDate = this.initDatePicker($('#orderEndTime'));
        // 解决时间
        this.resolveDate.startDate = this.initDatePicker($('#resolveStartTime'));
        this.resolveDate.endDate = this.initDatePicker($('#resolveEndTime'));
        // 客诉时间
        this.serverDate.startDate = this.initDatePicker($('#serverStartTime'));
        this.serverDate.endDate = this.initDatePicker($('#serverEndTime'));
    };

    // 初始化日期选择器
    AdvancedSearch.prototype.initDatePicker = function ($container) {
        var DateObj = {};
        DateObj = flyer.date($container, {
            isTime: false,
            format: 'yyyy-mm-dd'
        });
        return DateObj;
    };

    // 获取查询条件
    AdvancedSearch.prototype.getConditions = function () {
        var resultObj = Object.create({}),//返回给服务端的查询条件
            resultObjText = '';//返回给客户端的查询条件
        // 店铺
        if (baseData.storeSelect) {
            resultObj.storeID = baseData.storeSelect.getSelectedValue().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            resultObj.storeName = baseData.storeSelect.getSelectedText().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            if (resultObj.storeName.length) {
                resultObjText = flyer.i18n.initTitle('店铺') + '[' + resultObj.storeName + ']';
            }
        }
        // 问题类型
        if (baseData.questionSelect) {
            resultObj.questionTypeID = baseData.questionSelect.getSelectedValue().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            resultObj.questionTypeName = baseData.questionSelect.getSelectedText().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            if (resultObj.questionTypeName.length) {
                resultObjText = flyer.i18n.initTitle('问题类型') + '[' + resultObj.questionTypeName + ']';
            }
        }
        // 商品品类
        if (baseData.productTypeSelect) {
            resultObj.productTypeID = baseData.productTypeSelect.getSelectedValue().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            resultObj.productTypeName = baseData.productTypeSelect.getSelectedText().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            if (resultObj.productTypeName.length) {
                resultObjText += '，' + flyer.i18n.initTitle('商品分类') + '[' + resultObj.productTypeName + ']';
            }
        }
        // 商品分组
        if (baseData.newGroupSelect) {
            resultObj.productGroupID = baseData.newGroupSelect.getSelectedValue().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            resultObj.productGroupName = baseData.newGroupSelect.getSelectedText().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            if (resultObj.productGroupName.length) {
                resultObjText += '，' + flyer.i18n.initTitle('商品分组') + '[' + resultObj.productGroupName + ']';
            }
        }
        // 国家
        if (baseData.countriesSelect) {
            resultObj.countriesID = baseData.countriesSelect.getSelectedValue().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            resultObj.countriesName = baseData.countriesSelect.getSelectedText().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            if (resultObj.countriesName.length) {
                resultObjText += '，' + flyer.i18n.initTitle('国家') + '[' + resultObj.countriesName + ']';
            }
        }
        // 处理方式
        if (baseData.resolveMethodSelect) {
            resultObj.resolveMethodID = baseData.resolveMethodSelect.getSelectedValue().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            resultObj.resolveMethodName = baseData.resolveMethodSelect.getSelectedText().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            if (resultObj.resolveMethodName.length) {
                resultObjText += '，' + flyer.i18n.initTitle('处理方式') + '[' + resultObj.resolveMethodName + ']';
            }
        }
        // 订单时间
        if ($('#orderStartTime').length && $('#orderStartTime').val()) {
            resultObj.orderStartTime = $('#orderStartTime').val().trim();
        }
        if (resultObj.orderStartTime) {
            resultObjText += '，' + flyer.i18n.initTitle('订单开始时间') + '[' + resultObj.orderStartTime + ']';
        }
        if ($('#orderEndTime').length && $('#orderEndTime').val()) {
            resultObj.orderEndTime = $('#orderEndTime').val().trim();
        }
        if (resultObj.orderEndTime) {
            resultObjText += '，' + flyer.i18n.initTitle('订单结束时间') + '[' + resultObj.orderEndTime + ']';
        }
        // 解决时间
        if ($('#resolveStartTime').length && $('#resolveStartTime').val()) {
            resultObj.resolveStartTime = $('#resolveStartTime').val().trim();
        }
        if (resultObj.resolveStartTime) {
            resultObjText += '，' + flyer.i18n.initTitle('解决开始时间') + '[' + resultObj.resolveStartTime + ']';
        }
        if ($('#resolveEndTime').length && $('#resolveEndTime').val()) {
            resultObj.resolveEndTime = $('#resolveEndTime').val().trim();
        }
        if (resultObj.resolveEndTime) {
            resultObjText += '，' + flyer.i18n.initTitle('解决结束时间') + '[' + resultObj.resolveEndTime + ']';
        }
        // 客诉时间
        if ($('#serverStartTime').length && $('#serverStartTime').val()) {
            resultObj.serverStartTime = $('#serverStartTime').val().trim();
        }
        if (resultObj.serverStartTime) {
            resultObjText += '，' + flyer.i18n.initTitle('客诉开始时间') + '[' + resultObj.serverStartTime + ']';
        }
        if ($('#serverEndTime').length && $('#serverEndTime').val()) {
            resultObj.serverEndTime = $('#serverEndTime').val().trim();
        }
        if (resultObj.serverEndTime) {
            resultObjText += '，' + flyer.i18n.initTitle('客诉结束时间') + '[' + resultObj.serverEndTime + ']';
        }
        // 关键字
        if ($('#keyword').length && $('#keyword').val().trim()) {
            resultObj.keyword = $('#keyword').val().trim().replace(/\?/, '？');
        }
        if (resultObj.keyword) {
            resultObjText += '，' + flyer.i18n.initTitle('关键字') + '[' + resultObj.keyword + ']';
        }
        return {
            resultObj: resultObj,
            resultObjText: resultObjText.replace(/^，/, ' ')
        };
    };

    // 清空查询条件
    AdvancedSearch.prototype.clearConditions = function () {

    };

    // 隐藏日期面板
    AdvancedSearch.prototype.hideDatePicker = function () {
        // 订单时间
        $('#flyer-date-orderStartTime').hide();
        $('#flyer-date-orderEndTime').hide();
        // 解决时间
        $('#flyer-date-resolveStartTime').hide();
        $('#flyer-date-resolveEndTime').hide();
        // 客诉时间
        $('#flyer-date-serverStartTime').hide();
        $('#flyer-date-serverEndTime').hide();
    };

    var advancedSearch = new AdvancedSearch();
    advancedSearch.init();
    // 暴露接口
    exports.getConditions = advancedSearch.getConditions;
    exports.hideDatePicker = advancedSearch.hideDatePicker;
});
