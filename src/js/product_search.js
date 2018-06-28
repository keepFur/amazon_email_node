"use strict";
flyer.define("product_search", function (exports, module) {
    var AdvancedSearch = function () {
    };
    var baseData = {
        productTypeSelect: null,
        newGroupSelect: null,
        countriesSelect: null,
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
        });
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
        // 商品品类
        if (baseData.productTypeSelect) {
            resultObj.productTypeID = baseData.productTypeSelect.getSelectedValue().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            resultObj.productTypeName = baseData.productTypeSelect.getSelectedText().split(';').filter(function (item) {
                return item !== 'undefined' && item;
            });
            if (resultObj.productTypeName.length) {
                resultObjText += '，' + flyer.i18n.initTitle('品类') + '[' + resultObj.productTypeName + ']';
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
                resultObjText += '，' + flyer.i18n.initTitle('分组') + '[' + resultObj.productGroupName + ']';
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
        // ASIN
        if ($('#ASIN').length) {
            resultObj.ASIN = $('#ASIN').val().trim().replace(/\?/, '？');
        }
        if (resultObj.ASIN) {
            resultObjText += '，ASIN[' + resultObj.ASIN + ']';
        }
        // SKU
        if ($('#SKU').length) {
            resultObj.SKU = $('#SKU').val().trim().replace(/\?/, '？');
        }
        if (resultObj.SKU) {
            resultObjText += '，SKU[' + resultObj.SKU + ']';
        }
        // 产品名称
        if ($('#productName').length) {
            resultObj.productName = $('#productName').val().trim().replace(/\?/, '？');
        }
        if (resultObj.productName) {
            resultObjText += '，' + flyer.i18n.initTitle('商品名称') + '[' + resultObj.productName + ']';
        }
        return {
            resultObj: resultObj,
            resultObjText: resultObjText.replace(/^，/, ' ')
        };
    };

    var advancedSearch = new AdvancedSearch();
    advancedSearch.init();
    // 暴露接口
    exports.getConditions = advancedSearch.getConditions;
});
