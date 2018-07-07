'use strict';
$(function() {
    function init() {
        inieEvent();
    }

    function inieEvent() {
        // 注册
        $('#userRegister').on('click', userRegisterHandler);
        // 登录
        $('#userLogin').on('click', userLoginHandler);
    }

    function userLoginHandler(event) {
        flyer.open({
            pageUrl: '/html/user_login.html',
            isModal: true,
            area: [400, 150],
            title: '用户登录',
            btns: [{
                text: '登录',
                skin: 'flyer-btn-blue',
                click: function(ele) {
                    var that = this;
                    $.ajax({
                        url: '/api/userLogin',
                        type: 'POST',
                        data: {
                            userName: 'surong',
                            password: 'surong',
                            phone: '18098971690',
                            QQ: '838472035',
                            email: 'keepFur@163.com'
                        },
                        beforeSend: function(jqXHR, settings) {
                            $.lockedBtn($(ele), true, ('登录中'));
                        },
                        success: function(data, textStatus, jqXHR) {
                            flyer.msg(data.success ? ('操作成功') : ('操作失败'));
                            that.close();
                            getTableDatas(1, 20);
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            flyer.msg(baseDatas.errorMsg);
                        },
                        complete: function(jqXHR, textStatus) {
                            $.unlockBtn($(ele), ('登录'));
                        }
                    });
                }
            }, {
                text: '取消',
                skin: 'flyer-btn-default',
                click: function() {
                    this.close();
                }
            }]
        });
        return false;
    }

    function userRegisterHandler(event) {
        return false;
    }
    init();
});