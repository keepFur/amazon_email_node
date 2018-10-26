// 任务管理模块
'use strict';
flyer.define('task_manage', function (exports, module) {
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
        // 任务平台
        taskPlant: ''
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
        core.initTabClick($('#manageTaskTab li'), function ($li) {
            baseDatas.taskPlant = $li.data('task-plant');
            getTableDatas(baseDatas.curIndex, 20);
        });
        // 创建任务
        $('.createTask').on('click', createTaskHandle);
        // 取消任务信息
        $('.cancelTask').on('click', updateTaskHandle);
        // 禁用任务
        $('.disabledTask').on('click', {
            type: 0
        }, toggleTaskHandle);
        // 启用任务
        $('.enabledTask').on('click', {
            type: 1
        }, toggleTaskHandle);
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
        var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
        if (selectDatas.length === 1) {
            flyer.confirm('确定取消任务吗？取消之后积分将不退回账户中', function (result) { }, {
                btns: [{
                    text: '确定',
                    click: function (elm) {
                        this.close();
                        APIUtil.cancelTask(selectDatas[0].taskOrderNumber, function (res) {
                            if (res.data.status === '1') {
                                flyer.msg('操作成功!');
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
                                        flyer.msg(baseDatas.netErrMsg);
                                    }
                                });
                            } else {
                                flyer.msg(res.data.tips);
                            }
                        });
                    }
                },
                {
                    text: ("取消"),
                    click: function (elm) {
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
     * 切换任务状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleTaskHandle(events) {
        var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定暂停吗？' : '确定恢复吗？';
        if (selectDatas.length === 1) {
            flyer.confirm(tipMsg, function (result) { }, {
                btns: [{
                    text: '确定',
                    click: function (elm) {
                        this.close();
                        APIUtil.pauseAndResumeTask(selectDatas[0].taskOrderNumber, type, function (res) {
                            if (res.data.status === '1') {
                                flyer.msg('操作成功！');
                                getTableDatas(1, 20);
                            } else {
                                flyer.msg('操作失败：' + res.data.tips);
                            }
                        });
                    }
                },
                {
                    text: ("取消"),
                    click: function (elm) {
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
                    title: '订单号',
                    field: 'taskOrderNumber',
                    formatter: function (row) {
                        return `<span title="${row.taskOrderNumber}">${row.taskOrderNumber}</span>`;
                    }
                }, {
                    title: '数量和关键词',
                    field: "",
                    styles: {
                        width: 120
                    },
                    formatter: function (row) {
                        return '（' + row.taskQuantity + '）' + row.taskKeyword;
                    }
                }, {
                    title: '任务类型',
                    field: "",
                    formatter: function (row) {
                        var type = core.getTypeCodeByValue(row.taskChildType);
                        var taskPlant = type.plant === 'TB' ? '淘宝' : type.plant === 'JD' ? '京东' : '拼多多';
                        return taskPlant + '（' + type.name + '）';
                    }
                }, {
                    title: '任务名称',
                    field: "taskName"
                }, {
                    title: '开始日期',
                    field: "",
                    styles: {
                        width: 100
                    },
                    formatter: function (row) {
                        return flyer.formatDate('yyyy-mm-dd', row.taskStartDate);
                    }
                }, {
                    title: '链接',
                    field: "taskBabyLinkToken",
                    formatter: function (row) {
                        return `<a href="${row.taskBabyLinkToken}" style="color:#2cc3a9" target="_blank" title="${row.taskBabyLinkToken}">${row.taskBabyLinkToken}</a>`;
                    }
                }, {
                    title: '总消费',
                    field: "taskSumMoney",
                    styles: {
                        width: 70
                    }
                }, {
                    title: '创建时间',
                    field: "createdDate",
                    styles: {
                        width: 130
                    },
                    formatter: function (row, rows) {
                        return flyer.formatDate('yyyy-mm-dd hh:MM', row.createdDate);
                    }
                },
                // {
                //     title: '修改时间',
                //     field: "updateDate",
                //     styles: {
                //         width: 130,
                //     },
                //     formatter: function(row, rows) {
                //         return row.updateDate ? flyer.formatDate('yyyy-mm-dd hh:MM', row.updateDate) : '-';
                //     }
                // },
                {
                    title: '状态',
                    field: 'status',
                    styles: {
                        width: 60
                    },
                    formatter: function (row) {
                        return '<i class="mdui-icon material-icons mdui-text-color-pink js-view-status" data-id="' + row.id + '" data-task-order-number="' + row.taskOrderNumber + '">&#xe417;</i>';
                    }
                }
                ],
                data: datas,
                rowClick: function (index, row) {
                    console.log(row);
                    core.setWindowHash('task_view', '?taskId=' + row.id);
                }
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
        core.tableNoMatch($table, '暂时没有任务');
        // 初始化下拉框，显示每页数据条数的下拉框
        baseDatas.pageSizeSelectObj = core.initPagerSizeSelect($('#plantPagerSize'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
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
        $('#currentTaskMountSpan').text(currentTotal);
        $('#taskMountSpan').text(total);
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
            nocache: window.Date.now(),
            taskPlant: baseDatas.taskPlant
        },
            $table = $('#taskTable');
        $.ajax({
            url: '/api/readTaskPage',
            type: 'GET',
            data: conditions,
            beforeSend: function (jqXHR, settings) {
                $.addLoading();
            },
            success: function (data, jqXHR, textStatus) {
                if (data.success) {
                    renderTable($table, data.data.rows);
                    randerDOMPager(baseDatas.$table, data.data.rows, data.data.total, {
                        pageNumber: pageNumber || 1,
                        pageSize: pageSize || 20
                    });
                    setMountValue(data.data.rows.length, data.data.total);
                    core.bindCheckboxEvent(baseDatas.$table);
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
                            var tooltip = new mdui.Tooltip(event.target, {
                                position: 'left',
                                content: content
                            });
                            tooltip.open();
                        });
                    });
                } else {
                    flyer.msg(data.message);
                    renderTable($table, []);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                flyer.msg(baseDatas.netErrMsg);
            },
            complete: function (jqXHR, textStatus) {
                $.removeLoading()
            }
        });
    }

    /**
     * 根据用户的id获取用户的信息
     * 
     * @param {Number} id 用户id
     * @param {funciton} callback 回调函数
     */
    function readTaskById(id, callback) {
        if (!id) {
            if (typeof callback === 'function') {
                callback({
                    success: false,
                    message: '任务id不能为空'
                });
            }
            return;
        }
        $.ajax({
            url: '/api/readTaskById',
            data: {
                id: id
            },
            success: function (data) {
                callback(data);
            },
            error: function (error) {
                callback(data);
            }
        });
    }

    /**
     * 校验任务信息
     * 
     * @param {Object} plantInfo 任务信息对象
     */
    function validTaskInfo(plantInfo) {
        if (!plantInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }

        if (!plantInfo.plantName) {
            return {
                isPass: false,
                msg: '任务名称不能为空'
            }
        }

        if (!plantInfo.description) {
            return {
                isPass: false,
                msg: '任务描述不能为空'
            }
        }
        return {
            isPass: true,
            msg: ''
        };
    }

    function getTaskStatus() {
        alert(123);
    }

    // 页面入口
    init();
});