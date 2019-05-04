// 空包订单管理模块
'use strict';
layui.use(['element', 'table', 'layer', 'util', 'form', 'laydate'], function() {
            var element = layui.element;
            var table = layui.table;
            var layer = layui.layer;
            var util = layui.util;
            var form = layui.form;
            var laydate = layui.laydate;
            var baseDatas = {
                // 错误消息
                netErrMsg: '系统已退出登录，请登录系统重试',
                operatorErrMsg: {
                    single: '请选择一条数据操作',
                    batch: '请至少选择一条数据操作'
                },
                // 空包订单平台
                plants: ['TB', 'JD', 'PDD', 'PDDDZ'],
                // 当前页签的索引
                tabIndex: 0,
                kbType: (location.hash.split('?')[1] && location.hash.split('?')[1].split('=')[1]) || 'TB'
            };
            /**
             *页面入口函数 
             * 
             */
            (function init() {
                element.tabChange('manageKbOrder', baseDatas.kbType);
                getKbTypeServer(baseDatas.kbType);
                form.render('select');
                initComponent();
                // 渲染数据表格
                renderTable();
                // 初始化事件
                initEvent();
            })()

            // 初始化组件
            function initComponent() {
                // 开始日期和结束日期
                laydate.render({
                    elem: '#createdDate',
                    range: '~'
                });
                // 删除按钮
                core.getUserInfoById(function(user) {
                    if (!user.data.rows[0].isSuper) {
                        $('.js-super').remove();
                    }
                });
            }

            /**
             * 初始化DOM元素事件
             * 
             */
            function initEvent() {
                // 页签点击事件
                element.on('tab(manageKbOrder)', function(data) {
                    if (data.index !== baseDatas.tabIndex) {
                        reloadTable({
                            plant: baseDatas.plants[data.index]
                        });
                        baseDatas.tabIndex = data.index;
                        // 拼多多批量发货
                        $('#pddBatchBtn').toggleClass('layui-hide', data.index !== 2);
                        // 快递平台
                        getKbTypeServer(baseDatas.plants[data.index]);
                    }
                });
                // 查询
                $('#searchBtn').on('click', searchHandle);
                // 重置
                $('#resetBtn').on('click', function() {
                    $('#kbOrderSearchForm')[0].reset();
                    return false;
                });
                // 创建空包订单
                $('#createKbOrderBtn').on('click', createKbOrderHandle);
                // 导出订单
                $('#exportKbOrderBtn').on('click', exportKbOrderHandle);
                // 导出待扫描订单
                $('#downloadKbOrderBtn').on('click', downloadKbOrderHandle);
                // 拼多多批量发货
                $('#pddBatchBtn').on('click', pddBatchHandle);
                // 取消空包订单信息
                $('#cancelKbOrderBtn').on('click', {
                    type: 3
                }, toggleKbOrderHandle);
                // 标记为已扫描空包订单
                $('#markScanedKbOrderBtn').on('click', {
                    type: 2
                }, toggleKbOrderHandle);
                // 标记为已扫描空包订单
                $('#markUnScanedKbOrderBtn').on('click', {
                    type: 1
                }, toggleKbOrderHandle);
            }

            /**
             * 查询的点击事件处理函数
             * 
             * @param {any} events 
             */
            function searchHandle(events) {
                var queryParams = getQueryParams();
                queryParams.createdDateStart = queryParams.createdDate.split('~')[0];
                queryParams.createdDateEnd = queryParams.createdDate.split('~')[1];
                reloadTable($.extend(queryParams, {
                    plant: baseDatas.plants[baseDatas.tabIndex],
                    page: {
                        curr: 1,
                        limit: 10
                    }
                }));
                return false;
            }

            /**
             * 创建空包订单的点击事件处理函数
             * 
             * @param {any} events 
             */
            function createKbOrderHandle(events) {
                $(".flyer-layout-tree .flyer-layout-link[data-hash=kb_purchase]").click();
                return false;
            }

            /**
             * 导出空包订单的点击事件处理函数
             * 
             * @param {any} events 
             */
            function exportKbOrderHandle() {
                var aLink = document.createElement('a');
                aLink.href = '/api/exportKbOrderToExcel?limit=1000&offset=1&status=1&plant=' + baseDatas.plants[baseDatas.tabIndex];
                aLink.click();
                return false;
            }

            /**
             * 管理员导出订单
             *
             * @param {*} e
             */
            function downloadKbOrderHandle(e) {
                var aLink = document.createElement('a');
                var queryParams = getQueryParams();
                queryParams.plant = baseDatas.plants[baseDatas.tabIndex];
                if (!queryParams.kbCompany) {
                    layer.msg('请选择导出的快递公司');
                    return false;
                }
                aLink.href = '/api/downloadKbOrderToExcel?limit=1000&offset=1&' + core.objectToString(queryParams);
                aLink.click();
                setTimeout(function() {
                    reloadTable();
                }, 2000);
                return false;
            }

            /**
             *拼多多批量发货
             *
             * @param {*} e
             * @returns
             */
            function pddBatchHandle(e) {
                var aLink = document.createElement('a');
                // var queryParams = getQueryParams();
                aLink.href = '/api/pddBatch?limit=1000&offset=1&plant=PDD&status=1&userName=' + $('input[name=userName]').val().trim();
                aLink.click();
                return false;
            }

            /**
             * 切换空包订单状态按钮点击事件处理函数
             * 
             * @param {any} events 
             */
            function toggleKbOrderHandle(events) {
                var selectDatas = table.checkStatus('kbOrderTable').data;
                var type = events.data.type;
                var tipMsg = type === 2 ? '确定标记为已扫描状态吗？' : type === 1 ? '确定标记为未扫描状态吗？' : '确定标记为取消状态吗？';
                if (type === 3 && selectDatas.length !== 1) {
                    layer.msg(baseDatas.operatorErrMsg.single);
                    return false;
                }
                if (type === 3 && selectDatas[0].status === 2) {
                    layer.msg('已扫描的订单不能取消！！！');
                    return false;
                }
                if (type === 3 && selectDatas[0].status === 3) {
                    layer.msg('该订单已经是取消状态了！！！');
                    return false;
                }
                if (selectDatas.length > 0) {
                    layer.confirm(tipMsg, {
                        title: '询问框',
                        btn: ['确定', '取消']
                    }, function(index, layero) {
                        $.ajax({
                            url: '/api/toggleKbOrder',
                            type: 'POST',
                            data: {
                                id: selectDatas.map(function(item) {
                                    return item.id
                                }),
                                status: type,
                                count: selectDatas[0].price,
                                number: selectDatas[0].number,
                                userId: selectDatas[0].userId,
                                userName: selectDatas[0].userName
                            },
                            success: function(data, textStatus, jqXHR) {
                                layer.msg('操作成功');
                                reloadTable();
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                layer.msg(baseDatas.netErrMsg);
                            }
                        });
                    });
                } else {
                    layer.msg(baseDatas.operatorErrMsg.batch);
                }
                return false;
            }

            /**
             *获取表格的查询参数
             *
             * @returns 返回所有参数的对象
             */
            function getQueryParams() {
                var $form = $('#kbOrderSearchForm');
                var formDatas = $form.serializeArray();
                var ret = {};
                $.each(formDatas, function(index, item) {
                    ret[item.name] = item.value;
                });
                ret.createdDateStart = ret.createdDate.split('~')[0];
                ret.createdDateEnd = ret.createdDate.split('~')[1];
                return ret;
            }

            /**
             * 渲染表格
             * 
             */
            function renderTable() {
                table.render({
                            elem: '#kbOrderTable',
                            url: '/api/readKbOrderPage',
                            page: true,
                            where: {
                                plant: baseDatas.kbType
                            },
                            cols: [
                                    [{
                                            checkbox: true,
                                            fixed: 'left'
                                        },
                                        {
                                            field: '',
                                            title: '序号',
                                            fixed: 'left',
                                            templet: function(d) {
                                                return d.LAY_INDEX;
                                            }
                                        },
                                        {
                                            field: 'userName',
                                            title: '下单用户',
                                            width: 150
                                        },
                                        {
                                            field: 'number',
                                            title: '订单号',
                                            width: 220
                                        },
                                        {
                                            field: 'kbNumber',
                                            title: '快递单号',
                                            width: 220,
                                        },
                                        {
                                            field: 'kbCompany',
                                            title: '快递公司/平台',
                                            width: 150,
                                            templet: function(d) {
                                                return core.getKbTypeByCode(d.kbCompany) + '/' + core.getPlantByCode(d.plant);
                                            }
                                        },
                                        {
                                            field: 'addressFrom',
                                            title: '发件人信息',
                                            width: 300,
                                        },
                                        {
                                            field: 'addressTo',
                                            title: '收件人信息',
                                            width: 300
                                        },
                                        {
                                            field: 'remark',
                                            title: '备注',
                                            width: 150
                                        },
                                        {
                                            field: 'createdDate',
                                            title: '创建时间',
                                            width: 200,
                                            templet: function(d) {
                                                return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
                                            }
                                        },
                                        {
                                            field: 'status',
                                            title: '状态',
                                            width: 200,
                                            fixed: 'right',
                                            align: 'center',
                                            templet: function(d) {
                                                    var statusText = ['', '待扫描', '已扫描', '已取消']; // 1:待扫描 2，已扫描 3，已取消
                                                    return `<span class="layui-text-${d.status == 1 ? 'green' : 'pink'}">${statusText[d.status]}</span> ${d.status === 1 ? `<a class="layui-btn layui-btn-normal layui-btn-xs js-update-order" data-id="${d.id}" data-kb-weight="${d.kbWeight}" data-kb-from="${d.addressFrom}" data-kb-to="${d.addressTo}">修改</a>` : ``}`;
                        }
                    }
                ]
            ],
            limits: [10, 20, 50, 100],
            page: {
                theme: '#1E9FFF',
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
            done: function () {
                $('.js-update-order').off('click').on('click', function (event) {
                    var kbWeight = $(this).data('kb-weight');
                    var from = $(this).data('kb-from');
                    var to = $(this).data('kb-to');
                    var id = $(this).data('id');
                    layer.open({
                        content: `<form class="layui-form" name="kbOrderUpdateForm" lay-filter="kbOrderUpdateForm">
                                    <div class="layui-form-item">
                                        <label class="layui-form-label">发货地址</label>
                                        <div class="layui-input-block">
                                            <select name="addressFrom">
                                                <option value="">请选择发货地址</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="layui-form-item">
                                        <label class="layui-form-label">重量(千克)</label>
                                        <div class="layui-input-block">
                                            <input type="text" name="kbWeight" id="kbWeight" value="${kbWeight}" placeholder="单位：千克" class="layui-input">
                                        </div>
                                    </div>
                                    <div class="layui-form-item">
                                        <label class="layui-form-label">收货地址</label>
                                        <div class="layui-input-block">
                                            <input class="layui-input" name="addressTo" value="${to}" placeholder="" />
                                        </div>
                                    </div>
                                </form>`,
                        area: ['700px', '500px'],
                        title: '空包订单信息修改',
                        btn: ['保存', '取消'],
                        yes: function (index) {
                            var kbOrderInfo = core.getFormValues($('form[name=kbOrderUpdateForm]'));
                            var validKbOrderInfoResult = validKbOrderInfo(kbOrderInfo);
                            if (validKbOrderInfoResult.isPass) {
                                kbOrderInfo.id = id;
                                kbOrderInfo.addressFromPca = kbOrderInfo.addressFrom.split(/\s/g)[0];;
                                kbOrderInfo.addressToPca = (function () {
                                    var add = kbOrderInfo.addressTo.split(/,|，/)[2];
                                    var detail = add.split(' ');
                                    return detail[0] + '-' + detail[1] + '-' + detail[2];;
                                })();
                                $.ajax({
                                    url: '/api/updateKbOrder',
                                    type: 'POST',
                                    data: kbOrderInfo,
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
                                layer.msg(validKbOrderInfoResult.msg);
                            }
                        },
                        success: function () {
                            getAddressFromServer(function () {
                                form.val('kbOrderUpdateForm', {
                                    addressFrom: from
                                });
                            });
                        }
                    });
                    return false;
                });
            }
        });
    }

    /**
     * 重载表格
     * 
     */
    function reloadTable(where) {
        table.reload('kbOrderTable', {
            where: where
        });
    }

    /**
     *获取快递类型列表
     *
     * @param {*}  平台
     */
    function getKbTypeServer(plant) {
        $.get('/api/readKbType?status=1&plant=' + plant, function (res) {
            renderKbType(res.data.rows);
        }, 'json');
    }

    /**
     *渲染快递列表
     *
     * @param {*} kbTypes
     */
    function renderKbType(kbTypes) {
        var $container = $('select[name=kbCompany]');
        $container.empty();
        $container.append(`<option value="">请选择快递类型</option>`);
        $.each(kbTypes, function (index, item) {
            $container.append(`<option value="${item.code}" data-price="${item.price}" data-plant="${item.plant}">${item.name}</option>`);
        });
        form.render('select');
    }

    /**
     * 获取发货地址列表
     *
     */
    function getAddressFromServer(callback) {
        $.get('/api/readKbAddress?status=1', function (res) {
            renderAddressFrom(res.data.rows);
            callback && callback();
        }, 'json');
    }

    /**
     * 渲染用户发货地址列表
     *
     * @param {*} adds
     */
    function renderAddressFrom(adds) {
        var $container = $('select[name=addressFrom]');
        $container.empty();
        $container.append(` <option value="">请选择发货地址</option>`);
        $.each(adds, function (index, item) {
            $container.append(`<option value="${item.pca} ${item.detail}">${item.pca} ${item.detail} ${item.contact} ${item.phone} ${item.email}</option>`);
        });
        form.render('select');
    }

    /**
     * 校验空包订单信息
     * 
     * @param {Object} kbOrderInfo 收货地址信息对象
     */
    function validKbOrderInfo(kbOrderInfo) {
        if (!kbOrderInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }
        if (!kbOrderInfo.addressFrom) {
            return {
                isPass: false,
                msg: '请选择发货地址'
            }
        }
        if (!kbOrderInfo.addressTo) {
            return {
                isPass: false,
                msg: '请输入收货地址'
            }
        }
        if (!kbOrderInfo.kbWeight) {
            return {
                isPass: false,
                msg: '请输入包裹重量'
            }
        }
        return {
            isPass: true,
            msg: ''
        };
    }
});