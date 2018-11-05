//  用户充值模块
"use strict";
layui.use(['element', 'layer', 'form'], function () {
    var element = layui.element;
    var layer = layui.layer;
    var form = layui.form;
    var collectPrice = 0.1; // 收藏价格
    var trafficPrice = 0.05; // 流量价格
    // 入口函数
    (function init() {
        initComponment();
        initEvent();
    })()

    // 初始化组件
    function initComponment() {
        // 设置账号信息以及用户余额
        $('form[name=addMoneyForm] input[name=userName]').val($('#userName').text().trim());
        core.getUserInfoById($('#userName').data('user-id'), function (res) {
            $('#userMainMoney').text(res.data.rows[0].money);
        });
        // 获取所有的充值方式并渲染
        getPackageDatas();
        form.render('checkbox');
    }

    // 事件初始化
    function initEvent() {
        // 立即充值
        $('#addMoney').on('click', addMoneyHandle);
    }

    // 充值套餐点击函数
    function addPackageTypeHandle(elem) {
        var $this = $(elem);
        var purchaseScore = $this.data('purchase-score');
        var presentScore = $this.data('present-score');
        var sumScore = purchaseScore + presentScore;
        var purchaseMoney = $this.data('purchase-money');
        var presentMoney = $this.data('present-money');
        var sumMoney = purchaseMoney + presentMoney;
        var trafficCount = sumMoney / trafficPrice;
        var collectCount = sumMoney / collectPrice;
        // 总积分/除以单价 再取整
        $('#purchaseMoney').text(core.numberToLocalString(sumMoney));
        $('#purchaseScore').text(core.numberToLocalString(sumScore));// 总积分
        // $('#presentScore').text(core.numberToLocalString(presentScore));
        $('#trafficCount').text(core.numberToLocalString(trafficCount));
        $('#collectCount').text(core.numberToLocalString(collectCount));
        $('#addScore').text(core.numberToLocalString(purchaseScore) + '购买积分+' + core.numberToLocalString(presentScore) + '赠送积分');
        $('#payMoney').text(core.numberToLocalString($this.data('purchaseMoney')));
    }

    // 充值点击函数
    function addMoneyHandle(event) {
        var checkedPackage = $('input[type=radio][name=addPackageType]:checked');
        var open = {};
        var index = layer.open({
            content: `<div class="js-pay-container">
                            <h3 style="text-align:center;">打开微信或者支付宝扫一扫即可付款</h3>
                            <div>
                                <img width="100%" height="330" alt="付款码" id="jsPayCodeImg">
                                <button class="layer-btn layer-btn-normal" id="jsPayCodeRefresh" style="display:none;">刷新</button>
                            </div>
                            <div>
                                <span class="pull-left">付款金额：<spam id="payMount">100</spam>元</span>
                                <span class="pull-right">收款人：易店科技</span>
                            </div>
                        </div>`,
            area: ['450px', '520px'],
            title: '在线充值付款',
            btn: '支付完成',
            scrollbar: false,
            yes: function (index, layero) {
                $.lockedBtn(layero.find('.layui-layer-btn0'), true, '支付状态检测中');
                var count = 0;
                clearInterval(open.timer);
                open.timer = setInterval(function () {
                    count++;
                    if (count < 5) {
                        getQrCodePayStatus(open.qr_id, open.addPackageType, function (payStatus) {
                            layer.closeAll('msg');
                            if (payStatus) {
                                open.payStatus = true;
                                clearInterval(open.timer);
                                layer.msg('支付成功');
                                $.unlockBtn(layero.find('.layui-layer-btn0'), '支付完成');
                                layer.close(index);
                                core.setWindowHash('manage_logs');
                                window.location.reload(true);
                            } else {
                                if (count === 5) {
                                    layer.msg('订单未支付');
                                }
                            }
                        });
                    } else {
                        clearInterval(open.timer);
                    }
                }, count === 0 ? 0 : 10000);
            },
            cancel: function () {
                // 支付成功之后不需要再去检查支付状态了
                if (!open.payStatus) {
                    getQrCodePayStatus(open.qr_id, open.addPackageType, function (payStatus) {
                        layer.closeAll('msg');
                        if (payStatus) {
                            layer.msg('支付成功');
                            core.setWindowHash('manage_logs');
                            window.location.reload(true);
                        } else {
                            layer.msg('订单未支付');
                        }
                    });
                }
            },
            success: function (layero, index) {
                // 设置付款金额
                $('#payMount').text(checkedPackage.data('purchase-money'));
                $.ajax({
                    url: '/api/createQrCode',
                    type: 'POST',
                    data: {
                        qr_name: '余额充值',
                        packageId: checkedPackage.val(),
                        qr_type: 'QR_TYPE_NOLIMIT'
                    },
                    beforeSend: function () {
                        $.addLoading($('.js-pay-container'));
                    },
                    success: function (data) {
                        $('#jsPayCodeImg').toggle(data.success);
                        $('#jsPayCodeRefresh').toggle(!data.success);
                        if (data.success) {
                            $('#jsPayCodeImg').attr('src', data.data.qr_code);
                            open.qr_id = data.data.qr_id;
                            open.addPackageType = $('input[type=radio][name=addPackageType]').val();
                            var count = 0;
                            open.timer = setInterval(function () {
                                $.lockedBtn(layero.find('.layui-layer-btn0'), true, '支付状态检测中');
                                count++;
                                if (count < 5) {
                                    getQrCodePayStatus(open.qr_id, open.addPackageType, function (payStatus) {
                                        layer.closeAll('msg');
                                        if (payStatus) {
                                            open.payStatus = true;
                                            clearInterval(open.timer);
                                            layer.msg('支付成功，正在为你跳转到首页。。。');
                                            $.unlockBtn(layero.find('.layui-layer-btn0'), '支付完成');
                                            layer.close(index);
                                            core.setWindowHash('manage_logs');
                                            window.location.reload(true);
                                        } else {
                                            if (count === 5) {
                                                layer.msg('订单未支付');
                                            }
                                        }
                                    });
                                } else {
                                    clearInterval(open.timer);
                                }
                            }, 10000);
                        }
                    },
                    error: function () {
                        layer.msg(baseDatas.netErrMsg);
                    },
                    complete: function () {
                        $.removeLoading($('.js-pay-container'));
                    }
                });
            }
        });
        return false;
    }

    // 获取所有的充值方式
    function getPackageDatas() {
        $.ajax({
            url: '/api/readPackagePage',
            type: 'GET',
            data: {
                limit: 20,
                status: 1,
                offset: 1
            },
            beforeSend: function (jqXHR, settings) {
                $.addLoading();
            },
            success: function (data, jqXHR, textStatus) {
                if (data.success) {
                    renderPackage(data.data.rows);
                    // 充值套餐change事件并且模拟触发一次change事件
                    form.on('radio', function (data) {
                        if (this.name === 'addPackageType') {
                            addPackageTypeHandle(data.elem);
                        }
                    });
                    addPackageTypeHandle($('input[type=radio][name=addPackageType]').first()[0]);
                } else {
                    layer.msg(data.message);
                    renderPackage([]);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                layer.msg(baseDatas.netErrMsg);
            },
            complete: function (jqXHR, textStatus) {
                $.removeLoading()
            }
        });
    }

    // 渲染所有的充值方式
    function renderPackage(packages) {
        var $container = `<div class="layui-input-block">`;
        $.each(packages, function (index, pack) {
            if (index % 4 === 0 && index !== 0) {
                $container += '</div><div class="layui-input-block">';
                $container += generateRadio(pack, index === 0);
            } else {
                $container += generateRadio(pack, index === 0);
            }
        });
        $container += '</div>';
        $('.js-add-package-type-container').html($container);
        form.render('radio');
    }

    // 生成一个radio,isChcked默认是false
    function generateRadio(info, isChecked) {
        return `<input type="radio" name="addPackageType"
                    ${isChecked ? 'checked' : ''}
                    value="${info.id}"
                    data-purchase-score="${info.packagePurchaseScore}" 
                    data-present-score="${info.packagePresentScore}"
                    data-purchase-money="${info.packagePurchaseMoney}" 
                    data-present-money="${info.packagePresentMoney}"
                    title="${info.packageName}">
                </input>`;
    }

    /**
     * 获取一个二维码的支付状态
     * 
     * @param {any} qr_id 
     */
    function getQrCodePayStatus(qr_id, addPackageType, callback) {
        if (!qr_id) {
            return callback(false);
        }
        $.ajax({
            url: '/api/getQrCodePayStatus',
            data: {
                qr_id: qr_id,
                addPackageType: addPackageType,
                orderNumber: APIUtil.generateOrderNumer()
            },
            success: function (payStatus) {
                callback(payStatus.data.status);
            }
        });
    }
});
