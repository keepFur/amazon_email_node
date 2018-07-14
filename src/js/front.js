'use strict';
$(function() {
    var userNameMinLength = 5;
    var userNameMaxLength = 20;

    function init() {
        // 初始化通知组件
        initNoticeComponent();
        // 初始化事件
        inieEvent();
    }

    // 事件初始化
    function inieEvent() {
        // 注册
        $('#userRegister').on('click', userRegisterHandler);
        // 登录
        $('#userLogin').on('click', userLoginHandler);
    }

    // 初始化通知组件
    function initNoticeComponent() {
        $.get('/api/readNoticePage', {
            limit: 5,
            offset: 1
        }, function(res) {
            if (res.success) {
                var $noticeContainer = $('.js-notice-container');
                $.each(res.data.rows, function(index, item) {
                    var createdDate = flyer.formatDate('yyyy-mm-dd HH:MM', item.createdDate);
                    var $template = `<a href="#" class="pull-left text-ellipsis js-notice-item ${index===0?' js-notice-item-active':' hide'}" data-id="${item.id}">
                                        <span class="js-notice-title">${createdDate+'#' + item.noticeTitle}</span>
                                        <span class="js-notice-content">${item.noticeContent}</span>
                                     </a>`;
                    $noticeContainer.append($template);
                });
                // $noticeItemClone.remove();
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
        });
    }

    // 用户登录
    function userLoginHandler(event) {
        flyer.open({
            pageUrl: '/html/user_login.html',
            isModal: true,
            area: [400, 150],
            title: '用户登录',
            btns: [{
                text: '登录',
                click: function(ele) {
                    var that = this;
                    var userInfo = getUserInfo($('form[name=userLoginForm]'));
                    var validResult = validUserInfo(userInfo, false);
                    if (validResult.isPass) {
                        $.ajax({
                            url: '/api/userLogin',
                            type: 'POST',
                            data: userInfo,
                            beforeSend: function(jqXHR, settings) {
                                $.lockedBtn($(ele), true, ('登录中'));
                            },
                            success: function(data, textStatus, jqXHR) {
                                if (data.success) {
                                    flyer.msg('操作成功');
                                    that.close();
                                    window.location.assign('/console');
                                } else {
                                    flyer.msg('操作失败：' + data.message);
                                }
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                flyer.msg(baseDatas.errorMsg);
                            },
                            complete: function(jqXHR, textStatus) {
                                $.unlockBtn($(ele), ('登录'));
                            }
                        });
                    } else {
                        flyer.msg(validResult.msg);
                    }
                }
            }, {
                text: '取消',
                click: function() {
                    this.close();
                }
            }]
        });
        return false;
    }

    // 用户注册
    function userRegisterHandler(event) {
        flyer.open({
            pageUrl: '/html/user_register.html',
            isModal: true,
            area: [440, 350],
            title: '用户注册',
            btns: [{
                text: '注册',
                click: function(ele) {
                    var that = this;
                    var userInfo = getUserInfo($('form[name=userRegisterForm]'));
                    var validResult = validUserInfo(userInfo, true);
                    if (validResult.isPass) {
                        $.ajax({
                            url: '/api/createUser',
                            type: 'POST',
                            data: userInfo,
                            beforeSend: function(jqXHR, settings) {
                                $.lockedBtn($(ele), true, ('注册中'));
                            },
                            success: function(data, textStatus, jqXHR) {
                                if (data.success) {
                                    flyer.msg('操作成功');
                                    that.close();
                                    window.location.assign('/console');
                                } else {
                                    flyer.msg('操作失败：' + data.message);
                                }
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                flyer.msg(baseDatas.errorMsg);
                            },
                            complete: function(jqXHR, textStatus) {
                                $.unlockBtn($(ele), ('注册'));
                            }
                        });
                    } else {
                        flyer.msg(validResult.msg);
                    }
                }
            }, {
                text: '取消',
                click: function() {
                    this.close();
                }
            }]
        });
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
    function validUserInfo(userInfo, isRegister) {
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
                msg: '用户名不能为空且长度是5-20位'
            };
        }
        // 判断密码
        if (!userInfo.password ||
            userInfo.password.length > userNameMaxLength ||
            userInfo.password.length < userNameMinLength) {
            return {
                isPass: false,
                msg: '密码不能为空且长度是5-20位'
            };
        }

        // 判断两次密码是否一致
        if (isRegister && userInfo.password !== userInfo.confirmPassword) {
            return {
                isPass: false,
                msg: '两次密码不一致'
            };
        }
        return {
            isPass: true,
            msg: '校验通过'
        };
    }

    // 判断用户名是否存在
    function isExistUser(userInfo) {

    }
    init();
});