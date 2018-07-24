//  用户充值模块
"use strict";
$(function() {
    var collectPrice = 0.08; //0.05
    var trafficPrice = 0.01; //0.06
    // 入口函数
    function init() {
        initComponment();
        initEvent();
    }

    // 初始化组件
    function initComponment() {
        // 设置账号信息以及用户剩余积分
        $('form[name=addMoneyForm] input[name=userName]').val($('#userName').text());
        core.getUserInfoById($('#userName').data('user-id'), function(res) {
            $('#userMainMoney').text(res.data.rows[0].money);
        });
        // 获取所有的充值方式并渲染
        getPackageDatas();
    }

    // 事件初始化
    function initEvent() {
        // 立即充值
        $('#addMoney').on('click', addMoneyHandle);
    }

    // 充值套餐点击函数
    function addPackageTypeHandle(event) {
        var $this = $(this);
        var purchaseScore = $this.data('purchase-score');
        var presentScore = $this.data('present-score');
        var purchaseMoney = $this.data('purchase-money');
        var presentMoney = $this.data('present-money');
        var trafficCount = purchaseScore / trafficPrice;
        var collectCount = presentScore / collectPrice;
        $('#purchaseScore').text(core.numberToLocalString(purchaseScore));
        $('#presentScore').text(core.numberToLocalString(presentScore));
        $('#trafficCount').text(core.numberToLocalString(trafficCount));
        $('#collectCount').text(core.numberToLocalString(collectCount));
        $('#addScore').text(core.numberToLocalString(purchaseScore) + '购买积分+' + core.numberToLocalString(presentScore) + '赠送积分');
        $('#payMoney').text(core.numberToLocalString($this.data('purchaseMoney')));
    }

    // 充值点击函数
    function addMoneyHandle(event) {
        var checkedPackage = $('input[type=radio][name=addPackageType]:checked');
        var open = flyer.open({
            pageUrl: '/html/add_money_pay.html',
            isModal: true,
            area: [450, 430],
            title: '积分充值付款',
            btns: [{
                text: '支付完成',
                click: function(ele) {
                    $.lockedBtn($(ele), true, '支付状态检测中');
                    var count = 0;
                    clearInterval(open.timer);
                    open.timer = setInterval(function() {
                        count++;
                        if (count < 5) {
                            getQrCodePayStatus(open.qr_id, open.addPackageType, function(payStatus) {
                                flyer.closeAll('msg');
                                if (payStatus) {
                                    open.payStatus = true;
                                    clearInterval(open.timer);
                                    flyer.msg('支付成功');
                                    $.unlockBtn($(ele), '支付完成');
                                    open.close();
                                    core.setWindowHash('manage_logs');
                                    window.location.reload(true);
                                } else {
                                    if (count === 5) {
                                        flyer.msg('订单未支付');
                                    }
                                }
                            });
                        } else {
                            clearInterval(open.timer);
                        }
                    }, count === 0 ? 0 : 10000);
                }
            }],
            cancel: function() {
                // 支付成功之后不需要再去检查支付状态了
                if (!open.payStatus) {
                    getQrCodePayStatus(open.qr_id, open.addPackageType, function(payStatus) {
                        flyer.closeAll('msg');
                        if (payStatus) {
                            flyer.msg('支付成功');
                            core.setWindowHash('manage_logs');
                            window.location.reload(true);
                        } else {
                            flyer.msg('订单未支付');
                        }
                    });
                }
            },
            afterCreated: function() {
                // 设置付款金额
                $('#payMount').text(checkedPackage.data('purchase-money'));
                $.ajax({
                    url: '/api/createQrCode',
                    type: 'POST',
                    data: {
                        qr_name: '积分充值',
                        packageId: checkedPackage.val(),
                        qr_type: 'QR_TYPE_NOLIMIT'
                    },
                    beforeSend: function() {
                        $.addLoading($('.js-pay-container'));
                    },
                    success: function(data) {
                        $('#jsPayCodeImg').toggle(data.success);
                        $('#jsPayCodeRefresh').toggle(!data.success);
                        if (data.success) {
                            $('#jsPayCodeImg').attr('src', data.data.qr_code);
                            open.qr_id = data.data.qr_id;
                            open.addPackageType = $('input[type=radio][name=addPackageType]').val();
                            var count = 0;
                            open.timer = setInterval(function() {
                                console.log('after');
                                $.lockedBtn($(open.$btns[0]), true, '支付状态检测中');
                                count++;
                                if (count < 5) {
                                    getQrCodePayStatus(open.qr_id, open.addPackageType, function(payStatus) {
                                        flyer.closeAll('msg');
                                        if (payStatus) {
                                            open.payStatus = true;
                                            clearInterval(open.timer);
                                            flyer.msg('支付成功，正在为你跳转到首页。。。');
                                            $.unlockBtn($(open.$btns[0]), '支付完成');
                                            open.close();
                                            core.setWindowHash('manage_logs');
                                            window.location.reload(true);
                                        } else {
                                            if (count === 5) {
                                                flyer.msg('订单未支付');
                                            }
                                        }
                                    });
                                } else {
                                    clearInterval(open.timer);
                                }
                            }, 10000);
                        }
                    },
                    error: function() {
                        flyer.msg(baseDatas.netErrMsg);
                    },
                    complete: function() {
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
            beforeSend: function(jqXHR, settings) {
                $.addLoading();
            },
            success: function(data, jqXHR, textStatus) {
                if (data.success) {
                    renderPackage(data.data.rows);
                    // 充值套餐change事件并且触发一次change事件
                    $('input[type=radio][name=addPackageType]').on('change', addPackageTypeHandle);
                    $('input[type=radio][name=addPackageType]').first().change();
                } else {
                    flyer.msg(data.message);
                    renderPackage([]);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                flyer.msg(baseDatas.netErrMsg);
            },
            complete: function(jqXHR, textStatus) {
                $.removeLoading()
            }
        });
    }

    // 渲染所有的充值方式
    function renderPackage(packages) {
        var $container = `<div class="mdui-row-xs-1"><div class="mdui-col">`;
        $.each(packages, function(index, pack) {
            if (index % 4 === 0 && index !== 0) {
                $container += '</div></div><div class="mdui-row-xs-1"><div class="mdui-col">';
                $container += generateRadio(pack, index === 0);
            } else {
                $container += generateRadio(pack, index === 0);
            }
        });
        $container += '</div></div>';
        $('.js-add-package-type-container').html($container);
    }

    // 生成一个radio,isChcked默认是false
    function generateRadio(info, isChecked) {
        return `<label class="mdui-radio">
                            <input type="radio" name="addPackageType" ${isChecked?'checked':''} 
                            value="${info.id}" data-purchase-score="${info.packagePurchaseScore}" 
                            data-present-score="${info.packagePresentScore}"
                            data-purchase-money="${info.packagePurchaseMoney}" 
                            data-present-money="${info.packagePresentMoney}"
                            />
                            <i class="mdui-radio-icon"></i>
                            ${info.packageName}
                </label>`;
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
                addPackageType: addPackageType
            },
            success: function(payStatus) {
                callback(payStatus.data.status);
            }
        });
    }

    init();
});