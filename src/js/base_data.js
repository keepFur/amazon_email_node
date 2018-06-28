"use strict";
flyer.define("baseData", function (exports, module) {
    var baseDatas = {
        clickNum: 0
    };

    /**
     *页面入口函数 
     * 
     */
    function init() {
        // 初始化页面
        initPage();
    }

    /**
     *初始化页面 
     * 
     */
    function initPage() {
        var $tabContainer = $('#baseDataTab');
        var $tab = flyer.tab($tabContainer, {
            tabs: [{
                title: flyer.i18n.initTitle('商品列表'),
                url: './html/product.html',
                cache: true,
            }, {
                title: flyer.i18n.initTitle('商品品类列表'),
                url: './html/product_type.html',
                cache: true
            }, {
                title: flyer.i18n.initTitle('商品分组列表'),
                url: './html/product_group.html',
                cache: true
            }, {
                title: flyer.i18n.initTitle('国家列表'),
                url: './html/countries.html',
                cache: true
            }, {
                title: flyer.i18n.initTitle('问题分类列表'),
                url: './html/question_type.html',
                cache: true
            }, {
                title: flyer.i18n.initTitle('处理方式列表'),
                url: './html/resolve_method.html',
                cache: true
            }, {
                title: flyer.i18n.initTitle('店铺列表'),
                url: './html/shop_manage.html',
                cache: true
            }],
            click: function (elm) {
                baseDatas.clickNum++;
                var indexOfLi = $(elm).index();
                if (indexOfLi !== 0 && baseDatas.clickNum !== 0) {
                    $(".flyer-tab-content").find(".flyer-tab-item").eq(0).hide();
                } else {
                    $(".flyer-tab-content").find(".flyer-tab-item").eq(0).show();
                }
            }
        });
    }

    /**
     * 获取表格中选中的数据,返回选中数据的一个数组
     * 
     * @param {any} $table 数据表格
     * @returns 返回一个数组，没有则返回空数据
     */
    function getTableCheckedDatas($table) {
        var arr = [], rows = [];
        if ($table && Array.isArray(rows)) {
            var checkedDatas = $table.$body.find('input[type=checkbox][name!=flyer-active-radio]:checked');
            rows = $table.getDatas();
            $.each(checkedDatas, function (index, item) {
                var $item = $(item), $index = $item.parents('tr').data('index');
                arr[index] = rows[$index];
            });
        }
        return arr;
    }

    /**
     * 数组自动去重,数组元素支持任何类型的，包括对象，返回去重之后的数组
     * 
     * 
     * @param {any} arr 
     * @returns 
     */
    function unniqueArr(arr) {
        var hashTable = {},
            newArr = [],
            eleTypeofIsObject = false;
        if (Array.isArray(arr)) {
            if (arr.length) {
                for (var i = 0, l = arr.length; i < l; i++) {
                    eleTypeofIsObject = typeof arr[i] === 'object';
                    if (!hashTable[eleTypeofIsObject ? JSON.stringify(arr[i]) : arr[i]]) {
                        hashTable[eleTypeofIsObject ? JSON.stringify(arr[i]) : arr[i]] = true;
                        newArr.push(arr[i]);
                    }
                }
            }
        } else {
            flyer.msg(baseDatas.paramErrMsg);
        }
        return newArr;
    }

    /**
     * 处理空格或逗号分割的字符串，转换成数组并且去除空值
     * 
     * @param {any} str 
     * @returns 
     */
    function toArray(str, inputName) {
        var reg = /(,)+|(，)+/g, arrs = [];
        inputName = inputName || 'name';
        if (str === ',' || str === "，") {
            $('input[name=' + inputName + ']').val('').focus();
        } else if (typeof str === 'string' && str) {
            arrs = str.replace(reg, ',').split(',').map(function (item) {
                return item.trim();
            });
            for (var i = 0; i < arrs.length; i++) {
                if (arrs[i] === "" || typeof (arrs[i]) === "undefined") {
                    arrs.splice(i, 1);
                    i -= 1;
                }
            }
        }
        return arrs;
    }

    // 暴露接口
    exports.unniqueArr = unniqueArr;
    exports.toArray = toArray;
    exports.getTableCheckedDatas = getTableCheckedDatas;

    // 页面入口
    init();
});