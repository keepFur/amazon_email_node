// 通知管理模块
'use strict';
layui.use(['util', 'layer', 'element', 'table', 'form'], function () {
    var util = layui.util;
    var layer = layui.layer;
    var element = layui.element;
    var table = layui.table;
    var form = layui.form;
    var baseDatas = {
        netErrMsg: '系统已退出登录，请登录系统重试',
        operatorErrMsg: {
            single: '请选择一条数据操作',
            batch: '请至少选择一条数据操作'
        },
        currentTabIndex: 0,
    };

    /**
     *页面入口函数 
    * 
    */
    (function init() {
        form.render('select');
        // 渲染表格
        renderTable();
        // 初始化事件
        initEvent();
    })()

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // tab点击事件
        element.on('tab(adviceFeedback)', function (data) {
            if (data.index !== baseDatas.currentTabIndex && data.index === 1) {
                reloadTable();
                baseDatas.currentTabIndex = data.index;
            }
        });
        // 提交反馈
        $('#createAdviceFeedbackBtn').on('click', createAdviceFeedbackHandle);
        // 查询
        $('#searchBtn').on('click', searchHandle);
        // 重置
        $('#resetBtn').on('click', function () {
            $('#feedbackSearchForm')[0].reset();
            return false;
        });
        // 禁用意见反馈
        $('#disabledAdviceFeedbackBtn').on('click', {
            type: 0
        }, toggleAdviceFeedbackHandle);
        // 启用意见反馈
        $('#enabledAdviceFeedbackBtn').on('click', {
            type: 1
        }, toggleAdviceFeedbackHandle);
    }

    // 提交反馈
    function createAdviceFeedbackHandle() {
        var title = $.trim($('select[name=titleCre]').val());
        var content = $.trim($('textarea[name=contentCre]').val());
        if (title && content) {
            $.ajax({
                url: '/api/createAdviceFeedback',
                type: 'POST',
                data: {
                    title: title,
                    content: util.escape(content)
                },
                success: function (data) {
                    if (data.success) {
                        layer.msg('操作成功');
                        $('select[name=titleCre]').val('');
                        $('textarea[name=contentCre]').val('');
                        form.render('select');
                        element.tabChange('adviceFeedback', 'adviceFeedbackList');
                        baseDatas.currentTabIndex = 1;
                        reloadTable();
                    } else {
                        layer.msg('操作失败：' + data.message);
                    }
                },
                error: function () {
                    layer.msg(baseDatas.netErrMsg);
                }
            });
        } else {
            layer.msg('标题和内容不能为空');
            return false;
        }
        return false;
    }

    /**
    * 查询的点击事件处理函数
    * 
    * @param {any} events 
    */
    function searchHandle(events) {
        var queryParams = getQueryParams();
        reloadTable({
            where: queryParams,
            page: {
                curr: 1,
                limit: 10
            }
        });
        return false;
    }

    /**
     * 切换反馈状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleAdviceFeedbackHandle(events) {
        var selectDatas = table.checkStatus('adviceFeedbackTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                btn: ['确定', '取消'],
                title: "询问框",
            }, function () {
                $.ajax({
                    url: '/api/toggleAdviceFeedback',
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
     * 渲染表格结构
     * 
     */
    function renderTable() {
        table.render({
            elem: '#adviceFeedbackTable',
            url: '/api/readAdviceFeedbackPage',
            page: true,
            cols: [[
                {
                    checkbox: true,
                },
                {
                    title: '分类',
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
                    title: '状态',
                    field: 'status',
                    templet: function (d) {
                        return d.status === 1 ? '启用' : '停用';
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
            }
        });
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
     * 重载表格
     * 
     */
    function reloadTable(options) {
        table.reload('adviceFeedbackTable', options);
    }

    /**
    *获取表格的查询参数
    *
    * @returns 返回所有参数的对象
    */
    function getQueryParams() {
        var $form = $('#feedbackSearchForm');
        var formDatas = $form.serializeArray();
        var ret = {};
        $.each(formDatas, function (index, item) {
            ret[item.name] = item.value;
        });
        return ret;
    }
});