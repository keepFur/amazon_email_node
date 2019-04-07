// 通知管理模块
'use strict';
layui.use(['util', 'layer', 'element', 'table'], function () {
    var util = layui.util;
    var layer = layui.layer;
    var element = layui.element;
    var table = layui.table;
    var baseDatas = {
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
        // 获取表格数据(系统通知)
        renderTable();
        // 获取表格数据（个人通知）
        renderTablePerson();
        // 如果是普通用户只能选择查看通知，不能操作
        initContentByUser();
        // 初始化事件
        initEvent();
    })()

    /**
     *根据用户角色进行内容的初始化函数 
     * 
     */
    function initContentByUser() {
        // 删除按钮
        core.getUserInfoById(function (user) {
            if (!user.data.rows[0].isSuper) {
                $('#noticeOperator').remove();
            }
        });
    }

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 个人通知模块
        // 标记为已读-支持批量
        $('#markedReadBtn').on('click', markedReadHandler);
        // 删除通知-支持批量
        $('#deleteBtn').on('click', deleteHandler);

        // 系统通知模块
        // 创建通知
        $('#createNoticeBtn').on('click', createNoticeHandle);
        // 修改通知信息
        $('#updateNoticeBtn').on('click', updateNoticeHandle);
        // 禁用通知
        $('#disabledNoticeBtn').on('click', {
            type: 0
        }, toggleNoticeHandle);
        // 启用通知
        $('#enabledNoticeBtn').on('click', {
            type: 1
        }, toggleNoticeHandle);
    }

    /**
     * 通知标记为已读的点击事件处理函数
     * 
     * @param {any} events 
     */
    function markedReadHandler(e) {
        var selectDatas = table.checkStatus('noticeTablePerson').data;
        if (selectDatas.length > 0) {
            $.ajax({
                url: '/api/markedReadNotice',
                type: 'POST',
                data: {
                    ids: selectDatas.map(item => item.id),
                },
                success: function (data, textStatus, jqXHR) {
                    layer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                    table.reload('noticeTablePerson');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    layer.msg(baseDatas.errorMsg);
                }
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.batch);
        }
        return false;
    }

    /**
     * 删除通知的点击事件处理函数
     * 
     * @param {any} events 
     */
    function deleteHandler(e) {
        var selectDatas = table.checkStatus('noticeTablePerson').data;
        if (selectDatas.length > 0) {
            $.ajax({
                url: '/api/deleteNotice',
                type: 'POST',
                data: {
                    ids: selectDatas.map(item => item.id),
                },
                success: function (data, textStatus, jqXHR) {
                    layer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                    table.reload('noticeTablePerson');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    layer.msg(baseDatas.errorMsg);
                }
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.batch);
        }
        return false;
    }

    /**
     * 创建通知的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createNoticeHandle(events) {
        layer.open({
            content: `<form class="layui-form layui-form-pane" name="noticeCreateForm">
                            <div class="layui-form-item">
                                <div class="layui-inline">
                                    <label class="layui-form-label">标题</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="noticeTitle"  class="layui-input">
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">内容</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="noticeContent" class="layui-input">
                                    </div>
                                </div>
                            </div>
                        </form>`,
            title: '创建通知',
            btn: ['创建', '取消'],
            yes: function (index, layero) {
                var noticeInfo = core.getFormValues($('form[name=noticeCreateForm]'));
                var validNoticeInfoResult = validNoticeInfo(noticeInfo);
                var $ele = layero.find('.layui-layer-btn0');
                if (validNoticeInfoResult.isPass) {
                    $.ajax({
                        url: '/api/createNotice',
                        type: 'POST',
                        data: noticeInfo,
                        beforeSend: function () {
                            $.unlockBtn($ele, true, '创建中');
                        },
                        success: function (data, textStatus, jqXHR) {
                            layer.msg(data.success ? ('操作成功') : ('操作失败'));
                            layer.close(index);
                            reloadTable();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        },
                        complete: function () {
                            $.unlockBtn($ele, '创建');
                        }
                    });
                } else {
                    layer.msg(validNoticeInfoResult.msg);
                }
            }
        });
        return false;
    }

    /**
     * 通知信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updateNoticeHandle(events) {
        var selectDatas = table.checkStatus('noticeTable').data;
        if (selectDatas.length === 1) {
            var noticeTitle = selectDatas[0].noticeTitle;
            var noticeContent = selectDatas[0].noticeContent;
            layer.open({
                content: `<form class="layui-form layui-form-pane" name="noticeUpdateForm">
                            <div class="layui-form-item">
                                <div class="layui-inline">
                                    <label class="layui-form-label">标题</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="noticeTitle" value="${noticeTitle}"  class="layui-input">
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">内容</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="noticeContent" value="${noticeContent}" class="layui-input">
                                    </div>
                                </div>
                            </div>
                        </form>`,
                title: '通知信息修改',
                btn: ['确定', '取消'],
                yes: function (index) {
                    var noticeInfo = core.getFormValues($('form[name=noticeUpdateForm]'));
                    var validNoticeInfoResult = validNoticeInfo(noticeInfo);
                    noticeInfo.id = selectDatas[0].id;
                    if (validNoticeInfoResult.isPass) {
                        $.ajax({
                            url: '/api/updateNotice',
                            type: 'POST',
                            data: noticeInfo,
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
                        layer.msg(validNoticeInfoResult.msg);
                    }
                }
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 切换通知状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleNoticeHandle(events) {
        var selectDatas = table.checkStatus('noticeTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                btn: ['确定', '取消'],
                title: "询问框",
            }, function () {
                $.ajax({
                    url: '/api/toggleNotice',
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
     * 渲染表格结构 系统通知
     * 
     */
    function renderTable() {
        table.render({
            elem: '#noticeTable',
            url: '/api/readNoticePage',
            page: true,
            cols: [
                [{
                        checkbox: true,
                    },
                    {
                        field: '',
                        title: '序号',
                        width: 60,
                        templet: function (d) {
                            return d.LAY_INDEX;
                        }
                    },
                    {
                        title: '标题',
                        field: "noticeTitle"
                    }, {
                        title: '内容',
                        field: "noticeContent"
                    }, {
                        title: '创建时间',
                        field: "createdDate",
                        templet: function (d) {
                            return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
                        }
                    }, {
                        title: '最后修改时间',
                        field: "updateDate",
                        templet: function (d) {
                            return d.updateDate ? util.toDateString(d.updateDate, 'yyyy-MM-dd HH:mm') : '';
                        }
                    }, {
                        title: '状态',
                        field: 'status',
                        templet: function (d) {
                            return d.status === 1 ? '启用' : '停用';
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
            done: function (res) {}
        });
    }

    /**
     * 渲染表格结构 个人通知
     * 
     */
    function renderTablePerson() {
        table.render({
            elem: '#noticeTablePerson',
            url: '/api/readNoticePersonPage',
            page: true,
            cols: [
                [{
                        checkbox: true,
                    },
                    {
                        field: '',
                        title: '序号',
                        width: 60,
                        templet: function (d) {
                            return d.LAY_INDEX;
                        }
                    },
                    {
                        title: '标题',
                        field: "title"
                    }, {
                        title: '内容',
                        field: "content"
                    }, {
                        title: '创建时间',
                        field: "createdDate",
                        templet: function (d) {
                            return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
                        }
                    }, {
                        title: '所属用户',
                        field: 'username',
                    }, {
                        title: '备注',
                        field: 'remark',
                    }, {
                        title: '状态',
                        field: 'status',
                        width: 80,
                        templet: function (d) {
                            return d.status === 1 ? '未读' : '已读';
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
            }
        });
    }

    /**
     * 重载表格
     * 
     */
    function reloadTable(options) {
        table.reload('noticeTable', options);
    }

    /**
     * 校验通知信息
     * 
     * @param {Object} noticeInfo 通知信息对象
     */
    function validNoticeInfo(noticeInfo) {
        if (!noticeInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }

        if (!noticeInfo.noticeTitle) {
            return {
                isPass: false,
                msg: '通知标题不能为空'
            }
        }

        if (!noticeInfo.noticeContent) {
            return {
                isPass: false,
                msg: '通知内容不能为空'
            }
        }
        return {
            isPass: true,
            msg: ''
        };
    }

});