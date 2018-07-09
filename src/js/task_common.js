// 任务模块公共方法
'use strict';
$(function() {
    // 页面入口
    function init() {
        initEvent();
    }

    /**
     * 事件初始化
     * 
     */
    function initEvent() {
        // 页签点击事件
        $('#taskTab li').on('click', function(event) {
            var index = $(this).data('index') || 0;
            if ($(this).hasClass('flyer-tab-active')) {
                return false;
            }
            $('#taskTab li').removeClass('flyer-tab-active');
            $(this).addClass('flyer-tab-active');
            toggleTaskIndex(index);
            return false;
        });
    }

    /**
     * 根据页签的索引值动态的显示任务的流量入口
     * 
     * @param {any} index 页签索引
     */
    function toggleTaskIndex(index) {
        var $taskIndex = $('.js-task-index');
        var $form = $('form[name=taskForm]');
        var $taskPlant = $form.find('input[name=taskPlant]');
        $taskIndex.addClass('mdui-hidden').find('input[type=radio]').prop('checked', false);
        $taskIndex.eq(index).removeClass('mdui-hidden').find('input[type=radio]').first().prop('checked', true);
        // 店铺关注任务，只能是京东才有，所以需要禁用淘宝
        $taskPlant.first().prop('disabled', index === 4).prop('checked', index !== 4).end().last().prop('checked', index === 4);
        // 淘宝直播任务只能是淘宝平台
        $taskPlant.last().prop('disabled', index === 3).prop('checked', index !== 3).end().first().prop('checked', index === 3);
    }

    init();
});