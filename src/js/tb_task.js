// 淘宝任务模块
'use strict';
$(function() {
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
            format: 'yyyy-mm-dd',
            click: function(date) {
                taskEndDate.setMinDate(date);
            }
        });
        var taskEndDate = flyer.date($('#taskEndDate'), {
            format: 'yyyy-mm-dd',
            click: function(date) {
                taskStartDate.setMaxDate(date);
            }
        });
    }

    /**
     * 事件初始化
     * 
     */
    function initEvent() {
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
     * 
     * @param {any} event 
     * @returns 
     */
    function createTaskHandle(event) {
        var $taskForm = $('form[name=taskForm]');
        var taskInfo = getTaskInfo($taskForm);
        var validTaskInfoResult = validTaskInfo(taskInfo);
        if (validTaskInfoResult.isPass) {
            $.ajax({
                url: '/api/createTask',
                type: 'POST',
                data: taskInfo,
                beforeSend: function(jqXHR, settings) {
                    $.lockedBtn($(ele), true, '创建中');
                },
                success: function(data, textStatus, jqXHR) {
                    if (data.success) {
                        flyer.msg('操作成功');
                        core.setWindowHash('manage_order');
                    } else {
                        flyer.msg('操作失败' + data.message);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    flyer.msg(baseDatas.errorMsg);
                },
                complete: function(jqXHR, textStatus) {
                    $.unlockBtn($(ele), '创建');
                }
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
            $('#taskSumTime').val(taskInfo.taskSumTime || 1);
        }
        // 任务单价
        if (taskInfo.taskPrice) {
            $('#taskPrice').val(taskInfo.taskPrice || 0);
        }
        // 任务总金额
        if (taskInfo.taskSumMoney) {
            $('#taskSumMoney').val(taskInfo.taskSumMoney || 0);
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
        return core.getFormValues($form);
    }

    /**
     * 任务表单信息校验
     * 
     * @param {any} taskInfo 
     */
    function validTaskInfo(taskInfo) {
        if (!taskInfo) {
            $.writeLog('tb_task-setTaskDetail', '参数为空');
            return {
                isPass: false,
                msg: '参数不能为空'
            };
        }
        return {
            isPass: true,
            msg: ''
        };
    }

    init();
});