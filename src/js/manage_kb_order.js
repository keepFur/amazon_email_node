// 空包订单管理模块
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
        },
        // 空包订单平台
        plants: ['TB', 'JD', 'PDD'],
        // 当前页签的索引
        tabIndex: 0
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
    })()

    // 初始化组件
    function initComponent() {
        // 开始日期和结束日期
        laydate.render({
            elem: '#createdDate',
            range: '~'
        });
    }

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 页签点击事件
        element.on('tab(manageKbOrder)', function (data) {
            if (data.index !== baseDatas.tabIndex) {
                reloadTable({
                    plant: baseDatas.plants[data.index]
                });
                baseDatas.tabIndex = data.index;
                // 拼多多批量发货
                $('#pddBatchBtn').toggleClass('layui-hide', data.index !== 3);
            }
        });
        // 查询
        $('#searchBtn').on('click', searchHandle);
        // 重置
        $('#resetBtn').on('click', function () {
            $('#kbOrderSearchForm')[0].reset();
            return false;
        });
        // 创建空包订单
        $('#createKbOrderBtn').on('click', createKbOrderHandle);
        // 导出表格
        $('#exportKbOrderBtn').on('click', exportKbOrderHandle);
        // 拼多多批量发货
        $('#pddBatchBtn').on('click', pddBatchHandle);
        // 取消空包订单信息
        $('#cancelKbOrderBtn').on('click', updateKbOrderHandle);
        // 暂停空包订单
        $('#disabledKbOrderBtn').on('click', {
            type: 0
        }, toggleKbOrderHandle);
        // 恢复空包订单
        $('#enabledKbOrderBtn').on('click', {
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
        //默认导出 csv，也可以为：xls
        // var excelCol = ['订单号', '快递类型', '快递单号', '发货地址', '收货地址', '收货人', '下单时间'];
        // $.get('/api/exportKbOrderToExcel', {
        //     limit: '1000',
        //     offset: 1
        // }, function (res) {
        //     layer.msg('导出成功');
        // }, 'json');
        var aLink = document.createElement('a');
        aLink.href = '/api/exportKbOrderToExcel?limit=1000&offset=1';
        aLink.click();
        return false;
    }

    /**
     *拼多多批量发货
     *
     * @param {*} e
     * @returns
     */
    function pddBatchHandle(e) {
        layer.msg('pdd');
        return false;
    }

    /**
     * 空包订单信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updateKbOrderHandle(events) {
        var selectDatas = table.checkStatus('taskTable').data;
        if (selectDatas.length === 1) {
            layer.confirm('确定取消空包订单吗？状态会稍微有点延时，谢谢谅解！！取消之后将金额退回账户中，请谨慎操作！！', {
                title: "询问框",
                btn: ['确定', '取消']
            }, function (index, layero) {
                APIUtil.cancelKbOrder(selectDatas[0].taskOrderNumber, function (res) {
                    if (res.data.status === '1') {
                        layer.msg('操作成功!');
                        $.ajax({
                            url: '/api/toggleKbOrder',
                            type: 'POST',
                            data: {
                                id: selectDatas[0].id,
                                status: 3
                            },
                            success: function (data, textStatus, jqXHR) {
                                reloadTable();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                layer.msg(baseDatas.netErrMsg);
                            }
                        });
                    } else {
                        layer.msg(res.data.tips);
                    }
                });
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 切换空包订单状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleKbOrderHandle(events) {
        var selectDatas = table.checkStatus('taskTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定暂停吗？状态会稍微有点延时，谢谢谅解！！' : '确定恢复吗？状态会稍微有点延时，谢谢谅解！！';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                title: '询问框',
                btn: ['确定', '取消']
            }, function (index, layero) {
                APIUtil.pauseAndResumeKbOrder(selectDatas[0].taskOrderNumber, type, function (res) {
                    if (res.data.status === '1') {
                        layer.msg('操作成功！');
                        $.ajax({
                            url: '/api/toggleKbOrder',
                            type: 'POST',
                            data: {
                                id: selectDatas[0].id,
                                status: type ? 1 : 2
                            },
                            success: function (data, textStatus, jqXHR) {
                                reloadTable();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                layer.msg(baseDatas.netErrMsg);
                            }
                        });
                    } else {
                        layer.msg('操作失败：' + res.data.tips);
                    }
                });
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
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
        $.each(formDatas, function (index, item) {
            ret[item.name] = item.value;
        });
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
                taskPlant: 'TB'
            },
            toolbar: 'default',
            cols: [[
                {
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
                    templet: function (d) {
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
                    templet: function (d) {
                        return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
                    }
                },
                {
                    field: 'status',
                    title: '状态',
                    width: 150,
                    fixed: 'right',
                    align: 'center',
                    templet: function (d) {
                        var statusText = ['', '处理中', '已暂停', '已取消', '已完成']; // 1:处理中 2，已暂停 3，已取消,4已完成
                        return `<span class="layui-text-${d.status == 1 ? 'green' : 'pink'}">${statusText[d.status]}</span>`;
                    }
                }
            ]],
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
});