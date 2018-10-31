// 操作日志查询模块
layui.use(['table', 'element', 'layer', 'util', 'form'], function () {
    var table = layui.table;
    var element = layui.element;
    var layer = layui.layer;
    var util = layui.util;
    var form = layui.form;
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
        // 获取表格数据
        renderTable();
        // 初始化事件
        initEvent();
    })();

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 查询
        $('#searchBtn').on('click', searchHandle);
        // 重置
        $('#resetBtn').on('click', function () {
            $('#logsSearchForm')[0].reset();
            return false;
        });
        // 禁用日志积分
        $('#disabledLogsScoreBtn').on('click', {
            type: 0
        }, toggleLogsScoreHandle);
        // 启用日志积分
        $('#enabledLogsScoreBtn').on('click', {
            type: 1
        }, toggleLogsScoreHandle);
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
     * 切换日志积分状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleLogsScoreHandle(events) {
        var selectDatas = table.checkStatus('logsScoreTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                title: '询问框',
                btn: ['确定', '取消']
            }, function (index, layero) {
                $.ajax({
                    url: '/api/toggleLogsScore',
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
     * 渲染表格
     * 
     */
    function renderTable() {
        table.render({
            elem: '#logsScoreTable',
            url: '/api/readLogsScorePage',
            page: true,
            cols: [[
                {
                    checkbox: true,
                },
                {
                    title: '操作用户',
                    field: "userName"
                },
                {
                    title: '订单号',
                    field: 'orderNumber',
                    width: 250
                },
                {
                    title: '类型',
                    field: "",
                    templet: function (d) {
                        var status = ['', '充值', '订单消费', '退款', '充值赠送', '佣金'];
                        return status[d.type];
                    }
                },
                {
                    title: '数量',
                    field: "count"
                },
                {
                    title: '积分余额',
                    field: "balance"
                },
                {
                    title: '创建时间',
                    field: "createdDate",
                    templet: function (d) {
                        return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm:ss');
                    }
                }, {
                    title: '状态',
                    field: 'status',
                    styles: {
                        width: 56
                    },
                    templet: function (d) {
                        return d.status === 1 ? '启用' : '停用';
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
    function reloadTable(options) {
        table.reload('logsScoreTable', options);
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
    *获取表格的查询参数
    *
    * @returns 返回所有参数的对象
    */
    function getQueryParams() {
        var $form = $('#logsSearchForm');
        var formDatas = $form.serializeArray();
        var ret = {};
        $.each(formDatas, function (index, item) {
            ret[item.name] = item.value;
        });
        return ret;
    }
});