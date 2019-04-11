// 礼品订单管理模块
'use strict';
layui.use(['element', 'table', 'layer', 'util', 'form', 'laydate'], function () {
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
        }
    };
    /**
     *页面入口函数 
     * 
     */
    (function init() {
        form.render('select');
        initComponent();
        // 渲染数据表格
        renderTable();
        // 初始化事件
        initEvent();
        // 获取仓库信息
        getPresentFromStockServer();
    })()

    // 初始化组件
    function initComponent() {
        // 开始日期和结束日期
        laydate.render({
            elem: '#createdDate',
            range: '~'
        });
        // 删除按钮
        core.getUserInfoById(function (user) {
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
        // 查看礼品岛帐户余额
        $('#viewLipindaoAccountMoneyBtn').on('click', viewLipindaoAccountMoneyHandle);
        // 查询
        $('#searchBtn').on('click', searchHandle);
        // 重置
        $('#resetBtn').on('click', function () {
            $('#presentOrderSearchForm')[0].reset();
            return false;
        });
        // 创建礼品订单
        $('#createPresentOrderBtn').on('click', createPresentOrderHandle);
        // 导出订单
        $('#exportPresentOrderBtn').on('click', exportPresentOrderHandle);
        // 导出待扫描订单
        $('#downloadPresentOrderBtn').on('click', downloadPresentOrderHandle);
        // 拼多多批量发货
        $('#pddBatchBtn').on('click', pddBatchHandle);
        // 取消礼品订单信息
        $('#cancelPresentOrderBtn').on('click', {
            type: 3
        }, togglePresentOrderHandle);
        // 标记为已扫描礼品订单
        $('#markScanedPresentOrderBtn').on('click', {
            type: 2
        }, togglePresentOrderHandle);
    }


    /**
     * 查看礼品岛帐户余额的点击事件处理函数
     * 
     * @param {any} events 
     */
    function viewLipindaoAccountMoneyHandle(events) {
        APIUtil.viewLipindaoAccountMoney({}, function (res) {
            if (res.code === 1) {
                layer.msg('账户可用余额：¥' + res.data.usermoney + '元');
            } else {
                layer.msg(baseDatas.netErrMsg);
            }
        });
        return false;
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
            page: {
                curr: 1,
                limit: 10
            }
        }));
        return false;
    }

    /**
     * 创建礼品订单的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createPresentOrderHandle(events) {
        $(".flyer-layout-tree .flyer-layout-link[data-hash=present_purchase]").click();
        return false;
    }

    /**
     * 导出礼品订单的点击事件处理函数
     * 
     * @param {any} events 
     */
    function exportPresentOrderHandle() {
        var aLink = document.createElement('a');
        aLink.href = '/api/exportPresentOrderToExcel?limit=1000&offset=1&status=1';
        aLink.click();
        return false;
    }

    /**
     * 管理员导出订单
     *
     * @param {*} e
     */
    function downloadPresentOrderHandle(e) {
        var aLink = document.createElement('a');
        var queryParams = getQueryParams();
        if (!queryParams.stockFromId) {
            layer.msg('请选择发货仓库');
            return false;
        }
        aLink.href = '/api/downloadPresentOrderToExcel?limit=1000&offset=1&' + core.objectToString(queryParams);
        aLink.click();
        setTimeout(function () {
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
        aLink.href = '/api/pddBatch?limit=1000&offset=1&plant=PDD&status=1';
        aLink.click();
        return false;
    }

    /**
     * 切换礼品订单状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function togglePresentOrderHandle(events) {
        var selectDatas = table.checkStatus('presentOrderTable').data;
        var type = events.data.type;
        var tipMsg = type === 2 ? '确定标记为已扫描状态吗？' : '确定标记为取消状态吗？';
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
            }, function (index, layero) {
                $.ajax({
                    url: '/api/togglePresentOrder',
                    type: 'POST',
                    data: {
                        id: selectDatas.map(function (item) {
                            return item.id
                        }),
                        status: type,
                        count: selectDatas[0].total,
                        number: selectDatas[0].orderNumber,
                        userId: selectDatas[0].userId,
                        userName: selectDatas[0].userName
                    },
                    success: function (data, textStatus, jqXHR) {
                        layer.msg(data.success ? '操作成功！' : '操作失败：' + data.message);
                        reloadTable();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
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
        var $form = $('#presentOrderSearchForm');
        var formDatas = $form.serializeArray();
        var ret = {};
        $.each(formDatas, function (index, item) {
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
            elem: '#presentOrderTable',
            url: '/api/readPresentOrderPage',
            page: true,
            where: {

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
                        templet: function (d) {
                            return d.LAY_INDEX;
                        }
                    },
                    {
                        field: 'userName',
                        title: '下单用户',
                        width: 150
                    },
                    {
                        field: 'orderNumber',
                        title: '订单号',
                        width: 220
                    },
                    {
                        field: 'kdNumber',
                        title: '快递单号',
                        width: 220,
                        templet: function (d) {
                            return d.kdNumber === '000000' ? `系统会自动更新 <a class="layui-btn layui-btn-normal layui-btn-xs js-update-kd-number" data-id="${d.id}"  data-taskid="${d.taskid}">手动获取</a>` : d.kdNumber;
                        }
                    },
                    {
                        field: 'fromStockId',
                        title: '快递仓库/发货地址',
                        width: 300,
                        templet: function (d) {
                            return d.name + '/' + d.address;
                        }
                    },
                    {
                        field: 'addressFromName',
                        title: '发件人信息',
                        width: 200,
                        templet: function (d) {
                            return d.addressFromName + '(' + d.addressFromPhone + ')';
                        }
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
                        templet: function (d) {
                            return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
                        }
                    },
                    {
                        field: 'status',
                        title: '状态',
                        width: 200,
                        fixed: 'right',
                        align: 'center',
                        templet: function (d) {
                            var statusText = ['', '待扫描', '已扫描', '已取消']; // 1:待扫描 2，已扫描 3，已取消
                            return `<span class="layui-text-${(d.status == 1)? 'green' : 'pink'}">${statusText[d.status]}</span>`;
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
                    var from = $(this).data('kb-from');
                    var to = $(this).data('kb-to');
                    var id = $(this).data('id');
                    layer.open({
                        content: `<form class="layui-form" name="presentOrderUpdateForm" lay-filter="presentOrderUpdateForm">
                                    <div class="layui-form-item">
                                        <label class="layui-form-label">收货地址</label>
                                        <div class="layui-input-block">
                                            <input class="layui-input" name="addressTo" value="${to}" placeholder="" />
                                        </div>
                                    </div>
                                </form>`,
                        area: ['600px', '300px'],
                        title: '礼品订单信息修改',
                        btn: ['保存', '取消'],
                        yes: function (index) {
                            var presentOrderInfo = core.getFormValues($('form[name=presentOrderUpdateForm]'));
                            var validPresentOrderInfoResult = validPresentOrderInfo(presentOrderInfo);
                            if (validPresentOrderInfoResult.isPass) {
                                presentOrderInfo.id = id;
                                presentOrderInfo.addressToPca = (function () {
                                    var add = presentOrderInfo.addressTo.split(/,|，/)[2];
                                    var detail = add.split(' ');
                                    return detail[0] + '-' + detail[1] + '-' + detail[2];;
                                })();
                                $.ajax({
                                    url: '/api/updatePresentOrder',
                                    type: 'POST',
                                    data: presentOrderInfo,
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
                                layer.msg(validPresentOrderInfoResult.msg);
                            }
                        }
                    });
                    return false;
                });
                // 获取快递单号
                $('.js-update-kd-number').off('click').on('click', function (event) {
                    var id = $(this).data('id');
                    var taskid = $(this).data('taskid');
                    var content = '';
                    APIUtil.getPresentKdNumber({
                        taskid
                    }, function (res) {
                        if (res.code === 0) {
                            content = res.msg;
                            layer.tips(content, event.target, {
                                tips: 1
                            });
                        } else {
                            $.ajax({
                                url: '/api/setPresentKdNumber',
                                data: {
                                    id: id,
                                    taskid: res.data.taskid,
                                    kdNumber: res.data.express_no
                                },
                                type: 'post',
                                success: function (res) {
                                    if (res.success) {
                                        reloadTable();
                                    } else {
                                        layer.msg(baseDatas.netErrMsg);
                                    }
                                },
                                error: function (e) {
                                    layer.msg(baseDatas.netErrMsg);
                                }
                            });
                        }
                    });
                });
            }
        });
    }

    /**
     * 重载表格
     * 
     */
    function reloadTable(where) {
        table.reload('presentOrderTable', {
            where: where
        });
    }

    /**
     *获取发货仓库
     *
     */
    function getPresentFromStockServer(id) {
        APIUtil.readFromStock({}, function (res) {
            if (res.code === 1) {
                renderPresentStock(res.data.storelist);
            } else {
                layer.msg(baseDatas.netErrMsg);
            }
        });
    }

    /**
     *渲染快递列表
     *
     * @param {*} presentStock
     */
    function renderPresentStock(presentStock, selectedId) {
        var $container = $('select[name=stockFromId]');
        $container.empty();
        $container.append(`<option value="">请选择发货仓库</option>`);
        $.each(presentStock, function (index, item) {
            $container.append(`<option value="${item.id}" ${selectedId==item.id?'selected':''}>${item.store_name}</option>`);
        });
        form.render('select');
    }

    /**
     * 校验礼品订单信息
     * 
     * @param {Object} presentOrderInfo 收货地址信息对象
     */
    function validPresentOrderInfo(presentOrderInfo) {
        if (!presentOrderInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }
        if (!presentOrderInfo.addressTo) {
            return {
                isPass: false,
                msg: '请输入收货地址'
            }
        }
        return {
            isPass: true,
            msg: ''
        };
    }
});