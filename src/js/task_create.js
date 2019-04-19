// 创建任务模块
'use strict';
layui.use(['element', 'layer', 'laydate', 'form'], function() {
    var element = layui.element;
    var layer = layui.layer;
    var laydate = layui.laydate;
    var form = layui.form;
    var userInfo = $('#userName').data('user');
    var userId = $('#userName').data('user-id');
    var baseDatas = {
        tabIndex: 0,
        tabText: 'TB',
        taskTypeInfo: null
    };
    // 页面入口
    (function init() {
        initEvent();
        initComponent();
        core.getUserInfoById(function(user) {
            userInfo = user.data.rows[0];
            baseDatas.level = userInfo.level;
            getTaskTypeServer('TB');
            $('#userName').data('user', JSON.stringify(user));
            $('#userBalance').text(core.fenToYuan(userInfo.money));
            $('#userLevel').html(core.getLevelText(userInfo.level));
            $('#discountTaskSumMoneyText,#discountTaskPriceText').toggle(userInfo.level !== 1);
        });
    })()

    /**
     * 初始化组件
     * 
     */
    function initComponent() {
        // 日期组件
        laydate.render({
            format: 'yyyy-MM-dd',
            elem: '#taskStartDate',
            min: $.formatDate('yyyy-mm-dd')
        });
        laydate.render({
            format: 'yyyy-MM-dd',
            elem: '#taskEndDate',
            min: $.formatDate('yyyy-mm-dd')
        });
        form.render('radio');
        form.render('select');
        $('#taskStartDate').val($.formatDate('yyyy-mm-dd'));
    }

    /**
     * 事件初始化
     * 
     */
    function initEvent() {
        // 页签的点击事件
        element.on('tab(createTask)', function(data) {
            if (data.index !== baseDatas.tabIndex) {
                baseDatas.tabIndex = data.index;
                baseDatas.tabText = $(this).data('task-parent-type');
                getTaskTypeServer(baseDatas.tabText);
                $('form[name=taskForm]').find('.js-task-search-index').toggle(data.index === 0);
            }
        });
        // 任务类型的切换事件，动态的更新价格
        form.on('select(taskChildType)', function(data) {
            if (data.value) {
                var $selected = $(data.elem).find('option[value=' + data.value + ']')
                var price = $selected.data('price');
                var plant = $selected.data('plant');
                var name = $selected.data('name');
                var code = $selected.data('code');
                var hask = $selected.data('hask');
                var quantity = $('input[name=taskQuantityNoKeyword]').val();
                // 将选中的任务保存到基础数据中，后期的数据源只来源于此（唯一数据源）
                baseDatas.taskTypeInfo = {
                    price: price,
                    plant: plant,
                    name: name,
                    code: code,
                    hask: hask
                };
                // 单价
                $('#taskPrice').text(core.fenToYuan(price));
                // 优惠价
                $('#discountTaskPrice').text(core.fenToYuan(core.computeTotalPriceTask(baseDatas.level, price)));
                // 总价
                var sum = getKeywordsAndQuantity().reduce(function(total, item) {
                    return total + item.quantity;
                }, 0);
                var taskSumMoney = sum && baseDatas.taskTypeInfo.hask ? sum * baseDatas.taskTypeInfo.price : quantity * baseDatas.taskTypeInfo.price
                $('#taskSumMoney').text(core.fenToYuan(taskSumMoney));
                // 折后价
                $('#discountTaskSumMoney').text(core.fenToYuan(core.computeTotalPriceTask(baseDatas.level, taskSumMoney)));
                // 关键词
                $('.js-keyword-quantity-container').toggle(!!hask);
                // 无关键词
                $('.js-no-keyword-container').toggle(!hask);
            } else {
                baseDatas.taskTypeInfo = null;
            }
            // 重置时长
            $('input[name=taskGoodsBrowsingTime]').val(50);
        });
        // 数量输入框的keyup事件
        $('input[name=taskQuantity],input[name=taskQuantityNoKeyword]').on('keyup', function(event) {
            var value = this.value;
            if (!baseDatas.taskTypeInfo) {
                return false;
            }
            if (!isNaN(value) && value > 0) {
                var sum = getKeywordsAndQuantity().reduce(function(total, item) {
                    return total + item.quantity;
                }, 0);
                var taskSumMoney = sum && baseDatas.taskTypeInfo.hask ? sum * baseDatas.taskTypeInfo.price : value * baseDatas.taskTypeInfo.price;
                // 总价
                $('#taskSumMoney').text(core.fenToYuan(taskSumMoney));
                // 折后价
                $('#discountTaskSumMoney').text(core.fenToYuan(core.computeTotalPriceTask(baseDatas.level, taskSumMoney)));
            } else {
                this.value = '';
            }
        });
        // 减少时长
        $('.js-delete-time').on('click', function() {
            var $time = $('input[name=taskGoodsBrowsingTime]');
            var quantity = $('input[name=taskQuantityNoKeyword]').val();
            if (!baseDatas.taskTypeInfo) {
                layer.msg('请先选择任务类型');
                return false;
            }
            if ($time.val() <= 50) {
                layer.msg('不能低于50秒');
                return false;
            }
            $time.val($time.val() - 10);
            // 改变单价
            baseDatas.taskTypeInfo.price -= 10;
            $('#taskPrice').text(core.fenToYuan(baseDatas.taskTypeInfo.price));
            // 优惠价
            $('#discountTaskPrice').text(core.fenToYuan(core.computeTotalPriceTask(baseDatas.level, baseDatas.taskTypeInfo.price)));
            // 总价
            var sum = getKeywordsAndQuantity().reduce(function(total, item) {
                return total + item.quantity;
            }, 0);
            var taskSumMoney = sum && baseDatas.taskTypeInfo.hask ? sum * baseDatas.taskTypeInfo.price : quantity * baseDatas.taskTypeInfo.price;
            $('#taskSumMoney').text(core.fenToYuan(taskSumMoney));
            // 折后价
            $('#discountTaskSumMoney').text(core.fenToYuan(core.computeTotalPriceTask(baseDatas.level, taskSumMoney)));
            return false;
        });
        // 增加时长
        $('.js-add-time').on('click', function() {
            var $time = $('input[name=taskGoodsBrowsingTime]');
            var quantity = $('input[name=taskQuantityNoKeyword]').val();
            if (!baseDatas.taskTypeInfo) {
                layer.msg('请先选择任务类型');
                return false;
            }
            if ($time.val() >= 120) {
                layer.msg('不能高于120秒');
                return false;
            }
            $time.val(($time.val() | 0) + 10);
            // 改变单价
            baseDatas.taskTypeInfo.price += 10;
            $('#taskPrice').text(core.fenToYuan(baseDatas.taskTypeInfo.price));
            // 优惠价
            $('#discountTaskPrice').text(core.fenToYuan(core.computeTotalPriceTask(baseDatas.level, baseDatas.taskTypeInfo.price)));
            // 总价
            var sum = getKeywordsAndQuantity().reduce(function(total, item) {
                return total + item.quantity;
            }, 0);
            var taskSumMoney = sum && baseDatas.taskTypeInfo.hask ? sum * baseDatas.taskTypeInfo.price : quantity * baseDatas.taskTypeInfo.price;
            $('#taskSumMoney').text(core.fenToYuan(taskSumMoney));
            // 折后价
            $('#discountTaskSumMoney').text(core.fenToYuan(core.computeTotalPriceTask(baseDatas.level, taskSumMoney)));
            return false;
        });
        // 任务时段输入框的点击事件
        $('input[name=taskHour]').on('click', function(events) {
            var $this = $(this);
            var tepl = generateSetTaskHourTemp();
            var quantity = $this.parents('.js-keyword-quantity-item').find('input[name=taskQuantity]').val();
            var keyword = $this.parents('.js-keyword-quantity-item').find('input[name=taskKeyword]').val();
            if (!quantity || !keyword) {
                layer.msg('关键词和数量不能为空');
                return false;
            }
            var hours = $this.val().split(',');
            var index = layer.open({
                title: `设置任务时段（${keyword}/${quantity}）`,
                content: tepl,
                area: ['720px'],
                btn: ['确定', '重置', '取消'],
                btn1: function() {
                    var quantitys = getTaskHourQuantity();
                    var content = `关键词/数量（${keyword}/${quantity}）:</br>
                                   00:00-07:00: ${quantitys.slice(0, 8).join(',')}</br>
                                   08:00-15:00: ${quantitys.slice(8, 16).join(',')}</br>
                                   16:00-23:00: ${quantitys.slice(16).join(',')}`;
                    (function(msg) {
                        var tip = undefined;
                        $this.hover(function() {
                            tip = layer.tips(msg, $this[0], { tips: 1, time: 0 });
                        }, function() {
                            layer.close(tip);
                        });
                    })(content)
                    $this.val(quantitys.join(','));
                    layer.close(index);
                    layer.msg('设置成功');
                },
                btn2: function() {
                    setTaskHourQuantity(computeEqualPart(quantity, computeMainHourToday()));
                    return false;
                }
            });
            if (hours.length === 24) {
                setTaskHourQuantity(hours);
            } else {
                setTaskHourQuantity(computeEqualPart(quantity, computeMainHourToday()));
            }
            setHourInputDisabled(computeMainHourToday());
            return false;
        });
        // 宝贝链接的unblur事件
        $('input[name=taskBabyLinkToken]').on('blur', function(e) {
            var key = 'id';
            var value = '';
            if (!this.value.trim()) {
                $('#bbDetailContainer').addClass('layui-hide');
                return false;
            }
            // 京东和平多多不支持
            if (baseDatas.tabIndex === 1) {
                return false;
            }
            // 拼多多
            if (baseDatas.tabIndex === 2) {
                if (baseDatas.taskTypeInfo.code && baseDatas.taskTypeInfo.code === 93) {
                    key = 'mall_id';
                } else {
                    key = 'goods_id';
                }
            }
            value = core.getQueryString(key, this.value) || '';
            if (value) {
                this.value = this.value.split('?')[0] + '?' + key + '=' + value;
            }
            if (baseDatas.tabIndex === 0) {
                $.get('/api/getTbDetail?id=' + value, function(res) {
                    if (res.ret[0] === 'SUCCESS::调用成功') {
                        $('#bbDetailContainer').removeClass('layui-hide');
                        $('#bbImgContainer').html(`<img src="${res.data.item.images[0]}" width="100" height="100">`);
                        $('#bbTitle').text('标题：' + res.data.item.title);
                        $('#bbShop').text('店铺：' + res.data.seller.shopName);
                        $('#bbSeller').text('卖家：' + res.data.seller.sellerNick);
                    } else {
                        layer.msg('服务器异常');
                    }
                }, 'json');
            }
            return false;
        });
        // 添加关键词和数量
        $('button.js-add-keyword-quantity').on('click', addTaskKeywordQuantityHandle);
        // 删除关键词和数量
        $('button.js-delete-keyword-quantity').on('click', deleteTaskKeywordQuantityHandle);
        // 创建任务
        $('#createTask').on('click', createTaskHandle);
    }

    /**
     * 添加关键词
     * 
     * @param {any} event 
     * @returns 
     */
    function addTaskKeywordQuantityHandle(event) {
        var $items = $('.js-keyword-quantity-container').find('.js-keyword-quantity-item');
        if ($items.length === 5) {
            layer.msg('主人，你够了！');
            return false;
        }
        var $container = $(event.target).parents('.js-keyword-quantity-container');
        var $item = $(event.target).parents('.js-keyword-quantity-item').clone(true);
        $container.append($item);
        $item.find('input[name=taskKeyword]').val('');
        $item.find('input[name=taskQuantity]').val('');
        $item.find('input[name=taskHour]').val('');
        setKeywordAndQuantityIndex();
        return false;
    }

    /**
     * 生成设置任务时段的模版
     * 
     */
    function generateSetTaskHourTemp() {
        // 生成一行(时间)
        function generateTrTime(start, end) {
            var result = `<tr class="layui-table-nohover">`;
            for (var i = start; i < end; i++) {
                result += `<td style="padding-left:8px;padding-right:8px;">${core.padStart(i)}:00</td>`;
            }
            return result + '</tr>';
        }
        // 生成一行输入框
        function generateTrInput(count) {
            var result = `<tr class="layui-table-nohover">`;
            for (var i = 0; i < count; i++) {
                result += `<td style="padding:0 8px;">
                                <div class="layui-input-inline" style="padding-top:0;padding-bottom:8px;">
                                    <input class="layui-input" type="text" value="0"
                                    style="border: none;border-bottom: 1px solid rgba(0,0,0,.42);border-radius: 0;"/>
                                </div>
                            </td>`;
            }
            return result + '</tr>';
        }
        var result = ``;
        for (var i = 0; i < 6; i++) {
            var count = 8;
            count * (1 + i / 2)
            if (i % 2 === 0) {
                result += generateTrTime((i - i / 2) * count, (1 + i / 2) * count);
            } else {
                result += generateTrInput(count);
            }
        }
        var temp = `<div id="setTaskHourContainer">
                        <table class="layui-table">
                            <tbody>
                            ${result}
                            </tbody>
                        </table>
                    </div>`
        return temp;
    }

    /**
     * 根据当天剩余的时间设置禁用输入框
     * 
     * @param {any} mainHour 
     */
    function setHourInputDisabled(mainHour) {
        for (var i = 0; i < 24 - mainHour; i++) {
            $('#setTaskHourContainer input:eq(' + i + ')').attr('disabled', true);
        }
    }

    /**
     * 获取任务时段中的数量
     * 
     */
    function getTaskHourQuantity() {
        var quantity = [];
        var inputs = $('#setTaskHourContainer input');
        inputs.each(function(i, item) {
            item = $(item);
            quantity[i] = Number(isNaN(item.val()) ? 0 : item.val());
        });
        return quantity;
    }

    /**
     * 设置任务时段中的数量
     * 
     */
    function setTaskHourQuantity(hours) {
        var inputs = $('#setTaskHourContainer input');
        inputs.each(function(i, item) {
            item = $(item);
            item.val(hours[i]);
        });
    }

    /**
     * 设置数量和关键词的序号
     * 
     */
    function setKeywordAndQuantityIndex() {
        var $items = $('.js-keyword-quantity-container').find('.js-keyword-quantity-item');
        $.each($items, function(index, item) {
            var length = index + 1;
            $(item).find('.js-task-keyword').text('关键词' + length);
            $(item).find('.js-task-quantity').text('数量' + length);
            $(item).find('.js-task-hour').text('时段' + length);
        });
        return;
    }

    /**
     * 删除关键词，必须保留一个
     * 
     * @param {any} event 
     * @returns 
     */
    function deleteTaskKeywordQuantityHandle(event) {
        var $items = $('.js-keyword-quantity-container').find('.js-keyword-quantity-item');
        var $item = $(event.target).parents('.js-keyword-quantity-item');
        if ($items.length === 1) {
            layer.msg('主人，必须留个种啊！');
            return false;
        }
        $item.remove();
        setKeywordAndQuantityIndex();
        return false;
    }

    /**
     * 创建任务
     * 1，获取关键词的数量。
     * 2，多个的话，需要创建多个任务
     * 先要判断用户的余额是否足够
     * @param {any} event 
     * @returns 
     */
    function createTaskHandle(event) {
        if (!baseDatas.taskTypeInfo) {
            layer.msg('请先选择任务类型');
            return false;
        }
        var ele = event.target;
        var $taskForm = $('form[name=taskForm]');
        var taskInfo = getTaskInfo($taskForm);
        // 任务开始时间默认是今天
        taskInfo.taskStartDate = taskInfo.taskStartDate || $.formatDate('yyyy-mm-dd');
        var validTaskInfoResult = validTaskInfo(taskInfo);
        // 验证通过
        if (validTaskInfoResult.isPass) {
            // 没有关键词的任务
            if (!baseDatas.taskTypeInfo.hask) {
                taskInfo.taskKeyword = '';
                taskInfo.taskQuantity = taskInfo.taskQuantityNoKeyword;
                taskInfo.taskHour = computeEqualPart(taskInfo.taskQuantity, computeMainHourToday());
                taskInfo.taskSumMoney = taskInfo.taskUnitPrice * taskInfo.taskQuantity;
                var signKeyTaskInfo = getSignKeyTaskInfo(taskInfo);
                APIUtil.createTask(signKeyTaskInfo, function(res, err) {
                    if (err) {
                        layer.msg(err.message);
                        return false;
                    }
                    if (res.data.status !== '1') {
                        layer.msg(res.data.tips);
                        return false;
                    }
                    // 调用第三方api的时候，生成的订单号，需要传回到数据库中，不能再次生成
                    taskInfo.taskOrderNumber = res.orderNumber;
                    $.ajax({
                        url: '/api/createTask',
                        type: 'POST',
                        data: taskInfo,
                        beforeSend: function(jqXHR, settings) {
                            $.lockedBtn($(ele), true, '创建中');
                        },
                        success: function(data, textStatus, jqXHR) {
                            if (data.success) {
                                // 获取用户当前余额并提示
                                layer.msg(`操作成功！！！`);
                                core.getUserInfoById(function(user) {
                                    userInfo = user.data.rows[0];
                                    $('#userName').data('user', JSON.stringify(user));
                                });
                                core.setWindowHash('manage_task?taskType=' + baseDatas.tabText);
                            } else {
                                // 操作失败需要取消当前任务
                                APIUtil.cancelTask(taskInfo.taskOrderNumber, function(res) {
                                    layer.msg('操作失败：' + res.data.tips);
                                });
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        },
                        complete: function(jqXHR, textStatus) {
                            $.unlockBtn($(ele), '<i class="layui-icon layui-icon-release"></i>创建任务');
                        }
                    });
                });
            } else {
                for (var i = 0; i < taskInfo.keywordQuantity.length; i++) {
                    (function(index) {
                        taskInfo.taskKeyword = taskInfo.keywordQuantity[index].keyword;
                        taskInfo.taskQuantity = taskInfo.keywordQuantity[index].quantity;
                        taskInfo.taskHour = taskInfo.keywordQuantity[index].hour;
                        taskInfo.taskSumMoney = taskInfo.taskUnitPrice * taskInfo.taskQuantity;
                        var signKeyTaskInfo = getSignKeyTaskInfo(taskInfo);
                        APIUtil.createTask(signKeyTaskInfo, function(res, err) {
                            if (err) {
                                layer.msg(err.message);
                                return false;
                            }
                            if (res.data.status !== '1') {
                                layer.msg(res.data.tips);
                                return false;
                            }
                            // 调用第三方api的时候，生成的订单号，需要传回到数据库中，不能再次生成
                            taskInfo.taskOrderNumber = res.orderNumber;
                            // 此处不能删除
                            taskInfo.taskKeyword = taskInfo.keywordQuantity[index].keyword;
                            taskInfo.taskQuantity = taskInfo.keywordQuantity[index].quantity;
                            taskInfo.taskHour = taskInfo.keywordQuantity[index].hour;
                            taskInfo.taskSumMoney = taskInfo.taskUnitPrice * taskInfo.taskQuantity;
                            $.ajax({
                                url: '/api/createTask',
                                type: 'POST',
                                data: taskInfo,
                                async: false,
                                beforeSend: function(jqXHR, settings) {
                                    $.lockedBtn($(ele), true, '创建中');
                                },
                                success: function(data, textStatus, jqXHR) {
                                    if (data.success) {
                                        // 获取用户当前的余额并提示
                                        layer.msg(`操作成功！！！`);
                                        core.getUserInfoById(function(user) {
                                            userInfo = user.data.rows[0];
                                            $('#userName').data('user', JSON.stringify(user));
                                        });
                                        core.setWindowHash('manage_task?taskType=' + baseDatas.tabText);
                                    } else {
                                        // 操作失败需要取消当前任务
                                        APIUtil.cancelTask(taskInfo.taskOrderNumber, function(res) {
                                            layer.msg('操作失败：' + res.data.tips);
                                        });
                                    }
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    layer.msg(baseDatas.errorMsg);
                                },
                                complete: function(jqXHR, textStatus) {
                                    $.unlockBtn($(ele), '<i class="layui-icon layui-icon-release"></i>创建任务');
                                }
                            });
                        });
                    })(i)
                }
            }
        } else {
            layer.msg(validTaskInfoResult.msg);
        }
        return false;
    }

    /**
     * 获取任务表单信息
     * 
     * @param {any} $form 任务表单
     * @returns 任务表单信息对象
     */
    function getTaskInfo($form) {
        var taskInfo = {};
        var keywordQuantity = getKeywordsAndQuantity();
        taskInfo.taskUserId = $('#userName').data('user-id');
        taskInfo.taskParentType = baseDatas.tabText;
        taskInfo.taskUnitPrice = baseDatas.taskTypeInfo.price;
        taskInfo.taskPlant = baseDatas.taskTypeInfo.plant;
        taskInfo.keywordQuantity = keywordQuantity;
        return $.extend(core.getFormValues($form), taskInfo);
    }

    /**
     * 获取关键字、数量、时间段的分配
     * 返回对象数组
     */
    function getKeywordsAndQuantity() {
        var keywords = [];
        var keywordQuantityItem = $('.js-keyword-quantity-container').find('.js-keyword-quantity-item');
        $.each(keywordQuantityItem, function(index, element) {
            var keyword = $(element).find('input[name=taskKeyword]').val();
            var hour = $(element).find('input[name=taskHour]').val();
            var quantity = Number($(element).find('input[name=taskQuantity]').val());
            // 关键词存在且数量大于0
            if (keyword && quantity > 0) {
                if (hour && hour.split(',').length === 24) {
                    hour = hour.split(',');
                } else {
                    hour = computeEqualPart(quantity, computeMainHourToday());
                }
                keywords[index] = {
                    keyword: keyword,
                    quantity: quantity,
                    hour: hour
                };
            }
        });
        return keywords;
    }

    /**
     * 获取签名和提交到服务器用的参数
     * 
     * @param {any} taskInfo 
     */
    function getSignKeyTaskInfo(taskInfo) {
        var signKeyTaskInfo = {};
        signKeyTaskInfo.begin_time = taskInfo.taskStartDate || $.formatDate('yyyy-mm-dd');
        signKeyTaskInfo.type = baseDatas.taskTypeInfo.code;
        signKeyTaskInfo.count = taskInfo.taskQuantity;
        signKeyTaskInfo.target = taskInfo.taskBabyLinkToken;
        signKeyTaskInfo.keyword = taskInfo.taskKeyword;
        signKeyTaskInfo.sUrl = taskInfo.sUrl;
        signKeyTaskInfo.hour = taskInfo.taskHour.join(',');
        signKeyTaskInfo.goodsBrowsingTime = taskInfo.taskGoodsBrowsingTime;
        return signKeyTaskInfo;
    }

    /**
     * 任务表单信息校验
     * 
     * @param {any} taskInfo 
     */
    function validTaskInfo(taskInfo) {
        if (!taskInfo) {
            $.writeLog('tb_task-validTaskInfo', '参数为空');
            return {
                isPass: false,
                msg: '参数不能为空'
            };
        }
        // 判断用户的余额
        if (userInfo.money <= 0 || userInfo.money < core.computeTotalPriceTask(baseDatas.level, taskInfo.taskSumMoney)) {
            return {
                isPass: false,
                msg: '主人，您的余额不足，请先充值，谢谢！！！'
            };
        }
        if (!baseDatas.taskTypeInfo) {
            return {
                isPass: false,
                msg: '请先选择任务类型'
            };
        }
        if (!taskInfo.taskName) {
            return {
                isPass: false,
                msg: '任务名称不能为空'
            };
        }
        if (!taskInfo.taskBabyLinkToken) {
            return {
                isPass: false,
                msg: '宝贝链接不能为空'
            };
        }
        if (!taskInfo.taskGoodsBrowsingTime || isNaN(taskInfo.taskGoodsBrowsingTime) || taskInfo.taskGoodsBrowsingTime < 50) {
            return {
                isPass: false,
                msg: '商品浏览时间不能低于50秒'
            };
        }
        // 有关键词的才需要验证
        if (!taskInfo.taskKeyword && baseDatas.taskTypeInfo.hask) {
            return {
                isPass: false,
                msg: '关键词不能为空'
            };
        }
        return {
            isPass: true,
            msg: ''
        };
    }

    /**
     * 将sum的总数评分为n分，余数累加给最后一个元素
     * 并将等分之后的数据封装程一个数组返回
     * @param {number} sum 总数
     * @param {number} n 份数
     * @return {array} 
     */
    function computeEqualPart(sum, n) {
        // 返回一个长度为24大的数组，默认是使用0进行填充
        var result = new Array(24).fill(0);
        // sun%n的模
        var mode = 0;
        // sum减去余数之后的值
        var main = sum;
        // 填充的开始位置
        var start = 24 - n;
        if (isNaN(sum) || isNaN(n)) {
            return [];
        }
        mode = sum % n;
        main = sum - mode;
        // 填充元素
        result.fill(main / n, start, 24);
        // 剩下的再平均分配，只要剩余时间没有了或者余数没有了都要结束循环
        for(var i = 0;i < mode; i++ ){
            if(start>=23){
                result[start] += mode;
                break;
            }else{
                result[start + i] += 1;
            }
        }
        return result;
    }

    // 计算当前还剩几个小时，在一天中
    function computeMainHourToday() {
        var hour = new Date().getHours();
        return 24 - hour;
    }

    // 将字符串中的空格使用分号代替，先要去除两端空格
    function replaceSByDotted(str) {
        if (!str && typeof str !== 'string') {
            $.writeLog('task_create-replaceSByDotted', ' 参数类型错误');
            return '';
        }
        return $.trim(str).replace(/(\s|，)+/g, ',');
    }

    /**
     *获取任务类型列表
     *
     * @param {*}  平台
     */
    function getTaskTypeServer(plant) {
        $.get('/api/readTaskType?status=1&plant=' + plant, function(res) {
            renderTaskType(res.data.rows);
        }, 'json');
    }



    /**
     *渲染任务类型列表
     *
     * @param {*} kbTypes
     */
    function renderTaskType(kbTypes) {
        var $container = $('select[name=taskChildType]');
        $container.empty();
        $container.append(`<option value="">请选择任务类型</option>`);
        $.each(kbTypes, function(index, item) {
            // 当前
            var curP = core.fenToYuan(core.computeTotalPriceTask(baseDatas.level, item.outPrice));
            // 普通
            var comP = core.fenToYuan(core.computeTotalPriceTask(1, item.outPrice));
            // 金牌
            var goldP = core.fenToYuan(core.computeTotalPriceTask(2, item.outPrice));
            // 等级
            var levelText = ['', '普通会员', '金牌会员', '内部会员'][baseDatas.level];
            $container.append(`<option value="${item.id}" data-name="${item.name}" data-hask="${item.hasKeyword}" data-code="${item.lieliuCode}" data-price="${item.outPrice}" data-plant="${item.plant}">${item.name}，你的价格（${levelText}）：${curP}元，普通会员：${comP}元，金牌会员：${goldP}元</option>`);
        });
        form.render('select');
    }
});