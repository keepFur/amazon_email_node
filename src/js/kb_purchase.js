"use strict";
layui.use(['form', 'element', 'table', 'layer', 'util'], function () {
    var form = layui.form;
    var table = layui.table;
    var layer = layui.layer;
    var util = layui.util;
    var baseDatas = {
        netErrMsg: '系统已退出登录，请登录系统重试',
        operatorErrMsg: {
            single: '请选择一条数据操作',
            batch: '请至少选择一条数据操作'
        }
    };
    (function init() {
        form.render('select');
        form.render('radio');
        getKbTypeServer('TB');
        getAddressFromServer();
        renderTable();
        initEvents();
    })();

    // 事件初始化
    function initEvents() {
        // 电商平台的切换
        form.on('radio', function (data) {
            getKbTypeServer(data.value);
        });
        // 创建发货地址
        $('.js-create-bb-address').on('click', createKbAddressHandle);
        // 修改发货地址
        $('#updateKbAddressBtn').on('click', updateKbAddressHandle);
        // 禁用发货地址
        $('#disabledKbAddressBtn').on('click', {
            type: 0
        }, toggleKbAddressHandle);
        // 启用发货地址
        $('#enabledKbAddressBtn').on('click', {
            type: 1
        }, toggleKbAddressHandle);
    }

    /**
     * 创建收货地址的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createKbAddressHandle(events) {
        layer.open({
            content: `<form class="layui-form layui-form-pane" name="kbAddressCreateForm">
                            <div class="layui-form-item">
                                <div class="layui-form-item layui-form-text">
                                    <label class="layui-form-label">寄件人</label>
                                    <div class="layui-input-block">
                                        <input class="layui-input"  name="contact"/>
                                    </div>
                                </div>
                                <div class="layui-form-item layui-form-text">
                                    <label class="layui-form-label">手机号</label>
                                    <div class="layui-input-block">
                                        <input class="layui-input"  name="phone"/> 
                                    </div>
                                </div>
                                <div class="layui-form-item layui-form-text">
                                    <label class="layui-form-label">邮编</label>
                                    <div class="layui-input-block">
                                        <input class="layui-input"  name="email"/> 
                                    </div>
                                </div>
                                <div class="layui-form-item layui-form-text">
                                    <label class="layui-form-label">地址</label>
                                    <div class="layui-input-block">
                                        <textarea class="layui-textarea"  name="detail"></textarea>
                                    </div>
                                </div>
                                <div class="layui-form-item layui-form-text">
                                    <label class="layui-form-label">备注</label>
                                    <div class="layui-input-block">
                                        <input type="text" name="remark"  class="layui-input">
                                    </div>
                                </div>
                            </div>
                        </form>`,
            title: '创建收货地址',
            btn: ['创建', '取消'],
            area: ['400px'],
            yes: function (index) {
                var kbAddressInfo = core.getFormValues($('form[name=kbAddressCreateForm]'));
                var validKbAddressInfoResult = validKbAddressInfo(kbAddressInfo);
                if (validKbAddressInfoResult.isPass) {
                    $.ajax({
                        url: '/api/createKbAddress',
                        type: 'POST',
                        data: kbAddressInfo,
                        success: function (data, textStatus, jqXHR) {
                            layer.msg(data.success ? ('操作成功') : ('操作失败'));
                            layer.close(index);
                            reloadTable();
                            getAddressFromServer();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        }
                    });
                } else {
                    layer.msg(validKbAddressInfoResult.msg);
                }
            }
        });
        return false;
    }

    /**
     * 收货地址信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updateKbAddressHandle(events) {
        var selectDatas = table.checkStatus('kbAddressTable').data;
        if (selectDatas.length === 1) {
            var contact = selectDatas[0].contact;
            var phone = selectDatas[0].phone;
            var detail = selectDatas[0].detail;
            var remark = selectDatas[0].remark;
            var email = selectDatas[0].email;
            layer.open({
                content: `<form class="layui-form layui-form-pane" name="kbAddressUpdateForm" lay-filter="kbAddressUpdateForm">
                            <div class="layui-form-item">
                                <div class="layui-form-item layui-form-text">
                                    <label class="layui-form-label">寄件人</label>
                                    <div class="layui-input-block">
                                        <input class="layui-input" value="${contact}" name="contact" />
                                    </div>
                                </div>
                                <div class="layui-form-item layui-form-text">
                                    <label class="layui-form-label">手机号</label>
                                    <div class="layui-input-block">
                                        <input class="layui-input" value="${phone}" name="phone"/>
                                    </div>
                                </div>
                                <div class="layui-form-item layui-form-text">
                                    <label class="layui-form-label">邮编</label>
                                    <div class="layui-input-block">
                                        <input class="layui-input" value="${email}" name="email"/>
                                    </div>
                                </div>
                                <div class="layui-form-item layui-form-text">
                                    <label class="layui-form-label">地址</label>
                                    <div class="layui-input-block">
                                        <textarea class="layui-textarea"  name="detail"></textarea>
                                    </div>
                                </div>
                                <div class="layui-form-item layui-form-text">
                                    <label class="layui-form-label">备注</label>
                                    <div class="layui-input-block">
                                        <input type="text" name="remark" value="${remark}" class="layui-input">
                                    </div>
                                </div>
                            </div>
                        </form>`,
                title: '收货地址信息修改',
                btn: ['确定', '取消'],
                area: ['400px'],
                yes: function (index) {
                    var kbAddressInfo = core.getFormValues($('form[name=kbAddressUpdateForm]'));
                    var validKbAddressInfoResult = validKbAddressInfo(kbAddressInfo);
                    kbAddressInfo.id = selectDatas[0].id;
                    if (validKbAddressInfoResult.isPass) {
                        $.ajax({
                            url: '/api/updateKbAddress',
                            type: 'POST',
                            data: kbAddressInfo,
                            success: function (data, textStatus, jqXHR) {
                                layer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                                layer.close(index);
                                reloadTable();
                                getAddressFromServer();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                layer.msg(baseDatas.errorMsg);
                            }
                        });
                    } else {
                        layer.msg(validKbAddressInfoResult.msg);
                    }
                },
                success: function () {
                    form.val('kbAddressUpdateForm', {
                        "detail": detail
                    });
                }
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 切换收货地址状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleKbAddressHandle(events) {
        var selectDatas = table.checkStatus('kbAddressTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                btn: ['确定', '取消'],
                title: "询问框",
            }, function () {
                $.ajax({
                    url: '/api/toggleKbAddress',
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
            elem: '#kbAddressTable',
            url: '/api/readKbAddress',
            cols: [[
                {
                    checkbox: true,
                },
                {
                    title: '寄件人',
                    field: "contact"
                }, {
                    title: '手机',
                    field: "phone"
                }, {
                    title: '地址',
                    field: "detail"
                }, {
                    title: '邮编',
                    field: "email"
                }, {
                    title: '备注',
                    field: "remark"
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
                setMountValue(res.data.length, res.data.length);
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
        $('#currentKbAddressMountSpan').text(currentTotal);
        $('#kbAddressMountSpan').text(total);
    }

    /**
     * 重载表格
     * 
     */
    function reloadTable(options) {
        table.reload('kbAddressTable', options);
    }

    /**
     * 校验收货地址信息
     * 
     * @param {Object} kbAddressInfo 收货地址信息对象
     */
    function validKbAddressInfo(kbAddressInfo) {
        if (!kbAddressInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }

        if (!kbAddressInfo.detail) {
            return {
                isPass: false,
                msg: '详细地址不能为空'
            }
        }
        if (!kbAddressInfo.contact) {
            return {
                isPass: false,
                msg: '联系人不能为空'
            }
        }
        if (!kbAddressInfo.phone) {
            return {
                isPass: false,
                msg: '手机号不能为空'
            }
        }
        if (!kbAddressInfo.email) {
            return {
                isPass: false,
                msg: '邮编不能为空'
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
    function getKbTypeServer(plant) {
        $.get('/api/readKbType?status=1&plant=' + plant, function (res) {
            renderKbType(res.data.rows);
        }, 'json');
    }



    /**
     *渲染快递列表
     *
     * @param {*} kbTypes
     */
    function renderKbType(kbTypes) {
        var $container = $('select[name=kbCompany]');
        $container.empty();
        $container.append(` <option value="">请选择快递类型</option>`);
        $.each(kbTypes, function (index, item) {
            $container.append(`<option value="${item.name}">${item.name}</option>`);
        });
        form.render('select');
    }

    /**
     * 获取发货地址列表
     *
     */
    function getAddressFromServer() {
        $.get('/api/readKbAddress?status=1', function (res) {
            renderAddressFrom(res.data.rows);
        }, 'json');
    }

    /**
     * 渲染用户发货地址列表
     *
     * @param {*} adds
     */
    function renderAddressFrom(adds) {
        var $container = $('select[name=addressFrom]');
        $container.empty();
        $container.append(` <option value="">请选择发货地址</option>`);
        $.each(adds, function (index, item) {
            $container.append(`<option value="${item.detail}">${item.detail}</option>`);
        });
        form.render('select');
    }

});