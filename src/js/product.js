'use strict';
flyer.define('product', function (exports, module) {
    var baseDatas = {
        // 表格实例
        $table: null,
        pagerObj: null,
        pageSizeSelectObj: null,
        ajax_timeout: 1000 * 60 * 10,
        // 文件最大上传限制 20M
        maxSizeOfFile: 20 * 1024 * 1024,
        // 错误消息
        paramErrMsg: flyer.i18n.initTitle('参数错误，请刷新页面重试'),
        netErrMsg: flyer.i18n.initTitle('系统已退出登录，请登录系统重试'),
        operatorErrMsg: flyer.i18n.initTitle('请至少选择一条数据操作'),
        // true: readAsBinaryString ; false: readAsArrayBuffer
        rABS: true,
        // 用户所在组
        orgGroupID: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
        userID: $("#__userid").val().trim(),
        userName: $('#__username').val().trim(),
        // 部门信息
        companyOrgID: Number(core.getUserGroups().parentId ? core.getUserGroups().parentId.split(',')[1] : 0),
        companyOrgName: core.getUserGroups().parentName ? core.getUserGroups().parentName.split(',')[1] : '无组织'
    };

    /**
     *页面入口函数 
     * 
     */
    function init() {
        // 初始化上传附件组件
        initUploadComponent($(".flyer-upload-file-up"));
        initUploadComponent($(".flyer-upload-file-down"));
        // 获取表格数据
        getTableDatas(1, 20);
        // 初始化事件
        initEvent();
    }

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 删除产品
        $('.deleteProduct').on('click', deleteProductHandle);
        // 停用或启用商品
        // $('.toggleBtnGroup').on('click', toggleBtnGroupHandle);
        // 停用
        // $('.disabled-product').on('click', disabledProductHandle);
        // 高级搜索
        $('#advancedSearchBtn').on('click', advancedSearchHandle);
        // 清空搜索条件
        $('#clearSearchConditionsBtn').on('click', clearSearchConditionsHandle);
        // 数据修正,导入之后手动更新国家之类的信息
        $('.adjustDataProduct').on('click', adjustDataProductHandle);
    }

    /**
     * 删除产品按钮的点击事件
     * 
     */
    function deleteProductHandle(events) {
        var selectDatas = flyer.exports.baseData.getTableCheckedDatas(baseDatas.$table);
        if (selectDatas.length) {
            flyer.confirm(flyer.i18n.initTitle('确定删除吗?'), function (result) {
            }, {
                    btns: [{
                        text: flyer.i18n.initTitle('确定'),
                        skin: "flyer-btn-blue",
                        click: function (elm) {
                            this.close();
                            var ids = selectDatas.map(function (item) {
                                return item.ID;
                            });
                            $.ajax({
                                url: core.url + '/delete_product',
                                type: 'POST',
                                data: {
                                    ID: ids
                                },
                                success: function (data, textStatus, jqXHR) {
                                    flyer.msg(data.success ? flyer.i18n.initTitle('操作成功') : flyer.i18n.initTitle('操作失败'));
                                    getTableDatas(1, 20);
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    flyer.msg(baseDatas.netErrMsg);
                                }
                            });
                        }
                    },
                    {
                        text: flyer.i18n.initTitle("取消"),
                        skin: "",
                        click: function (elm) {
                            this.close();
                        }
                    }
                    ],
                    title: flyer.i18n.initTitle("询问框"),
                    isModal: true
                });
        } else {
            flyer.msg(baseDatas.operatorErrMsg);
        }
        return false;
    }

    /**
     * 停用或者启用按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleBtnGroupHandle(events) {
        var $this = $(this), isHidden = $('.flyer-btn-group-content').is(':hidden');
        if (isHidden) {
            $('.flyer-btn-group-content').show();
            $this.find('i').removeClass('fa-angle-down').addClass('fa-angle-up');
        } else {
            $('.flyer-btn-group-content').hide();
            $this.find('i').removeClass('fa-angle-up').addClass('fa-angle-down');
        }
        return false;
    }

    /**
     * 停用或禁用按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function disabledProductHandle(events) {
        var selectDatas = flyer.exports.baseData.getTableCheckedDatas(baseDatas.$table),
            operatoreType = $(this).data('disabled'),//0是禁用，1是启用
            title = operatoreType === '0' ? flyer.i18n.initTitle('确定停用吗?') : flyer.i18n.initTitle('确定启用吗?');
        if (selectDatas.length) {
            flyer.confirm(title, function (result) {
            }, {
                    btns: [{
                        text: flyer.i18n.initTitle('确定'),
                        skin: "flyer-btn-blue",
                        click: function (elm) {
                            this.close();
                            var ids = selectDatas.map(function (item) {
                                return item.ID;
                            });
                            $.ajax({
                                url: core.url + '/delete_product',
                                type: 'POST',
                                data: {
                                    operatoreType: operatoreType,
                                    ID: ids
                                },
                                success: function (data, textStatus, jqXHR) {
                                    flyer.msg(data.success ? flyer.i18n.initTitle('操作成功') : flyer.i18n.initTitle('操作失败'));
                                    $('.toggleBtnGroup').trigger('click');
                                    getTableDatas(1, 20);
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    flyer.msg(baseDatas.netErrMsg);
                                }
                            });
                        }
                    },
                    {
                        text: flyer.i18n.initTitle("取消"),
                        skin: "",
                        click: function (elm) {
                            this.close();
                        }
                    }
                    ],
                    title: flyer.i18n.initTitle("询问框"),
                    isModal: true
                });
        } else {
            flyer.msg(baseDatas.operatorErrMsg);
        }
        return false;
    }

    /**
     * 高级搜索按钮的点击事件处理函数
     * 
     * @param {any} events 
     * @returns 
     */
    function advancedSearchHandle(events) {
        $('.flyer-search-conditions').data('conditions', null).data('conditionstext', null);
        showAdvancedSearchWindow(getTableDatas);
        return false;
    }

    /**
     * 清空高级搜索按钮点击事件处理函数
     * 
     * @returns 
     */
    function clearSearchConditionsHandle() {
        $('.flyer-search-conditions').html('').data('conditions', null).data('conditionstext', null);
        flyer.exports.product_search = false;
        getTableDatas(1, 20);
        return false;
    }

    /**
     * 产品数据中心修正
     * 
     * @param {any} events 
     */
    function adjustDataProductHandle(events) {
        $.ajax({
            url: core.url + '/adjust_product',
            type: 'POST',
            success: function (data, textStatus, jqXHR) {
                flyer.msg(data.success ? flyer.i18n.initTitle('操作成功') : flyer.i18n.initTitle('操作失败'));
                getTableDatas(1, 20);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                flyer.msg(baseDatas.netErrMsg);
            }
        });
        return false;
    }

    /**
     *初始化上传附件组件样式 
     * 
     */
    function initUploadComponent($input) {
        if ($input && $input.length) {
            flyer.upload($input, {
                text: flyer.i18n.initTitle('导入产品'),
                url: core.url + "/upload",
                uploadBefore: function ($inputEle) {
                    // 此处的size是字节
                    if ($inputEle[0].files[0].size <= baseDatas.maxSizeOfFile) {
                        return true;
                    } else {
                        flyer.msg(flyer.i18n.initTitle('文件最大上传限制为20M'));
                        return false
                    }
                },
                success: function (files) {
                    importXLSFileHandle(files, $input);
                }
            });
        } else {
            flyer.msg(baseDatas.paramErrMsg);
        }
    }

    /**
    *导入XLS文件按钮点击事件处理函数
    * 
    */
    function importXLSFileHandle(files) {
        var file = files[0];
        $.ajax({
            url: core.url + '/import_xls_to_database',
            type: 'POST',
            timeout: baseDatas.ajax_timeout,
            data: {
                file: file,
                companyOrgID: baseDatas.companyOrgID,
                companyOrgName: baseDatas.companyOrgName,
                createByID: baseDatas.userID,
                createByName: baseDatas.userName
            },
            beforeSend: function () {
                flyer.loading.init().add();
            },
            success: function (data, textStatus, jqXHR) {
                if (data.success) {
                    getTableDatas(1, 20);
                    flyer.msg(flyer.i18n.initTitle("操作成功"));
                } else {
                    flyer.msg(data.message);
                }
            },
            complete: function (jqXHR, textStatus) {
                flyer.loading.init().delete();
            }
        });
    }

    /**
     * 渲染表格结构
     * 
     * @param {any} $table 表格容器
     * @param {any} datas 表格数据
     */
    function renderDOMTable($table, datas) {
        if ($table && $table.length && Array.isArray(datas)) {
            baseDatas.$table = flyer.table($table, {
                columns: [{
                    field: "",
                    checkbox: true,
                    styles: {
                        width: 34
                    }
                }, {
                    title: flyer.i18n.initTitle('店铺'),
                    field: "",
                    styles: {
                        width: 80
                    },
                    formatter: function (row) {
                        if (row.storeName && row.storeName !== '#N/A' && row.storeName !== 'N/A') {
                            return row.storeName;
                        }
                        return '-';
                    }
                }, {
                    title: flyer.i18n.initTitle('ASIN'),
                    field: "",
                    styles: {
                        width: 150
                    },
                    formatter: function (row) {
                        var ASIN = row.ASIN;
                        if (ASIN && ASIN !== '#N/A' && ASIN !== 'N/A') {
                            return '<span title="' + ASIN + '">' + ASIN + '</span>';
                        }
                        return '-';
                    }
                }, {
                    title: flyer.i18n.initTitle('SKU'),
                    field: "",
                    styles: {
                        width: 150
                    },
                    formatter: function (row) {
                        var SKU = row.SKU;
                        if (SKU && SKU !== '#N/A' && SKU !== 'N/A') {
                            return '<span title="' + SKU + '">' + SKU + '</span>';
                        }
                        return '-';
                    }
                }, {
                    title: flyer.i18n.initTitle('商品名称'),
                    field: "",
                    formatter: function (row) {
                        var productName = row.productName;
                        if (productName && productName !== '#N/A' && productName !== 'N/A') {
                            return '<span title="' + productName + '">' + productName + '</span>';
                        }
                        return '-';
                    }
                }, {
                    title: flyer.i18n.initTitle('品类'),
                    field: "",
                    styles: {
                        width: 100
                    },
                    formatter: function (row) {
                        var productTypeName = row.productTypeName;
                        if (productTypeName && productTypeName !== '#N/A' && productTypeName !== 'N/A') {
                            return '<span title="' + productTypeName + '">' + productTypeName + '</span>';
                        }
                        return '-';
                    }
                }, {
                    title: flyer.i18n.initTitle('国家'),
                    field: "",
                    styles: {
                        width: 80
                    },
                    formatter: function (row) {
                        if (row.countriesName && row.countriesName !== '#N/A' && row.countriesName !== 'N/A') {
                            return row.countriesName;
                        }
                        return '-';
                    }
                }, {
                    title: flyer.i18n.initTitle('分组'),
                    field: "",
                    styles: {
                        width: 80
                    },
                    formatter: function (row) {
                        if (row.productGroupName && row.productGroupName !== '#N/A' && row.productGroupName !== 'N/A') {
                            return row.productGroupName;
                        }
                        return '-';
                    }
                }],
                data: datas
            });
        } else {
            flyer.msg(baseDatas.paramErrMsg);
        }
    }

    /**
     * 初始化分页信息
     * 
     * @param {any} $table 
     * @param {any} datas 
     */
    function randerDOMPager($table, datas, total, pagerObj) {
        //没有结果的时候
        core.tableNoMatch($table, flyer.i18n.initTitle('暂时没有相关商品'));
        // 初始化下拉框，显示每页数据条数的下拉框
        baseDatas.pageSizeSelectObj = core.initPagerSizeSelect($('#productPagerSize'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
            callback: getTableDatas,
            pagerObj: baseDatas.pagerObj,
            total: datas.total,
            exports: exports
        });
        //初始化分页
        baseDatas.pagerObj = core.initPager($('.paper-container-product'), total, pagerObj.pageSize || 20, {
            callback: getTableDatas,
            pageNumber: pagerObj.pageNumber || 1,
            pageSizeSelectObj: baseDatas.pageSizeSelectObj,
            exports: exports
        });
        // 有数据的时候。才需要去初始化
        if (datas.total) {
            // 为表中的checkbox绑定点击事件
            core.bindCheckboxEvent($table);
        }
    }

    /**
     * 设置spanner
     * 
     * @param {any} currentTotal 当前显示数据的总数
     * @param {any} total 总数居
     */
    function setMountValue(currentTotal, total) {
        $('#productCurrentMountSpan').text(currentTotal);
        $('#productMountSpan').text(total);
    }

    /**
     * 获取表格数据
     * 
     */
    function getTableDatas(pageNumber, pageSize) {
        var conditions = {},
            conditionsObj = {},
            conditionsText = '',
            $flyerSearchConditions = $('.flyer-search-conditions'),
            $table = $('#dataTable');
        if ($flyerSearchConditions.data('conditions')) {
            conditions = JSON.parse($flyerSearchConditions.data('conditions'));
            conditionsText = $flyerSearchConditions.data('conditionstext');
            $flyerSearchConditions.html(conditionsText);
        } else {
            if (flyer.exports.product_search && typeof flyer.exports.product_search.getConditions === 'function') {
                conditionsObj = flyer.exports.product_search.getConditions() || {};
                conditions = conditionsObj.resultObj;
                conditionsText = conditionsObj.resultObjText ? '，' + flyer.i18n.initTitle('搜索条件') + '：' + conditionsObj.resultObjText : '';
                $flyerSearchConditions.html(conditionsText).data('conditions', JSON.stringify(conditions)).data('conditionstext', conditionsText);
            }
        }
        conditions.offset = pageNumber || 1;
        conditions.limit = pageSize || 20;
        conditions.nocache = window.Date.now();
        conditions.companyOrgID = baseDatas.companyOrgID;
        conditions.companyOrgName = baseDatas.companyOrgName;
        $.ajax({
            url: core.url + '/read_product',
            type: 'GET',
            data: conditions,
            beforeSend: function (jqXHR, settings) {
                flyer.loading.init().add();
            },
            success: function (data, jqXHR, textStatus) {
                if (data.success) {
                    renderDOMTable($table, data.data.rows);
                    randerDOMPager(baseDatas.$table, data.data.rows, data.data.total, {
                        pageNumber: pageNumber || 1,
                        pageSize: pageSize || 20
                    });
                    core.bindCheckboxEvent(baseDatas.$table);
                    setMountValue(data.data.rows.length, data.data.total);
                } else {
                    flyer.msg(baseDatas.netErrMsg);
                    renderDOMTable($table, []);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                flyer.msg(baseDatas.netErrMsg);
            },
            complete: function (jqXHR, textStatus) {
                flyer.loading.init().delete();
            }
        });
    }

    /**
    * 显示高级搜索弹出框
    * 
    */
    function showAdvancedSearchWindow(callback) {
        flyer.open({
            pageUrl: core.url + '/html/product_search.html',
            isModal: true,
            area: [460, 400],
            title: flyer.i18n.initTitle('高级搜索'),
            btns: [{
                text: flyer.i18n.initTitle('搜索'),
                click: function (elm) {
                    if (typeof callback === 'function') {
                        callback(0, 20);
                        this.close();
                    }
                }
            }, {
                text: flyer.i18n.initTitle('关闭'),
                click: function (elm) {
                    this.close();
                }
            }]
        });
    }

    // 暴露接口
    exports.getTableDatas = getTableDatas;
    // 页面入口
    init();
});