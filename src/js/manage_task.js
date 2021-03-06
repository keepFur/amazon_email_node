// 任务管理模块
'use strict';
layui.use(['element', 'table', 'layer', 'util', 'form'], function() {
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
        // 任务平台
        taskPlants: ['TB', 'JD', 'PDD'],
        // 当前页签的索引
        tabIndex: 0,
        taskType: (location.hash.split('?')[1] && location.hash.split('?')[1].split('=')[1]) || 'TB'
    };
    /**
     *页面入口函数 
     * 
     */
    (function init() {
        form.render('select');
        // 调转到相应的平台
        element.tabChange('manageTask', baseDatas.taskType);
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
        element.on('tab(manageTask)', function(data) {
            if (data.index !== baseDatas.tabIndex) {
                reloadTable({
                    taskPlant: baseDatas.taskPlants[data.index]
                });
                baseDatas.tabIndex = data.index;
            }
        });
        // 查询
        $('#searchBtn').on('click', searchHandle);
        // 重置
        $('#resetBtn').on('click', function() {
            $('#taskSearchForm')[0].reset();
            return false;
        });
        // 创建任务
        $('#createTaskBtn').on('click', createTaskHandle);
        // 取消任务信息
        $('#cancelTaskBtn').on('click', updateTaskHandle);
        // 暂停任务
        $('#disabledTaskBtn').on('click', {
            type: 0
        }, toggleTaskHandle);
        // 恢复任务
        $('#enabledTaskBtn').on('click', {
            type: 1
        }, toggleTaskHandle);
        // 标记为已完成
        $('#completeTaskBtn').on('click', completeTaskHandle);
        //  同步任务
        $('#asyncTaskBtn').on('click', asyncTaskHandle);
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
     * 创建任务的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createTaskHandle(events) {
        $(".flyer-layout-tree .flyer-layout-link[data-hash=task_create]").click();
        return false;
    }

    /**
     * 任务信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updateTaskHandle(events) {
        var selectDatas = table.checkStatus('taskTable').data;
        if (selectDatas.length === 1) {
            layer.confirm('确定取消任务吗？状态会稍微有点延时，谢谢谅解！！取消之后金额将会退回账户中，请注意查看！！', {
                title: "询问框",
                btn: ['确定', '取消']
            }, function(index, layero) {
                // 先判断任务是否进行到一半了，如果是的话，不能取消，否则的话，将剩余量的金额退款即可
                APIUtil.listTask({
                    id: selectDatas[0].taskOrderNumber
                }, function(res) {
                    if (res.data.status !== '1') {
                        layer.msg(res.data.tips);
                    } else if (res.data.list && res.data.list.l.length > 0) {
                        var total = res.data.list.l[0].c | 0;
                        var remain = res.data.list.l[0].e | 0;
                        // 不是处理中的
                        if (res.data.list.l[0].s == 0) {
                            // 处理到一半了
                            if (remain < total / 2) {
                                layer.msg('该订单已经完成一半了（坚持就是胜利），不能再取消了哦');
                            } else {
                                // 取消
                                APIUtil.cancelTask(selectDatas[0].taskOrderNumber, function(res) {
                                    if (res.data.status === '1') {
                                        layer.msg('操作成功!');
                                        $.ajax({
                                            url: '/api/toggleTask',
                                            type: 'POST',
                                            data: {
                                                id: selectDatas[0].id,
                                                status: 3,
                                                count: selectDatas[0].taskUnitPrice * remain,
                                                taskOrderNumber: selectDatas[0].taskOrderNumber,
                                                taskUserId: selectDatas[0].taskUserId
                                            },
                                            success: function(data, textStatus, jqXHR) {
                                                reloadTable();
                                            },
                                            error: function(jqXHR, textStatus, errorThrown) {
                                                layer.msg(baseDatas.netErrMsg);
                                            }
                                        });
                                    } else {
                                        layer.msg(res.data.tips);
                                    }
                                });
                            }
                        } else {
                            layer.msg('该订单不是处理中的，不支持取消');
                        }
                    } else {
                        layer.msg('查无此订单信息');
                    }
                });
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 切换任务状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleTaskHandle(events) {
        var selectDatas = table.checkStatus('taskTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定暂停吗？状态会稍微有点延时，谢谢谅解！！' : '确定恢复吗？状态会稍微有点延时，谢谢谅解！！';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                title: '询问框',
                btn: ['确定', '取消']
            }, function(index, layero) {
                APIUtil.pauseAndResumeTask(selectDatas[0].taskOrderNumber, type, function(res) {
                    if (res.data.status === '1') {
                        layer.msg('操作成功！');
                        $.ajax({
                            url: '/api/toggleTask',
                            type: 'POST',
                            data: {
                                id: selectDatas[0].id,
                                status: type ? 1 : 2
                            },
                            success: function(data, textStatus, jqXHR) {
                                reloadTable();
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
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
    function completeTaskHandle(e) {
        var selectDatas = table.checkStatus('taskTable').data;
        var tipMsg = '确定将任务标记为已完成吗？此操作不会影响任务的处理，只是为了方便管理！！';
        if (selectDatas.length !== 1) {
            layer.msg(baseDatas.operatorErrMsg.single);
            return;
        }
        if (selectDatas[0].status === 1) {
            layer.confirm(tipMsg, {
                title: '询问框',
                btn: ['确定', '取消']
            }, function(index, layero) {
                $.ajax({
                    url: '/api/toggleTask',
                    type: 'POST',
                    data: {
                        id: selectDatas[0].id,
                        status: 4
                    },
                    success: function(data, textStatus, jqXHR) {
                        if (data.success) {
                            layer.msg('操作成功');
                            reloadTable();
                        } else {
                            layer.msg('操作失败:' + data.message);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        layer.msg(baseDatas.netErrMsg);
                    }
                });
            });
        } else {
            layer.msg('只可以标记处理中的任务');
        }
        return false;
    }


    /**
     *同步任务
     *
     * @param {*} e
     */
    function asyncTaskHandle(e) {
        // 1，查找出所有的处理中任务
        $.get('/api/readAllProcessTask', function(res) {
            if (res.data.rows.length) {
                layer.confirm(`当前共有 ${res.data.rows.length} 条处理中的任务,确定更新吗？<br>此操作不会产生任何不良影响，请放心操作！`, {
                    title: '询问框',
                    btn: ['确定', '取消']
                }, function(index, layero) {
                    // 2，通过列流的api查询出以上任务中已完成的任务
                    APIUtil.listTask({
                        id: res.data.rows.map(function(item) { return item.taskOrderNumber }).join(',')
                    }, function(res) {
                        if (res.data.status !== '1') {
                            layer.msg(res.data.tips);
                        } else if (res.data.list && res.data.list.l.length > 0) {
                            var ids = res.data.list.l.filter(function(item) {
                                return item.s == 1;
                            }).map(function(t) {
                                return t.i;
                            });
                            var failIds = res.data.list.l.filter(function(item) {
                                return item.s == 8 || item.s == 9 || item.s == 10;
                            }).map(function(t) {
                                return t.i;
                            });
                            if (ids.length) {
                                // 3，将已完成的任务标记为已完成状态
                                $.ajax({
                                    url: '/api/maskCompleteTask',
                                    type: 'POST',
                                    data: {
                                        id: ids.join(','),
                                        status: 4
                                    },
                                    success: function(data, textStatus, jqXHR) {
                                        if (data.success) {
                                            layer.msg('操作成功,共同步（' + (ids.length) + '）条任务');
                                            reloadTable();
                                        } else {
                                            layer.msg('操作失败:' + data.message);
                                        }
                                    },
                                    error: function(jqXHR, textStatus, errorThrown) {
                                        layer.msg(baseDatas.netErrMsg);
                                    }
                                });
                            } else {
                                layer.msg('所有任务都已更新到最新状态');
                            }
                            // 标记为取消
                            if (failIds.length) {
                                $.ajax({
                                    url: '/api/maskCompleteTask',
                                    type: 'POST',
                                    data: {
                                        id: failIds.join(','),
                                        status: 3
                                    },
                                    success: function(data, textStatus, jqXHR) {
                                        if (data.success) {
                                            layer.msg('操作成功,共同步（' + (failIds.length) + '）条任务');
                                            reloadTable();
                                        } else {
                                            layer.msg('操作失败:' + data.message);
                                        }
                                    },
                                    error: function(jqXHR, textStatus, errorThrown) {
                                        layer.msg(baseDatas.netErrMsg);
                                    }
                                });
                            } else {
                                layer.msg('所有任务都已更新到最新状态');
                            }
                        } else {
                            layer.msg('查无此订单信息');
                        }
                    });
                });
            } else {
                layer.msg('暂时没有处理中的任务');
            }
        });
        return false;
    }

    /**
     *获取表格的查询参数
     *
     * @returns 返回所有参数的对象
     */
    function getQueryParams() {
        var $form = $('#taskSearchForm');
        var formDatas = $form.serializeArray();
        var ret = {};
        $.each(formDatas, function(index, item) {
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
            elem: '#taskTable',
            url: '/api/readTaskPage',
            page: true,
            where: {
                taskPlant: baseDatas.taskType
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
                        field: 'taskOrderNumber',
                        title: '订单号',
                        width: 220
                    },
                    {
                        field: 'taskUserName',
                        title: '下单用户',
                        width: 150
                    },
                    {
                        field: 'taskQuantity',
                        title: '关键词/数量',
                        width: 200,
                        templet: function(d) {
                            return '（' + (d.taskKeyword || '-') + '）' + d.taskQuantity + '个 ';
                        }
                    },
                    {
                        field: 'taskSumMoney',
                        title: '消费金额',
                        width: 100,
                        templet: function(d) {
                            return core.fenToYuan(d.taskSumMoney) + ' 元';
                        }
                    },
                    {
                        field: 'plant',
                        title: '平台/任务类型',
                        width: 250,
                        templet: function(d) {
                            return core.getPlantByCode(d.taskPlant) + '（' + d.taskTypeName + '）';
                        }
                    },
                    {
                        field: 'taskName',
                        title: '任务名称',
                        width: 200
                    },
                    {
                        field: 'taskBabyLinkToken',
                        title: '宝贝链接',
                        width: 250,
                        templet: function(d) {
                            return `<a href="${d.taskBabyLinkToken}" style="color:#2cc3a9" target="_blank">${d.taskBabyLinkToken}</a>`;
                        }
                    },
                    {
                        field: 'taskStartDate',
                        title: '任务开始日期',
                        width: 120,
                        templet: function(d) {
                            return util.toDateString(d.createdDate, 'yyyy-MM-dd');
                        }
                    },
                    {
                        field: 'createdDate',
                        title: '订单创建时间',
                        width: 200,
                        templet: function(d) {
                            return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
                        }
                    },
                    {
                        field: 'status',
                        title: '处理状态',
                        width: 150,
                        fixed: 'right',
                        align: 'center',
                        templet: function(d) {
                            var statusText = ['', '处理中', '已暂停', '已取消', '已完成']; // 1:处理中 2，已暂停 3，已取消,4已完成
                            return `<span class="layui-text-${d.status == 1 ? 'green' : 'pink'}">${statusText[d.status]}</span> <a class="layui-btn layui-btn-normal layui-btn-xs js-view-status" data-id=" ${d.id}" data-task-order-number="${d.taskOrderNumber}">查看详情</a>`;
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
            parseData: function(res) {
                return {
                    code: res.success,
                    msg: res.msg,
                    count: res.data.total,
                    data: res.data.rows
                }
            },
            done: function(res) {
                $('.js-view-status').off('click').on('click', function(event) {
                    var taskOrderNumber = $(this).data('task-order-number');
                    var content = '';
                    APIUtil.listTask({
                        id: taskOrderNumber
                    }, function(res) {
                        if (res.data.status !== '1') {
                            content = res.data.tips;
                        } else if (res.data.list && res.data.list.l.length > 0) {
                            var data = res.data.list.l[0];
                            content = `任务单号：${taskOrderNumber}</br>任务状态：${data.m.replace(/\(已退款\)|\(部分退款\)/, '')}</br>任务总量：${data.c}</br>剩余量：${data.e}</br></br>PS：此处的状态会有稍微的延时，敬请谅解！！`;
                        } else {
                            content = '查无此订单信息，如有疑问，请联系客服人员解决！';
                        }
                        layer.tips(content, event.target, {
                            tips: 1
                        });
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
        table.reload('taskTable', {
            where: where
        });
    }
});