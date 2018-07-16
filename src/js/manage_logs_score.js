// 日志积分管理模块
'use strict';
flyer.define('logs_scoremanage', function(exports, module) {
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
        // 禁用日志积分
        $('.disabledLogsScore').on('click', {
            type: 0
        }, toggleLogsScoreHandle);
        // 启用日志积分
        $('.enabledLogsScore').on('click', {
            type: 1
        }, toggleLogsScoreHandle);
    }

    /**
     * 切换日志积分状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleLogsScoreHandle(events) {
        var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            flyer.confirm(tipMsg, function(result) {}, {
                btns: [{
                        text: '确定',
                        click: function(elm) {
                            this.close();
                            $.ajax({
                                url: '/api/toggleLogsScore',
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
                    title: '操作用户',
                    field: "userName"
                }, {
                    title: '类型',
                    field: "",
                    formatter: function(row) {
                        return row.type === 1 ? '充值' : '扣减';
                    }
                }, {
                    title: '数量',
                    field: "count"
                }, {
                    title: '余额',
                    field: "mainCount"
                }, {
                    title: '创建时间',
                    field: "createdDate",
                    formatter: function(row, rows) {
                        return flyer.formatDate('yyyy-mm-dd hh:MM', row.createdDate);
                    }
                }, {
                    title: '状态',
                    field: 'status',
                    styles: {
                        width: 56
                    },
                    formatter: function(row) {
                        return row.status === 1 ? '启用' : '停用';
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
        core.tableNoMatch($table, '暂时没有日志积分');
        // 初始化下拉框，显示每页数据条数的下拉框
        baseDatas.pageSizeSelectObj = core.initPagerSizeSelect($('#logsScorePagerSize'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
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
        $('#currentLogsScoreMountSpan').text(currentTotal);
        $('#logsScoreMountSpan').text(total);
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
                limit: pageSize || 20
            },
            $table = $('#logsScoreTable');
        $.ajax({
            url: '/api/readLogsScorePage',
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
     * 根基用户的id获取用户的信息
     * 
     * @param {Number} id 用户id
     * @param {funciton} callback 回调函数
     */
    function readLogsScoreById(id, callback) {
        if (!id) {
            if (typeof callback === 'function') {
                callback({
                    success: false,
                    message: '日志积分id不能为空'
                });
            }
            return;
        }
        $.ajax({
            url: '/api/readLogsScoreById',
            data: {
                id: id
            },
            success: function(data) {
                callback(data);
            },
            error: function(error) {
                callback(data);
            }
        });
    }

    /**
     * 校验日志积分信息
     * 
     * @param {Object} logsScoreInfo 日志积分信息对象
     */
    function validLogsScoreInfo(logsScoreInfo) {
        if (!logsScoreInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }

        if (!logsScoreInfo.logsScoreTitle) {
            return {
                isPass: false,
                msg: '日志积分标题不能为空'
            }
        }

        if (!logsScoreInfo.logsScoreContent) {
            return {
                isPass: false,
                msg: '日志积分内容不能为空'
            }
        }
        return {
            isPass: true,
            msg: ''
        };
    }

    // 页面入口
    init();
});