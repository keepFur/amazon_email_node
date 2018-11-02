// 空包订单管理模块
'use strict';
layui.use(['element', 'table', 'layer', 'util', 'form'], function () {
    var element = layui.element;
    var table = layui.table;
    var layer = layui.layer;
    var util = layui.util;
    var form = layui.form;
    var baseDatas = {
        // 错误消息
        netErrMsg: '系统已退出登录，请登录系统重试',
        operatorErrMsg: {
            single: '请选择一条数据操作',
            batch: '请至少选择一条数据操作'
        },
        // 空包订单平台
        plants: ['', 'TB', 'JD', 'PDD'],
        // 当前页签的索引
        tabIndex: 0
    };
    /**
     *页面入口函数 
     * 
     */
    (function init() {
        form.render('select');
        // 渲染数据表格
        renderTable();
        // 初始化事件
        initEvent();
    })()

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
        reloadTable($.extend(queryParams, {
            taskPlant: baseDatas.taskPlants[baseDatas.tabIndex],
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
        layer.msg('123');
        return false;
    }

    /**
     * 空包订单信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updateKbOrderHandle(events) {
        var selectDatas = table.checkStatus('taskTable').data;
        if (selectDatas.length === 1) {
            layer.confirm('确定取消空包订单吗？状态会稍微有点延时，谢谢谅解！！取消之后积分将不退回账户中，请谨慎操作！！', {
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
     *标记为已完成按钮的点击事件处理函数
     *
     * @param {*} e
     */
    function completeKbOrderHandle(e) {
        var selectDatas = table.checkStatus('taskTable').data;
        var tipMsg = '确定将空包订单标记为已完成吗？此操作不会影响空包订单的处理，只是为了方便管理！！';
        if (selectDatas.length !== 1) {
            layer.msg(baseDatas.operatorErrMsg.single);
            return;
        }
        if (selectDatas[0].status === 1) {
            layer.confirm(tipMsg, {
                title: '询问框',
                btn: ['确定', '取消']
            }, function (index, layero) {
                $.ajax({
                    url: '/api/toggleKbOrder',
                    type: 'POST',
                    data: {
                        id: selectDatas[0].id,
                        status: 4
                    },
                    success: function (data, textStatus, jqXHR) {
                        if (data.success) {
                            layer.msg('操作成功');
                            reloadTable();
                        } else {
                            layer.msg('操作失败:' + data.message);
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        layer.msg(baseDatas.netErrMsg);
                    }
                });
            });
        } else {
            layer.msg('只可以标记处理中的空包订单');
        }
        return false;
    }


    /**
     *同步空包订单
     *
     * @param {*} e
     */
    function asyncKbOrderHandle(e) {
        // 1，查找出所有的处理中空包订单
        $.get('/api/readAllProcessKbOrder', function (res) {
            if (res.data.rows.length) {
                layer.confirm(`当前共有 ${res.data.rows.length} 条处理中的空包订单,确定更新吗？<br>此操作不会产生任何不良影响，请放心操作！`, {
                    title: '询问框',
                    btn: ['确定', '取消']
                }, function (index, layero) {
                    // 2，通过列流的api查询出以上空包订单中已完成的空包订单
                    APIUtil.listKbOrder({
                        id: res.data.rows.map(function (item) { return item.taskOrderNumber }).join(',')
                    }, function (res) {
                        if (res.data.status !== '1') {
                            layer.msg(res.data.tips);
                        } else if (res.data.list && res.data.list.l.length > 0) {
                            var ids = res.data.list.l.filter(function (item) {
                                return item.s == 1;
                            }).map(function (t) {
                                return t.i;
                            });
                            if (ids.length) {
                                // 3，将已完成的空包订单标记为已完成状态
                                $.ajax({
                                    url: '/api/maskCompleteKbOrder',
                                    type: 'POST',
                                    data: {
                                        id: ids.join(','),
                                        status: 4
                                    },
                                    success: function (data, textStatus, jqXHR) {
                                        if (data.success) {
                                            layer.msg('操作成功,共同步（' + ids.length + '）条空包订单');
                                            reloadTable();
                                        } else {
                                            layer.msg('操作失败:' + data.message);
                                        }
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        layer.msg(baseDatas.netErrMsg);
                                    }
                                });
                            } else {
                                layer.msg('所有空包订单都已更新到最新状态');
                            }
                        } else {
                            layer.msg('查无此订单信息');
                        }
                    });
                });
            } else {
                layer.msg('暂时没有处理中的空包订单');
            }
        });
        return false;
    }

    /**
     * 设置spanner
     * 
     * @param {any} currentTotal 当前显示数据的总数
     * @param {any} total 总数居
     */
    function setMountValue(currentTotal, total) {
        $('#currentKbOrderMountSpan').text(currentTotal);
        $('#kbOrderMountSpan').text(total);
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
            cols: [[
                {
                    checkbox: true,
                    fixed: 'left'
                },
                {
                    field: 'number',
                    title: '订单号',
                    width: 220
                },
                {
                    field: 'kbNumner',
                    title: '快递单号',
                    width: 150, templet: function (d) {
                        return '（' + d.taskQuantity + '）' + d.taskKeyword;
                    }
                },
                {
                    field: 'kbCompany',
                    title: '快递公司/平台',
                    width: 150
                },
                {
                    field: 'totak',
                    title: '金额',
                    width: 150
                },
                {
                    field: 'addressFrom',
                    title: '发件人信息',
                    width: 200,
                },
                {
                    field: 'addressTo',
                    title: '收件人信息',
                    width: 200
                },
                {
                    field: 'remark',
                    title: '备注',
                    width: 100
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
    function reloadTable(where) {
        table.reload('kbOrderTable', {
            where: where
        });
    }
});