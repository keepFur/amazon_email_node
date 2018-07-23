// 意见反馈管理模块
'use strict';
flyer.define('adviceFeedback_manage', function(exports, module) {
    var baseDatas = {
        // 表格实例
        $table: null,
        pagerObj: null,
        pageSizeSelectObj: null,
        curIndex: Number(flyer.getQueryString('curIndex') || 1),
        // 错误消息
        paramErrMsg: '参数错误，请刷新页面重试',
        netErrMsg: '网络错误',
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
        // 禁用意见反馈
        $('.disabledAdviceFeedback').on('click', {
            type: 0
        }, toggleAdviceFeedbackHandle);
        // 启用意见反馈
        $('.enabledAdviceFeedback').on('click', {
            type: 1
        }, toggleAdviceFeedbackHandle);
    }

    /**
     * 切换意见反馈状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleAdviceFeedbackHandle(events) {
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
                                url: '/api/toggleAdviceFeedback',
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
                    title: '标题',
                    field: "title"
                }, {
                    title: '内容',
                    field: "content"
                }, {
                    title: '创建时间',
                    field: "createdDate",
                    formatter: function(row, rows) {
                        return flyer.formatDate('yyyy-mm-dd hh:MM', row.createdDate);
                    }
                }, {
                    title: '最后修改时间',
                    field: "updateDate",
                    formatter: function(row, rows) {
                        return row.updateDate ? flyer.formatDate('yyyy-mm-dd hh:MM', row.updateDate) : '-';
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
        core.tableNoMatch($table, '暂时没有意见反馈');
        // 初始化下拉框，显示每页数据条数的下拉框
        baseDatas.pageSizeSelectObj = core.initPagerSizeSelect($('#adviceFeedbackPagerSize'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
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
        $('#currentAdviceFeedbackMountSpan').text(currentTotal);
        $('#adviceFeedbackMountSpan').text(total);
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
            $table = $('#adviceFeedbackTable');
        $.ajax({
            url: '/api/readAdviceFeedbackPage',
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
    function readAdviceFeedbackById(id, callback) {
        if (!id) {
            if (typeof callback === 'function') {
                callback({
                    success: false,
                    message: '意见反馈id不能为空'
                });
            }
            return;
        }
        $.ajax({
            url: '/api/readAdviceFeedbackById',
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
     * 校验意见反馈信息
     * 
     * @param {Object} adviceFeedbackInfo 意见反馈信息对象
     */
    function validAdviceFeedbackInfo(adviceFeedbackInfo) {
        if (!adviceFeedbackInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }

        if (!adviceFeedbackInfo.adviceFeedbackTitle) {
            return {
                isPass: false,
                msg: '意见反馈标题不能为空'
            }
        }

        if (!adviceFeedbackInfo.adviceFeedbackContent) {
            return {
                isPass: false,
                msg: '意见反馈内容不能为空'
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