// 任务管理模块
'use strict';
layui.use(['element', 'table', 'layer', 'util'], function () {
    var element = layui.element;
    var table = layui.table;
    var layer = layui.layer;
    var util = layui.util;
    var baseDatas = {
        // 错误消息
        netErrMsg: '系统已退出登录，请登录系统重试',
        operatorErrMsg: {
            single: '请选择一条数据操作',
            batch: '请至少选择一条数据操作'
        },
        // 任务平台
        taskPlants: ['', 'TB', 'JD', 'PDD'],
        // 当前页签的索引
        tabIndex: 0
    };
    /**
     *页面入口函数 
     * 
     */
    (function init() {
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
        element.on('tab(manageTask)', function (data) {
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
        $('#resetBtn').on('click', function () {
            $('#taskSearchForm')[0].reset();
            return false;
        });
        // 创建任务
        $('#createTaskBtn').on('click', createTaskHandle);
        // 取消任务信息
        $('#cancelTaskBtn').on('click', updateTaskHandle);
        // 禁用任务
        $('#disabledTaskBtn').on('click', {
            type: 0
        }, toggleTaskHandle);
        // 启用任务
        $('#enabledTaskBtn').on('click', {
            type: 1
        }, toggleTaskHandle);
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
            layer.confirm('确定取消任务吗？取消之后积分将不退回账户中', {
                title: "询问框",
                btn: ['确定', '取消']
            }, function (index, layero) {
                APIUtil.cancelTask(selectDatas[0].taskOrderNumber, function (res) {
                    if (res.data.status === '1') {
                        layer.msg('操作成功!');
                        $.ajax({
                            url: '/api/toggleTask',
                            type: 'POST',
                            data: {
                                id: selectDatas[0].id,
                                status: 0
                            },
                            success: function (data, textStatus, jqXHR) {
                                getTableDatas(1, 20);
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
     * 切换任务状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleTaskHandle(events) {
        var selectDatas = table.checkStatus('taskTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定暂停吗？' : '确定恢复吗？';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                title: '询问框',
                btn: ['确定', '取消']
            }, function (index, layero) {
                APIUtil.pauseAndResumeTask(selectDatas[0].taskOrderNumber, type, function (res) {
                    if (res.data.status === '1') {
                        layer.msg('操作成功！');
                        getTableDatas(1, 20);
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
     * 设置spanner
     * 
     * @param {any} currentTotal 当前显示数据的总数
     * @param {any} total 总数居
     */
    function setMountValue(currentTotal, total) {
        $('#currentTaskMountSpan').text(currentTotal);
        $('#taskMountSpan').text(total);
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
            elem: '#taskTable',
            url: '/api/readTaskPage',
            page: true,
            cols: [[
                {
                    checkbox: true,
                    fixed: 'left'
                },
                {
                    field: 'taskOrderNumber',
                    title: '订单号',
                    width: 220
                },
                {
                    field: 'taskQuantity',
                    title: '数量和关键词',
                    width: 150, templet: function (d) {
                        return '（' + d.taskQuantity + '）' + d.taskKeyword;
                    }
                },
                {
                    field: 'plant',
                    title: '任务类型',
                    width: 150,
                    templet: function (d) {
                        var type = core.getTypeCodeByValue(d.taskChildType);
                        var taskPlant = type.plant === 'TB' ? '淘宝' : type.plant === 'JD' ? '京东' : '拼多多';
                        return taskPlant + '（' + type.name + '）';
                    }
                },
                {
                    field: 'taskName',
                    title: '任务名称',
                    width: 150
                },
                {
                    field: 'taskStartDate',
                    title: '开始日期',
                    width: 120,
                    templet: function (d) {
                        return util.toDateString(d.createdDate, 'yyyy-MM-dd');
                    }
                },
                {
                    field: 'taskBabyLinkToken',
                    title: '宝贝链接',
                    width: 200,
                    templet: function (d) {
                        return `<a href="${d.taskBabyLinkToken}" style="color:#2cc3a9" target="_blank">${d.taskBabyLinkToken}</a>`;
                    }
                },
                {
                    field: 'taskSumMoney',
                    title: '总消费',
                    width: 80
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
                    width: 70,
                    fixed: 'right',
                    align: 'center',
                    templet: function (d) {
                        return '<a class="layui-btn layui-btn-normal layui-btn-xs js-view-status" style="background-color: #2cc3a9;"  data-id="' + d.id + '" data-task-order-number="' + d.taskOrderNumber + '">查看</a>';
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
                $('.js-view-status').off('click').on('click', function (event) {
                    var taskOrderNumber = $(this).data('task-order-number');
                    var content = '';
                    APIUtil.listTask({
                        id: taskOrderNumber
                    }, function (res) {
                        if (res.data.status !== '1') {
                            content = res.data.tips;
                        } else if (res.data.list && res.data.list.l.length > 0) {
                            var data = res.data.list.l[0];
                            content = `任务单号：${taskOrderNumber}</br>任务状态：${data.m.replace(/\(已退款\)|\(部分退款\)/, '')}</br>任务总量：${data.c}</br>剩余量：${data.e}`;
                        } else {
                            content = '查无此订单信息，请联系客服';
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