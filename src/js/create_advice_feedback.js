//  提交反馈模块
"use strict";
$(function() {
    // 入口函数
    function init() {
        initEvent();
    }

    // 事件初始化
    function initEvent() {
        // 提交反馈
        $('#createAdviceFeedback').on('click', createAdviceFeedbackHandle);
    }

    // 充值点击函数
    function createAdviceFeedbackHandle() {
        var title = $.trim($('input[name=title]').val());
        var content = $.trim($('textarea[name=content]').val());
        if (title && content) {
            $.ajax({
                url: '/api/createAdviceFeedback',
                type: 'POST',
                data: {
                    title: title,
                    content: content
                },
                success: function(data) {
                    if (data.success) {
                        flyer.msg('操作成功');
                        $('input[name=title]').val('');
                        $('textarea[name=content]').val('');
                        $('#adviceFeedbackTab ul>li[data-index=1]').click();
                    } else {
                        flyer.msg('操作失败：' + data.message);
                    }
                },
                error: function() {
                    flyer.msg(baseDatas.netErrMsg);
                },
                complete: function() {

                }
            });
        } else {
            flyer.msg('标题和内容不能为空');
            return false;
        }
        return false;
    }

    init();
});