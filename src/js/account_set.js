//  用户充值模块
"use strict";
layui.use(['element', 'layer', 'form'], function () {
    var element = layui.element;
    var layer = layui.layer;
    var form = layui.form;
    var passwordErrorMsg = '密码是由6-15位的数字或密码组成';
    var phoneErrorMsg = '电话是由11位的数字组成';
    var userId = $('#userName').data('user-id');
    var userName = $('#userName').data('user-name');
    var level = 0;
    var minMoney = 990;
    // 入口函数
    (function init() {
        initComponment();
        initEvent();
    })()

    // 初始化组件
    function initComponment() {
        getUserInfoServer(setUserInfo);
    }

    // 事件初始化
    function initEvent() {
        // 修改个人信息
        $('#updateInfoBtn').on('click', updateInfoHandler);
        // 重置密码
        $('#updatePasswordBtn').on('click', updatePasswordHandler);
        // 升级
        $('#updateLevelBtn').on('click', updateLevelHandler);
    }

    // 更新个人资料
    function updateInfoHandler(e) {
        var userInfo = getUserInfoClient();
        if (!/^1[0-9]{10}$/.test(userInfo.phone)) {
            layer.msg(phoneErrorMsg);
            return;
        }
        $.ajax({
            url: '/api/updateUser',
            type: 'POST',
            data: userInfo,
            success: function (data, textStatus, jqXHR) {
                layer.msg(data.success ? ('操作成功') : ('操作失败'));
                getUserInfoServer(setUserInfo);
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
        if (!/^[a-zA-Z0-9]{6,15}$/g.test(pass.old) || !/^[a-zA-Z0-9]{6,15}$/g.test(pass.new)) {
            layer.msg(passwordErrorMsg);
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


    /**
     * 会员升级
     *
     */
    function updateLevelHandler(e) {
        if (level === 2) {
            layer.msg('老板，你已经是我们的顶级会员了，已经大权在握，杠杠的！！！');
            return false;
        }
        // 获取用户的余额，判断月是否大于等于1000
        getUserInfoServer(function (data) {
            var money = data.money;
            if (money >= minMoney) {
                $.ajax({
                    url: '/api/updateLevelUser',
                    type: 'POST',
                    data: {
                        id: userId,
                        level: 2,
                        money: money,
                        userName: userName,
                        orderNumber: APIUtil.generateOrderNumer()
                    },
                    success: function (data, textStatus, jqXHR) {
                        layer.msg(data.success ? '恭喜老板，你已经成为最高等级的会员了，赶紧去下单享受特权吧！！！' : ('操作失败' + data.message));
                        getUserInfoServer(setUserInfo);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        layer.msg(baseDatas.netErrMsg);
                    }
                });
            } else {
                layer.msg(`您的账户余额不足${core.fenToYuan(minMoney)}元， 请充值之后再升级。当前账户余额是 ${core.fenToYuan(money)} 元!`);
            }
        });
        return false;
    }

    // 获取个人信息
    function getUserInfoServer(callback) {
        $.get('/api/readUserById?id=' + userId, function (res) {
            if (res.success) {
                callback(res.data.rows[0]);
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
        // 等级
        $('form[name=updateLevelForm] input[name=oldLevel]').val((userInfo.level === 2 ? '金牌会员（' : '普通会员（') + core.fenToYuan(userInfo.money) + '）元');
        level = userInfo.level;
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
