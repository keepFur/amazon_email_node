//  用户充值模块
"use strict";
$(function() {
    var collectPrice = 0.08; //0.05
    var trafficPrice = 0.01; //0.06
    var userInfo = $('#userName').data('user');
    // 入口函数
    function init() {
        initComponment();
        initEvent();
    }

    // 初始化组件
    function initComponment() {
        // 设置账号信息以及用户剩余积分
        $('form[name=addMoneyForm] input[name=userName]').val($('#userName').text());
        $('#userMainMoney').text(userInfo.money);
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
        $('#addScore').text(core.numberToLocalString(purchaseScore) + '购买积分+' + core.numberToLocalString(presentScore) + '赠送积分（赠送积分不能发布收藏任务）');
        $('#payMoney').text(core.numberToLocalString($this.data('purchaseMoney')));
    }

    // 充值点击函数
    function addMoneyHandle(event) {
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

    init();
});