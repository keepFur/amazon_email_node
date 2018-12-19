//  用户充值模块
"use strict";
layui.use(['element', 'layer', 'form', 'table', 'util'], function() {
    var element = layui.element;
    var layer = layui.layer;
    var form = layui.form;
    var table = layui.table;
    var util = layui.util;
    var collectPrice = 0.1; // 收藏价格
    var trafficPrice = 0.05; // 流量价格
    var otherShareCode = '';
    var myShareCode = '';
    // 入口函数
    (function init() {
        initComponment();
        initEvent();
    })()

    // 初始化组件
    function initComponment() {
        // 设置账号信息以及用户余额
        $('form[name=addMoneyForm] input[name=userName]').val($('#userName').text().trim());
        core.getUserInfoById(function(res) {
            $('#userMainMoney').text(core.fenToYuan(res.data.rows[0].money));
            // debugger
            otherShareCode = res.data.rows[0].otherShareCode;
            myShareCode = res.data.rows[0].myShareCode;
            renderShareTable();
            // 生成推广链接（注册的时候自动给账号分配一个推广链接），链接形式：www.08v12.com?otherShareCode=adadjasjdiujasdiqwkajskd
            var link = location.host + '/?otherShareCode=' + res.data.rows[0].myShareCode;
            $('input[name=shareLink]').val(link);
            // 生成效果
            $('#jsShareEffect').val(`亲爱的朋友，我正在使用易店科技优化店铺，效果很不错哦，你也可以试试。点击下方为你准备的专属链接${link}进行注册吧。注册就送2.5元。`);
        });
        // 获取所有的充值方式并渲染
        getPackageDatas();
        form.render('checkbox');
    }

    // 事件初始化
    function initEvent() {
        // 立即充值
        $('#addMoney').on('click', addMoneyHandle);
        // 一键复制推广文案
        $('#copyShareLink').on('click', copyShareLinkHandle);
        // 查询
        $('#searchBtn').on('click', function() {
            reloadTable({
                userName: $('input[name=username]').val().trim(),
                page: {
                    curr: 1,
                    limit: 10
                }
            });
            return false;
        });
        // 重置
        $('#resetBtn').on('click', function() {
            $('#shareUserSearchForm')[0].reset();
            return false;
        });
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
        $('#purchaseScore').text(core.numberToLocalString(sumScore)); // 总积分
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
            yes: function(index, layero) {
                if (!open.payStatus) {
                    getQrCodePayStatus(open.qr_id, open.addPackageType, function(payStatus) {
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
            cancel: function() {
                // 支付成功之后不需要再去检查支付状态了
                if (!open.payStatus) {
                    getQrCodePayStatus(open.qr_id, open.addPackageType, function(payStatus) {
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
            success: function(layero, index) {
                // 设置付款金额
                $('#payMount').text(checkedPackage.data('purchase-money') / 100);
                $.ajax({
                    url: '/api/createQrCode',
                    type: 'POST',
                    data: {
                        qr_name: '余额充值',
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
                            open.addPackageType = $('input[type=radio][name=addPackageType]:checked').val();
                            var count = 0;
                            open.timer = setInterval(function() {
                                $.lockedBtn(layero.find('.layui-layer-btn0'), true, '支付状态检测中');
                                count++;
                                if (count < 5) {
                                    getQrCodePayStatus(open.qr_id, open.addPackageType, function(payStatus) {
                                        layer.closeAll('msg');
                                        if (payStatus) {
                                            open.payStatus = true;
                                            clearInterval(open.timer);
                                            layer.msg('支付成功，正在为你跳转到首页。。。');
                                            $.unlockBtn(layero.find('.layui-layer-btn0'), '支付完成');
                                            layer.close(index);
                                            core.setWindowHash('manage_logs');
                                            window.location.reload(true);
                                        } else if (count === 4) {
                                            clearInterval(open.timer);
                                            layer.msg('订单未支付');
                                        }
                                    });
                                } else {
                                    clearInterval(open.timer);
                                }
                            }, 15000);
                        }
                    },
                    error: function() {
                        layer.msg(baseDatas.netErrMsg);
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
                    // 充值套餐change事件并且模拟触发一次change事件
                    form.on('radio', function(data) {
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
            error: function(jqXHR, textStatus, errorThrown) {
                layer.msg(baseDatas.netErrMsg);
            },
            complete: function(jqXHR, textStatus) {
                $.removeLoading()
            }
        });
    }

    // 渲染所有的充值方式
    function renderPackage(packages) {
        var $container = `<div class="layui-input-block">`;
        $.each(packages, function(index, pack) {
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
                orderNumber: APIUtil.generateOrderNumer(),
                otherShareCode: otherShareCode
            },
            success: function(payStatus) {
                callback(payStatus.data.status);
            }
        });
    }

    /**
     * 一键复制推广文案按钮的点击事件的处理函数
     * 每个账户下有一个otherShareCode（别人分享的）和myShareCode（自己的）：
     * 当用户注册的时候：判断链接中是否有otherShareCode查询参数，如果有的话，说明是通过别人分享的链接进行注册的，否则不是。注册的时候，每个账户分配一个myShareCode，当用户进行充值的时候，根据用户的otherShareCode去判断是否有人通过你分享的链接进行了注册，如果有的话，根据充值金额，按照比例进行佣金的返回并记录日志。
     * 实现步骤（服务端）：
     * 1，user 表增加myShareCode和otherShareCode字断
     * 2，注册的时候，判断查询参数，是否有otherShareCode，如果有写入到otherShareCode字断中，并自动生成一个myOtherCode
     * 3，充值的时候，判断是否是通过别人的链接进行注册的，如果是，返回佣金和记录日志
     * 实现步骤（客户端）：完成
     * 1，获取用户信息（myShareCode），生成推广链接
     * 2，组装推广文案
     * 3，复制推广文案
     * @param {any} e 
     */
    function copyShareLinkHandle(e) {
        core.copyToClipBoard('jsShareEffect');
        layer.msg('推广文案已成功复制到粘贴吧，去推广吧');
        return false;
    }

    /**
     * 渲染表格
     * 
     */
    function renderShareTable() {
        table.render({
            elem: '#shareUserTable',
            url: '/api/readShareUserPage',
            page: true,
            where: {
                myShareCode: myShareCode
            },
            cols: [
                [{
                        field: '',
                        title: '序号',
                        width: 60,
                        templet: function(d) {
                            return d.LAY_INDEX;
                        }
                    },
                    {
                        field: 'userName',
                        title: '用户名',
                    },
                    {
                        field: 'createdDate',
                        title: '创建时间',
                        templet: function(d) {
                            return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
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
            parseData: function(res) {
                return {
                    code: res.success,
                    msg: res.msg,
                    count: res.data.total,
                    data: res.data.rows
                }
            }
        });
    }

    /**
     * 重载表格
     * 
     */
    function reloadTable(where) {
        table.reload('shareUserTable', {
            where: where
        });
    }
});