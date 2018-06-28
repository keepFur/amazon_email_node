// 用于客诉记录中基础数据下拉框的初始化
"use strict";
flyer.define("init_base_data_select", function (exports, module) {
    var baseData = {
        // 当网络请求出错误的时候，提示用户的消息
        errorMsg: flyer.i18n.initTitle('网络错误，请刷新页面重试'),
        paramErrMsg: flyer.i18n.initTitle('参数错误，请刷新页面重试'),
        // 部门信息
        companyOrgID: Number(core.getUserGroups().parentId ? core.getUserGroups().parentId.split(',')[1] : 0),
        companyOrgName: core.getUserGroups().parentName ? core.getUserGroups().parentName.split(',')[1] : '无组织',
    };
    /**
     * 初始化基础u数据下拉框构造函数
     * 
     */
    function InitBaseDataSelect() {

    }

    /**
     * 获取所有的基础数据
     * 
     * @param {Array} data 数据源
     * @param {any} defaultValue 默认值
     * @param {Function} fn 选中之后处理函数
     * 
     */
    InitBaseDataSelect.prototype.readAllBaseDatas = function (companyOrgID, callback) {
        companyOrgID = companyOrgID || baseData.companyOrgID;
        $.ajax({
            url: core.url + '/read_all_base_datas',
            type: 'GET',
            data: {
                companyOrgID: companyOrgID
            },
            success: function (data, textStatus, jqXHR) {
                if (typeof callback === 'function') {
                    callback(data.data);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                flyer.msg(baseData.errorMsg);
            }
        });
    };

    /**
     * 初始化店铺下拉框
     * 
     * @param {Array} data 数据源
     * @param {any} defaultValue 默认值
     * @param {Function} fn 选中之后处理函数
     * 
     */
    InitBaseDataSelect.prototype.initStoreSelectBox = function ($container, data, defaultVal, fn) {
        return flyer.combobox($container || $('#storeSelectContainer'), {
            data: data || [],
            allowSearch: false,
            isMulti: false,
            defaultValue: String(defaultVal || ''),
            fieldKey: 'ID',
            fieldValue: 'storeName',
            placeholder: flyer.i18n.initTitle('选择店铺'),
            fnSelected: function () {
                if (typeof fn === 'function') {
                    fn();
                }
            }
        });
    };

    /**
     * 初始化商品品类下拉框
     * 
     * @param {Array} data 数据源
     * @param {any} defaultValue 默认值
     * @param {Function} fn 选中之后处理函数
     * 
     */
    InitBaseDataSelect.prototype.initProductTypeSelectBox = function ($container, data, defaultVal, fn) {
        return flyer.combobox($container || $('#typeSelectContainer'), {
            data: data || [],
            allowSearch: true,
            searchPlaceholder: flyer.i18n.initTitle('搜索内容'),
            isMulti: false,
            defaultValue: String(defaultVal || ''),
            fieldKey: 'ID',
            fieldValue: 'productType',
            fieldValuePY: 'productTypePY',
            placeholder: flyer.i18n.initTitle('选择商品品类'),
            fnSelected: function () {
                if (typeof fn === 'function') {
                    fn();
                }
            }
        });
    };

    /**
     * 初始化商品分组下拉框
     * 
     * @param {Array} data 数据源
     * @param {any} defaultValue 默认值
     * @param {Function} fn 选中之后处理函数
     * 
     */
    InitBaseDataSelect.prototype.initNewGroupSelectBox = function ($container, data, defaultVal, fn) {
        return flyer.combobox($container || $('#newGroupSelectContainer'), {
            data: data || [],
            allowSearch: false,
            isMulti: false,
            defaultValue: String(defaultVal || ''),
            fieldKey: 'ID',
            fieldValue: 'productGroupName',
            placeholder: flyer.i18n.initTitle('选择分组'),
            fnSelected: function () {
                if (typeof fn === 'function') {
                    fn();
                }
            }
        });
    };

    /**
     * 初始化国家下拉框
     * 
     * @param {Array} data 数据源
     * @param {any} defaultValue 默认值
     * @param {Function} fn 选中之后处理函数
     * 
     */
    InitBaseDataSelect.prototype.initCountriesSelectBox = function ($container, data, defaultVal, fn) {
        return flyer.combobox($container || $('#countriesSelectContainer'), {
            data: data || [],
            allowSearch: false,
            isMulti: false,
            defaultValue: String(defaultVal || ''),
            fieldKey: 'ID',
            fieldValue: 'countriesName',
            placeholder: flyer.i18n.initTitle('选择国家'),
            fnSelected: function () {
                if (typeof fn === 'function') {
                    fn();
                }
            }
        });
    };

    /**
     * 初始化问题类型下拉框
     * 
     * @param {Array} data 数据源
     * @param {any} defaultValue 默认值
     * @param {Function} fn 选中之后处理函数
     * 
     */
    InitBaseDataSelect.prototype.initQuestionTypeSelectBox = function ($container, data, defaultVal, fn) {
        return flyer.combobox($container || $('#questionSelectContainer'), {
            data: data || [],
            allowSearch: false,
            isMulti: false,
            defaultValue: String(defaultVal || ''),
            fieldKey: 'ID',
            fieldValue: 'questionType',
            placeholder: flyer.i18n.initTitle('选择问题类型'),
            fnSelected: function () {
                if (typeof fn === 'function') {
                    fn();
                }
            }
        });
    };

    /**
     * 初始化处理方式下拉框
     * 
     * @param {Array} data 数据源
     * @param {any} defaultValue 默认值
     * @param {Function} fn 选中之后处理函数
     * 
     */
    InitBaseDataSelect.prototype.initResovleMethodSelectBox = function ($container, data, defaultVal, fn) {
        return flyer.combobox($container || $('#resolveMethodSelectContainer'), {
            data: data,
            allowSearch: false,
            isMulti: false,
            fieldKey: 'ID',
            fieldValue: 'resolveMethodName',
            placeholder: flyer.i18n.initTitle('选择处理方式'),
            defaultValue: String(defaultVal || ''),
            fnSelected: function () {
                if (typeof fn === 'function') {
                    fn();
                }
            }
        });
    };

    // 到处接口
    exports.InitBaseDataSelect = InitBaseDataSelect;
});