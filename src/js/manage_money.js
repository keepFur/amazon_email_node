// 充值套餐管理模块
'use strict';
flyer.define('package_manage', function(exports, module) {
    var baseDatas = {
        // 表格实例
        $table: null,
        pagerObj: null,
        pageSizeSelectObj: null,
        curIndex: Number(flyer.getQueryString('curIndex') || 1),
        // 错误消息
        paramErrMsg: '参数错误，请刷新页面重试',
        netErrMsg: '系统已退出登录，请登录系统重试',
        operatorErrMsg: {
            single: '请选择一条数据操作',
            batch: '请至少选择一条数据操作'
        },
        // 充值套餐
        packagePlant: ''
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
        // 页签点击事件
        core.initTabClick($('#managePackageTab li'), function($li) {
            if (!$li.hasClass('flyer-tab-active')) {
                getTableDatas(baseDatas.curIndex, 20);
            }
        });
        // 创建充值套餐
        $('.createPackage').on('click', createPackageHandle);
        // 修改充值套餐信息
        $('.updatePackage').on('click', updatePackageHandle);
        // 禁用充值套餐
        $('.disabledPackage').on('click', {
            type: 0
        }, togglePackageHandle);
        // 启用充值套餐
        $('.enabledPackage').on('click', {
            type: 1
        }, togglePackageHandle);
    }

    /**
     * 创建充值套餐的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createPackageHandle(events) {
        flyer.open({
            pageUrl: '/html/package_create.html',
            isModal: true,
            area: [440, 350],
            title: '新增支付套餐',
            btns: [{
                text: '保存',
                click: function(ele) {
                    var that = this;
                    var packgaeInfo = core.getFormValues($('form[name=packageCreateForm]'));
                    var validPackgaeInfoResult = validPackageInfo(packgaeInfo);
                    if (validPackgaeInfoResult.isPass) {
                        $.ajax({
                            url: '/api/createPackage',
                            type: 'POST',
                            data: packgaeInfo,
                            beforeSend: function(jqXHR, settings) {
                                $.lockedBtn($(ele), true, ('保存中'));
                            },
                            success: function(data, textStatus, jqXHR) {
                                flyer.msg(data.success ? ('操作成功') : ('操作失败'));
                                that.close();
                                getTableDatas(1, 20);
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                flyer.msg(baseDatas.errorMsg);
                            },
                            complete: function(jqXHR, textStatus) {
                                $.unlockBtn($(ele), '保存');
                            }
                        });
                    } else {
                        flyer.msg(validPackgaeInfoResult.msg);
                    }
                }
            }, {
                text: '取消',
                click: function() {
                    this.close();
                }
            }]
        });
        return false;
    }

    /**
     * 充值套餐信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updatePackageHandle(events) {
        var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
        if (selectDatas.length === 1) {
            var packageName = selectDatas[0].packageName;
            var description = selectDatas[0].description;
            flyer.open({
                pageUrl: '/html/package_create.html',
                isModal: true,
                area: [400, 350],
                title: '充值套餐信息修改',
                btns: [{
                    text: '确定',
                    click: function(ele) {
                        var that = this;
                        var packageInfo = core.getFormValues($('form[name=packageCreateForm]'));
                        var validPackageInfoResult = validPackageInfo(packageInfo);
                        packageInfo.id = selectDatas[0].id;
                        if (validPackageInfoResult.isPass) {
                            $.ajax({
                                url: '/api/updatePackage',
                                type: 'POST',
                                data: packageInfo,
                                beforeSend: function(jqXHR, settings) {
                                    $.lockedBtn($(ele), true, ('修改中'));
                                },
                                success: function(data, textStatus, jqXHR) {
                                    flyer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                                    that.close();
                                    getTableDatas(1, 20);
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    flyer.msg(baseDatas.errorMsg);
                                },
                                complete: function(jqXHR, textStatus) {
                                    $.unlockBtn($(ele), ('确定'));
                                }
                            });
                        } else {
                            flyer.msg(validPackageInfoResult.msg);
                        }
                    }
                }, {
                    text: '取消',
                    click: function() {
                        this.close();
                    }
                }],
                afterCreated: function() {
                    setPackageInfo(selectDatas[0]);
                }
            });
        } else {
            flyer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 切换充值套餐状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function togglePackageHandle(events) {
        var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定暂停吗？' : '确定恢复吗？';
        if (selectDatas.length === 1) {
            flyer.confirm(tipMsg, function(result) {}, {
                btns: [{
                        text: '确定',
                        click: function(elm) {
                            this.close();
                            $.ajax({
                                url: '/api/togglePackage',
                                type: 'POST',
                                data: {
                                    id: selectDatas[0].id,
                                    status: type
                                },
                                success: function(data, textStatus, jqXHR) {
                                    flyer.msg(data.success ? '操作成功' : ('操作失败' + data.message));
                                    getTableDatas(1, 20);
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    flyer.msg(baseDatas.netErrMsg);
                                }
                            });
                        }
                    },
                    {
                        text: ("取消"),
                        click: function(elm) {
                            this.close();
                        }
                    }
                ],
                title: "询问框",
                isModal: true
            });
        } else {
            flyer.msg(baseDatas.operatorErrMsg.single);
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
                    field: "",
                    checkbox: true,
                    styles: {
                        width: 34
                    }
                }, {
                    title: '名称',
                    field: 'packageName'
                }, {
                    title: '充值积分（购买/赠送）',
                    field: "",
                    formatter: function(row) {
                        return `${row.packagePurchaseScore}/${row.packagePresentScore}`;
                    }
                }, {
                    title: '金额（购买金额/赠送金额）',
                    field: "packageMoney",
                    formatter: function(row) {
                        return `${row.packagePurchaseMoney}/${row.packagePresentMoney}`;
                    }
                }, {
                    title: '创建时间',
                    field: "createdDate",
                    styles: {
                        width: 130
                    },
                    formatter: function(row, rows) {
                        return flyer.formatDate('yyyy-mm-dd hh:MM', row.createdDate);
                    }
                }, {
                    title: '修改时间',
                    field: "updateDate",
                    styles: {
                        width: 130
                    },
                    formatter: function(row, rows) {
                        return row.updateDate ? flyer.formatDate('yyyy-mm-dd hh:MM', row.updateDate) : '-';
                    }
                }, {
                    title: '状态',
                    field: 'status',
                    styles: {
                        width: 60
                    },
                    formatter: function(row) {
                        return row.status === 1 ? '启用' : '停用';
                    }
                }],
                data: datas,
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
        core.tableNoMatch($table, '暂时没有充值套餐');
        // 初始化下拉框，显示每页数据条数的下拉框
        baseDatas.pageSizeSelectObj = core.initPagerSizeSelect($('#packagePagerSize'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
            callback: getTableDatas,
            pagerObj: baseDatas.pagerObj,
            total: datas.total,
            exports: exports
        });
        // 初始化分页
        baseDatas.pagerObj = core.initPager($('.paper-container'), total, pagerObj.pageSize || 20, {
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
        $('#currentPackageMountSpan').text(currentTotal);
        $('#packageMountSpan').text(total);
    }

    /**
     * 获取表格数据
     * 
     * @param {Number} pageNumber 当前显示页数，默认为0
     * @param {NUmber} pageSize 煤业显示的数据条数，默认为20
     */
    function getTableDatas(pageNumber, pageSize) {
        var conditions = {
                offset: pageNumber || 1,
                limit: pageSize || 20,
            },
            $table = $('#packageTable');
        $.ajax({
            url: '/api/readPackagePage',
            type: 'GET',
            data: conditions,
            beforeSend: function(jqXHR, settings) {
                $.addLoading();
            },
            success: function(data, jqXHR, textStatus) {
                if (data.success) {
                    renderTable($table, data.data.rows);
                    randerDOMPager(baseDatas.$table, data.data.rows, data.data.total, {
                        pageNumber: pageNumber || 1,
                        pageSize: pageSize || 20
                    });
                    setMountValue(data.data.rows.length, data.data.total);
                    core.bindCheckboxEvent(baseDatas.$table);
                } else {
                    flyer.msg(data.message);
                    renderTable($table, []);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                flyer.msg(baseDatas.netErrMsg);
            },
            complete: function(jqXHR, textStatus) {
                $.removeLoading()
            }
        });
    }

    /**
     * 校验充值套餐信息
     * 
     * @param {Object} packageInfo 充值套餐信息对象
     */
    function validPackageInfo(packageInfo) {
        if (!packageInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }

        if (!packageInfo.packageName) {
            return {
                isPass: false,
                msg: '充值套餐名称不能为空'
            }
        }

        if (!packageInfo.packagePurchaseMoney) {
            return {
                isPass: false,
                msg: '充值套餐购买金额不能为空'
            }
        }
        if (!packageInfo.packagePresentMoney) {
            return {
                isPass: false,
                msg: '充值套餐赠送金额不能为空'
            }
        }
        if (!packageInfo.packagePurchaseScore) {
            return {
                isPass: false,
                msg: '充值套餐购买积分不能为空'
            }
        }
        if (!packageInfo.packagePresentScore) {
            return {
                isPass: false,
                msg: '充值套餐赠送积分不能为空'
            }
        }
        return {
            isPass: true,
            msg: ''
        };
    }

    /**
     * 为表单复制
     * 
     * @param {any} packageInfo 
     * @param {any} $form 
     */
    function setPackageInfo(packageInfo, $form) {
        $form = $form || $('form[name=packageCreateForm]');
        for (var key in packageInfo) {
            if (packageInfo.hasOwnProperty(key)) {
                var element = packageInfo[key];
                $form.find('input[name=' + key + ']').val(element);
            }
        }
    }

    // 页面入口
    init();
});