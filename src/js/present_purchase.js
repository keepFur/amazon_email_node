"use strict";
layui.use(['form', 'element', 'table', 'layer', 'util', 'upload'], function() {
            var form = layui.form;
            var table = layui.table;
            var layer = layui.layer;
            var util = layui.util;
            var element = layui.element;
            var upload = layui.upload;
            var baseDatas = {
                // 表格实例
                $table: null,
                level: 1,
                presentInfo: null,
                fromStockInfo: null,
                // 错误消息
                paramErrMsg: '参数错误，请刷新页面重试',
                netErrMsg: '系统已退出登录，请登录系统重试',
                operatorErrMsg: {
                    single: '请选择一条数据操作',
                    batch: '请至少选择一条数据操作'
                },
                prensentList: [],
                kdPrice: 310,
                plant: 'TB'
            };
            var userInfo = {};

            /**
             *页面入口函数 
             * 
             */
            (function init() {
                // 初始化事件
                initEvent();
                // 获取用户信息
                core.getUserInfoById(function(user) {
                    userInfo = user.data.rows[0];
                    baseDatas.level = userInfo.level;
                    // 获取礼品
                    readPresentListServer();
                    $('#userName').data('user', JSON.stringify(user));
                    $('#userBalance').text(core.fenToYuan(userInfo.money));
                    $('#userLevel').html(core.getLevelText(userInfo.level));
                    $('#discountKbSumMoneyText,#discountKbPriceText').toggle(userInfo.level !== 1);
                    // 读取发货人信息
                    readFromUserInfoById();
                });
                // 渲染发货仓库
                getPresentFromStockServer();
                // 初始化文件上传组件
                initUpload('#importTBAddressExcelBtn', 'TB');
                initUpload('#importPDDAddressExcelBtn', 'PDD');
                initUpload('#importJDAddressExcelBtn', 'JD');
            })();

            /**
             * 初始化文件上传组件
             *
             */
            function initUpload($ele, plant) {
                function format(a) {
                    return a.map(function(item) {
                        return item.name + '，' + item.phone + '，' + item.province + ' ' + item.city + ' ' + item.area + ' ' + item.detail + '，' + item.email;
                    });
                }
                upload.render({
                    elem: $ele,
                    url: '/api/importAddressExcel',
                    done: function(res) {
                        if (res.success) {
                            layer.msg('数据解析成功！！');
                            $('textarea[name=addressTo]').val(format(res.data).join('\n'));
                        } else {
                            layer.msg('数据解析失败：' + res.message);
                        }
                        layer.closeAll('loading');
                    },
                    before: function(obj) {
                        layer.load();
                        return false;
                    },
                    data: {
                        plant: plant
                    },
                    size: 2048,
                    accept: 'file',
                    exts: 'xls|xlsx|csv',
                    error: function(err) {
                        layer.closeAll('loading');
                        layer.msg('数据解析失败:服务器异常！！！');
                    }
                });
            }

            /**
             * 初始化事件函数
             * 
             */
            function initEvent() {
                // 保存礼品订单
                $('#createPresentOrderBtn').on('click', createPresentOrderHandler);
                // 收货地址输入框的onblur事件
                $('textarea[name=addressTo]').on('blur', function(e) {
                    // 数量
                    var quantity = getKbAddressTo().length;
                    var sumMoney = quantity && baseDatas.presentInfo ? quantity * (core.yuanToFen(baseDatas.presentInfo.price) + baseDatas.kdPrice) : 0;
                    $('#kbQuantity').text(quantity);
                    // 总价
                    $('#kbSumMoney').text(core.fenToYuan(sumMoney));
                    // 优惠总价 = 数量*单价（礼品价格+快递价格
                    var vipKdPrice = core.computeTotalPrice(baseDatas.level, baseDatas.kdPrice);
                    var lastPrice = baseDatas.presentInfo && quantity ? (core.fenToYuan(quantity * (core.yuanToFen(baseDatas.presentInfo.price) + vipKdPrice))) : 0;
                    $('#discountKbSumMoney').text(lastPrice);
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
                // 保存发货信息
                $('#saveSetPurchaseInfoBtn').on('click', saveSetPurchaseInfoHandler);
                // 监听tab切换事件
                element.on('tab(presentPurchase)', function() {
                    if (this.getAttribute('lay-id') === 'presentPurchase') {
                        renderPresentSelect(baseDatas.prensentList);
                    }
                });
                // 监听礼品下拉框的change事件
                form.on('select(present)', function(data) {
                    var $selected = $(data.elem).find('option[value=' + data.value + ']')
                    var price = $selected.data('price');
                    var name = $selected.data('name');
                    // 将选中的任务保存到基础数据中，后期的数据源只来源于此（唯一数据源）
                    baseDatas.presentInfo = {
                        price: price,
                        id: data.value,
                        name: name
                    };
                    // 单价
                    $('#kbPrice').text(core.fenToYuan(price));
                    // 优惠单价
                    $('#discountKbPrice').text(core.fenToYuan(core.computeTotalPrice(baseDatas.level, price)));
                });
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
                var ret = addressTos.map(function(item) {
                    return $.trim(item);
                }).filter(function(item, index) {
                    if (item.split(/，|,/).length === 4 && item.split(/，|,/)[2].split(/\s{1,}/g).length === 4) {
                        return true;
                    }
                    badIndex.push('<span class="layui-text-pink">第' + (index + 1) + '个</span>(' + item + ')； <br>');
                    return false;
                });
                layer.open({
                            content: `<span class="layui-text-pink">正确格式：姓名，手机，省（空格）市（空格）县区（空格）详细地址，邮编或快递单号或订单号</span><br>总共收货地址<span class="layui-text-pink">${addressTos.length}个</span>，其中有效收货地址<span class="layui-text-pink">${ret.length}个</span>，无效收货地址<span class="layui-text-pink">${addressTos.length - ret.length}个</span>${badIndex.length ? `。<br>无效地址分别是在：<br>${badIndex.join('')}<span class="layui-text-pink">烦请修改后提交订单，谢谢！</span>` : '，非常好！！！'}<br>`,
            title: '检查地址格式',
            btn: ['确定'],
            area: ['660px','500px'],
            html:true,
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
     * 保存订单事件处理函数
     * 
     * @param {any} e 
     */
    function createPresentOrderHandler(e) {
        var presentOrderInfo = core.getFormValues($('form[name=presentOrderForm]'));
        var validPresentOrderInfoResult = validPresentOrderInfo(presentOrderInfo);
        var ele = e.target;
        $.lockedBtn($(ele), true, '提交中');
        if (validPresentOrderInfoResult.isPass) {
            presentOrderInfo.addressTo = presentOrderInfo.addressTo.split(/\n/g).filter(function (item) {
                return !!item;
            }).map(function (k) {
                return $.trim(k);
            });
            presentOrderInfo.addressToPca = getKbAddressToPca();
            presentOrderInfo.addressFromName = baseDatas.fromStockInfo.fromName;
            presentOrderInfo.addressFromPhone = baseDatas.fromStockInfo.fromPhone;
            presentOrderInfo.total = (core.yuanToFen(baseDatas.presentInfo.price) + core.computeTotalPrice(baseDatas.level, baseDatas.kdPrice)) * presentOrderInfo.addressTo.length;
            presentOrderInfo.fromStockId = presentOrderInfo.presentStock;
            presentOrderInfo.pid = presentOrderInfo.present;
            presentOrderInfo.count = 1;
            presentOrderInfo.price = core.yuanToFen(baseDatas.presentInfo.price);
            // 循环调用
            for (let i = 0, length = presentOrderInfo.addressTo.length; i < length; i++) {
                (function (i) {
                    presentOrderInfo.orderNumber = APIUtil.generateOrderNumer();
                    var params = {
                        send_order_no: presentOrderInfo.orderNumber,
                        goodsid: presentOrderInfo.pid,
                        storesid: presentOrderInfo.presentStock,
                        num: 1,
                        receiver_name: presentOrderInfo.addressTo[i].split(/,|，/)[0],
                        receiver_phone: presentOrderInfo.addressTo[i].split(/,|，/)[1],
                        receiver_province: presentOrderInfo.addressToPca[i].split('-')[0],
                        receiver_city: presentOrderInfo.addressToPca[i].split('-')[1],
                        receiver_district: presentOrderInfo.addressToPca[i].split('-')[2],
                        receiver_address: presentOrderInfo.addressTo[i].split(/,|，/)[2].split(' ')[3],
                        sendname: presentOrderInfo.addressFromName,
                        sendphone: presentOrderInfo.addressFromPhone,
                    };
                    presentOrderInfo.addressToLocal = [presentOrderInfo.addressTo[i]];
                    presentOrderInfo.addressToPcaLocal = [presentOrderInfo.addressToPca[i]];
                    presentOrderInfo.addressToLocal = [presentOrderInfo.addressTo[i]]
                    params.presentOrderInfo = presentOrderInfo;
                    APIUtil.createPresentOrder(params, function (res, err) {
                        if (err || !res.success) {
                            layer.msg(baseDatas.netErrMsg);
                            $.unlockBtn($(ele), '<i class="layui-icon layui-icon-release"></i>提交订单');
                            return false;
                        }
                        if (length - 1 === i) {
                            layer.msg(res.success ? ('操作成功') : ('操作失败：' + baseDatas.netErrMsg));
                            $.unlockBtn($(ele), '<i class="layui-icon layui-icon-release"></i>提交订单');
                            core.setWindowHash('manage_present_order');
                        }
                    });
                })(i);
            }
        } else {
            layer.msg(validPresentOrderInfoResult.msg);
        }
        return false;
    }

    /**
     * 保存发货信息事件处理函数
     * 
     * @param {any} e 
     * @returns 
     */
    function saveSetPurchaseInfoHandler(e) {
        var fromName = $('input[name=fromName]').val().trim();
        var fromPhone = $('input[name=fromPhone]').val().trim();
        if (baseDatas.fromStockInfo && baseDatas.fromStockInfo.fromName === fromName && baseDatas.fromStockInfo.fromPhone === fromPhone) {
            layer.msg('信息没有发生改变');
            return false;
        }
        if (!fromName) {
            layer.msg('姓名不能为空');
            return false;
        }
        if (!fromPhone) {
            layer.msg('手机号或者座机号不能为空');
            return false;
        }
        var url = !baseDatas.fromStockInfo ? '/api/saveFromUserInfoById' : '/api/updateFromUserInfoById';
        $.ajax({
            url,
            type: 'post',
            data: {
                fromName,
                fromPhone,
                userId: userInfo.id
            },
            dataType: 'json',
            success: function (data) {
                if (data.success) {
                    layer.msg('操作成功');
                } else {
                    layer.msg('操作失败：' + data.message);
                }
            },
            error: function (err) {
                layer.msg('操作失败：' + baseDatas.netErrMsg);
            }
        });
        return false;
    }

    /**
     * 渲染礼品
     * 
     * @param {any} prensentList 
     */
    function renderPrensentList(prensentList) {
        var $container = $('.list-container .layui-row');
        var tpl = ``;
        for (var index = 0; index < prensentList.length; index++) {
            var present = prensentList[index];
            tpl += `<div class="layui-col-xs3 layui-col-md2 layui-col-lg2">
                                <div class="present-item" style="height:330px;" data-id="${present.id}" data-name="${present.name}" data-price="${present.apiprice}">
                                    <div class="present-item-body" style="height:260px;">
                                        <img src="./imgs/${present.id}.jpg" onerror="this.src='./imgs/nopic.jpg'" width="100%" height="100%" alt="礼品">
                                    </div>
                                    <div class="present-item-footer">
                                        <h5 style="margin-bottom:8px;">${present.name}</h5>
                                        <div class="layui-row layui-col-space8">
                                            <div class="layui-col-xs4">
                                                <span style="color:red"> ¥${present.apiprice}</span>
                                            </div>
                                            <div class="layui-col-xs4">
                                               
                                            </div>
                                            <div class="layui-col-xs4">
                                                <button class="layui-btn layui-btn-normal layui-btn-sm purchaseBtn">立即下单</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        </div>`;
            // <button class="layui-btn layui-btn-primary layui-btn-sm ${isCollect?'cancelCollectBtn':'addCollectBtn'}" data-iscollect="${isCollect}">${isCollect?'取消收藏':'加入收藏'}</button>
        }
        $container.html(tpl);
        // 收藏和取消收藏
        $('.addCollectBtn,.cancelCollectBtn').click(function (e) {
            layer.msg('功能正在开发中，尽情期待。。。。')
            return false;
        });
        // 立即下单
        $('.present-item').click(function (e) {
            // 跳转到购买叶签中去 带上id
            var $this = $(this);
            var id = $this.data('id');
            var price = $this.data('price');
            var name = $this.data('name');
            baseDatas.presentInfo = {
                id,
                name,
                price
            };
            element.tabChange('presentPurchase', 'presentPurchase');
            return false;
        });
    }


    /**
     * 渲染礼品 下拉框模式
     * 
     */
    function renderPresentSelect(presents) {
        var $container = $('select[name=present]');
        $container.empty();
        $container.append(`<option value="">请选择礼品</option>`);
        $.each(presents, function (index, item) {
            $container.append(`<option value="${item.id}" data-price="${item.apiprice}" data-name="${item.name}" ${baseDatas.presentInfo&&item.id==baseDatas.presentInfo.id?'selected':''}>礼品名称：${item.name}，价格：${item.apiprice}元</option>`);
        });
        // 当前
        var curP = core.fenToYuan(core.computeTotalPrice(baseDatas.level, baseDatas.kdPrice));
        // 普通
        var comP = core.fenToYuan(core.computeTotalPrice(1, baseDatas.kdPrice));
        // 金牌
        var goldP = core.fenToYuan(core.computeTotalPrice(2, baseDatas.kdPrice));
        // 等级
        var levelText = ['', '普通会员', '金牌会员', '内部会员'][baseDatas.level];
        $('#kdPrice').val(`你的价格（${levelText}）：${curP}元，普通会员：${comP}元，金牌会员：${goldP}元`).data('price', curP);
        form.render('select');
    }

    /**
     * 读取发货人信息
     * 
     */
    function readFromUserInfoById() {
        $.get('/api/readFromUserInfoById?userId=' + userInfo.id, function (data) {
            var url = '/api/saveFromUserInfoById';
            if (data.data.rows.length) {
                baseDatas.fromStockInfo = data.data.rows[0];
                $('input[name=fromName]').val(baseDatas.fromStockInfo.fromName);
                $('input[name=fromPhone]').val(baseDatas.fromStockInfo.fromPhone);
            }
        });
    }

    /**
     * 获取礼品列表，从服务端
     * 
     */
    function readPresentListServer() {
        APIUtil.readPresentList({}, function (res) {
            $('#nodataTip').toggle(res.code !== 1);
            if (res.code === 1) {
                baseDatas.prensentList = res.data.goodslist.map(function (item) {
                    return {
                        id: item.id,
                        name: item.name,
                        apiprice: core.fenToYuan(core.yuanToFen(item.apiprice) + 20)
                    };
                });
                renderPresentSelect(baseDatas.prensentList);
                renderPrensentList(baseDatas.prensentList);
            } else {
                layer.msg(baseDatas.netErrMsg);
            }
        });
    }

    /**
     *获取发货仓库
     *
     */
    function getPresentFromStockServer() {
        APIUtil.readFromStock({}, function (res) {
            if (res.code === 1) {
                renderFromStockSelect(res.data.storelist);
            } else {
                layer.msg(baseDatas.netErrMsg);
            }
        });
    }

    /**
     * 渲染礼品发货仓
     * 
     * @param {any} stock 
     */
    function renderFromStockSelect(stocks) {
        var $container = $('select[name=presentStock]');
        $container.empty();
        $container.append(`<option value="">请选择发货仓库</option>`);
        $.each(stocks, function (index, item) {
            $container.append(`<option value="${item.id}"} ${index==0?'selected':''}>${item.store_name}</option>`);
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
     * 校验空包订单信息
     * 
     * @param {Object} presentOrderInfo 收货地址信息对象
     */
    function validPresentOrderInfo(presentOrderInfo) {
        if (!presentOrderInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }
        // 判断用户是否设置了发货信息
        if (!baseDatas.fromStockInfo) {
            return {
                isPass: false,
                msg: '请先设置发货人信息'
            }
        }
        // 判断用户的余额
        if (userInfo.money <= 0 || userInfo.money < core.computeTotalPrice(baseDatas.level, presentOrderInfo.total)) {
            return {
                isPass: false,
                msg: '主人，您的余额不足，请先充值，谢谢！！！'
            };
        }
        if (!presentOrderInfo.present) {
            return {
                isPass: false,
                msg: '请选择需要购买的礼品'
            }
        }
        if (!presentOrderInfo.presentStock) {
            return {
                isPass: false,
                msg: '请选择发货仓库'
            }
        }
        if (!presentOrderInfo.addressTo) {
            return {
                isPass: false,
                msg: '请输入收货地址'
            }
        }
        // if (!presentOrderInfo.count||presentOrderInfo.count<1) {
        //     return {
        //         isPass: false,
        //         msg: '请输入正整数的数量'
        //     }
        // }
        var addressTos = presentOrderInfo.addressTo.split(/\n{1,}/g);
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
});


// 接口列表
// 获取商品列表
// 获取仓库列表
// 保存发货人信息
// 保存订单信息
// 查询订单列表