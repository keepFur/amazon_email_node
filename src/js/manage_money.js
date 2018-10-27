// 充值套餐管理模块
layui.use(['table', 'element', 'layer', 'util', 'form'], function () {
    var table = layui.table;
    var element = layui.element;
    var layer = layui.layer;
    var util = layui.util;
    var form = layui.form;
    var baseDatas = {
        // 错误消息
        netErrMsg: '系统已退出登录，请登录系统重试',
        operatorErrMsg: {
            single: '请选择一条数据操作',
            batch: '请至少选择一条数据操作'
        }
    };
    var openContent = `<form class="layui-form layui-form-pane" name="packageCreateForm">
                            <div class="layui-form-item">
                                <label class="layui-form-label">名称</label>
                                <div class="layui-input-block">
                                    <input type="text" name="packageName" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <label class="layui-form-label">购买积分</label>
                                <div class="layui-input-block">
                                    <input type="text" name="packagePurchaseScore" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <label class="layui-form-label">赠送积分</label>
                                <div class="layui-input-block">
                                    <input type="text" name="packagePresentScore" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <label class="layui-form-label">购买金额</label>
                                <div class="layui-input-block">
                                    <input type="text" name="packagePurchaseMoney" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <label class="layui-form-label">赠送金额</label>
                                <div class="layui-input-block">
                                    <input type="text" name="packagePresentMoney" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <label class="layui-form-label">支付方式</label>
                                <div class="layui-input-block">
                                    <input type="text" name="packagePayMethod" placeholder="0 是微信和支付宝，1 是微信，2 是支付宝，默认是0" class="layui-input">
                                </div>
                            </div>
                        </form>`;

    /**
     *页面入口函数 
     * 
     */
    (function init() {
        form.render('select');
        // 获取表格数据
        renderTable();
        // 初始化事件
        initEvent();
    })();

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 查询
        $('#searchBtn').on('click', searchHandle);
        // 重置
        $('#resetBtn').on('click', function () {
            $('#logsSearchForm')[0].reset();
            return false;
        });
        // 创建充值套餐
        $('#createPackageBtn').on('click', createPackageHandle);
        // 修改充值套餐信息
        $('#updatePackageBtn').on('click', updatePackageHandle);
        // 禁用充值套餐
        $('#disabledPackageBtn').on('click', {
            type: 0
        }, togglePackageHandle);
        // 启用充值套餐
        $('#enabledPackagneBtn').on('click', {
            type: 1
        }, togglePackageHandle);
    }

    /**
    * 查询的点击事件处理函数
    * 
    * @param {any} events 
    */
    function searchHandle(events) {
        var queryParams = getQueryParams();
        reloadTable({
            where: queryParams,
            page: {
                curr: 1
            }
        });
        return false;
    }

    /**
     * 创建充值套餐的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createPackageHandle(events) {
        layer.open({
            content: openContent,
            area: ['400px', '450px'],
            title: '新增支付套餐',
            btn: ['保存', '取消'],
            yes: function (index, layero) {
                var that = this;
                var packgaeInfo = core.getFormValues($('form[name=packageCreateForm]'));
                packgaeInfo.packagePayMethod = packgaeInfo.packagePayMethod || 0;
                var validPackgaeInfoResult = validPackageInfo(packgaeInfo);
                if (validPackgaeInfoResult.isPass) {
                    $.ajax({
                        url: '/api/createPackage',
                        type: 'POST',
                        data: packgaeInfo,
                        success: function (data, textStatus, jqXHR) {
                            layer.msg(data.success ? ('操作成功') : ('操作失败'));
                            layer.close(index);
                            reloadTable();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        },
                    });
                } else {
                    layer.msg(validPackgaeInfoResult.msg);
                }
            }
        });
        return false;
    }

    /**
     * 充值套餐信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updatePackageHandle(events) {
        var selectDatas = table.checkStatus('packageTable').data;
        if (selectDatas.length === 1) {
            var packageName = selectDatas[0].packageName;
            var description = selectDatas[0].description;
            layer.open({
                content: openContent,
                area: ['400px', '450px'],
                title: '充值套餐信息修改',
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    var that = this;
                    var packageInfo = core.getFormValues($('form[name=packageCreateForm]'));
                    var validPackageInfoResult = validPackageInfo(packageInfo);
                    packageInfo.id = selectDatas[0].id;
                    if (validPackageInfoResult.isPass) {
                        $.ajax({
                            url: '/api/updatePackage',
                            type: 'POST',
                            data: packageInfo,
                            success: function (data, textStatus, jqXHR) {
                                layer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                                layer.close(index);
                                reloadTable();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                layer.msg(baseDatas.errorMsg);
                            }
                        });
                    } else {
                        layer.msg(validPackageInfoResult.msg);
                    }
                },
                success: function () {
                    setPackageInfo(selectDatas[0]);
                }
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 切换充值套餐状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function togglePackageHandle(events) {
        var selectDatas = table.checkStatus('packageTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                title: '询问框',
                btn: ['确定', '取消']
            }, function (index, layero) {
                $.ajax({
                    url: '/api/togglePackage',
                    type: 'POST',
                    data: {
                        id: selectDatas[0].id,
                        status: type
                    },
                    success: function (data, textStatus, jqXHR) {
                        layer.msg(data.success ? '操作成功' : ('操作失败' + data.message));
                        reloadTable();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        layer.msg(baseDatas.netErrMsg);
                    }
                });
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 渲染表格
     * 
     */
    function renderTable() {
        table.render({
            elem: '#packageTable',
            url: '/api/readPackagePage',
            page: true,
            cols: [[
                {
                    checkbox: true,
                },
                {
                    title: '名称',
                    field: 'packageName'
                },
                {
                    title: '充值积分（购买/赠送）',
                    field: "",
                    templet: function (d) {
                        return `${d.packagePurchaseScore}/${d.packagePresentScore}`;
                    }
                },
                {
                    title: '金额（购买金额/赠送金额）',
                    field: "packageMoney",
                    templet: function (d) {
                        return `${d.packagePurchaseMoney}/${d.packagePresentMoney}`;
                    }
                },
                {
                    title: '创建时间',
                    field: "createdDate",
                    templet: function (d) {
                        return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
                    }
                }, {
                    title: '修改时间',
                    field: "",
                    styles: {
                        width: 130
                    },
                    templet: function (d) {
                        return d.updateDate ? util.toDateString(d.updateDate, 'yyyy-MM-dd HH:mm') : '-';
                    }
                }, {
                    title: '状态',
                    field: 'status',
                    styles: {
                        width: 56
                    },
                    templet: function (d) {
                        return d.status === 1 ? '启用' : '停用';
                    }
                }
            ]],
            limits: [10, 20, 50, 100],
            page: {
                theme: '#2cc3a9',
                layout: ['prev', 'page', 'next', 'skip', 'count', 'limit']
            },
            request: {
                pageName: 'offset'
            },
            response: {
                statusCode: true
            },
            parseData: function (res) {
                return {
                    code: res.success,
                    msg: res.msg,
                    count: res.data.total,
                    data: res.data.rows
                }
            },
            done: function (res) {
                setMountValue(res.data.length, res.count);
            }
        });
    }

    /**
     * 重载表格
     * 
     */
    function reloadTable(options) {
        table.reload('packageTable', options);
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
    *获取表格的查询参数
    *
    * @returns 返回所有参数的对象
    */
    function getQueryParams() {
        var $form = $('#logsSearchForm');
        var formDatas = $form.serializeArray();
        var ret = {};
        $.each(formDatas, function (index, item) {
            ret[item.name] = item.value;
        });
        return ret;
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
});

'use strict';
// flyer.define('package_manage', function (exports, module) {
//     var baseDatas = {
//         // 表格实例
//         $table: null,
//         pagerObj: null,
//         pageSizeSelectObj: null,
//         curIndex: Number(flyer.getQueryString('curIndex') || 1),
//         // 错误消息
//         paramErrMsg: '参数错误，请刷新页面重试',
//         netErrMsg: '系统已退出登录，请登录系统重试',
//         operatorErrMsg: {
//             single: '请选择一条数据操作',
//             batch: '请至少选择一条数据操作'
//         },
//         // 充值套餐
//         packagePlant: ''
//     };

//     /**
//      *页面入口函数 
//      * 
//      */
//     function init() {
//         // 获取表格数据
//         getTableDatas(baseDatas.curIndex, 20);
//         // 初始化事件
//         initEvent();
//     }

//     /**
//      * 初始化DOM元素事件
//      * 
//      */
//     function initEvent() {
//         // 页签点击事件
//         core.initTabClick($('#managePackageTab li'), function ($li) {
//             if (!$li.hasClass('flyer-tab-active')) {
//                 getTableDatas(baseDatas.curIndex, 20);
//             }
//         });
//         // 创建充值套餐
//         $('.createPackage').on('click', createPackageHandle);
//         // 修改充值套餐信息
//         $('.updatePackage').on('click', updatePackageHandle);
//         // 禁用充值套餐
//         $('.disabledPackage').on('click', {
//             type: 0
//         }, togglePackageHandle);
//         // 启用充值套餐
//         $('.enabledPackage').on('click', {
//             type: 1
//         }, togglePackageHandle);
//     }

//     /**
//      * 创建充值套餐的点击事件处理函数
//      * 
//      * @param {any} events 
//      */
//     function createPackageHandle(events) {
//         flyer.open({
//             pageUrl: '/html/package_create.html',
//             isModal: true,
//             area: [440, 350],
//             title: '新增支付套餐',
//             btns: [{
//                 text: '保存',
//                 click: function (ele) {
//                     var that = this;
//                     var packgaeInfo = core.getFormValues($('form[name=packageCreateForm]'));
//                     packgaeInfo.packagePayMethod = packgaeInfo.packagePayMethod || 0;
//                     var validPackgaeInfoResult = validPackageInfo(packgaeInfo);
//                     if (validPackgaeInfoResult.isPass) {
//                         $.ajax({
//                             url: '/api/createPackage',
//                             type: 'POST',
//                             data: packgaeInfo,
//                             beforeSend: function (jqXHR, settings) {
//                                 $.lockedBtn($(ele), true, ('保存中'));
//                             },
//                             success: function (data, textStatus, jqXHR) {
//                                 layer.msg(data.success ? ('操作成功') : ('操作失败'));
//                                 that.close();
//                                 getTableDatas(1, 20);
//                             },
//                             error: function (jqXHR, textStatus, errorThrown) {
//                                 layer.msg(baseDatas.errorMsg);
//                             },
//                             complete: function (jqXHR, textStatus) {
//                                 $.unlockBtn($(ele), '保存');
//                             }
//                         });
//                     } else {
//                         layer.msg(validPackgaeInfoResult.msg);
//                     }
//                 }
//             }, {
//                 text: '取消',
//                 click: function () {
//                     this.close();
//                 }
//             }]
//         });
//         return false;
//     }

//     /**
//      * 充值套餐信息修改的点击事件处理函数
//      * @param {any} events 
//      */
//     function updatePackageHandle(events) {
//         var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
//         if (selectDatas.length === 1) {
//             var packageName = selectDatas[0].packageName;
//             var description = selectDatas[0].description;
//             flyer.open({
//                 pageUrl: '/html/package_create.html',
//                 isModal: true,
//                 area: [400, 350],
//                 title: '充值套餐信息修改',
//                 btns: [{
//                     text: '确定',
//                     click: function (ele) {
//                         var that = this;
//                         var packageInfo = core.getFormValues($('form[name=packageCreateForm]'));
//                         var validPackageInfoResult = validPackageInfo(packageInfo);
//                         packageInfo.id = selectDatas[0].id;
//                         if (validPackageInfoResult.isPass) {
//                             $.ajax({
//                                 url: '/api/updatePackage',
//                                 type: 'POST',
//                                 data: packageInfo,
//                                 beforeSend: function (jqXHR, settings) {
//                                     $.lockedBtn($(ele), true, ('修改中'));
//                                 },
//                                 success: function (data, textStatus, jqXHR) {
//                                     layer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
//                                     that.close();
//                                     getTableDatas(1, 20);
//                                 },
//                                 error: function (jqXHR, textStatus, errorThrown) {
//                                     layer.msg(baseDatas.errorMsg);
//                                 },
//                                 complete: function (jqXHR, textStatus) {
//                                     $.unlockBtn($(ele), ('确定'));
//                                 }
//                             });
//                         } else {
//                             layer.msg(validPackageInfoResult.msg);
//                         }
//                     }
//                 }, {
//                     text: '取消',
//                     click: function () {
//                         this.close();
//                     }
//                 }],
//                 afterCreated: function () {
//                     setPackageInfo(selectDatas[0]);
//                 }
//             });
//         } else {
//             layer.msg(baseDatas.operatorErrMsg.single);
//         }
//         return false;
//     }

//     /**
//      * 切换充值套餐状态按钮点击事件处理函数
//      * 
//      * @param {any} events 
//      */
//     function togglePackageHandle(events) {
//         var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
//         var type = events.data.type;
//         var tipMsg = type === 0 ? '确定暂停吗？' : '确定恢复吗？';
//         if (selectDatas.length === 1) {
//             flyer.confirm(tipMsg, function (result) { }, {
//                 btns: [{
//                     text: '确定',
//                     click: function (elm) {
//                         this.close();
//                         $.ajax({
//                             url: '/api/togglePackage',
//                             type: 'POST',
//                             data: {
//                                 id: selectDatas[0].id,
//                                 status: type
//                             },
//                             success: function (data, textStatus, jqXHR) {
//                                 layer.msg(data.success ? '操作成功' : ('操作失败' + data.message));
//                                 getTableDatas(1, 20);
//                             },
//                             error: function (jqXHR, textStatus, errorThrown) {
//                                 layer.msg(baseDatas.netErrMsg);
//                             }
//                         });
//                     }
//                 },
//                 {
//                     text: ("取消"),
//                     click: function (elm) {
//                         this.close();
//                     }
//                 }
//                 ],
//                 title: "询问框",
//                 isModal: true
//             });
//         } else {
//             layer.msg(baseDatas.operatorErrMsg.single);
//         }
//         return false;
//     }

//     /**
//      * 渲染表格结构
//      * 
//      * @param {jq} $table 表格容器
//      * @param {Array} datas 表格数据
//      */
//     function renderTable($table, datas) {
//         if ($table && $table.length && Array.isArray(datas)) {
//             baseDatas.$table = flyer.table($table, {
//                 columns: [{
//                     field: "",
//                     checkbox: true,
//                     styles: {
//                         width: 34
//                     }
//                 }, {
//                     title: '名称',
//                     field: 'packageName'
//                 }, {
//                     title: '充值积分（购买/赠送）',
//                     field: "",
//                     formatter: function (row) {
//                         return `${row.packagePurchaseScore}/${row.packagePresentScore}`;
//                     }
//                 }, {
//                     title: '金额（购买金额/赠送金额）',
//                     field: "packageMoney",
//                     formatter: function (row) {
//                         return `${row.packagePurchaseMoney}/${row.packagePresentMoney}`;
//                     }
//                 }, {
//                     title: '创建时间',
//                     field: "createdDate",
//                     styles: {
//                         width: 130
//                     },
//                     formatter: function (row, rows) {
//                         return flyer.formatDate('yyyy-mm-dd hh:MM', row.createdDate);
//                     }
//                 }, {
//                     title: '修改时间',
//                     field: "updateDate",
//                     styles: {
//                         width: 130
//                     },
//                     formatter: function (row, rows) {
//                         return row.updateDate ? flyer.formatDate('yyyy-mm-dd hh:MM', row.updateDate) : '-';
//                     }
//                 }, {
//                     title: '状态',
//                     field: 'status',
//                     styles: {
//                         width: 60
//                     },
//                     formatter: function (row) {
//                         return row.status === 1 ? '启用' : '停用';
//                     }
//                 }],
//                 data: datas,
//             });
//         } else {
//             layer.msg(baseDatas.paramErrMsg);
//         }
//     }

//     /**
//      * 初始化分页信息
//      * 
//      * @param {jq} $table 表格初始化之后的实例对象 
//      * @param {Array} datas 表格的数据
//      */
//     function randerDOMPager($table, datas, total, pagerObj) {
//         // 没有数据的时候
//         core.tableNoMatch($table, '暂时没有充值套餐');
//         // 初始化下拉框，显示每页数据条数的下拉框
//         baseDatas.pageSizeSelectObj = core.initPagerSizeSelect($('#packagePagerSize'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
//             callback: getTableDatas,
//             pagerObj: baseDatas.pagerObj,
//             total: datas.total,
//             exports: exports
//         });
//         // 初始化分页
//         baseDatas.pagerObj = core.initPager($('.paper-container'), total, pagerObj.pageSize || 20, {
//             callback: getTableDatas,
//             pageNumber: pagerObj.pageNumber || 1,
//             pageSizeSelectObj: baseDatas.pageSizeSelectObj,
//             exports: exports
//         });
//         // 有数据的时候。才需要去初始化
//         if (datas.total) {
//             // 为表中的checkbox绑定点击事件
//             core.bindCheckboxEvent($table);
//         }
//     }

//     /**
//      * 设置spanner
//      * 
//      * @param {any} currentTotal 当前显示数据的总数
//      * @param {any} total 总数居
//      */
//     function setMountValue(currentTotal, total) {
//         $('#currentPackageMountSpan').text(currentTotal);
//         $('#packageMountSpan').text(total);
//     }

//     /**
//      * 获取表格数据
//      * 
//      * @param {Number} pageNumber 当前显示页数，默认为0
//      * @param {NUmber} pageSize 煤业显示的数据条数，默认为20
//      */
//     function getTableDatas(pageNumber, pageSize) {
//         var conditions = {
//             offset: pageNumber || 1,
//             limit: pageSize || 20,
//         },
//             $table = $('#packageTable');
//         $.ajax({
//             url: '/api/readPackagePage',
//             type: 'GET',
//             data: conditions,
//             beforeSend: function (jqXHR, settings) {
//                 $.addLoading();
//             },
//             success: function (data, jqXHR, textStatus) {
//                 if (data.success) {
//                     renderTable($table, data.data.rows);
//                     randerDOMPager(baseDatas.$table, data.data.rows, data.data.total, {
//                         pageNumber: pageNumber || 1,
//                         pageSize: pageSize || 20
//                     });
//                     setMountValue(data.data.rows.length, data.data.total);
//                     core.bindCheckboxEvent(baseDatas.$table);
//                 } else {
//                     layer.msg(data.message);
//                     renderTable($table, []);
//                 }
//             },
//             error: function (jqXHR, textStatus, errorThrown) {
//                 layer.msg(baseDatas.netErrMsg);
//             },
//             complete: function (jqXHR, textStatus) {
//                 $.removeLoading()
//             }
//         });
//     }

//     /**
//      * 校验充值套餐信息
//      * 
//      * @param {Object} packageInfo 充值套餐信息对象
//      */
//     function validPackageInfo(packageInfo) {
//         if (!packageInfo) {
//             return {
//                 isPass: false,
//                 msg: '参数错误'
//             }
//         }

//         if (!packageInfo.packageName) {
//             return {
//                 isPass: false,
//                 msg: '充值套餐名称不能为空'
//             }
//         }

//         if (!packageInfo.packagePurchaseMoney) {
//             return {
//                 isPass: false,
//                 msg: '充值套餐购买金额不能为空'
//             }
//         }
//         if (!packageInfo.packagePresentMoney) {
//             return {
//                 isPass: false,
//                 msg: '充值套餐赠送金额不能为空'
//             }
//         }
//         if (!packageInfo.packagePurchaseScore) {
//             return {
//                 isPass: false,
//                 msg: '充值套餐购买积分不能为空'
//             }
//         }
//         if (!packageInfo.packagePresentScore) {
//             return {
//                 isPass: false,
//                 msg: '充值套餐赠送积分不能为空'
//             }
//         }
//         return {
//             isPass: true,
//             msg: ''
//         };
//     }

//     /**
//      * 为表单复制
//      * 
//      * @param {any} packageInfo 
//      * @param {any} $form 
//      */
//     function setPackageInfo(packageInfo, $form) {
//         $form = $form || $('form[name=packageCreateForm]');
//         for (var key in packageInfo) {
//             if (packageInfo.hasOwnProperty(key)) {
//                 var element = packageInfo[key];
//                 $form.find('input[name=' + key + ']').val(element);
//             }
//         }
//     }

//     // 页面入口
//     init();
// });