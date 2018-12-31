'use strict';
var $ = mdui.JQ;
$(function() {
    var userNameMinLength = 6;
    var userNameMaxLength = 15;
    var passwordErrorMsg = '密码是由6-15位的数字或密码组成';
    var usernameErrorMsg = '用户名是由6-15位的数字或密码组成';
    var phoneErrorMsg = '电话是由11位的数字组成';
    var computeErrorMsg = '计算结果不正确';
    var clickCount = 0;
    // 模块入口
    (function init() {
        // 初始化通知组件
        initNoticeComponent();
        // 初始化轮播图
        initScrollImgComponent();
        // 初始化事件
        inieEvent();
        // 触发一次刷新题目事件
        $('#refreshCompute').trigger('click');
        new mdui.Tooltip($('.js-notice-view-more'), {
            position: 'auto',
            content: '更多公告，请登录系统查看，谢谢！！！祝老板每天爆单'
        });
        // 如果是通过别人的分享的链接进行注册的话，直接跳转到注册的页面
        getOtherShareCode() && $('#userRegister').trigger('click');
    })()

    // 事件初始化
    function inieEvent() {
        var kefuDialog = null;

        // 查看更多公告
        $('.js-notice-view-more').on('click', function(e) {
            return false;
        });

        // 首页
        $('#home').on('click', function() {
            if (!$('.js-user-login').hasClass('mdui-hidden') || !$('.js-user-register').hasClass('mdui-hidden')) {
                window.location.reload();
            }
            return false;
        });

        // 空包下单
        $('#kbPur').on('click', function() {
            $.ajax({
                url: '/front/getUserLoginStatus',
                success: function(data) {
                    data = JSON.parse(data);
                    if (data.status) {
                        window.location.assign('/console#kb_purchase');
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

        // 流量下单
        $('.jsTrafficPur').on('click', function() {
            $.ajax({
                url: '/front/getUserLoginStatus',
                success: function(data) {
                    data = JSON.parse(data);
                    if (data.status) {
                        window.location.assign('/console#task_create');
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

        // 点击大图 注册get
        $('#userRegister').on('click', userRegisterHandler);

        // 注册跳转到登录
        $('.js-to-login').on('click', function() {
            $('#userLogin').trigger('click');
        });

        // 注册post
        $('#userRegisterSubmit').on('click', userRegisterSubmitHanlder);

        // 登录get
        $('#userLogin').on('click', userLoginHandler);

        // 登录到注册
        $('.js-login-to-register').on('click', function() {
            $('#userRegister').trigger('click');
        });

        // 登录post
        $('#userLoginSubmit').on('click', userLoginSubmitHanlder);

        // 找回密码 get
        $('#getUserPassword').on('click', userGetPasswordHandler);

        // 找回密码 post
        $('#getUserPasswordSubmit').on('click', userGetPasswordSubmitHandler);

        // 获取验证码
        $('#getVerfiyCode').on('click', { $userPhone: $('input[name=userPhone]') }, getVerfiyCodeHandler);

        // 获取验证码 注册模块
        $('#getVerfiyCodeReg').on('click', { $userPhone: $('input[name=phone]') }, getVerfiyCodeHandler);

        // 刷新题目
        $('#refreshCompute').on('click', refreshComputeHandler);

        // 立即找回 post
        $('#setUserPasswordSubmit').on('click', setUserPasswordSubmitHandler);

        // 控制台
        $('#console,.big-img').on('click', function(event) {
            $.ajax({
                url: '/front/getUserLoginStatus',
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
                url: '/front/getUserLoginStatus',
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
        $('#userLoginFooter,.buy').on('click', function(event) {
            var $this = $(this);
            $.ajax({
                url: '/front/getUserLoginStatus',
                success: function(data) {
                    data = JSON.parse(data);
                    if (data.status) {
                        window.location.assign($this.find('a').attr('href'));
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
    }

    /**
     *初始化轮播图
     *
     */
    function initScrollImgComponent() {
        /**
         *为批量元素设置类名
         *
         * @param {any} eles 设置的元素
         * @param {any} classNames 类名
         */
        function setClassName(eles, className) {
            if (eles) {
                eles.forEach(function(ele, index) {
                    ele.className = className;
                });
            }
        }
        // 实现轮播图功能
        var controlBtns = document.querySelectorAll('.ad .control>li');
        var imgItems = document.querySelectorAll('.ad .item');
        controlBtns.forEach(function(item) {
            item.addEventListener('click', function() {
                var index = parseInt(this.getAttribute('data-index'));
                setClassName(controlBtns, '');
                setClassName([this], 'active');
                setClassName(imgItems, 'item hide');
                setClassName([imgItems[index]], 'item show');
            });
        });
    }

    // 初始化通知组件
    function initNoticeComponent() {
        $.ajax({
            url: '/front/readNoticePage',
            data: {
                limit: 5,
                offset: 1
            },
            dataType: 'json',
            success: function(res) {
                var $noticeContainer = $('.js-notice-container');
                if (res.success) {
                    if (res.data.rows.length === 0) {
                        $noticeContainer.append(`<a href="#">暂无公告</a>`);
                    } else {
                        $.each(res.data.rows, function(index, item) {
                            var createdDate = formatDate('yyyy-mm-dd HH:MM', item.createdDate);
                            var $template = `<a href="#" class="pull-left text-ellipsis js-notice-item ${index === 0 ? ' js-notice-item-active' : ' hide'}" data-id="${item.id}">
                                        <span class="js-notice-title">${createdDate + '#' + item.noticeTitle}</span>
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
        $('.js-user-get-password').hide().addClass('mdui-hidden');
        $('.js-user-set-password').hide().addClass('mdui-hidden');
        $('.js-user-login').show().removeClass('mdui-hidden');
        return false;
    }

    // 用户登录提交
    function userLoginSubmitHanlder(event) {
        var userInfo = getUserInfo($('form[name=userLoginForm]'));
        var validUserInfoResult = validUserInfo(userInfo);
        if (validUserInfoResult.isPass) {
            if (userInfo.computeResult != $('input[name=loginProblem]').data('result')) {
                mdui.snackbar({
                    message: computeErrorMsg,
                    position: 'top'
                });
                return;
            }
            $.ajax({
                url: '/front/userLogin',
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
        $('.js-user-get-password').hide().addClass('mdui-hidden');
        $('.js-user-register').show().removeClass('mdui-hidden');
        return false;
    }

    // 用户注册post
    function userRegisterSubmitHanlder() {
        var userInfo = getUserInfo($('form[name=userRegisterForm]'));
        // 获取分享码
        userInfo.otherShareCode = getOtherShareCode();
        var validUserInfoResult = validUserInfo(userInfo);
        if (!validUserInfoResult.isPass) {
            mdui.snackbar({
                message: validUserInfoResult.msg,
                position: 'top'
            });
            return;
        }
        // 判断电话
        if (!/^1[0-9]{10}$/.test(userInfo.phone)) {
            mdui.snackbar({
                message: phoneErrorMsg,
                position: 'top'
            });
            return;
        }


        // 判断验证码
        if (!userInfo.verfiyCode.trim()) {
            mdui.snackbar({
                message: '请输入验证码',
                position: 'top'
            });
            return;
        }

        if ($('input[name=phone]').data('code') !== userInfo.verfiyCode.trim()) {
            mdui.snackbar({
                message: '验证码错误',
                position: 'top'
            });
            return;
        }
        clickCount++;
        if (clickCount === 1) {
            $.ajax({
                url: '/front/createUser',
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
                },
                complete: function() {
                    clickCount = 0;
                }
            });
        }
        return false;
    }

    // 找回密码 get
    function userGetPasswordHandler(e) {
        if (!$('.js-user-get-password').hasClass('mdui-hidden')) {
            return false;
        }
        $(this).addClass('li-selected').siblings().removeClass('li-selected');
        $('.js-content,.front-footer').hide();
        $('.js-user-login').hide().addClass('mdui-hidden');
        $('.js-user-get-password').show().removeClass('mdui-hidden');
        return false;
    }

    // 找回密码 post
    function userGetPasswordSubmitHandler(e) {
        var userInfo = getUserInfo($('form[name=userGetPasswordForm]'));
        var actualCode = $('input[name=userPhone]').data('code');
        var validate = function() {
            // 判断用户名的规则
            if (!/^[a-zA-Z0-9]{6,15}$/g.test(userInfo.userName)) {
                return {
                    isPass: false,
                    msg: usernameErrorMsg
                };
            }
            if (userInfo.verfiyCode !== actualCode) {
                return {
                    isPass: false,
                    msg: '验证码错误'
                };
            }
            return {
                isPass: true,
                msg: '验证通过'
            };
        };
        // 校验信息
        var validateResult = validate();
        if (!validateResult.isPass) {
            mdui.snackbar({
                message: validateResult.msg,
                position: 'top'
            });
            return;
        }
        // 判断手机号和用户名是否匹配
        $.ajax({
            url: '/front/getUserInfoByPhone',
            data: userInfo,
            dataType: 'json',
            success: function(res) {
                if (res.success) {
                    mdui.snackbar({
                        message: '信息校验成功',
                        position: 'top'
                    });
                    $('.js-user-set-password').show().removeClass('mdui-hidden');
                    $('.js-user-login').hide().addClass('mdui-hidden');
                    $('.js-user-get-password').hide().addClass('mdui-hidden');
                    $('.js-user-register').hide().addClass('mdui-hidden');
                    $('form[name=userSetPasswordForm] input[name=userName]').val(userInfo.userName);
                } else {
                    mdui.snackbar({
                        message: res.msg,
                        position: 'top'
                    });
                }
            }
        });
        return false;
    }

    // 刷新题目
    function refreshComputeHandler(e) {
        var ret = generateCompute();
        $('input[name=loginProblem]').val(ret.num1 + '+' + ret.num2 + '=').data('result', ret.ret);
        return false;
    }

    // 获取验证码
    function getVerfiyCodeHandler(e) {
        // 存储到当前的元素data中
        var $userPhone = e._data.$userPhone;
        var userPhone = $userPhone.val().trim();
        var $this = $(this);
        var timer = null;
        var totalSecond = 60;
        // 判断电话
        if (!/^1[0-9]{10}$/.test(userPhone)) {
            mdui.snackbar({
                message: phoneErrorMsg,
                position: 'top'
            });
            return false;
        }

        $.ajax({
            url: '/front/getVerfiyCode',
            data: {
                userPhone: userPhone
            },
            dataType: 'json',
            beforeSend: function() {
                $this.text('发送中...').attr('disabled', true);
            },
            success: function(res) {
                if (res.success) {
                    mdui.snackbar({
                        message: '验证码获取成功',
                        position: 'top'
                    });
                    $userPhone.data('code', res.code);
                    timer = setInterval(function() {
                        totalSecond--;
                        if (totalSecond <= 0) {
                            $this.text(`重新获取`).removeAttr('disabled');
                            totalSecond = 60;
                            clearInterval(timer);
                        } else {
                            $this.text(`${totalSecond}s 之后重新获取`).attr('disabled', true).css('color', '#000');
                        }
                    }, 1000);
                } else {
                    mdui.snackbar({
                        message: '验证码获取失败:' + res.msg,
                        position: 'top'
                    });
                }
            },
            error: function(err) {
                mdui.snackbar({
                    message: '网络错误，请刷新页面重试',
                    position: 'top'
                });
            },
            complete: function() {
                console.log('已发送');
                $this.text(`获取验证码`).removeAttr('disabled');
            }
        });
        return false;
    }

    // 立即重置 post
    function setUserPasswordSubmitHandler(e) {
        var userInfo = getUserInfo($('form[name=userSetPasswordForm]'));
        var validateResult = validUserInfo(userInfo);
        if (!validateResult.isPass) {
            mdui.snackbar({
                message: validateResult.msg,
                position: 'top'
            });
            return;
        }
        $.ajax({
            url: '/front/setUserPassword',
            method: 'POST',
            data: userInfo,
            dataType: 'json',
            success: function(res) {
                if (res.success) {
                    mdui.snackbar({
                        message: '密码重置成功：' + res.message,
                        position: 'top'
                    });
                    $('#userLogin').trigger('click');
                } else {
                    mdui.snackbar({
                        message: '密码重置失败：' + res.message,
                        position: 'top'
                    });
                }
            },
            error: function(err) {
                mdui.snackbar({
                    message: '网络错误，请刷新页面重试',
                    position: 'top'
                });
            }
        });
        return false;
    }


    // 获取用户表单信息
    function getUserInfo($form) {
        var userInfo = {};
        var serializeArray = [];
        if (!$form || !$form.length) {
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
            return {
                isPass: false,
                msg: '参数错误'
            };
        }
        // 判断用户名的规则
        if (!/^[a-zA-Z0-9]{6,15}$/g.test(userInfo.userName)) {
            return {
                isPass: false,
                msg: usernameErrorMsg
            };
        }
        // 判断密码的规则
        if (!/^[a-zA-Z0-9@]{6,15}$/g.test(userInfo.password)) {
            return {
                isPass: false,
                msg: passwordErrorMsg
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

    // 生成一个算术题，并把结果返回
    function generateCompute() {
        var num1 = Math.ceil(Math.random() * 14);
        var num2 = Math.ceil(Math.random() * 14);
        var ret = num1 + num2;
        return {
            num1: num1,
            num2: num2,
            ret: ret,
        };
    }

    /**
     * 
     * 根据参数名称获取到URL的参数值
     * @param {any} name 
     * @returns 
     */
    function getQueryString(name, url) {
        var reg = new RegExp(name + "=([^&|#?]+)");
        var r = url.substring(url.indexOf("?") + 1).match(reg);
        if (r !== null) {
            return window.unescape(r[1])
        }
        return null;
    }

    // 获取分享码
    function getOtherShareCode() {
        return getQueryString('otherShareCode', window.location.href);
    }
});