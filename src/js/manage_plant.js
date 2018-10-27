// 平台管理模块
layui.use(['util', 'layer', 'element', 'table'], function () {
    var util = layui.util;
    var layer = layui.layer;
    var element = layui.element;
    var table = layui.table;
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
        // 获取表格数据
        renderTable();
        // 初始化事件
        initEvent();
    })()

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 创建平台
        $('#createPlantBtn').on('click', createPlantHandle);
        // 修改平台信息
        $('#updatePlantBtn').on('click', updatePlantHandle);
        // 禁用平台
        $('#disabledPlantBtn').on('click', {
            type: 0
        }, togglePlantHandle);
        // 启用平台
        $('#enabledPlantBtn').on('click', {
            type: 1
        }, togglePlantHandle);
    }

    /**
     * 创建平台的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createPlantHandle(events) {
        layer.open({
            content: `<form class="layui-form layui-form-pane" name="plantCreateForm">
                        <div class="layui-form-item">
                            <div class="layui-inline">
                                <label class="layui-form-label">名称</label>
                                <div class="layui-input-inline">
                                    <input type="text" name="plantName"  class="layui-input">
                                </div>
                            </div>
                            <div class="layui-inline">
                                <label class="layui-form-label">平台描述</label>
                                <div class="layui-input-inline">
                                    <input type="text" name="description" class="layui-input">
                                </div>
                            </div>
                        </div>
                    </form>`,
            title: '创建平台',
            btn: ['创建', '取消'],
            yes: function (index) {
                var that = this;
                var plantInfo = core.getFormValues($('form[name=plantCreateForm]'));
                var validPlantInfoResult = validPlantInfo(plantInfo);
                if (validPlantInfoResult.isPass) {
                    $.ajax({
                        url: '/api/createPlant',
                        type: 'POST',
                        data: plantInfo,
                        success: function (data, textStatus, jqXHR) {
                            layer.msg(data.success ? ('操作成功') : ('操作失败'));
                            layer.close(index);
                            reloadTable();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        }
                    });
                } else {
                    layer.msg(validPlantInfoResult.msg);
                }
            }
        });
        return false;
    }

    /**
     * 平台信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updatePlantHandle(events) {
        var selectDatas = table.checkStatus('plantTable').data;
        if (selectDatas.length === 1) {
            var plantName = selectDatas[0].plantName;
            var description = selectDatas[0].description;
            layer.open({
                content: `<form class="layui-form layui-form-pane" name="plantUpdateForm">
                            <div class="layui-form-item">
                                <div class="layui-inline">
                                    <label class="layui-form-label">名称</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="plantName" value="${plantName}"  class="layui-input">
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">平台描述</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="description" value="${description}" class="layui-input">
                                    </div>
                                </div>
                            </div>
                        </form>`,
                title: '平台信息修改',
                yes: function (index) {
                    var plantInfo = core.getFormValues($('form[name=plantUpdateForm]'));
                    var validPlantInfoResult = validPlantInfo(plantInfo);
                    plantInfo.id = selectDatas[0].id;
                    if (validPlantInfoResult.isPass) {
                        $.ajax({
                            url: '/api/updatePlant',
                            type: 'POST',
                            data: plantInfo,
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
                        layer.msg(validPlantInfoResult.msg);
                    }
                },
                btns: ['确定', '取消']
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 切换平台状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function togglePlantHandle(events) {
        var selectDatas = table.checkStatus('plantTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                btns: ['确定', '取消'],
                title: "询问框",
            }, function () {
                $.ajax({
                    url: '/api/togglePlant',
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
     * @param {jq} $table 表格容器
     * @param {Array} datas 表格数据
     */
    function renderTable($table, datas) {
        table.render({
            elem: '#plantTable',
            url: '/api/readPlantPage',
            page: true,
            cols: [[
                {
                    checkbox: true,
                },
                {
                    title: '平台名称',
                    field: "plantName"
                }, {
                    title: '描述',
                    field: "description"
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
     * 设置spanner
     * 
     * @param {any} currentTotal 当前显示数据的总数
     * @param {any} total 总数居
     */
    function setMountValue(currentTotal, total) {
        $('#currentPlantMountSpan').text(currentTotal);
        $('#plantMountSpan').text(total);
    }

    /**
     * 重载表格
     * 
     */
    function reloadTable(options) {
        table.reload('plantTable', options);
    }

    /**
     * 校验平台信息
     * 
     * @param {Object} plantInfo 平台信息对象
     */
    function validPlantInfo(plantInfo) {
        if (!plantInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }

        if (!plantInfo.plantName) {
            return {
                isPass: false,
                msg: '平台名称不能为空'
            }
        }

        if (!plantInfo.description) {
            return {
                isPass: false,
                msg: '平台描述不能为空'
            }
        }
        return {
            isPass: true,
            msg: ''
        };
    }
});