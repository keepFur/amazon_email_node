// 淘宝任务模块
'use strict';
$(function() {
    var userInfo = $('#userName').data('user');
    // 页面入口
    function init() {
        initEvent();
        initComponent();
    }

    /**
     * 初始化组件
     * 
     */
    function initComponent() {
        // 日期组件
        var taskStartDate = flyer.date($('#taskStartDate'), {
            format: 'yyyy-mm-dd'
        });
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
        core.initTabClick($('#taskTab li'), toggleTaskIndex);
        // 任务平台的点击事件
        $('form[name=taskForm]').find('input[name=taskPlant]').on('change', function(event) {
            if ($('#taskTab li[data-index=2]').hasClass('flyer-tab-active')) {
                $('input[value=APPOINTMENT_SOLD]').prop('disabled', $(this).val() === '1');
                if ($(this).val() === '1' && $('input[value=APPOINTMENT_SOLD]').is(':checked')) {
                    $('input[value=SEARCH_ADDCART]').prop('checked', true);
                }
            }
            return false;
        });
        // 任务类型的点击事件，动态的更新价格
        $('.js-task-index').on('change', 'input[type=radio][name=taskChildType]', function(event) {
            var quantity = $('input[name=taskQuantity]').val();
            $('#taskPrice').text(core.getTypeCodeByValue($(this).val()).price);
            if (quantity) {
                $('#taskSumMoney').text(core.numberToLocalString($('#taskPrice').text() * quantity));
            }
        });
        // 数量输入框的keyup事件
        $('input[name=taskQuantity]').on('keyup', function(event) {
            var value = this.value;
            if (!isNaN(value) && value > 0) {
                $('#taskSumMoney').text(core.numberToLocalString(value * $('#taskPrice').text()));
            } else {
                this.value = '';
            }
        });
        // 添加关键词和数量
        // $('button.js-add-keyword-quantity').on('click', addTaskKeywordQuantityHandle);
        // 删除关键词和数量
        // $('button.js-delete-keyword-quantity').on('click', deleteTaskKeywordQuantityHandle);
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
            flyer.msg('主人，已经播了很多种了！');
            return false;
        }
        var $container = $(event.target).parents('.js-keyword-quantity-container');
        var $item = $(event.target).parents('.js-keyword-quantity-item').clone(true);
        $container.append($item);
        setKeywordAndQuantityIndex();
        return false;
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
        var signKeyTaskInfo = getSignKeyTaskInfo(taskInfo);
        var validTaskInfoResult = validTaskInfo(taskInfo);
        // 验证通过
        if (validTaskInfoResult.isPass) {
            // 判断用户的积分是否充足
            APIUtil.createTask(signKeyTaskInfo, function(res, err) {
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
                $.ajax({
                    url: '/api/createTask',
                    type: 'POST',
                    data: taskInfo,
                    beforeSend: function(jqXHR, settings) {
                        $.lockedBtn($(ele), true, '创建中');
                    },
                    success: function(data, textStatus, jqXHR) {
                        if (data.success) {
                            // 获取用户当前的积分余额并提示
                            flyer.msg('操作成功！！！</br>本次共消费积分：' + taskInfo.taskSumMoney + '</br>' + '积分余额：' + (userInfo.money - taskInfo.taskSumMoney));
                            core.setWindowHash('manage_task');
                        } else {
                            // 操作失败需要取消当前任务
                            APIUtil.cancelTask(taskOrderNumber, function(res) {
                                flyer.msg('操作失败：' + res.data.tips);
                            });
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        flyer.msg(baseDatas.errorMsg);
                    },
                    complete: function(jqXHR, textStatus) {
                        $.unlockBtn($(ele), '<i class="mdui-icon material-icons">&#xe569;</i>创建任务');
                    }
                });
            });
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
        taskInfo.taskUserId = userInfo.id;
        taskInfo.taskParentType = $('#taskTab li.flyer-tab-active').data('task-parent-type');
        taskInfo.taskUnitPrice = $('#taskPrice').text();
        taskInfo.taskSumMoney = taskInfo.taskUnitPrice * $('input[name=taskQuantity]').val();
        return $.extend(core.getFormValues($form), taskInfo);
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
        signKeyTaskInfo.hour = computeEqualPart(taskInfo.taskQuantity, computeMainHourToday());
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
        $.each($items, function(index, item) {
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
        if (!taskInfo.goodsBrowsingTime || isNaN(taskInfo.goodsBrowsingTime) || taskInfo.goodsBrowsingTime < 50) {
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
        // var $taskPlant = $form.find('input[name=taskPlant]');
        var $taskSearchIndex = $form.find('.js-task-search-index');
        var index = $li.data('index');
        $taskIndex.addClass('mdui-hidden').find('input[type=radio]').prop('checked', false);
        $taskIndex.eq(index).removeClass('mdui-hidden').find('input[type=radio]').first().prop('checked', true);
        // 搜索入口只有淘宝流量入口有
        $taskSearchIndex.toggle((index === 0 || index == 1));
        // 店铺关注任务，只能是京东才有，所以需要禁用淘宝
        // $taskPlant.first().prop('disabled', index === 4).prop('checked', index !== 4).end().last().prop('checked', index === 4);
        // 淘宝直播任务只能是淘宝平台
        // $taskPlant.last().prop('disabled', index === 3).prop('checked', index !== 3).end().first().prop('checked', index === 3);
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
        // sun%n的磨
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
    init();
});