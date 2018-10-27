// 创建任务模块
'use strict';
layui.use(['element', 'table', 'layer', 'laydate', 'form'], function () {
    var element = layui.element;
    var table = layui.table;
    var layer = layui.layer;
    var laydate = layui.laydate;
    var form = layui.form;
    var userInfo = $('#userName').data('user');
    var userId = $('#userName').data('user-id');
    var baseDatas = {
        tabIndex: 0
    };
    // 页面入口
    (function init() {
        initEvent();
        initComponent();
        core.getUserInfoById(userId, function (user) {
            userInfo = user.data.rows[0];
            $('#userName').data('user', JSON.stringify(user));
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
            elem: '#taskStartDate'
        });
        form.render('radio');
        $('#taskStartDate').val(flyer.formatDate('yyyy-mm-dd'));
        // 设置单价的值
        $('#taskPrice').text(core.getTypeCodeByValue($('input[type=radio][name=taskChildType]:checked').val()).price);
    }

    /**
     * 事件初始化
     * 
     */
    function initEvent() {
        // 自定义页签的点击事件
        element.on('tab(createTask)', function (data) {
            if (data.index !== baseDatas.tabIndex) {
                toggleTaskIndex($(this));
                form.render('radio');
                baseDatas.tabIndex = data.index;
            }
        });
        // 任务类型的点击事件，动态的更新价格
        form.on('radio', function (data) {
            if (this.name === 'taskChildType') {
                var quantity = $('input[name=taskQuantity]').val();
                $('#taskPrice').text(core.getTypeCodeByValue(this.value).price);
                if (quantity) {
                    $('#taskSumMoney').text(core.numberToLocalString($('#taskPrice').text() * quantity));
                }
            }
        });
        // 数量输入框的keyup事件
        $('input[name=taskQuantity]').on('keyup', function (event) {
            var value = this.value;
            if (!isNaN(value) && value > 0) {
                var sum = getKeywordsAndQuantity().reduce(function (total, item) {
                    return total + item.quantity;
                }, 0);
                $('#taskSumMoney').text(core.numberToLocalString(sum * $('#taskPrice').text()));
            } else {
                this.value = '';
            }
        });
        ["begin_time", "count", "format", "goodsBrowsingTime", "hour", "id", "keyword", "sUrl", "signkey", "target", "timestamp", "type", "username", "ver"]
        // 任务时段输入框的点击事件
        $('input[name=taskHour]').on('click', function (events) {
            var $this = $(this);
            var tepl = generateSetTaskHourTemp();
            var quantity = $this.parents('.js-keyword-quantity-item').find('input[name=taskQuantity]').val();
            var keyword = $this.parents('.js-keyword-quantity-item').find('input[name=taskKeyword]').val();
            if (!quantity || !keyword) {
                flyer.msg('关键词和数量不能为空');
                return false;
            }
            var hours = $this.val().split(',');
            var index = layer.open({
                title: `设置任务时段（${keyword}/${quantity}）`,
                content: tepl,
                area: ['720px'],
                btn: ['确定', '重置', '取消'],
                btn1: function () {
                    var quantitys = getTaskHourQuantity();
                    var content = `关键词/数量（${keyword}/${quantity}）:</br>
                                   00:00-07:00: ${quantitys.slice(0, 8).join(',')}</br>
                                   08:00-15:00: ${quantitys.slice(8, 16).join(',')}</br>
                                   16:00-23:00: ${quantitys.slice(16).join(',')}`;
                    (function (msg) {
                        var tip = undefined;
                        $this.hover(function () {
                            tip = layer.tips(msg, $this[0], { tips: 1, time: 0 });
                        }, function () {
                            layer.close(tip);
                        });
                    })(content)
                    $this.val(quantitys.join(','));
                    layer.close(index);
                    flyer.msg('设置成功');
                },
                btn2: function () {
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
            flyer.msg('主人，你够了！');
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
            var result = `<tr>`;
            for (var i = start; i < end; i++) {
                result += `<td class="mdui-p-l-1  mdui-p-r-1">${core.padStart(i)}:00</td>`;
            }
            return result + '</tr>';
        }
        // 生成一行输入框
        function generateTrInput(count) {
            var result = `<tr>`;
            for (var i = 0; i < count; i++) {
                result += `<td class="mdui-p-t-0 mdui-p-b-0 mdui-p-l-1  mdui-p-r-1">
                                <div class="mdui-textfield mdui-p-t-0">
                                    <input class="mdui-textfield-input" type="text" value="0"/>
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
        var temp = `<div class="mdui-table-fluid" id="setTaskHourContainer">
                        <table class="mdui-table">
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
        inputs.each(function (i, item) {
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
        inputs.each(function (i, item) {
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
        $.each($items, function (index, item) {
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
            flyer.msg('主人，必须留个种啊！');
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
     * 先要判断用户的积分是否足够
     * @param {any} event 
     * @returns 
     */
    function createTaskHandle(event) {
        var ele = event.target;
        var $taskForm = $('form[name=taskForm]');
        var taskInfo = getTaskInfo($taskForm);
        // 任务开始时间默认是今天
        taskInfo.taskStartDate = taskInfo.taskStartDate || flyer.formatDate('yyyy-mm-dd');
        var validTaskInfoResult = validTaskInfo(taskInfo);
        // 验证通过
        if (validTaskInfoResult.isPass) {
            for (var i = 0; i < taskInfo.keywordQuantity.length; i++) {
                (function (index) {
                    taskInfo.taskKeyword = taskInfo.keywordQuantity[index].keyword;
                    taskInfo.taskQuantity = taskInfo.keywordQuantity[index].quantity;
                    taskInfo.taskHour = taskInfo.keywordQuantity[index].hour;
                    taskInfo.taskSumMoney = taskInfo.taskUnitPrice * taskInfo.taskQuantity;
                    var signKeyTaskInfo = getSignKeyTaskInfo(taskInfo);
                    APIUtil.createTask(signKeyTaskInfo, function (res, err) {
                        if (err) {
                            flyer.msg(err.message);
                            return false;
                        }
                        if (res.data.status !== '1') {
                            flyer.msg(res.data.tips);
                            return false;
                        }
                        // 调用第三方api的时候，生成的订单号，需要传回到数据库中，不能再次生成
                        taskInfo.taskOrderNumber = res.orderNumber;
                        taskInfo.taskKeyword = taskInfo.keywordQuantity[index].keyword;
                        taskInfo.taskQuantity = taskInfo.keywordQuantity[index].quantity;
                        taskInfo.taskHour = taskInfo.keywordQuantity[index].hour;
                        taskInfo.taskSumMoney = taskInfo.taskUnitPrice * taskInfo.taskQuantity;
                        $.ajax({
                            url: '/api/createTask',
                            type: 'POST',
                            data: taskInfo,
                            beforeSend: function (jqXHR, settings) {
                                $.lockedBtn($(ele), true, '创建中');
                            },
                            success: function (data, textStatus, jqXHR) {
                                if (data.success) {
                                    // 获取用户当前的积分余额并提示
                                    flyer.msg('操作成功！！！</br>本次共消费积分：' + taskInfo.taskSumMoney + '</br>' + '积分余额：' + (userInfo.money - taskInfo.taskSumMoney));
                                    core.getUserInfoById(userId, function (user) {
                                        userInfo = user.data.rows[0];
                                        $('#userName').data('user', JSON.stringify(user));
                                    });
                                    core.setWindowHash('manage_task');
                                } else {
                                    // 操作失败需要取消当前任务
                                    APIUtil.cancelTask(taskInfo.taskOrderNumber, function (res) {
                                        flyer.msg('操作失败：' + res.data.tips);
                                    });
                                }
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                flyer.msg(baseDatas.errorMsg);
                            },
                            complete: function (jqXHR, textStatus) {
                                $.unlockBtn($(ele), '<i class="layui-icon layui-icon-release"></i>创建任务');
                            }
                        });
                    });
                })(i)
            }
        } else {
            flyer.msg(validTaskInfoResult.msg);
        }
        return false;
    }

    /**
     * 设置任务详情信息
     * 
     * @param {any} taskInfo 任务信息
     */
    function setTaskDetail(taskInfo) {
        if (!taskInfo) {
            $.writeLog('tb_task-setTaskDetail', '参数错误');
            return;
        }
        // 任务耗时
        if (taskInfo.taskSumTime) {
            $('#taskSumTime').text(taskInfo.taskSumTime || 1);
        }
        // 任务单价
        if (taskInfo.taskPrice) {
            $('#taskPrice').text(taskInfo.taskPrice || 0);
        }
        // 任务总金额
        if (taskInfo.taskSumMoney) {
            $('#taskSumMoney').text(taskInfo.taskSumMoney || 0);
        }
        return;
    }

    /**
     * 获取任务表单信息
     * 
     * @param {any} $form 任务表单
     * @returns 任务表单信息对象
     */
    function getTaskInfo($form) {
        var taskInfo = {};
        var typeCodeByValue = core.getTypeCodeByValue($('input[name=taskChildType]:checked').val())
        var keywordQuantity = getKeywordsAndQuantity();
        var taskSumMoney = keywordQuantity.reduce(function (total, item) {
            return total + item.quantity;
        }, 0);
        taskInfo.taskUserId = $('#userName').data('user-id');
        taskInfo.taskParentType = $('#taskTab li.flyer-tab-active').data('task-parent-type');
        taskInfo.taskUnitPrice = typeCodeByValue.price;
        // 总价格的计算，需要根据关键字的个数来衡量（单价*数量） 数量 = 关键词1数量+关键词2数量+。。。
        // taskInfo.taskSumMoney = taskInfo.taskUnitPrice * taskSumMoney;
        taskInfo.taskPlant = typeCodeByValue.plant;
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
        $.each(keywordQuantityItem, function (index, element) {
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
        signKeyTaskInfo.begin_time = taskInfo.taskStartDate || flyer.formatDate('yyyy-mm-dd');
        signKeyTaskInfo.type = core.getTypeCodeByValue(taskInfo.taskChildType).code;
        signKeyTaskInfo.count = taskInfo.taskQuantity;
        signKeyTaskInfo.target = taskInfo.taskBabyLinkToken;
        signKeyTaskInfo.keyword = taskInfo.taskKeyword;
        signKeyTaskInfo.sUrl = taskInfo.sUrl;
        signKeyTaskInfo.hour = taskInfo.taskHour.join(',');
        signKeyTaskInfo.goodsBrowsingTime = taskInfo.taskGoodsBrowsingTime;
        return signKeyTaskInfo;
    }

    /**
     * 获取任务的关键词和数量
     * 
     * @param {any} $form 任务表单元素
     */
    function getKeywordQuantity($form) {
        var result = [];
        if (!$form) {
            $.writeLog('tb_task-getKeywordQuantity', '参数错误');
            return [];
        }
        var $items = $('.js-keyword-quantity-item');
        $.each($items, function (index, item) {
            result.push({
                taskKeyword: $(item).find('input[name=taskKeyword]').val(),
                taskQuantity: $(item).find('input[name=taskQuantity]').val()
            });
        });
        return result;
    }

    /**
     * 任务表单信息校验
     * 
     * @param {any} taskInfo 
     */
    function validTaskInfo(taskInfo) {
        // 判断用户的积分
        if (userInfo.money <= 0 || userInfo.money < taskInfo.taskSumMoney) {
            return {
                isPass: false,
                msg: '主人，您的积分不足，请先充值，谢谢！'
            };
        }
        if (!taskInfo) {
            $.writeLog('tb_task-setTaskDetail', '参数为空');
            return {
                isPass: false,
                msg: '参数不能为空'
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
        if (!taskInfo.taskKeyword) {
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
     * 根据页签的索引值动态的显示任务的流量入口
     * 
     * @param {any} $li 页签元素
     */
    function toggleTaskIndex($li) {
        var $taskIndex = $('.js-task-index');
        var $form = $('form[name=taskForm]');
        var $taskSearchIndex = $form.find('.js-task-search-index');
        var index = $li.data('index');
        $taskIndex.addClass('layui-hide').find('input[type=radio]').prop('checked', false);
        $taskIndex.eq(index).removeClass('layui-hide').find('input[type=radio]').first().prop('checked', true);
        // 搜索入口只有淘宝流量入口有
        $taskSearchIndex.toggle((index === 0 || index == 1));
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
        result[23] += mode;
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
});