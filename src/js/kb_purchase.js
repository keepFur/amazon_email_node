"use strict";
layui.use(['form', 'element', 'table', 'layer', 'util', 'upload'], function () {
    var form = layui.form;
    var table = layui.table;
    var layer = layui.layer;
    var util = layui.util;
    var upload = layui.upload;
    var baseDatas = {
        netErrMsg: '系统已退出登录，请登录系统重试',
        operatorErrMsg: {
            single: '请选择一条数据操作',
            batch: '请至少选择一条数据操作'
        },
        level: 1,
        plant: 'TB',
        kbTypeInfo: null
    };
    var pca = {
        p: '',
        c: '',
        a: '',
        pT: '',
        cT: '',
        aT: ''
    }; // 省市区
    var userInfo = {};

    (function init() {
        form.render('select');
        form.render('radio');
        getAddressFromServer();
        renderTable();
        initEvents();
        core.getUserInfoById(function (user) {
            userInfo = user.data.rows[0];
            baseDatas.level = userInfo.level;
            getKbTypeServer('TB');
            $('#userName').data('user', JSON.stringify(user));
            $('#userBalance').text(core.fenToYuan(userInfo.money));
            $('#userLevel').html(core.getLevelText(userInfo.level));
            $('#discountKbSumMoneyText,#discountKbPriceText').toggle(userInfo.level !== 1);
        });
        initUpload();
    })();

    /**
     * 初始化文件上传组件
     *
     */
    function initUpload() {
        function format(a) {
            return a.map(function (item) {
                return item.name + '，' + item.phone + '，' + item.province + ' ' + item.city + ' ' + item.area + ' ' + item.detail + '，' + item.email;
            });
        }
        upload.render({
            elem: '#importAddressExcelBtn',
            url: '/api/importAddressExcel',
            done: function (res) {
                if (res.success) {
                    layer.msg('数据解析成功！！');
                    $('textarea[name=addressTo]').val(format(res.data).join('\n'));
                } else {
                    layer.msg('数据解析失败：' + res.message);
                }
                layer.closeAll('loading');
            },
            before: function (obj) {
                layer.load();
            },
            data: {
                plant: function () {
                    return baseDatas.plant;
                }
            },
            size: 2048,
            accept: 'file',
            exts: 'xls|xlsx|csv',
            error: function (err) {
                layer.closeAll('loading');
                layer.msg('数据解析失败:服务器异常！！！');
            }
        });
    }

    // 事件初始化
    function initEvents() {
        // 电商平台的切换
        form.on('radio', function (data) {
            renderKbType(getKbTypeClient(data.value))
            var p = data.value === 'PDD' ? `格式：姓名，手机，省（空格）市（空格）县区（空格）详细地址，订单流水号 
例如：张三，13688888888 ，广东省 深圳市 罗湖区 深南大道102号，20150831-070478496
严格按上面的格式来  三个逗号，三个空格，一个都不要少，也不能多
一行一个地址
PS：提交订单之前最好先点击下面的【检查地址格式】按钮来检查地址格式是否正确，系统会将不符合格式的地址进行提示，不强制检查。` : data.value === 'PDDDZ' ? `格式：姓名，手机，省（空格）市（空格）县区（空格）详细地址，快递单号 
例如：张三，13688888888 ，广东省 深圳市 罗湖区 深南大道102号，2015083113213123
严格按上面的格式来  三个逗号，三个空格，一个都不要少，也不能多
一行一个地址
PS：提交订单之前最好先点击下面的【检查地址格式】按钮来检查地址格式是否正确，系统会将不符合格式的地址进行提示，不强制检查。` : `格式：姓名，手机，省（空格）市（空格）县区（空格）详细地址，邮编 
例如：张三，13688888888 ，广东省 深圳市 罗湖区 深南大道102号，518000 
严格按上面的格式来  三个逗号，三个空格，一个都不要少，也不能多
一行一个地址
PS：提交订单之前最好先点击下面的【检查地址格式】按钮来检查地址格式是否正确，系统会将不符合格式的地址进行提示，不强制检查。`;
            $('#addressFormat').val(p);
            baseDatas.plant = data.value;
            // 将注意事项隐藏
            $('#bbDetailContainer').addClass('layui-hide');
            $('#description').text('');
        });
        // 快递类型的选择
        form.on('select(kbCompany)', function (data) {
            if (data.value) {
                var $selected = $(data.elem).find('option[value=' + data.value + ']')
                var price = $selected.data('price');
                var plant = $selected.data('plant');
                var desc = $selected.data('desc');
                // 将选中的任务保存到基础数据中，后期的数据源只来源于此（唯一数据源）
                baseDatas.kbTypeInfo = {
                    price: price,
                    plant: plant,
                    code: data.value
                };
                // 单价
                $('#kbPrice').text(core.fenToYuan(price));
                // 优惠单价
                $('#discountKbPrice').text(core.fenToYuan(core.computeTotalPrice(baseDatas.level, price)));
                // 数量
                var quantity = getKbAddressTo().length;
                var sumMoney = quantity && baseDatas.kbTypeInfo ? quantity * baseDatas.kbTypeInfo.price : 0;
                $('#kbQuantity').text(quantity);
                // 总价
                $('#kbSumMoney').text(core.fenToYuan(sumMoney));
                // 优惠总价
                $('#discountKbSumMoney').text(core.fenToYuan(core.computeTotalPrice(baseDatas.level, baseDatas.kbTypeInfo ? quantity * baseDatas.kbTypeInfo.price : 0) * quantity));
                // 将注意事项显示出来
                $('#bbDetailContainer').removeClass('layui-hide');
                $('#description').text(desc);
            } else {
                baseDatas.kbTypeInfo = null;
                // 将注意事项隐藏
                $('#bbDetailContainer').addClass('layui-hide');
                $('#description').text('');
            }
        });
        // 收货地址输入框的onblur事件
        $('textarea[name=addressTo]').on('blur', function (e) {
            // 数量
            var quantity = getKbAddressTo().length;
            var sumMoney = quantity && baseDatas.kbTypeInfo ? quantity * baseDatas.kbTypeInfo.price : 0;
            $('#kbQuantity').text(quantity);
            // 总价
            $('#kbSumMoney').text(core.fenToYuan(sumMoney));
            // 优惠总价
            $('#discountKbSumMoney').text(core.fenToYuan(core.computeTotalPrice(baseDatas.level, baseDatas.kbTypeInfo ? baseDatas.kbTypeInfo.price : 0) * quantity));
            return false;
        });
        // 通过excel导入收货地址
        $('#importAddressExcelBtn').on('click', importAddressExcelHandle);
        // 下载收货地址模版
        $('#downloadTemplateBtn').on('click', downloadTemplateHandle);
        // 格式化地址
        $('#formatAddressBtn').on('click', formatAddressHandle);
        // 过滤真实订单
        $('#getRealOrderBtn').on('click', getRealOrderHandle);
        // 提交订单
        $('#createKbOrderBtn').on('click', createKbOrderHandle);
        // 创建发货地址
        $('.js-create-bb-address').on('click', createKbAddressHandle);
        // 修改发货地址
        $('#updateKbAddressBtn').on('click', updateKbAddressHandle);
        // 设置为默认地址
        $('#setDefaultKbAddressBtn').on('click', setDefaultKbAddressHandle);
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
     *通过excel导入收货地址
     *
     * @param {*} e
     * @returns
     */
    function importAddressExcelHandle(e) {
        return false;
    }

    /**
     * 下载模版
     *
     * @param {*} e
     * @returns
     */
    function downloadTemplateHandle(e) {
        var aLink = document.createElement('a');
        aLink.href = '/api/downloadTemplate?plant=' + baseDatas.plant;
        aLink.click();
        return false;
    }

    /**
     *格式化收货地址
     *
     * @param {*} e
     * @returns
     */
    function formatAddressHandle(e) {
        var addressTo = $('textarea[name=addressTo]').val();
        if (!addressTo) {
            layer.msg('请先填写收货地址信息');
            return false;
        }
        var addressTos = addressTo.split(/\n{1,}/g);
        var badIndex = [];
        var ret = addressTos.map(function (item) {
            return $.trim(item);
        }).filter(function (item, index) {
            if (item.split(/，|,/).length === 4 && item.split(/，|,/)[2].split(/\s{1,}/g).length === 4) {
                return true;
            }
            badIndex.push('<span class="layui-text-pink">第' + (index + 1) + '个</span>(' + item + ')； <br>');
            return false;
        });
        var formatText = $('#addressFormat').val();
        layer.open({
            content: `<span class="layui-text-pink">正确格式：姓名，手机，省（空格）市（空格）县区（空格）详细地址，邮编或快递单号或订单号</span><br>总共收货地址<span class="layui-text-pink">${addressTos.length}个</span>，其中有效收货地址<span class="layui-text-pink">${ret.length}个</span>，无效收货地址<span class="layui-text-pink">${addressTos.length - ret.length}个</span>${badIndex.length ? `。<br>无效地址分别是在：<br>${badIndex.join('')}<span class="layui-text-pink">烦请修改后提交订单，谢谢！</span>` : '，非常好！！！'}<br>`,
            title: '检查地址格式',
            btn: ['确定'],
            area: ['660px', '500px'],
            html: true,
            scrollbar: false,
        });
        return false;
    }

    /**
     *
     * 过滤真实订单
     * @param {*} e
     * @returns
     */
    function getRealOrderHandle(e) {
        var addressTo = $('textarea[name=addressTo]').val();
        if (!addressTo) {
            layer.msg('请先填写收货地址信息');
            return false;
        }
        layer.open({
            content: `<form class="layui-form layui-form-pane" name="getRealOrderForm">
                            <div class="layui-form-item">
                                <div class="layui-form-item layui-form-text">
                                    <label class="layui-form-label">刷单订单的收件人姓名</label>
                                    <div class="layui-input-block">
                                        <textarea class="layui-textarea" placeholder="输入刷单订单的收件人姓名,一行一个，请严格按照此格式填写" name="condition"></textarea>
                                    </div>
                                </div>
                            </div>
                        </form>`,
            title: '过滤真实订单',
            btn: ['确定', '取消'],
            area: ['450px'],
            scrollbar: false,
            yes: function (index) {
                var condition = $('textarea[name=condition]').val();
                var cs = condition.split(/\n{1,}/g);
                var addressTos = addressTo.split(/\n{1,}/g);
                var ret = [];
                if (condition) {
                    layer.msg('过滤成功');
                    layer.close(index);
                    ret = addressTos.filter(function (item) {
                        return cs.indexOf(item.split(/，|,/)[0]) !== -1;
                    });
                    $('textarea[name=addressTo]').val(ret.join('\n'));
                    // 过滤之后需要更新数量
                    $('textarea[name=addressTo]').trigger('blur');
                } else {
                    layer.msg('过滤条件不能为空');
                }
            }
        });
        return false;
    }


    /**
     *创建空包订单
     *
     * @param {*} e
     * @returns
     */
    function createKbOrderHandle(e) {
        var kbOrderInfo = core.getFormValues($('form[name=kbOrderForm]'));
        var validKbOrderInfoResult = validKbOrderInfo(kbOrderInfo);
        var ele = e.target;
        if (validKbOrderInfoResult.isPass) {
            kbOrderInfo.number = APIUtil.generateOrderNumer();
            kbOrderInfo.addressTo = kbOrderInfo.addressTo.split(/\n/g).filter(function (item) {
                return !!item;
            }).map(function (k) {
                return $.trim(k);
            });
            kbOrderInfo.addressToPca = getKbAddressToPca();
            kbOrderInfo.addressFromPca = kbOrderInfo.addressFrom.split(/\s/g)[0];
            kbOrderInfo.total = baseDatas.kbTypeInfo.price * kbOrderInfo.addressTo.length;
            kbOrderInfo.price = baseDatas.kbTypeInfo.price;
            // 张三，13688888888 ，广东省 深圳市 罗湖区 深南大道102号，518000
            // 拼多多电子面单的
            $.ajax({
                url: baseDatas.plant == 'PDDDZ' ? '/api/createPDDDZKbOrder' : '/api/createKbOrder',
                type: 'POST',
                data: kbOrderInfo,
                beforeSend: function () {
                    $.lockedBtn($(ele), true, '提交中');
                },
                success: function (data, textStatus, jqXHR) {
                    layer.msg(data.success ? ('操作成功') : ('操作失败：' + data.message));
                    if (data.success) {
                        core.setWindowHash('manage_kb_order?kbType=' + baseDatas.plant);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    layer.msg(baseDatas.errorMsg);
                },
                complete: function () {
                    $.unlockBtn($(ele), '<i class="layui-icon layui-icon-release"></i>提交订单');
                }
            });
        } else {
            layer.msg(validKbOrderInfoResult.msg);
        }
        return false;
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
                                <div class="layui-form-item">
                                    <div class="layui-input-inline">
                                        <select name="pCode" lay-filter="province">
                                        <option value="">请选择省份</option>
                                        </select>
                                    </div>
                                    <div class="layui-input-inline">
                                        <select name="cCode" lay-filter="city">
                                        <option value="">请选择城市</option>
                                        </select>
                                    </div>
                                    <div class="layui-input-inline">
                                        <select name="aCode" lay-filter="area">
                                        <option value="">请选择区域</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="layui-form-item layui-form-text">
                                    <label class="layui-form-label">详细地址</label>
                                    <div class="layui-input-block">
                                        <input class="layui-input" placeholder="此处不需要填省市区了"  name="detail"/>
                                    </div>
                                </div>
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
                                    <label class="layui-form-label">备注</label>
                                    <div class="layui-input-block">
                                        <input type="text" name="remark"  class="layui-input">
                                    </div>
                                </div>
                            </div>
                        </form>`,
            title: '创建收货地址',
            btn: ['创建', '取消'],
            area: ['660px'],
            yes: function (index, layero) {
                var kbAddressInfo = core.getFormValues($('form[name=kbAddressCreateForm]'));
                var validKbAddressInfoResult = validKbAddressInfo(kbAddressInfo);
                var $ele = layero.find('.layui-layer-btn0');
                //  省市区
                kbAddressInfo.pca = pca.pT + '-' + pca.cT + '-' + pca.aT;
                if (validKbAddressInfoResult.isPass) {
                    $.ajax({
                        url: '/api/createKbAddress',
                        type: 'POST',
                        data: kbAddressInfo,
                        beforeSend: function () {
                            $.lockedBtn($ele, true, '创建中');
                        },
                        success: function (data, textStatus, jqXHR) {
                            layer.msg(data.success ? ('操作成功') : ('操作失败'));
                            layer.close(index);
                            reloadTable();
                            getAddressFromServer();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        },
                        complete: function () {
                            $.unlockBtn($ele, '<i class="layui-icon layui-icon-release"></i>创建');
                        }
                    });
                } else {
                    layer.msg(validKbAddressInfoResult.msg);
                }
            },
            success: function () {
                getProvince();
                // 监听省份下拉框的事件
                form.on('select(province)', function (data) {
                    getCityByCode(data.value);
                    pca.p = data.value;
                    pca.pT = $(data.elem).find('option[value=' + data.value + ']').data('name')
                    pca.c = '';
                    pca.cT = ''
                    pca.a = '';
                    pca.aT = ''
                    renderPCASelect([], $('select[name=aCode]'), 'area');
                });
                // 监听城市下拉框的事件
                form.on('select(city)', function (data) {
                    getAreaByCode(pca.p, data.value);
                    pca.c = data.value;
                    pca.cT = $(data.elem).find('option[value=' + data.value + ']').data('name')
                    pca.a = '';
                });
                // 监听区域下拉框的事件
                form.on('select(area)', function (data) {
                    pca.a = data.value;
                    pca.aT = $(data.elem).find('option[value=' + data.value + ']').data('name');
                });
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
            var pCode = selectDatas[0].pCode;
            var cCode = selectDatas[0].cCode;
            var aCode = selectDatas[0].aCode;
            layer.open({
                content: `<form class="layui-form layui-form-pane" name="kbAddressUpdateForm" lay-filter="kbAddressUpdateForm">
                            <div class="layui-form-item">
                                <div class="layui-form-item">
                                    <div class="layui-input-inline">
                                        <select name="pCode" lay-filter="province">
                                        <option value="">请选择省份</option>
                                        </select>
                                    </div>
                                    <div class="layui-input-inline">
                                        <select name="cCode" lay-filter="city">
                                        <option value="">请选择城市</option>
                                        </select>
                                    </div>
                                    <div class="layui-input-inline">
                                        <select name="aCode" lay-filter="area">
                                        <option value="">请选择区域</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="layui-form-item layui-form-text">
                                    <label class="layui-form-label">详细地址</label>
                                    <div class="layui-input-block">
                                        <input class="layui-input" placeholder="此处不需要填省市区了" value="${detail}" name="detail"/>
                                    </div>
                                </div>
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
                                    <label class="layui-form-label">备注</label>
                                    <div class="layui-input-block">
                                        <input type="text" name="remark" value="${remark}" class="layui-input">
                                    </div>
                                </div>
                            </div>
                        </form>`,
                title: '收货地址信息修改',
                btn: ['确定', '取消'],
                area: ['660px'],
                yes: function (index) {
                    var kbAddressInfo = core.getFormValues($('form[name=kbAddressUpdateForm]'));
                    var validKbAddressInfoResult = validKbAddressInfo(kbAddressInfo);
                    kbAddressInfo.id = selectDatas[0].id;
                    // 省市区
                    kbAddressInfo.pca = pca.pT + '-' + pca.cT + '-' + pca.aT;
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
                    getProvince(function () {
                        form.val('kbAddressUpdateForm', {
                            pCode: pCode
                        });
                    });
                    getCityByCode(pCode, function () {
                        form.val('kbAddressUpdateForm', {
                            cCode: cCode
                        });
                    });
                    getAreaByCode(pCode, cCode, function () {
                        form.val('kbAddressUpdateForm', {
                            aCode: aCode
                        });
                    });
                    // 监听省份下拉框的事件
                    form.on('select(province)', function (data) {
                        getCityByCode(data.value);
                        pca.p = data.value;
                        pca.pT = $(data.elem).find('option[value=' + data.value + ']').data('name')
                        pca.c = '';
                        pca.cT = ''
                        pca.a = '';
                        pca.aT = ''
                        renderPCASelect([], $('select[name=aCode]'), 'area');
                    });
                    // 监听城市下拉框的事件
                    form.on('select(city)', function (data) {
                        getAreaByCode(pca.p, data.value);
                        pca.c = data.value;
                        pca.cT = $(data.elem).find('option[value=' + data.value + ']').data('name')
                        pca.a = '';
                    });
                    // 监听区域下拉框的事件
                    form.on('select(area)', function (data) {
                        pca.a = data.value;
                        pca.aT = $(data.elem).find('option[value=' + data.value + ']').data('name')
                    });
                }
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     *设置为默认地址
     *
     * @param {*} e
     */
    function setDefaultKbAddressHandle(e) {
        var selectDatas = table.checkStatus('kbAddressTable').data;
        if (selectDatas.length === 1) {
            if (selectDatas[0].isDefault === 1) {
                layer.msg('该地址已经是默认的了');
                return false;
            }
            layer.confirm('确定设置为默认发货地址吗？', {
                btn: ['确定', '取消'],
                title: "询问框",
            }, function () {
                $.ajax({
                    url: '/api/setDefaultKbAddress',
                    type: 'POST',
                    data: {
                        id: selectDatas[0].id,
                    },
                    success: function (data, textStatus, jqXHR) {
                        layer.msg(data.success ? '操作成功' : ('操作失败' + data.message));
                        reloadTable();
                        getAddressFromServer();
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
     * 切换收货地址状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleKbAddressHandle(events) {
        var selectDatas = table.checkStatus('kbAddressTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            // 禁用状态下，如果是默认地址，不允许禁用
            if (type === 0 && selectDatas[0].isDefault) {
                layer.msg('当前地址是默认地址，不允许禁用，请先取消默认地址在进行操作！！！');
                return false;
            }
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
                        getAddressFromServer();
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
            cols: [
                [{
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
                    field: "detail",
                    templet: function (d) {
                        return d.pca + d.detail;
                    }
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
                    title: '是否默认',
                    field: '',
                    templet: function (d) {
                        return d.isDefault === 1 ? '<span class="layui-text-pink">是</span>' : '否';
                    }
                },
                {
                    title: '状态',
                    field: 'status',
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
            }
        });
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

        if (!kbAddressInfo.pCode) {
            return {
                isPass: false,
                msg: '请选择省份'
            }
        }
        if (!kbAddressInfo.cCode) {
            return {
                isPass: false,
                msg: '请选择城市'
            }
        }
        if (!kbAddressInfo.aCode) {
            return {
                isPass: false,
                msg: '请选择区域'
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
     * 校验空包订单信息
     * 
     * @param {Object} kbOrderInfo 收货地址信息对象
     */
    function validKbOrderInfo(kbOrderInfo) {
        if (!kbOrderInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }
        // 判断用户的余额
        if (userInfo.money <= 0 || userInfo.money < core.computeTotalPrice(baseDatas.level, kbOrderInfo.total)) {
            return {
                isPass: false,
                msg: '主人，您的余额不足，请先充值，谢谢！！！'
            };
        }
        if (!kbOrderInfo.kbCompany) {
            return {
                isPass: false,
                msg: '请选择快递类型'
            }
        }
        if (!kbOrderInfo.addressFrom) {
            return {
                isPass: false,
                msg: '请选择发货地址'
            }
        }
        if (!kbOrderInfo.addressTo) {
            return {
                isPass: false,
                msg: '请输入收货地址'
            }
        }
        var addressTos = kbOrderInfo.addressTo.split(/\n{1,}/g);
        var ret = addressTos.map(function (item) {
            return $.trim(item);
        }).filter(function (item) {
            if (item.split(/，|,/).length === 4 && item.split(/，|,/)[2].split(/\s{1,}/g).length === 4) {
                return true;
            }
            return false;
        });
        if (!ret.length) {
            return {
                isPass: false,
                msg: '请输入正确格式的收货地址'
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
        // 一次性把所有的快递拉过来，然后存储在客户端localStorege
        $.get('/api/readKbType?status=1', function (res) {
            localStorage.setItem('getKbTypeClient', JSON.stringify(res.data.rows))
            renderKbType(getKbTypeClient(plant))
        }, 'json');
    }

    /**
    *获取快递类型列表
    *
    * @param {*}  平台
    */
    function getKbTypeClient(plant) {
        var kbTypes = [];
        try {
            kbTypes = JSON.parse(localStorage.getItem('getKbTypeClient'))
        } catch (error) {
            kbTypes = []
        }
        return kbTypes.filter(item => item.plant === plant)
    }

    /**
     *渲染快递列表
     *
     * @param {*} kbTypes
     */
    function renderKbType(kbTypes) {
        var $container = $('select[name=kbCompany]');
        $container.empty();
        $container.append(`<option value="">请选择快递类型</option>`);
        $.each(kbTypes, function (index, item) {
            // 当前
            var curP = core.fenToYuan(core.computeTotalPrice(baseDatas.level, item.price));
            // 普通
            var comP = core.fenToYuan(core.computeTotalPrice(1, item.price));
            // 金牌
            var goldP = core.fenToYuan(core.computeTotalPrice(2, item.price));
            // 等级
            var levelText = ['', '普通会员', '金牌会员', '内部会员'][baseDatas.level];
            $container.append(`<option value="${item.code}" data-price="${item.price}" data-plant="${item.plant}" data-desc="${item.description}">${item.name} ，你的价格（${levelText}）：${curP}元，普通会员：${comP}元，金牌会员：${goldP}元</option>`);
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
            $container.append(`<option value="${item.pca} ${item.detail}" ${item.isDefault ? 'selected' : ''}>${item.pca} ${item.detail} ${item.contact} ${item.phone} ${item.email}${item.isDefault ? '    【默认地址】' : ''}</option>`);
        });
        form.render('select');
    }

    /**
     *获取收货地址的数量
     *
     */
    function getKbAddressTo() {
        var s = [];
        try {
            s = $('textarea[name=addressTo]').val().split('\n').filter(function (item) {
                return !!item;
            });
        } catch (error) {
            s = [];
        }
        return s;
    }

    /**
     * 获取收货地址中的省市区
     *
     */
    function getKbAddressToPca() {
        var s = [];
        try {
            s = $('textarea[name=addressTo]').val().split('\n').filter(function (item) {
                return !!item;
            }).map(function (m) {
                var add = m.split(/,|，/)[2];
                var detail = add.split(' ');
                return detail[0] + '-' + detail[1] + '-' + detail[2];
            });
        } catch (error) {
            s = [];
        }
        return s;
    }

    /**
     * 渲染省下拉框
     *
     */
    function renderPCASelect(data, $select, type) {
        var typeObj = {
            province: '省份',
            city: '城市',
            area: '区域'
        };
        $select.empty();
        $select.append(`<option value="">请选择${typeObj[type]}</option>`);
        $.each(data, function (index, item) {
            $select.append(`<option value="${item.code}" data-name="${item.name}">${item.name}</option>`);
        });
        form.render('select');
    }

    /**
     *获取所有的省份
     *
     */
    function getProvince(callback) {
        $.get('/api/getProvince', function (res) {
            renderPCASelect(res.rows, $('select[name=pCode]'), 'province');
            callback && callback();
        }, 'json');
    }

    /**
     * 根据省份code获取城市的数据
     *
     * @param {*} code
     */
    function getCityByCode(code, callback) {
        $.get('/api/getCityByCode', {
            code: code
        }, function (res) {
            renderPCASelect(res.rows, $('select[name=cCode]'), 'city');
            callback && callback();
        }, 'json');
    }

    /**
     *根据城市的code获取市区数据
     *
     * @param {*} pCode 省份code
     * @param {*} cCode 城市code
     */
    function getAreaByCode(pCode, cCode, callback) {
        $.get('/api/getAreaByCode', {
            pCode: pCode,
            cCode: cCode
        }, function (res) {
            renderPCASelect(res.rows, $('select[name=aCode]'), 'area');
            callback && callback();
        }, 'json');
    }
});