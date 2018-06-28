'use strict';
flyer.define('storeManage', function (exports, module) {
    var baseDatas = {
        // 用户所在组
        orgGroupID: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
        orgCode: core.getUserGroups().orgCode,
        userID: $("#__userid").val().trim(),
        userName: $('#__username').val().trim(),
        // 部门信息
        companyOrgID: Number(core.getUserGroups().parentId ? core.getUserGroups().parentId.split(',')[1] : 0),
        companyOrgName: core.getUserGroups().parentName ? core.getUserGroups().parentName.split(',')[1] : '无组织',
        // 表格实例
        $table: null,
        pagerObj: null,
        pageSizeSelectObj: null,
        curIndex: Number(flyer.getQueryString('curIndex') || 1),
        // 错误消息
        paramErrMsg: flyer.i18n.initTitle('参数错误，请刷新页面重试'),
        netErrMsg: flyer.i18n.initTitle("系统已退出登录，请登录系统重试"),
        operatorErrMsg: {
            single: flyer.i18n.initTitle('请选择一条数据操作'),
            batch: flyer.i18n.initTitle('请至少选择一条数据操作')
        },
        i18nText: {
            name: flyer.i18n.initTitle('名称'),
            nameNotEmpty: flyer.i18n.initTitle('名称不能为空'),
            saveText: flyer.i18n.initTitle('保存'),
            savingText: flyer.i18n.initTitle('保存中'),
            cnacelText: flyer.i18n.initTitle('取消'),
            operatorSuccess: flyer.i18n.initTitle('操作成功'),
            operatorFailed: flyer.i18n.initTitle('操作失败')
        }
    };

    /**
     *页面入口函数 
     * 
     */
    function init() {
        // 获取表格数据
        getTableDatas(baseDatas.curIndex, 20);
        // 初始化事件
        initEvent();
    }

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 创建店铺（支持批量）
        $('.createStore').on('click', createStoreHandle);
        // 删除店铺（支持批量）
        $('.deleteStore').on('click', deleteStoreBatchHandle);
    }

    /**
        * 创建店铺（支持批量）的点击事件处理函数
        * 
        * @param {any} events 
        */
    function createStoreHandle(events) {
        flyer.open({
            pageUrl: core.url + '/html/add_base_data.html',
            isModal: true,
            area: [440, 160],
            title: flyer.i18n.initTitle('创建店铺'),
            btns: [{
                text: baseDatas.i18nText.saveText,
                click: function () {
                    var that = this, $firstBtn = $(that.$btns[0]),
                        storeName = flyer.exports.baseData.unniqueArr(flyer.exports.baseData.toArray($('#baseDataName').val().trim()));
                    if (storeName) {
                        storeName = hasStoreName(storeName, JSON.parse(flyer.store.get('storeName')).map(function (item) {
                            return item.storeName;
                        }));
                        if (storeName.length) {
                            $.ajax({
                                url: core.url + '/create_store',
                                type: 'POST',
                                data: {
                                    storeName: storeName,
                                    createByID: baseDatas.userID,
                                    createByName: baseDatas.userName,
                                    companyOrgID: baseDatas.companyOrgID,
                                    companyOrgName: baseDatas.companyOrgName
                                },
                                beforeSend: function (jqXHR, settings) {
                                    core.lockedBtn($firstBtn, true, baseDatas.i18nText.savingText);
                                },
                                success: function (data, textStatus, jqXHR) {
                                    flyer.msg(data.success ? baseDatas.i18nText.operatorSuccess : baseDatas.i18nText.operatorFailed);
                                    that.close();
                                    getTableDatas(1, 20);
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    flyer.msg(baseDatas.errorMsg);
                                },
                                complete: function (jqXHR, textStatus) {
                                    core.unlockBtn($firstBtn, baseDatas.i18nText.saveText);
                                }
                            });
                        } else {
                            flyer.msg(baseDatas.i18nText.operatorSuccess);
                            that.close();
                        }
                    } else {
                        flyer.msg(baseDatas.i18nText.nameNotEmpty);
                    }
                }
            }, {
                text: baseDatas.i18nText.cnacelText,
                click: function () {
                    this.close();
                }
            }]
        });
        return false;
    }

    /**
     * 删除店铺（支持批量）
     * 
     */
    function deleteStoreBatchHandle(events) {
        var selectDatas = flyer.exports.baseData.getTableCheckedDatas(baseDatas.$table);
        if (selectDatas.length) {
            flyer.confirm(flyer.i18n.initTitle('确定删除吗?'), function (result) {
            }, {
                    btns: [{
                        text: flyer.i18n.initTitle('确定'),
                        skin: "flyer-btn-blue",
                        click: function (elm) {
                            this.close();
                            var IDS = selectDatas.map(function (item) {
                                return item.ID;
                            });
                            $.ajax({
                                url: core.url + '/delete_store',
                                type: 'POST',
                                data: {
                                    IDS: IDS
                                },
                                success: function (data, textStatus, jqXHR) {
                                    flyer.msg(baseDatas.i18nText.operatorSuccess);
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
                    title: flyer.i18n.initTitle('询问框'),
                    isModal: true
                });
        } else {
            flyer.msg(baseDatas.operatorErrMsg.batch);
        }
        return false;
    }

    /**
     * 更新店铺按钮点击事件处理函数，需要判断是否存在跟这个品类相关的客诉记录，如果存在，需要更新相应的客诉记录
     * @param {any} events 
     */
    function updateStoreHandle(events) {
        var $this = $(this),
            oldStoreName = $this.data('storename'),
            companyOrgID = $this.data('companyorgid'),
            placeholderI18n = flyer.i18n.initTitle('原名称'),
            open = flyer.open({
                content: '<div class="flyer-form" style="margin-right:0;padding-right:32px;margin-top:44px;">'
                + '<div class="flyer-form-item" >'
                + '<label class="flyer-form-label">' + flyer.i18n.initTitle('名称') + '</label>'
                + '<div class="flyer-input-block">'
                + '<input type="text" id="baseDataName" required="true" autocomplete="off" class="flyer-input"  placeholder="' + placeholderI18n + '：' + oldStoreName + '" value="' + oldStoreName + '" autofocus>'
                + '</div>'
                + '</div>'
                + '</div>',
                isModal: true,
                area: [440, 160],
                title: flyer.i18n.initTitle('更新店铺'),
                btns: [{
                    text: baseDatas.i18nText.saveText,
                    click: function () {
                        var that = this, $firstBtn = $(that.$btns[0]), storeName = $("#baseDataName").val().trim();
                        if (storeName) {
                            storeName = hasStoreName([storeName], JSON.parse(flyer.store.get('storeName')).map(function (item) {
                                return item.storeName;
                            }));
                            if (storeName.length) {
                                $.ajax({
                                    url: core.url + '/update_store',
                                    type: 'POST',
                                    data: {
                                        storeName: $("#baseDataName").val(),
                                        ID: $this.data('id'),
                                        oldStoreName: oldStoreName,
                                        companyOrgID: companyOrgID,
                                        updateByID: baseDatas.userID,
                                        updateByName: baseDatas.userName,
                                        nocache: window.Date.now()
                                    },
                                    beforeSend: function (jqXHR, settings) {
                                        core.lockedBtn($firstBtn, true, baseDatas.i18nText.savingText);
                                    },
                                    success: function (data, textStatus, jqXHR) {
                                        that.close();
                                        flyer.msg(data.success ? baseDatas.i18nText.operatorSuccess : baseDatas.i18nText.operatorFailed);
                                        getTableDatas(1, 20);
                                        flyer.exports.product.getTableDatas(1, 20);
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        flyer.msg(baseDatas.netErrMsg);
                                    },
                                    complete: function (jqXHR, textStatus) {
                                        core.unlockBtn($firstBtn, baseDatas.i18nText.saveText);
                                    }
                                });
                            } else {
                                flyer.msg(flyer.i18n.initTitle("名称") + '[\'' + $('#baseDataName').val().trim() + '\']' + flyer.i18n.initTitle("已经存在"));
                                $('#baseDataName').focus();
                            }
                        } else {
                            flyer.msg(baseDatas.i18nText.nameNotEmpty);
                            return
                        }
                    }
                }, {
                    text: baseDatas.i18nText.cnacelText,
                    click: function () {
                        this.close();
                    }
                }]
            });
        return false;
    }

    /**
    * 删除店铺点击事件处理函数(单个删除)
    * 
    * @param {any} events 
    */
    function deleteStoreSingleHandle(events) {
        var ID = Number($(events.target).data('id'));
        if (ID) {
            flyer.confirm(flyer.i18n.initTitle('确定删除吗?'), function (result) {
            }, {
                    btns: [{
                        text: flyer.i18n.initTitle('确定'),
                        skin: "flyer-btn-blue",
                        click: function (elm) {
                            this.close();
                            $.ajax({
                                url: core.url + '/delete_store',
                                type: 'POST',
                                data: {
                                    IDS: [ID]
                                },
                                success: function (data, textStatus, jqXHR) {
                                    flyer.msg(baseDatas.i18nText.operatorSuccess);
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
                    title: flyer.i18n.initTitle('询问框'),
                    isModal: true
                });
        } else {
            flyer.msg(baseDatas.operatorErrMsg.batch);
        }
        return false;
    }

    /**
     * 渲染表格结构
     * 
     * @param {jq} $table 表格容器
     * @param {Array} datas 表格数据
     */
    function renderTable($table, datas) {
        if ($table && $table.length && Array.isArray(datas)) {
            baseDatas.$table = flyer.table($table, {
                columns: [{
                    checkbox: true,
                    field: "",
                    styles: {
                        width: 34
                    }
                }, {
                    title: flyer.i18n.initTitle('店铺名称'),
                    field: "storeName"
                }, {
                    title: flyer.i18n.initTitle('创建用户'),
                    field: "createByName"
                }, {
                    title: flyer.i18n.initTitle('更新用户'),
                    field: "",
                    formatter: function (row) {
                        return row.updateByName ? row.updateByName : '-';
                    }
                }, {
                    title: flyer.i18n.initTitle('操作'),
                    styles: {
                        width: 120
                    },
                    formatter: function (row) {
                        return '<span class="table-btn" title="' + flyer.i18n.initTitle("编辑") + '"><i class="icon-pen table-btn flyer-editstore-btn" data-id="' + row.ID + '" data-storename="' + row.storeName + '" data-companyorgid="' + row.companyOrgID + '" style="padding-right:8px;"></i></span>'
                            + '<span class="table-btn"  style="display:none;" title="' + flyer.i18n.initTitle("删除") + '"><i class="icon-remove table-btn flyer-deletestore-btn" data-id="' + row.ID + '"></i></span>';
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
     * @param {jq} $table 表格初始化之后的实例对象 
     * @param {Array} datas 表格的数据
     */
    function randerDOMPager($table, datas, total, pagerObj) {
        // 没有数据的时候
        core.tableNoMatch($table, flyer.i18n.initTitle("暂时没有店铺记录"));
        // 初始化下拉框，显示每页数据条数的下拉框
        baseDatas.pageSizeSelectObj = core.initPagerSizeSelect($('#shopManagePagerSize'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
            callback: getTableDatas,
            pagerObj: baseDatas.pagerObj,
            total: datas.total,
            exports: exports
        });
        // 初始化分页
        baseDatas.pagerObj = core.initPager($('.paper-container-shop'), total, pagerObj.pageSize || 20, {
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
        $('#currentShopManageMountSpan').text(currentTotal);
        $('#shopManageMountSpan').text(total);
    }

    /**
     * 获取表格数据
     * 
     * 
     * @param {Number} pageNumber 当前显示页数，默认为0
     * @param {NUmber} pageSize 煤业显示的数据条数，默认为20
     */
    function getTableDatas(pageNumber, pageSize) {
        var conditions = {
            limit: pageSize || 20,
            pageNumber: pageNumber || 1,
            time: window.Date.parse(new Date()),
            companyOrgID: baseDatas.companyOrgID
        },
            $table = $('#shopManageTable');
        $.ajax({
            url: core.url + '/read_store_page',
            type: 'GET',
            data: conditions,
            beforeSend: function (jqXHR, settings) {
                flyer.loading.init().add();
            },
            success: function (data, jqXHR, textStatus) {
                renderTable($table, data.rows);
                randerDOMPager(baseDatas.$table, data.rows, data.total, {
                    pageNumber: pageNumber || 1,
                    pageSize: pageSize || 20
                });
                setMountValue(data.rows.length, data.total);
                core.bindCheckboxEvent(baseDatas.$table);
                getStoreName();
                // 修改店铺名称
                $('.flyer-editstore-btn').off('click').on('click', updateStoreHandle);
                // 删除店铺
                $('.flyer-deletestore-btn').off('click').on('click', deleteStoreSingleHandle);
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
    * 获取所有的店铺数据，并缓存到浏览器中
    * 
    */
    function getStoreName() {
        $.ajax({
            url: core.url + '/read_store_no_page',
            type: 'GET',
            data: {
                nocache: window.Date.now(),
                companyOrgID: baseDatas.companyOrgID
            },
            success: function (data, jqXHR, textStatus) {
                flyer.store.set('storeName', JSON.stringify(data.success ? data.data.rows : []));
            },
            error: function (jqXHR, textStatus, errorThrown) {
                flyer.msg(baseDatas.netErrMsg);
            }
        });
    }

    /**
     * 判断是否已经存在这个店铺了，存在的会自动去除掉，
     * 
     * 
     * @param {Array} arr 需要判断的数组
     * @returns 返回经过筛选之后的数组，如果传入的参数，是非数组或者数组长度为0的话，返回一个空数组
     */
    function hasStoreName(inputArr, orginArr) {
        var returnArr = [];
        if (inputArr && inputArr.length) {
            for (var i = 0; i < inputArr.length; i++) {
                if (orginArr.indexOf(inputArr[i]) === -1) {
                    returnArr.push(inputArr[i]);
                }
            }
        }
        return returnArr;
    }

    // 页面入口
    init();
});