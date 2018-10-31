//  用户充值模块
"use strict";
layui.use(['element', 'layer', 'form'], function () {
    var element = layui.element;
    var layer = layui.layer;
    var form = layui.form;
    var userId = $('#userName').data('user-id');
    var userName = $('#userName').data('user-name');
    // 入口函数
    (function init() {
        initComponment();
        initEvent();
    })()

    // 初始化组件
    function initComponment() {
        getUserInfoServer();
    }

    // 事件初始化
    function initEvent() {
        // 修改个人信息
        $('#updateInfoBtn').on('click', updateInfoHandler);
        // 重置密码
        $('#updatePasswordBtn').on('click', updatePasswordHandler);
    }

    // 更新个人资料
    function updateInfoHandler(e) {
        var userInfo = getUserInfoClient();
        if (!userInfo.phone) {
            layer.msg('手机号不能为空');
            return;
        }
        $.ajax({
            url: '/api/updateUser',
            type: 'POST',
            data: userInfo,
            success: function (data, textStatus, jqXHR) {
                layer.msg(data.success ? ('操作成功') : ('操作失败'));
                getUserInfoServer();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                layer.msg(baseDatas.errorMsg);
            }
        });
        return false;
    }

    // 修改密码
    function updatePasswordHandler(e) {
        var pass = {
            old: $('form[name=userUpdatePasswordForm] input[name=oldPassword]').val(),
            new: $('form[name=userUpdatePasswordForm] input[name=password]').val(),
        };
        if (!pass.old || !pass.new) {
            layer.msg('密码不能为空');
            return false;
        }
        if (pass.new === pass.old) {
            layer.msg('新密码和就密码一致，无需修改');
            return false;
        }
        // 验证原密码是否正确
        $.ajax({
            url: '/api/userLogin',
            method: 'POST',
            data: {
                password: pass.old,
                userName: userName
            },
            dataType: 'json',
            success: function (data, textStatus, jqXHR) {
                if (data.success) {
                    $.ajax({
                        url: '/api/setUserPassword',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            userName: userName,
                            password: pass.new
                        },
                        success: function (data, textStatus, jqXHR) {
                            if (data.success) {
                                layer.msg('操作成功，请重新登录');
                                window.location.href = '/api/logout';
                                //  $.get('/api/logout');
                            } else {
                                layer.msg('操作失败');
                            }
                        }
                    });
                } else {
                    layer.msg('原密码不正确');
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                mdui.snackbar({
                    message: '网络错误',
                    position: 'top'
                });
            }
        });
        return false;
    }

    // 获取个人信息
    function getUserInfoServer() {
        $.get('/api/readUserById?id=' + userId, function (res) {
            if (res.success) {
                setUserInfo(res.data.rows[0]);
            } else {
                layer.msg('服务器发生异常');
            }
        }, 'json');
    }

    // 设置个人信息
    function setUserInfo(userInfo) {
        $('form[name=userUpdateForm] input[name=email]').val(userInfo.email);
        $('form[name=userUpdateForm] input[name=QQ]').val(userInfo.QQ);
        $('form[name=userUpdateForm] input[name=phone]').val(userInfo.phone);
    }

    // 获取用户表单信息
    function getUserInfoClient() {
        return {
            id: userId,
            email: $('form[name=userUpdateForm] input[name=email]').val(),
            QQ: $('form[name=userUpdateForm] input[name=QQ]').val(),
            phone: $('form[name=userUpdateForm] input[name=phone]').val()
        };
    }
});
