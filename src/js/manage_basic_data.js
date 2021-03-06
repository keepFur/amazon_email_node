// 平台管理模块
layui.use(['util', 'layer', 'element', 'table', 'form', 'upload'], function () {
    var util = layui.util;
    var layer = layui.layer;
    var element = layui.element;
    var upload = layui.upload;
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
        renderKbNumberTable();
        renderKbTypeTable();
        renderTaskTypeTable();
        readKbNumberStock('TB', $('#tableTBUnuse'));
        readKbNumberStock('JD', $('#tableJDUnuse'));
        readKbNumberStock('PDD', $('#tablePDDUnuse'));
        // 初始化事件
        initEvent();
        form.render('select');
        form.render('radio');
        initUpload();
    })()

    /**
     * 初始化上传组件
     *
     */
    function initUpload() {
        upload.render({
            elem: '#importKbNumberBtn',
            url: '/api/importKbNumberExcel',
            done: function (res) {
                if (res.success) {
                    layer.msg('导入成功！！！');
                    reloadTable('kbNumberTable');
                } else {
                    layer.msg('导入失败：' + res.message);
                }
                layer.closeAll('loading');
            },
            before: function (obj) {
                layer.load();
            },
            size: 4096,
            accept: 'file',
            exts: 'xls|xlsx',
            error: function (err) {
                layer.closeAll('loading');
                layer.msg('导入失败:服务器异常！！！');
            }
        });
    }

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 空包单号

        // 查询
        $('#searchKbNumberBtn').on('click', searchKbNumberHandle);
        // 重置
        $('#resetKbNumberBtn').on('click', function () {
            $('#kbNumberSearchForm')[0].reset();
            return false;
        });
        // 通过excel导入
        $('#importKbNumberBtn').on('click', function () {
            return false;
        });
        // 下载excel模版
        $('#downloadKbNumberTemplateBtn').on('click', function () {
            var aLink = document.createElement('a');
            aLink.href = '/api/downloadKbNumberTemplate'
            aLink.click();
            return false;
        });
        // 创建空包单号
        $('#createKbNumberBtn').on('click', createKbNumberHandle);
        // 修改空包单号信息
        $('#updateKbNumberBtn').on('click', updateKbNumberHandle);
        // 禁用空包单号
        $('#disabledKbNumberBtn').on('click', {
            type: 0
        }, toggleKbNumberHandle);
        // 启用空包单号
        $('#enabledKbNumberBtn').on('click', {
            type: 1
        }, toggleKbNumberHandle);

        // 空包库存
        // 切换平台

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

    function searchKbNumberHandle(e) {
        var queryParams = getQueryParams();
        reloadTable('kbNumberTable', {
            where: queryParams,
            page: {
                curr: 1,
                limit: 10
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
        var $form = $('#kbNumberSearchForm');
        var formDatas = $form.serializeArray();
        var ret = {};
        $.each(formDatas, function (index, item) {
            ret[item.name] = item.value;
        });
        return ret;
    }

    /**
     * 创建空包单号的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createKbNumberHandle(events) {
        layer.open({
            content: `<form class="layui-form layui-form-pane" name="kbNumberCreateForm" lay-filter="kbNumberCreateForm">
                        <div class="layui-form-item">
                            <div class="layui-form-item layui-form-text">
                                <div class="layui-input-block">
                                    <select name="plant" lay-filter="plant">
                                        <option value="">选择电商平台</option>
                                        <option value="TB">淘宝</option>
                                        <option value="JD">京东</option>
                                        <option value="PDD">拼多多</option>
                                    </select> 
                                </div>
                            </div>
                            <div class="layui-form-item layui-form-text">
                                <div class="layui-input-block">
                                    <select name="company">
                                       <option value="">选择快递平台</option>
                                    </select>
                                </div>
                            </div>
                            <div class="layui-form-item layui-form-text">
                                <label class="layui-form-label">快递单号</label>
                                <div class="layui-input-block">
                                   <textarea placeholder="多个使用逗号或者空格隔开" rows="10" name="number" class="layui-textarea"></textarea>
                                </div>
                            </div>
                        </div>
                    </form>`,
            title: '创建单号',
            area: ['400px'],
            btn: ['创建', '取消'],
            yes: function (index, layero) {
                var kbNumberInfo = core.getFormValues($('form[name=kbNumberCreateForm]'));
                var validKbNumberInfoResult = validKbNumberInfo(kbNumberInfo);
                var $ele = layero.find('.layui-layer-btn0');
                if (validKbNumberInfoResult.isPass) {
                    kbNumberInfo.numbers = kbNumberInfo.number.split(/\s{1,}|,|，|\n/g).filter(function (item) {
                        return !!item;
                    });
                    $.ajax({
                        url: '/api/createKbNumber',
                        type: 'POST',
                        data: kbNumberInfo,
                        beforeSend: function () {
                            $.lockedBtn($ele, true, '创建中');
                        },
                        success: function (data, textStatus, jqXHR) {
                            layer.msg(data.success ? ('操作成功') : ('操作失败'));
                            layer.close(index);
                            reloadTable('kbNumberTable');
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        },
                        complete: function () {
                            $.unlockBtn($ele, '创建');
                        }
                    });
                } else {
                    layer.msg(validKbNumberInfoResult.msg);
                }
            },
            success: function () {
                // 电商平台的切换
                form.on('select(plant)', function (data) {
                    if (data.value) {
                        getKbTypeServer(data.value);
                    } else {
                        getKbTypeServer('NULL');
                    }
                });
                form.render('select');
                // var number = function () {
                //     var ret = [];
                //     for (var i = 0; i < 100; i++) {
                //         ret[i] = APIUtil.generateOrderNumer();
                //     }
                //     return ret.join();
                // };
                // form.val('kbNumberCreateForm', {
                //     number: number()
                // });
            }
        });
        return false;
    }

    /**
     * 空包单号信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updateKbNumberHandle(events) {
        var selectDatas = table.checkStatus('kbNumberTable').data;
        if (selectDatas.length === 1) {
            if (selectDatas[0].status === 0) {
                layer.msg('已经使用的单号不能进行修改');
                return false;
            }
            var plant = selectDatas[0].plant;
            var number = selectDatas[0].number;
            var company = selectDatas[0].company;
            layer.open({
                content: `<form class="layui-form layui-form-pane" lay-filter="kbNumberUpdateForm" name="kbNumberUpdateForm">
                            <div class="layui-form-item">
                                <div class="layui-form-item layui-form-text">
                                    <div class="layui-input-block">
                                        <select name="plant" lay-filter="plant">
                                            <option value="">选择电商平台</option>
                                            <option value="TB">淘宝</option>
                                            <option value="JD">京东</option>
                                            <option value="PDD">拼多多</option>
                                        </select> 
                                    </div>
                                </div>
                                <div class="layui-form-item layui-form-text">
                                    <div class="layui-input-block">
                                        <select name="company">
                                            <option value="">选择快递平台</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="ayui-form-item layui-block">
                                    <label class="layui-form-label">单号</label>
                                    <div class="layui-input-block">
                                        <input type="text" name="number" value="${number}" class="layui-input">
                                    </div>
                                </div>
                            </div>
                        </form>`,
                title: '空包单号信息修改',
                btn: ['确定', '取消'],
                area: ['400px', '400px'],
                yes: function (index, layero) {
                    var kbNumberInfo = core.getFormValues($('form[name=kbNumberUpdateForm]'));
                    var validKbNumberInfoResult = validKbNumberInfo(kbNumberInfo);
                    var $ele = layero.find('.layui-layer-btn0');
                    kbNumberInfo.id = selectDatas[0].id;
                    if (validKbNumberInfoResult.isPass) {
                        $.ajax({
                            url: '/api/updateKbNumber',
                            type: 'POST',
                            data: kbNumberInfo,
                            beforeSend: function () {
                                $.lockedBtn($ele, true, '修改中');
                            },
                            success: function (data, textStatus, jqXHR) {
                                layer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                                layer.close(index);
                                reloadTable('kbNumberTable');
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                layer.msg(baseDatas.errorMsg);
                            },
                            complete: function () {
                                $.unlockBtn($ele, '确定');
                            }
                        });
                    } else {
                        layer.msg(validKbNumberInfoResult.msg);
                    }
                },
                success: function () {
                    // 电商平台的切换
                    form.on('select(plant)', function (data) {
                        if (data.value) {
                            getKbTypeServer(data.value);
                        } else {
                            getKbTypeServer('NULL');
                        }
                        return false;
                    });
                    form.render('select');
                    getKbTypeServer(plant, function () {
                        form.val('kbNumberUpdateForm', {
                            plant: plant,
                            company: company
                        });
                    });
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
    function toggleKbNumberHandle(events) {
        var selectDatas = table.checkStatus('kbNumberTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length > 0) {
            var ids = selectDatas.filter(function (n) {
                return n.status === 1;
            }).map(function (item) {
                return item.id;
            })
            if (!ids.length) {
                layer.msg('请选择未使用的单号进行操作');
                return false;
            }
            layer.confirm(tipMsg, {
                btns: ['确定', '取消'],
                title: "询问框",
            }, function () {
                $.ajax({
                    url: '/api/toggleKbNumber',
                    type: 'POST',
                    data: {
                        id: ids,
                        status: type
                    },
                    success: function (data, textStatus, jqXHR) {
                        layer.msg(data.success ? '操作成功' : ('操作失败' + data.message));
                        reloadTable('kbNumberTable');
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        layer.msg(baseDatas.netErrMsg);
                    }
                });
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.batch);
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
                                        <option value="PDDDZ">拼多多电子面单</option>
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
                                <label class="layui-form-label">简称</label>
                                <div class="layui-input-inline">
                                    <input type="text" name="code" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-inline">
                                <label class="layui-form-label">价格(分)</label>
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
            yes: function (index, layero) {
                var kbTypeInfo = core.getFormValues($('form[name=kbTypeCreateForm]'));
                var validKbTypeInfoResult = validKbTypeInfo(kbTypeInfo);
                var $ele = layero.find('.layui-layer-btn0');
                if (validKbTypeInfoResult.isPass) {
                    $.ajax({
                        url: '/api/createKbType',
                        type: 'POST',
                        data: kbTypeInfo,
                        beforeSend: function () {
                            $.lockedBtn($ele, true, '创建中');
                        },
                        success: function (data, textStatus, jqXHR) {
                            layer.msg(data.success ? ('操作成功') : ('操作失败'));
                            layer.close(index);
                            reloadTable('kbTypeTable');
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        },
                        complete: function () {
                            $.unlockBtn($ele, '创建');
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
            var code = selectDatas[0].code;
            layer.open({
                content: `<form class="layui-form layui-form-pane" name="kbTypeUpdateForm" lay-filter="kbTypeUpdateForm">
                            <div class="layui-form-item">
                                <div class="layui-inline">
                                    <label class="layui-form-label">平台</label>
                                    <div class="layui-input-inline">
                                        <select name="plant">
                                            <option value="">请选择平台</option>
                                            <option value="TB">淘宝</option>
                                            <option value="JD">京东</option>
                                            <option value="PDD">拼多多</option>
                                            <option value="PDDDZ">拼多多电子面单</option>
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
                                    <label class="layui-form-label">简称</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="code" value="${code}" class="layui-input">
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">价格(分)</label>
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
                yes: function (index, layero) {
                    var kbTypeInfo = core.getFormValues($('form[name=kbTypeUpdateForm]'));
                    var validKbTypeInfoResult = validKbTypeInfo(kbTypeInfo);
                    var $ele = layero.find('.layui-layer-btn0');
                    kbTypeInfo.id = selectDatas[0].id;
                    if (validKbTypeInfoResult.isPass) {
                        $.ajax({
                            url: '/api/updateKbType',
                            type: 'POST',
                            data: kbTypeInfo,
                            beforeSend: function () {
                                $.lockedBtn($ele, true, '提交中');
                            },
                            success: function (data, textStatus, jqXHR) {
                                layer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                                layer.close(index);
                                reloadTable('kbTypeTable');
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                layer.msg(baseDatas.errorMsg);
                            },
                            complete: function () {
                                $.unlockBtn($ele, '确定');
                            }
                        });
                    } else {
                        layer.msg(validKbTypeInfoResult.msg);
                    }
                },
                success: function () {
                    form.render('select');
                    form.val('kbTypeUpdateForm', {
                        plant: plant
                    });
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
                                <label class="layui-form-label">关键词</label>
                                <div class="layui-input-inline">
                                    <select name="hasKeyword">
                                        <option value="">请选择是否有关键词</option>
                                        <option value="1">有</option>
                                        <option value="0">无</option>
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
                                <label class="layui-form-label">进价(分)</label>
                                <div class="layui-input-inline">
                                    <input type="text" name="inPrice" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-inline">
                                <label class="layui-form-label">售价(分)</label>
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
                var $ele = layero.find('.layui-layer-btn0');
                if (validTaskTypeInfoResult.isPass) {
                    $.ajax({
                        url: '/api/createTaskType',
                        type: 'POST',
                        data: taskTypeInfo,
                        beforeSend: function () {
                            $.lockedBtn($ele, true, '创建中');
                        },
                        success: function (data, textStatus, jqXHR) {
                            layer.msg(data.success ? ('操作成功') : ('操作失败'));
                            layer.close(index);
                            reloadTable('taskTypeTable');
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        },
                        complete: function () {
                            $.unlockBtn($ele, '换行');
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
            var hasKeyword = selectDatas[0].hasKeyword;
            layer.open({
                content: `<form class="layui-form layui-form-pane" name="taskTypeUpdateForm" lay-filter="taskTypeUpdateForm">
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
                                    <label class="layui-form-label">关键词</label>
                                    <div class="layui-input-inline">
                                        <select name="hasKeyword">
                                            <option value="">请选择是否有关键词</option>
                                            <option value="1">有</option>
                                            <option value="0">无</option>
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
                                    <label class="layui-form-label">进价(分)</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="inPrice" value="${inPrice}" class="layui-input">
                                    </div>
                                </div>
                                <div class="layui-inline">
                                    <label class="layui-form-label">售价(分)</label>
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
                yes: function (index, layero) {
                    var taskTypeInfo = core.getFormValues($('form[name=taskTypeUpdateForm]'));
                    var validTaskTypeInfoResult = validTaskTypeInfo(taskTypeInfo);
                    var $ele = layero.find('.layui-layer-btn0');
                    taskTypeInfo.id = selectDatas[0].id;
                    if (validTaskTypeInfoResult.isPass) {
                        $.ajax({
                            url: '/api/updateTaskType',
                            type: 'POST',
                            data: taskTypeInfo,
                            beforeSend: function () {
                                $.lockedBtn($ele, true, '创建中');
                            },
                            success: function (data, textStatus, jqXHR) {
                                layer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                                layer.close(index);
                                reloadTable('taskTypeTable');
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                layer.msg(baseDatas.errorMsg);
                            },
                            complete: function () {
                                $.unlockBtn($ele, '确定');
                            }
                        });
                    } else {
                        layer.msg(validTaskTypeInfoResult.msg);
                    }
                },
                success: function () {
                    form.render('select');
                    form.val('taskTypeUpdateForm', {
                        plant: plant,
                        isPc: isPc,
                        hasKeyword: hasKeyword
                    });
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
    function renderKbNumberTable() {
        table.render({
            elem: '#kbNumberTable',
            url: '/api/readKbNumberPage',
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
                        title: '单号',
                        field: "number"
                    }, {
                        title: '电商平台',
                        field: "plant",
                        templet: function (d) {
                            return core.getPlantByCode(d.plant);
                        }
                    }, {
                        title: '快递平台',
                        field: "company",
                        templet: function (d) {
                            return core.getKbTypeByCode(d.company);
                        }
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
                            return d.status === 1 ? '<span class="layui-text-green">未使用</span>' : '<span class="layui-text-pink">已使用</span>';
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
            done: function (res) {
                if (res.data.length) {
                    $('.layui-table-fixed-r').removeClass('layui-hide');
                }
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
            cols: [
                [{
                        checkbox: true,
                        fixed: 'left',
                    },
                    {
                        field: '',
                        title: '序号',
                        width: 60,
                        fixed: 'left',
                        templet: function (d) {
                            return d.LAY_INDEX;
                        }
                    },
                    {
                        title: '名称',
                        field: "name",
                        width: 250
                    }, {
                        title: '描述',
                        field: "description",
                        width: 350
                    }, {
                        title: '平台',
                        field: "plant",
                        width: 150,
                        templet: function (d) {
                            return core.getPlantByCode(d.plant);
                        }
                    }, {
                        title: '简称',
                        field: "code",
                        width: 150
                    }, {
                        title: '价格(元)',
                        field: "price",
                        width: 150,
                        templet: function (d) {
                            return core.fenToYuan(d.price);
                        }
                    }, {
                        title: '创建时间',
                        field: "createdDate",
                        width: 200,
                        templet: function (d) {
                            return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
                        }
                    }, {
                        title: '最后修改时间',
                        field: "updateDate",
                        width: 200,
                        templet: function (d) {
                            return d.updateDate ? util.toDateString(d.updateDate, 'yyyy-MM-dd HH:mm') : '';
                        }
                    }, {
                        title: '状态',
                        field: 'status',
                        width: 150,
                        fixed: 'right',
                        templet: function (d) {
                            return d.status === 1 ? '启用' : '<span class="layui-text-pink">停用</span>';
                        }
                    }
                ]
            ],
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
                if (res.data.length) {
                    $('.layui-table-fixed-r').removeClass('layui-hide');
                }
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
            cols: [
                [{
                        checkbox: true,
                        fixed: 'left'
                    },
                    {
                        field: '',
                        title: '序号',
                        width: 60,
                        fixed: 'left',
                        templet: function (d) {
                            return d.LAY_INDEX;
                        }
                    },
                    {
                        title: '名称',
                        field: "name",
                        width: 250
                    }, {
                        title: '描述',
                        field: "description",
                        width: 250
                    }, {
                        title: '平台',
                        field: "plant",
                        width: 150,
                        templet: function (d) {
                            return core.getPlantByCode(d.plant);
                        }
                    }, {
                        title: '进价（积分）',
                        field: "inPrice",
                        width: 150,
                    }, {
                        title: '售价（元）',
                        field: "outPrice",
                        width: 150,
                        templet: function (d) {
                            return core.fenToYuan(d.outPrice);
                        }
                    }, {
                        title: '有无关键词',
                        field: "hasKeyword",
                        width: 150,
                        templet: function (d) {
                            return d.hasKeyword === 1 ? '有' : '无';
                        }
                    }, {
                        title: '类型',
                        field: "isPc",
                        width: 150,
                        templet: function (d) {
                            return d.isPc === 1 ? 'PC' : 'APP';
                        }
                    }, {
                        title: '列流码',
                        width: 150,
                        field: "lieliuCode"
                    }, {
                        title: '创建时间',
                        field: "createdDate",
                        width: 200,
                        templet: function (d) {
                            return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
                        }
                    }, {
                        title: '最后修改时间',
                        field: "updateDate",
                        width: 200,
                        templet: function (d) {
                            return d.updateDate ? util.toDateString(d.updateDate, 'yyyy-MM-dd HH:mm') : '';
                        }
                    }, {
                        title: '状态',
                        field: 'status',
                        width: 150,
                        fixed: 'right',
                        templet: function (d) {
                            return d.status === 1 ? '启用' : '<span class="layui-text-pink">停用</span>';
                        }
                    }
                ]
            ],
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
                if (res.data.length) {
                    $('.layui-table-fixed-r').removeClass('layui-hide');
                }
            }
        });
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
     * @param {Object} kbNumberInfo 空包单号信息对象
     */
    function validKbNumberInfo(kbNumberInfo) {
        if (!kbNumberInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }

        if (!kbNumberInfo.plant) {
            return {
                isPass: false,
                msg: '电商平台不能为空'
            }
        }

        if (!kbNumberInfo.company) {
            return {
                isPass: false,
                msg: '快递平台不能为空'
            }
        }

        if (!kbNumberInfo.number) {
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
        if (!kbTypeInfo.code) {
            return {
                isPass: false,
                msg: '简称不能为空'
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
        if (!taskTypeInfo.hasKeyword) {
            return {
                isPass: false,
                msg: '请选择是否有关键词'
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

    /**
     *获取快递类型列表
     *
     * @param {*}  平台
     */
    function getKbTypeServer(plant, callback) {
        $.get('/api/readKbType?status=1&plant=' + plant, function (res) {
            renderKbType(res.data.rows);
            callback && callback();
        }, 'json');
    }

    /**
     *渲染快递列表
     *
     * @param {*} kbTypes
     */
    function renderKbType(kbTypes) {
        var $container = $('select[name=company]');
        $container.empty();
        $container.append(`<option value="">请选择快递类型</option>`);
        $.each(kbTypes, function (index, item) {
            $container.append(`<option value="${item.code}" data-price="${item.price}" data-plant="${item.plant}">${item.name}</option>`);
        });
        form.render('select');
    }

    /**
     *渲染空包库存(使用)
     *
     * @param {*} data
     * @param {*} status
     */
    function renderKbNumberStock(data, $container) {
        var tpl = `<table class="layui-table">
                        <thead>
                        <tr>
                            <th>快递公司</th>
                            <th>总数</th>
                            <th>已使用</th>
                            <th>剩余</th>
                        </tr> 
                    </thead>
                    <tbody>
                    `;
        if (!data.length) {
            tpl += `<tr><td colspan="4">无数据</tr>`;
        }
        $.each(data, function (index, d) {
            tpl += `<tr><td>${core.getKbTypeByCode(d.company)}</td><td>${d.total}</td><td>${d.used}</td><td><span class="layui-text-pink">${d.remain}</span></td></tr>`;
        });
        tpl += `</tbody></table>`;
        $container.html(tpl);
    }

    /**
     * 读取空包库存
     *
     * @param {*} plant
     * @param {*} status
     */
    function readKbNumberStock(plant, $container) {
        $.get('/api/readKbNumberStock', {
            plant: plant
        }, function (res) {
            renderKbNumberStock(res.data.rows, $container);
        }, 'json');
    }
});