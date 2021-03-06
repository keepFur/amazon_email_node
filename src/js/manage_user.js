'use strict';
layui.use(['form', 'element', 'layer', 'table', 'util'], function () {
    var form = layui.form;
    var element = layui.element;
    var layer = layui.layer;
    var table = layui.table;
    var util = layui.util;
    var baseDatas = {
        // 表格实例
        $table: null,
        // 错误消息
        paramErrMsg: '参数错误，请刷新页面重试',
        netErrMsg: '系统已退出登录，请登录系统重试',
        operatorErrMsg: {
            single: '请选择一条数据操作',
            batch: '请至少选择一条数据操作'
        }
    };
    var openContentUpdate = `<form class="layui-form layui-form-pane" name="userUpdateForm">
                                <div class="layui-form-item">
                                    <label class="layui-form-label">手机</label>
                                    <div class="layui-input-block">
                                        <input type="text" name="phone" placeholder="非必填" class="layui-input">
                                    </div>
                                </div>
                                <div class="layui-form-item">
                                    <label class="layui-form-label">邮箱</label>
                                    <div class="layui-input-block">
                                        <input type="text" name="email" placeholder="非必填" class="layui-input">
                                    </div>
                                </div>
                                <div class="layui-form-item">
                                    <label class="layui-form-label">QQ</label>
                                    <div class="layui-input-block">
                                        <input type="text" name="QQ"  placeholder="非必填" class="layui-input">
                                    </div>
                                </div>
                            </form>`;
    var userNameMinLength = 5;
    var userNameMaxLength = 20;

    /**
     *页面入口函数 
     * 
     */
    (function init() {
        form.render('select');
        // 获取表格数据
        renderTable();
        // 初始化事件
        initEvent();
    })();

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 查询
        $('#searchBtn').on('click', searchHandle);
        // 重置
        $('#resetBtn').on('click', function () {
            $('#userSearchForm')[0].reset();
            return false;
        });
        // 注册用户
        $('#createUserBtn').on('click', createUserHandle);
        // 修改用户
        $('#updateUserBtn').on('click', updateUserHandle);
        // 余额充值
        $('#addMoneyUserBtn').on('click', addMoneyUserHandle);
        // 会员等级修改
        $('#updateLevelUserBtn').on('click', updateLevelUserHandle);
        // 禁用用户
        $('#disabledUserBtn').on('click', {
            type: 0
        }, toggleUserHandle);
        // 启用用户
        $('#enabledUserBtn').on('click', {
            type: 1
        }, toggleUserHandle);
    }

    /**
     * 查询的点击事件处理函数
     * 
     * @param {any} events 
     */
    function searchHandle(events) {
        var queryParams = getQueryParams();
        reloadTable({
            where: queryParams,
            page: {
                curr: 1,
                limit: 10
            }
        });
        return false;
    }

    /**
     * 注册用户的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createUserHandle(events) {
        layer.msg(' 请前往首页注册！！');
        return false;
    }

    /**
     * 修改用户的点击事件处理函数
     * 
     * @param {any} events 
     */
    function updateUserHandle(event) {
        var selectDatas = table.checkStatus('userTable').data;
        if (selectDatas.length === 1) {
            layer.open({
                content: openContentUpdate,
                area: ['440px'],
                title: '修改用户「' + selectDatas[0].userName + '」',
                btn: ['修改', '取消'],
                yes: function (index) {
                    var userInfo = core.getFormValues($('form[name=userUpdateForm]'));
                    userInfo.id = selectDatas[0].id;
                    $.ajax({
                        url: '/api/updateUser',
                        type: 'POST',
                        data: userInfo,
                        success: function (data, textStatus, jqXHR) {
                            layer.msg(data.success ? ('操作成功') : ('操作失败'));
                            layer.close(index);
                            reloadTable();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        }
                    });
                },
                success: function () {
                    setUserInfo($('form[name=userUpdateForm]'), selectDatas[0]);
                }
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     *  余额充值的点击事件处理函数
     * 
     * @param {any} events 
     */
    function addMoneyUserHandle(events) {
        var selectDatas = table.checkStatus('userTable').data;
        if (selectDatas.length === 1) {
            layer.open({
                content: `<form class="layui-form layui-form-pane">
                                <div class="layui-form-item">
                                    <label class="layui-form-label">金额（分）</label>
                                    <div class="layui-input-block">
                                        <input type="text" name="money" placeholder="单位为分，只能是正整数，最少10元"  class="layui-input">
                                    </div>
                                </div>
                            </form>`,
                area: ['400px'],
                title: '余额充值（单位：分）',
                btn: ['充值', '取消'],
                yes: function (index) {
                    var money = $.trim($('input[name=money]').val());
                    var validAddMoneyUserResult = validAddMoneyUser(money);
                    if (validAddMoneyUserResult.isPass) {
                        $.ajax({
                            url: '/api/userAddMoney',
                            type: 'POST',
                            data: {
                                money: money,
                                id: selectDatas[0].id,
                                userName: selectDatas[0].userName,
                                balance: selectDatas[0].money
                            },
                            success: function (data, textStatus, jqXHR) {
                                layer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                                layer.close(index);
                                reloadTable();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                layer.msg(baseDatas.errorMsg);
                            }
                        });
                    } else {
                        layer.msg(validAddMoneyUserResult.msg);
                    }
                }
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 会员等级修改的点击事件处理函数
     * 会员升级一次 1000分
     * @param {any} events 
     */
    function updateLevelUserHandle(events) {
        var selectDatas = table.checkStatus('userTable').data;
        var minMoney = 1000;
        var tipMsg = `<span style="color:#f00;">确定升级吗？</br>升级之后可以享受<strong>九折</strong>优惠!</br>升级会从账户中抵扣${minMoney}元，</br>请确保账户中有足够的余额！</span>`;
        if (selectDatas.length === 1) {
            // 获取用户的余额，判断余额是否大于等于1000分
            readUserById(selectDatas[0].id, function (data) {
                if (data.success) {
                    var money = data.data.rows[0].money;
                    if (money >= minMoney) {
                        layer.confirm(tipMsg, {
                            btn: ['确定', '取消'],
                            title: "询问框",
                        }, function () {
                            $.ajax({
                                url: '/api/updateLevelUser',
                                type: 'POST',
                                data: {
                                    id: selectDatas[0].id,
                                    userName: selectDatas[0].userName,
                                    money: selectDatas[0].money,
                                    level: 2
                                },
                                success: function (data, textStatus, jqXHR) {
                                    layer.msg(data.success ? '操作成功' : ('操作失败' + data.message));
                                    reloadTable();
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    layer.msg(baseDatas.netErrMsg);
                                }
                            });
                        });
                    } else {
                        layer.msg(`您的余额不足${minMoney}， 请充值之后再升级。当前余额是 ${money} 元!`);
                    }
                } else {
                    layer.msg(data.message);
                }
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 切换用户状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleUserHandle(events) {
        var selectDatas = table.checkStatus('userTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                btn: ['确定', '取消'],
                title: "询问框",
            }, function () {
                $.ajax({
                    url: '/api/toggleUser',
                    type: 'POST',
                    data: {
                        id: selectDatas[0].id,
                        status: type
                    },
                    success: function (data, textStatus, jqXHR) {
                        layer.msg(data.success ? '操作成功' : ('操作失败' + data.message));
                        reloadTable();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        layer.msg(baseDatas.netErrMsg);
                    }
                });
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 渲染表格结构
     * 
     */
    function renderTable() {
        table.render({
            elem: '#userTable',
            url: '/api/readUserPage',
            page: true,
            cols: [
                [{
                        checkbox: true,
                        fixed: 'left',
                    },
                    {
                        field: '',
                        title: '序号',
                        width: 60,
                        fixed: 'left',
                        templet: function (d) {
                            return d.LAY_INDEX;
                        }
                    },
                    {
                        title: '用户名',
                        field: "userName",
                        fixed: 'left',
                        width: 150,
                    }, {
                        title: '当前余额（元）',
                        field: "money",
                        width: 150,
                        templet: function (d) {
                            return core.fenToYuan(d.money);
                        }
                    }, {
                        title: '等级',
                        field: "level",
                        width: 150,
                        templet: function (d) {
                            return d.level === 1 ? '普通' : '金牌';
                        }
                    }, {
                        title: '邮箱',
                        field: "email",
                        width: 150,
                        templet: function (d) {
                            return d.email ? d.email : '';
                        }
                    }, {
                        title: '电话',
                        field: "phone",
                        width: 150,
                        templet: function (d) {
                            return d.phone ? d.phone : '';
                        }
                    }, {
                        title: 'QQ',
                        field: "QQ",
                        width: 150,
                        templet: function (d) {
                            return d.QQ ? d.QQ : '';
                        }
                    }, {
                        title: '注册时间',
                        width: 200,
                        field: "createdDate",
                        templet: function (d) {
                            return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
                        }
                    }, {
                        title: '最后修改时间',
                        field: "updateDate",
                        width: 200,
                        templet: function (d) {
                            return d.updateDate ? util.toDateString(d.updateDate, 'yyyy-MM-dd HH:mm') : '';
                        }
                    }, {
                        title: '状态',
                        field: 'status',
                        width: 120,
                        fixed: 'right',
                        templet: function (d) {
                            return d.status === 1 ? '启用' : '<span class="layui-text-pink">停用</span>';
                        }
                    }, {
                        title: '操作',
                        field: '',
                        width: 150,
                        fixed: 'right',
                        templet: function (d) {
                            return `<a class="layui-btn layui-btn-normal layui-btn-xs js-view-extend" data-username="${d.userName}" data-id="${d.id}" data-othersharecode="${d.otherShareCode}" data-mysharecode="${d.myShareCode}">推广详情</a>`;
                        }
                    }
                ]
            ],
            limits: [10, 20, 50, 100],
            page: {
                theme: '#1E9FFF',
                layout: ['prev', 'page', 'next', 'skip', 'count', 'limit']
            },
            request: {
                pageName: 'offset'
            },
            response: {
                statusCode: true
            },
            parseData: function (res) {
                return {
                    code: res.success,
                    msg: res.msg,
                    count: res.data.total,
                    data: res.data.rows
                }
            },
            done: function (res) {
                $('.js-view-extend').off('click').on('click', function (event) {
                    var username = $(this).data('username');
                    var id = $(this).data('id');
                    var otherShareCode = $(this).data('othersharecode') || '';
                    var myShareCode = $(this).data('mysharecode');
                    // 需要显示的内容
                    // 1，用户注册的来源（是否是别人推荐的，如果是显示上家的用户名，否则显示一级代理）
                    // 2，显示当前用户的下级代理数量以及用户详情（用户id， 用户名  等级  用户余额 注册时间）
                    // 3，显示用户所获得的佣金总额
                    // 显示的方式：弹出框，下级代理用表格展示
                    $.ajax({
                        url: '/api/readUserExtendDetailById',
                        data: {
                            id: id,
                            otherShareCode
                        },
                        success: function (res) {
                            // 初始化内容
                            if (res.success) {
                                layer.open({
                                    content: `<div>
                                                <h5 class="layui-text-green">推广概览</h5>
                                                <div class="layui-row layui-anim layui-anim-up layui-anim-fadein layui-anim-rotate" style="margin-bottom:16px;">
                                                    <div class="layui-col-md6 home-account-info" style="padding:8px;">
                                                        <h3 class="pull-left">注册来源：<span class="layui-text-pink js-user-register">0</span></h3>
                                                    </div>
                                                    <div class="layui-col-md6 home-account-info" style="padding:8px;">
                                                        <h3 class="pull-left">佣金总额：<span class="layui-text-pink js-user-extend-money">0</span></h3>
                                                    </div>
                                                  </div>
                                                  <h5 class="layui-text-green">下级代理</h5>
                                                  <div lay-filter='userExtend' id="userExtendTable"></div>
                                                </div>`,
                                    area: ['800px', '600px'],
                                    title: `用户【${username}】推广详情`,
                                    btn: ['关闭'],
                                    yes: function (index) {
                                        layer.close(index);
                                    },
                                    success: function () {
                                        renderUserExtendTable(myShareCode);
                                        $('.js-user-register').text(res.data.registerOrigin);
                                        $('.js-user-extend-money').text(core.fenToYuan(res.data.extendMoney || 0) + '元');
                                    }
                                });
                            } else {
                                console.log(res.message);
                                layer.msg('服务器出现异常，请刷新页面重试！');
                            }
                        },
                        error: function (error) {
                            layer.msg('服务器出现异常，请刷新页面重试！');
                        }
                    });

                });
            }
        });
    }

    /**
     * 渲染用户下级代理表格
     * 
     */
    function renderUserExtendTable(myShareCode) {
        // 用户id， 用户名  等级  用户余额 注册时间）
        table.render({
            elem: '#userExtendTable',
            url: '/api/readShareUserPage',
            page: true,
            where: {
                myShareCode
            },
            cols: [
                [{
                    title: '用户名',
                    field: "userName",
                }, {
                    title: '当前余额（元）',
                    field: "money",
                    width: 150,
                    templet: function (d) {
                        return core.fenToYuan(d.money);
                    }
                }, {
                    title: '等级',
                    field: "level",
                    width: 100,
                    templet: function (d) {
                        return d.level === 1 ? '普通' : '金牌';
                    }
                }, {
                    title: '注册时间',
                    width: 200,
                    field: "createdDate",
                    templet: function (d) {
                        return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
                    }
                }, {
                    title: '状态',
                    field: 'status',
                    width: 100,
                    templet: function (d) {
                        return d.status === 1 ? '启用' : '<span class="layui-text-pink">停用</span>';
                    }
                }]
            ],
            limits: [10, 20, 50, 100],
            page: {
                theme: '#1E9FFF',
                layout: ['prev', 'page', 'next', 'skip', 'count', 'limit']
            },
            request: {
                pageName: 'offset'
            },
            response: {
                statusCode: true
            },
            parseData: function (res) {
                return {
                    code: res.success,
                    msg: res.msg,
                    count: res.data.total,
                    data: res.data.rows
                }
            }
        });
    }

    /**
     * 重载表格
     * 
     */
    function reloadTable(options) {
        table.reload('userTable', options);
    }

    /**
     * 根基用户的id获取用户的信息
     * 
     * @param {Number} id 用户id
     * @param {funciton} callback 回调函数
     */
    function readUserById(id, callback) {
        if (!id) {
            if (typeof callback === 'function') {
                callback({
                    success: false,
                    message: '用户id不能为空'
                });
            }
            return;
        }
        $.ajax({
            url: '/api/readUserById',
            data: {
                id: id
            },
            success: function (data) {
                callback(data);
            },
            error: function (error) {
                callback(data);
            }
        });
    }

    /**
     * 校验余额，正整数，大于1000
     * 
     * @param {Number} money 分
     */
    function validAddMoneyUser(money) {
        if (!money) {
            return {
                isPass: false,
                msg: '请输入充值金额'
            }
        }

        if (money < 100) {
            return {
                isPass: false,
                msg: '充值金额不能小于10元'
            }
        }
        if (isNaN(money)) {
            return {
                isPass: false,
                msg: '充值金额只能是正整数'
            }
        }
        return {
            isPass: true,
            msg: ''
        };
    }

    /**
     *获取表格的查询参数
     *
     * @returns 返回所有参数的对象
     */
    function getQueryParams() {
        var $form = $('#userSearchForm');
        var formDatas = $form.serializeArray();
        var ret = {};
        $.each(formDatas, function (index, item) {
            ret[item.name] = item.value;
        });
        return ret;
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

    /**
     * 设置表单数据
     * 
     * @param {object} $form 表单对象
     * @param {object} userInfo 表单信息
     */
    function setUserInfo($form, userInfo) {
        if (!$form || !userInfo) {
            $.writeLog('manage_user-setUserInfo', '表单元素或表单信息为空');
            return;
        }
        for (var key in userInfo) {
            if (userInfo.hasOwnProperty(key)) {
                var element = userInfo[key];
                $form.find('input[name=' + key + ']').val(element);
            }
        }
        return;
    }
});