'use strict';
var $ = mdui.JQ;
$(function() {
    var userNameMinLength = 6;
    var userNameMaxLength = 15;

    function init() {
        // 初始化通知组件
        initNoticeComponent();
        // 初始化事件
        inieEvent();
    }

    // 事件初始化
    function inieEvent() {
        var kefuDialog = null;
        // 首页
        $('#home').on('click', function() {
            if (!$('.js-user-login').hasClass('mdui-hidden') || !$('.js-user-register').hasClass('mdui-hidden')) {
                window.location.reload();
            }
            return false;
        });

        // 注册get
        $('#userRegister').on('click', userRegisterHandler);

        // 注册跳转到登录
        $('#registerToLogin').on('click', function() {
            $('#userLogin').trigger('click');
        });

        // 注册post
        $('#userRegisterSubmit').on('click', userRegisterSubmitHanlder);

        // 登录get
        $('#userLogin').on('click', userLoginHandler);

        // 登录到注册
        $('#loginToRegister').on('click', function() {
            $('#userRegister').trigger('click');
        });

        // 登录post
        $('#userLoginSubmit').on('click', userLoginSubmitHanlder);

        // 控制台
        $('#console').on('click', function(event) {
            $.ajax({
                url: '/api/getUserLoginStatus',
                success: function(data) {
                    data = JSON.parse(data);
                    if (data.status) {
                        window.location.assign('/console');
                    } else {
                        mdui.snackbar({
                            message: '请先登录系统',
                            position: 'top'
                        });
                        $('#userLogin').trigger('click');
                    }
                }
            });
            return false;
        });

        // 充值
        $('#addMoney').on('click', function(event) {
            $.ajax({
                url: '/api/getUserLoginStatus',
                success: function(data) {
                    data = JSON.parse(data);
                    if (data.status) {
                        window.location.assign('/console#add_money');
                    } else {
                        mdui.snackbar({
                            message: '请先登录系统',
                            position: 'top'
                        });
                        $('#userLogin').trigger('click');
                    }
                }
            });
        });

        // 打开立即咨询
        $('.kefu-container').on('click', function() {
            kefuDialog = new mdui.Dialog('.js-kefu-mdui-dialog');
            kefuDialog.open();
            return false;
        });

        // 关闭立即咨询
        $('.kefu-btn-no').on('click', function() {
            kefuDialog.close();
            return false;
        });

        // 底部立即使用
        $('#userLoginFooter').on('click', function(event) {
            $.ajax({
                url: '/api/getUserLoginStatus',
                success: function(data) {
                    data = JSON.parse(data);
                    if (data.status) {
                        window.location.assign('/console#task_create');
                    } else {
                        $('#userLogin').trigger('click');
                    }
                }
            });
            return false;
        });
    }

    // 初始化通知组件
    function initNoticeComponent() {
        $.ajax({
            url: '/api/readNoticePage',
            data: {
                limit: 5,
                offset: 1
            },
            success: function(res) {
                res = JSON.parse(res);
                if (res.success) {
                    var $noticeContainer = $('.js-notice-container');
                    if (res.data.rows.length === 0) {
                        $noticeContainer.append(`<a href="#">暂无公告</a>`);
                    } else {
                        $.each(res.data.rows, function(index, item) {
                            var createdDate = formatDate('yyyy-mm-dd HH:MM', item.createdDate);
                            var $template = `<a href="#" class="pull-left text-ellipsis js-notice-item ${index===0?' js-notice-item-active':' hide'}" data-id="${item.id}">
                                        <span class="js-notice-title">${createdDate+'#' + item.noticeTitle}</span>
                                        <span class="js-notice-content">${item.noticeContent}</span>
                                     </a>`;
                            $noticeContainer.append($template);
                        });
                        // 做一个定时器
                        var timer = setInterval(function() {
                            var $item = $('.js-notice-item');
                            var length = $item.length;
                            var $currentItem = $('.js-notice-item-active');
                            var currentItemIndex = $item.index($currentItem[0]);
                            // 最后一个
                            if (currentItemIndex === length - 1) {
                                currentItemIndex = -1;
                            }
                            $currentItem.removeClass('js-notice-item-active').addClass('hide');
                            $item.eq(currentItemIndex + 1).addClass('js-notice-item-active').removeClass('hide');
                        }, 10000);
                    }
                } else {
                    $noticeContainer.append(`<a href="#">暂无公告</a>`);
                }
            }
        });
    }

    // 用户登录
    function userLoginHandler(event) {
        if (!$('.js-user-login').hasClass('mdui-hidden')) {
            return false;
        }
        $(this).addClass('li-selected').siblings().removeClass('li-selected');
        $('.js-content,.front-footer').hide();
        $('.js-user-register').hide().addClass('mdui-hidden');
        $('.js-user-login').show().removeClass('mdui-hidden');
        return false;
    }

    // 用户登录提交
    function userLoginSubmitHanlder(event) {
        var userInfo = getUserInfo($('form[name=userLoginForm]'));
        var $btn = $(this);
        var validUserInfoResult = validUserInfo(userInfo);
        if (validUserInfoResult.isPass) {
            $.ajax({
                url: '/api/userLogin',
                method: 'POST',
                data: userInfo,
                success: function(data, textStatus, jqXHR) {
                    data = JSON.parse(data);
                    if (data.success) {
                        mdui.snackbar({
                            message: '登录成功',
                            position: 'top'
                        });
                        window.location.assign('/console');
                    } else {
                        mdui.snackbar({
                            message: '登录失败:' + data.message,
                            position: 'top'
                        });
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    mdui.snackbar({
                        message: '网络错误',
                        position: 'top'
                    });
                }
            });
        } else {
            mdui.snackbar({
                message: validUserInfoResult.msg,
                position: 'top'
            });
        }
        return false;
    }

    // 用户注册get
    function userRegisterHandler(event) {
        if (!$('.js-user-register').hasClass('mdui-hidden')) {
            return false;
        }
        $(this).addClass('li-selected').siblings().removeClass('li-selected');
        $('.js-content,.front-footer').hide();
        $('.js-user-login').hide().addClass('mdui-hidden');
        $('.js-user-register').show().removeClass('mdui-hidden');
        return false;
    }

    // 用户注册post
    function userRegisterSubmitHanlder() {
        var userInfo = getUserInfo($('form[name=userRegisterForm]'));
        var validUserInfoResult = validUserInfo(userInfo);
        var $btn = $(this);
        if (validUserInfoResult.isPass) {
            $.ajax({
                url: '/api/createUser',
                method: 'POST',
                data: userInfo,
                success: function(data, textStatus, jqXHR) {
                    data = JSON.parse(data);
                    if (data.success) {
                        mdui.snackbar({
                            message: '注册成功',
                            position: 'top'
                        });
                        window.location.assign('/console');
                    } else {
                        mdui.snackbar({
                            message: '注册失败:' + data.message,
                            position: 'top'
                        });
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    mdui.snackbar({
                        message: '网络错误，请刷新页面重试',
                        position: 'top'
                    });
                }
            });
        } else {
            mdui.snackbar({
                message: validUserInfoResult.msg,
                position: 'top'
            });
        }
        return false;
    }

    // 获取用户表单信息
    function getUserInfo($form) {
        var userInfo = {};
        var serializeArray = [];
        if (!$form || !$form.length) {
            $.writeLog('front-getUserInfo', '参数错误');
            return {};
        }
        serializeArray = $form.serializeArray();
        serializeArray.forEach(function(element) {
            userInfo[element.name] = $.trim(element.value);
        }, this);
        return userInfo;
    }

    // 校验表单信息,用户名和密码不能为空
    function validUserInfo(userInfo) {
        if (!userInfo) {
            $.writeLog('front-validUserInfo', '参数错误');
            return {
                isPass: false,
                msg: '参数错误'
            };
        }

        // 判断用户名
        if (!userInfo.userName ||
            userInfo.userName.length > userNameMaxLength ||
            userInfo.userName.length < userNameMinLength) {
            return {
                isPass: false,
                msg: '用户名是6-15位字母组成'
            };
        }
        // 判断密码
        if (!userInfo.password ||
            userInfo.password.length > userNameMaxLength ||
            userInfo.password.length < userNameMinLength) {
            return {
                isPass: false,
                msg: '密码是6-15位字母组成'
            };
        }
        return {
            isPass: true,
            msg: '校验通过'
        };
    }

    /**
     * 格式化日期
     * @param {string} format 格式化日期的字符串
     * @param {date} date 日期字符串，默认时间是当前时间
     */
    function formatDate(format, date) {
        if (typeof format !== "string") {
            format = "yyyy-mm-dd hh:MM:ss";
        }
        var getDate = function(date) {
            date = isString(date) ? new Date(date) : (date || new Date());
            return {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
                hours: date.getHours(),
                minutes: date.getMinutes(),
                seconds: date.getSeconds()
            };
        };
        var isString = function(obj) {
            return typeof obj === "string";
        };
        var fullTime = function(time) {
            return time >= 10 ? time : ("0" + time);
        };
        date = getDate(date);
        return format
            .replace(/yyyy/gi, date.year)
            .replace(/mm/, fullTime(date.month))
            .replace(/dd/gi, fullTime(date.day))
            .replace(/hh/gi, fullTime(date.hours))
            .replace(/MM/, fullTime(date.minutes))
            .replace(/ss/gi, fullTime(date.seconds));
    }

    // 去除字符串两头的空格
    $.trim = function(str) {
        str = str || '';
        return str.replace(/^\s*|\s*$/g, '');
    };

    init();
});