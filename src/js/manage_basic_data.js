// 平台管理模块
layui.use(['util', 'layer', 'element', 'table', 'form'], function () {
    var util = layui.util;
    var layer = layui.layer;
    var element = layui.element;
    var table = layui.table;
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
        // 渲染表格数据
        renderKbOrderTable();
        renderKbTypeTable();
        renderTaskTypeTable();
        // 初始化事件
        initEvent();
    })()

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 空包单号

        // 创建空包单号
        $('#createKbOrderBtn').on('click', createKbOrderHandle);
        // 修改空包单号信息
        $('#updateKbOrderBtn').on('click', updateKbOrderHandle);
        // 禁用空包单号
        $('#disabledKbOrderBtn').on('click', {
            type: 0
        }, toggleKbOrderHandle);
        // 启用空包单号
        $('#enabledKbOrderBtn').on('click', {
            type: 1
        }, toggleKbOrderHandle);

        // 空包类型

        // 创建空包类型
        $('#createKbTypeBtn').on('click', createKbTypeHandle);
        // 修改空包类型信息
        $('#updateKbTypeBtn').on('click', updateKbTypeHandle);
        // 禁用空包类型
        $('#disabledKbTypeBtn').on('click', {
            type: 0
        }, toggleKbTypeHandle);
        // 启用空包类型
        $('#enabledKbTypeBtn').on('click', {
            type: 1
        }, toggleKbTypeHandle);

        // 任务类型

        // 创建任务类型
        $('#createTaskTypeBtn').on('click', createTaskTypeHandle);
        // 修改任务类型信息
        $('#updateTaskTypeBtn').on('click', updateTaskTypeHandle);
        // 禁用任务类型
        $('#disabledTaskTypeBtn').on('click', {
            type: 0
        }, toggleTaskTypeHandle);
        // 启用任务类型
        $('#enabledTaskTypeBtn').on('click', {
            type: 1
        }, toggleTaskTypeHandle);
    }

    /************************  空包单号 ***********************************/

    /**
     * 创建空包单号的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createKbOrderHandle(events) {
        layer.open({
            content: `<form class="layui-form layui-form-pane" name="kbOrderCreateForm">
                        <div class="layui-form-item">
                            <div class="layui-inline">
                                <label class="layui-form-label">平台</label>
                                <div class="layui-input-inline">
                                    <select name="plant">
                                        <option value="">选择快递平台</option>
                                        <option value="0">申通</option>
                                        <option value="1">中通</option>
                                        <option value="2">韵达</option>
                                        <option value="3">天天</option>
                                    </select>
                                </div>
                            </div>
                            <div class="layui-form-item layui-form-text">
                                <label class="layui-form-label">单号</label>
                                <div class="layui-input-block">
                                <textarea placeholder="多个使用逗号或者空格隔开" rows="10" name="number" class="layui-textarea"></textarea>
                                </div>
                            </div>
                        </div>
                    </form>`,
            title: '创建单号',
            btn: ['创建', '取消'],
            yes: function (index) {
                var kbOrderInfo = core.getFormValues($('form[name=kbOrderCreateForm]'));
                var validKbOrderInfoResult = validKbOrderInfo(kbOrderInfo);
                if (validKbOrderInfoResult.isPass) {
                    kbOrderInfo.numbers = kbOrderInfo.number.split(/\s{1,}|,|，|\n/g).filter(function (item) {
                        return !!item;
                    });
                    $.ajax({
                        url: '/api/createKbOrder',
                        type: 'POST',
                        data: kbOrderInfo,
                        success: function (data, textStatus, jqXHR) {
                            layer.msg(data.success ? ('操作成功') : ('操作失败'));
                            layer.close(index);
                            reloadTable('kbOrderTable');
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        }
                    });
                } else {
                    layer.msg(validKbOrderInfoResult.msg);
                }
            },
            success: function () {
                form.render('select');
            }
        });
        return false;
    }

    /**
     * 空包单号信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updateKbOrderHandle(events) {
        var selectDatas = table.checkStatus('kbOrderTable').data;
        if (selectDatas.length === 1) {
            var plant = selectDatas[0].plant;
            var number = selectDatas[0].number;
            layer.open({
                content: `<form class="layui-form layui-form-pane" name="kbOrderUpdateForm">
                            <div class="layui-form-item">
                                <div class="layui-inline">
                                    <label class="layui-form-label">平台</label>
                                    <div class="layui-input-inline">
                                        <select name="plant">
                                            <option value="">请选择平台</option>
                                            <option value="0">申通</option>
                                            <option value="1">中通</option>
                                            <option value="2">韵达</option>
                                            <option value="3">天天</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">单号</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="number" value="${number}" class="layui-input">
                                    </div>
                                </div>
                            </div>
                        </form>`,
                title: '空包单号信息修改',
                btn: ['确定', '取消'],
                area: ['360px', '360px'],
                yes: function (index) {
                    var kbOrderInfo = core.getFormValues($('form[name=kbOrderUpdateForm]'));
                    var validKbOrderInfoResult = validKbOrderInfo(kbOrderInfo);
                    kbOrderInfo.id = selectDatas[0].id;
                    if (validKbOrderInfoResult.isPass) {
                        $.ajax({
                            url: '/api/updateKbOrder',
                            type: 'POST',
                            data: kbOrderInfo,
                            success: function (data, textStatus, jqXHR) {
                                layer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                                layer.close(index);
                                reloadTable('kbOrderTable');
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                layer.msg(baseDatas.errorMsg);
                            }
                        });
                    } else {
                        layer.msg(validKbOrderInfoResult.msg);
                    }
                },
                success: function () {
                    form.render('select');
                }
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 切换空包单号状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleKbOrderHandle(events) {
        var selectDatas = table.checkStatus('kbOrderTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                btns: ['确定', '取消'],
                title: "询问框",
            }, function () {
                $.ajax({
                    url: '/api/toggleKbOrder',
                    type: 'POST',
                    data: {
                        id: selectDatas[0].id,
                        status: type
                    },
                    success: function (data, textStatus, jqXHR) {
                        layer.msg(data.success ? '操作成功' : ('操作失败' + data.message));
                        reloadTable('kbOrderTable');
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

    /************************  空包类型 ***********************************/
    /**
     * 创建空包类型的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createKbTypeHandle(events) {
        layer.open({
            content: `<form class="layui-form layui-form-pane" name="kbTypeCreateForm">
                        <div class="layui-form-item">
                            <div class="layui-inline">
                                <label class="layui-form-label">平台</label>
                                <div class="layui-input-inline">
                                    <select name="plant">
                                        <option value="">请选择平台</option>
                                        <option value="TB">淘宝</option>
                                        <option value="JD">京东</option>
                                        <option value="PDD">拼多多</option>
                                    </select>
                                </div>
                            </div>
                            <div class="layui-inline">
                                <label class="layui-form-label">名称</label>
                                <div class="layui-input-inline">
                                    <input type="text" name="name" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-inline">
                                <label class="layui-form-label">价格</label>
                                <div class="layui-input-inline">
                                    <input type="text" name="price"  class="layui-input">
                                </div>
                            </div>
                            <div class="layui-inline">
                                <label class="layui-form-label">描述</label>
                                <div class="layui-input-inline">
                                    <input type="text" name="description" class="layui-input">
                                </div>
                            </div>
                        </div>
                    </form>`,
            title: '创建空包类型',
            btn: ['创建', '取消'],
            yes: function (index) {
                var kbTypeInfo = core.getFormValues($('form[name=kbTypeCreateForm]'));
                var validKbTypeInfoResult = validKbTypeInfo(kbTypeInfo);
                if (validKbTypeInfoResult.isPass) {
                    $.ajax({
                        url: '/api/createKbType',
                        type: 'POST',
                        data: kbTypeInfo,
                        success: function (data, textStatus, jqXHR) {
                            layer.msg(data.success ? ('操作成功') : ('操作失败'));
                            layer.close(index);
                            reloadTable('kbTypeTable');
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        }
                    });
                } else {
                    layer.msg(validKbTypeInfoResult.msg);
                }
            },
            success: function () {
                form.render('select');
            }
        });
        return false;
    }

    /**
     * 空包类型信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updateKbTypeHandle(events) {
        var selectDatas = table.checkStatus('kbTypeTable').data;
        if (selectDatas.length === 1) {
            var plant = selectDatas[0].plant;
            var name = selectDatas[0].name;
            var price = selectDatas[0].price;
            var description = selectDatas[0].description;
            layer.open({
                content: `<form class="layui-form layui-form-pane" name="kbTypeUpdateForm">
                            <div class="layui-form-item">
                                <div class="layui-inline">
                                    <label class="layui-form-label">平台</label>
                                    <div class="layui-input-inline">
                                        <select name="plant">
                                            <option value="">请选择平台</option>
                                            <option value="TB">淘宝</option>
                                            <option value="JD">京东</option>
                                            <option value="PDD">拼多多</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">名称</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="name" value="${name}" class="layui-input">
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">价格</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="price" value="${price}" class="layui-input">
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">描述</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="description" value="${description}" class="layui-input">
                                    </div>
                                </div>
                            </div>
                        </form>`,
                title: '空包类型信息修改',
                yes: function (index) {
                    var kbTypeInfo = core.getFormValues($('form[name=kbTypeUpdateForm]'));
                    var validKbTypeInfoResult = validKbTypeInfo(kbTypeInfo);
                    kbTypeInfo.id = selectDatas[0].id;
                    if (validKbTypeInfoResult.isPass) {
                        $.ajax({
                            url: '/api/updateKbType',
                            type: 'POST',
                            data: kbTypeInfo,
                            success: function (data, textStatus, jqXHR) {
                                layer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                                layer.close(index);
                                reloadTable('kbTypeTable');
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                layer.msg(baseDatas.errorMsg);
                            }
                        });
                    } else {
                        layer.msg(validKbTypeInfoResult.msg);
                    }
                },
                success: function () {
                    form.render('select');
                },
                btn: ['确定', '取消']
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 切换空包类型状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleKbTypeHandle(events) {
        var selectDatas = table.checkStatus('kbTypeTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                btns: ['确定', '取消'],
                title: "询问框",
            }, function () {
                $.ajax({
                    url: '/api/toggleKbType',
                    type: 'POST',
                    data: {
                        id: selectDatas[0].id,
                        status: type
                    },
                    success: function (data, textStatus, jqXHR) {
                        layer.msg(data.success ? '操作成功' : ('操作失败' + data.message));
                        reloadTable('kbTypeTable');
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

    /************************  任务类型 ***********************************/
    /**
     * 创建任务类型的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createTaskTypeHandle(events) {
        layer.open({
            content: `<form class="layui-form layui-form-pane" name="taskTypeCreateForm">
                        <div class="layui-form-item">
                            <div class="layui-inline">
                                <label class="layui-form-label">平台</label>
                                <div class="layui-input-inline">
                                    <select name="plant">
                                        <option value="">请选择平台</option>
                                        <option value="TB">淘宝</option>
                                        <option value="JD">京东</option>
                                        <option value="PDD">拼多多</option>
                                    </select>
                                </div>
                            </div>
                            <div class="layui-inline">
                                <label class="layui-form-label">类型</label>
                                <div class="layui-input-inline">
                                    <select name="isPc">
                                        <option value="">请选择类型</option>
                                        <option value="1">PC</option>
                                        <option value="0">APP</option>
                                    </select>
                                </div>
                            </div>
                            <div class="layui-inline">
                                <label class="layui-form-label">名称</label>
                                <div class="layui-input-inline">
                                    <input type="text" name="name" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-inline">
                                <label class="layui-form-label">进价</label>
                                <div class="layui-input-inline">
                                    <input type="text" name="inPrice" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-inline">
                                <label class="layui-form-label">售价</label>
                                <div class="layui-input-inline">
                                    <input type="text" name="outPrice" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-inline">
                                <label class="layui-form-label">猎流码</label>
                                <div class="layui-input-inline">
                                    <input type="text" name="lieliuCode" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-inline">
                                <label class="layui-form-label">描述</label>
                                <div class="layui-input-inline">
                                    <input type="text" name="description" class="layui-input">
                                </div>
                            </div>
                        </div>
                    </form>`,
            title: '创建任务类型',
            btn: ['创建', '取消'],
            yes: function (index) {
                var taskTypeInfo = core.getFormValues($('form[name=taskTypeCreateForm]'));
                var validTaskTypeInfoResult = validTaskTypeInfo(taskTypeInfo);
                if (validTaskTypeInfoResult.isPass) {
                    $.ajax({
                        url: '/api/createTaskType',
                        type: 'POST',
                        data: taskTypeInfo,
                        success: function (data, textStatus, jqXHR) {
                            layer.msg(data.success ? ('操作成功') : ('操作失败'));
                            layer.close(index);
                            reloadTable('taskTypeTable');
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        }
                    });
                } else {
                    layer.msg(validTaskTypeInfoResult.msg);
                }
            },
            success: function () {
                form.render('select');
            }
        });
        return false;
    }

    /**
     * 任务类型信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updateTaskTypeHandle(events) {
        var selectDatas = table.checkStatus('taskTypeTable').data;
        if (selectDatas.length === 1) {
            var plant = selectDatas[0].plant;
            var name = selectDatas[0].name;
            var description = selectDatas[0].description;
            var isPc = selectDatas[0].isPc;
            var lieliuCode = selectDatas[0].lieliuCode;
            var inPrice = selectDatas[0].inPrice;
            var outPrice = selectDatas[0].outPrice;
            layer.open({
                content: `<form class="layui-form layui-form-pane" name="taskTypeUpdateForm">
                            <div class="layui-form-item">
                                <div class="layui-inline">
                                    <label class="layui-form-label">平台</label>
                                    <div class="layui-input-inline">
                                        <select name="plant">
                                            <option value="">请选择平台</option>
                                            <option value="TB">淘宝</option>
                                            <option value="JD">京东</option>
                                            <option value="PDD">拼多多</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">类型</label>
                                    <div class="layui-input-inline">
                                        <select name="isPc">
                                            <option value="">请选择类型</option>
                                            <option value="1" ${isPc === '1' ? 'selected' : ''}>PC</option>
                                            <option value="0" ${isPc === '0' ? 'selected' : ''}>APP</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">名称</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="name" value="${name}" class="layui-input">
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">进价</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="inPrice" value="${inPrice}" class="layui-input">
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">售价</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="outPrice" value="${outPrice}" class="layui-input">
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">猎流码</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="lieliuCode" value="${lieliuCode}" class="layui-input">
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">描述</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="description" value="${description}" class="layui-input">
                                    </div>
                                </div>
                            </div>
                        </form>`,
                title: '任务类型信息修改',
                yes: function (index) {
                    var taskTypeInfo = core.getFormValues($('form[name=taskTypeUpdateForm]'));
                    var validTaskTypeInfoResult = validTaskTypeInfo(taskTypeInfo);
                    taskTypeInfo.id = selectDatas[0].id;
                    if (validTaskTypeInfoResult.isPass) {
                        $.ajax({
                            url: '/api/updateTaskType',
                            type: 'POST',
                            data: taskTypeInfo,
                            success: function (data, textStatus, jqXHR) {
                                layer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                                layer.close(index);
                                reloadTable('taskTypeTable');
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                layer.msg(baseDatas.errorMsg);
                            }
                        });
                    } else {
                        layer.msg(validTaskTypeInfoResult.msg);
                    }
                },
                success: function () {
                    form.render('select');
                },
                btn: ['确定', '取消']
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 切换任务类型状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleTaskTypeHandle(events) {
        var selectDatas = table.checkStatus('taskTypeTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                btns: ['确定', '取消'],
                title: "询问框",
            }, function () {
                $.ajax({
                    url: '/api/toggleTaskType',
                    type: 'POST',
                    data: {
                        id: selectDatas[0].id,
                        status: type
                    },
                    success: function (data, textStatus, jqXHR) {
                        layer.msg(data.success ? '操作成功' : ('操作失败' + data.message));
                        reloadTable('taskTypeTable');
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
     * 渲染表格结构(空包单号)
     * 
     */
    function renderKbOrderTable() {
        table.render({
            elem: '#kbOrderTable',
            url: '/api/readKbOrderPage',
            page: true,
            cols: [[
                {
                    checkbox: true,
                },
                {
                    title: '单号',
                    field: "number"
                }, {
                    title: '平台',
                    field: "plant"
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
                setMountValueForOrder(res.data.length, res.count);
            }
        });
    }

    /**
     * 渲染表格结构(空包类型)
     */
    function renderKbTypeTable() {
        table.render({
            elem: '#kbTypeTable',
            url: '/api/readKbType',
            cols: [[
                {
                    checkbox: true,
                },
                {
                    title: '名称',
                    field: "name"
                }, {
                    title: '描述',
                    field: "description"
                }, {
                    title: '平台',
                    field: "plant"
                }, {
                    title: '价格',
                    field: "price"
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
            response: {
                statusCode: true
            },
            parseData: function (res) {
                return {
                    code: res.success,
                    msg: res.msg,
                    data: res.data.rows
                }
            },
            done: function (res) {
                setMountValueForKbType(res.data.length, res.data.length);
            }
        });
    }

    /**
     * 渲染表格结构(任务类型)
     * 
     */
    function renderTaskTypeTable() {
        table.render({
            elem: '#taskTypeTable',
            url: '/api/readTaskType',
            cols: [[
                {
                    checkbox: true,
                },
                {
                    title: '名称',
                    field: "name"
                }, {
                    title: '描述',
                    field: "description"
                }, {
                    title: '平台',
                    field: "plant"
                }, {
                    title: '进价',
                    field: "inPrice"
                }, {
                    title: '售价',
                    field: "outPrice"
                }, {
                    title: '类型',
                    field: "isPc",
                    templet: function (d) {
                        return d.isPc === 1 ? 'PC' : 'APP';
                    }
                }, {
                    title: '列流码',
                    field: "lieliuCode"
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
            response: {
                statusCode: true
            },
            parseData: function (res) {
                return {
                    code: res.success,
                    msg: res.msg,
                    data: res.data.rows
                }
            },
            done: function (res) {
                setMountValueForTaskType(res.data.length, res.data.length);
            }
        });
    }

    /**
     * 设置空包单号的spanner
     * 
     * @param {any} currentTotal 当前显示数据的总数
     * @param {any} total 总数居
     */
    function setMountValueForOrder(currentTotal, total) {
        $('#currentKbOrderMountSpan').text(currentTotal);
        $('#kbOrderMountSpan').text(total);
    }

    /**
     * 设置空包类型的spanner
     * 
     * @param {any} currentTotal 当前显示数据的总数
     * @param {any} total 总数居
     */
    function setMountValueForKbType(currentTotal, total) {
        $('#currentKbTypeMountSpan').text(currentTotal);
        $('#kbTypeMountSpan').text(total);
    }

    /**
     * 设置 任务类型的spanner
     * 
     * @param {any} currentTotal 当前显示数据的总数
     * @param {any} total 总数居
     */
    function setMountValueForTaskType(currentTotal, total) {
        $('#currentTaskTypeMountSpan').text(currentTotal);
        $('#TaskTypeMountSpan').text(total);
    }

    /**
     * 重载表格
     * 
     */
    function reloadTable(id, options) {
        table.reload(id, options);
    }

    /**
     * 校验空包单号信息
     * 
     * @param {Object} kbOrderInfo 空包单号信息对象
     */
    function validKbOrderInfo(kbOrderInfo) {
        if (!kbOrderInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }

        if (!kbOrderInfo.plant) {
            return {
                isPass: false,
                msg: '平台不能为空'
            }
        }

        if (!kbOrderInfo.number) {
            return {
                isPass: false,
                msg: '订单号不能为空'
            }
        }
        return {
            isPass: true,
            msg: ''
        };
    }

    /**
     * 校验空包类型信息
     * 
     * @param {Object} kbTypeInfo 空包类型信息对象
     */
    function validKbTypeInfo(kbTypeInfo) {
        if (!kbTypeInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }

        if (!kbTypeInfo.name) {
            return {
                isPass: false,
                msg: '名称不能为空'
            }
        }

        if (!kbTypeInfo.plant) {
            return {
                isPass: false,
                msg: '平台不能为空'
            }
        }

        if (!kbTypeInfo.description) {
            return {
                isPass: false,
                msg: '描述不能为空'
            }
        }

        if (!kbTypeInfo.price) {
            return {
                isPass: false,
                msg: '价格不能为空'
            }
        }
        return {
            isPass: true,
            msg: ''
        };
    }

    /**
     * 校验任务类型信息
     * 
     * @param {Object} taskTypeInfo 任务类型信息对象
     */
    function validTaskTypeInfo(taskTypeInfo) {
        if (!taskTypeInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }

        if (!taskTypeInfo.name) {
            return {
                isPass: false,
                msg: '名称不能为空'
            }
        }

        if (!taskTypeInfo.plant) {
            return {
                isPass: false,
                msg: '平台不能为空'
            }
        }

        if (!taskTypeInfo.description) {
            return {
                isPass: false,
                msg: '描述不能为空'
            }
        }

        if (!taskTypeInfo.inPrice) {
            return {
                isPass: false,
                msg: '进价不能为空'
            }
        }
        if (!taskTypeInfo.outPrice) {
            return {
                isPass: false,
                msg: '售价不能为空'
            }
        }

        if (!taskTypeInfo.lieliuCode) {
            return {
                isPass: false,
                msg: '列流码不能为空'
            }
        }

        if (!taskTypeInfo.isPc) {
            return {
                isPass: false,
                msg: '流量类型不能为空'
            }
        }

        return {
            isPass: true,
            msg: ''
        };
    }
});