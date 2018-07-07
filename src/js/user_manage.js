'use strict';
flyer.define('user_manage', function(exports, module) {
    var baseDatas = {
        // 表格实例
        $table: null,
        pagerObj: null,
        pageSizeSelectObj: null,
        curIndex: Number(flyer.getQueryString('curIndex') || 1),
        // 错误消息
        paramErrMsg: '参数错误，请刷新页面重试',
        netErrMsg: '系统已退出登录，请登录系统重试',
        operatorErrMsg: {
            single: '请选择一条数据操作',
            batch: '请至少选择一条数据操作'
        }
    };

    /**
     *页面入口函数 
     * 
     */
    function init() {
        // 获取表格数据
        getTableDatas(baseDatas.curIndex, 20);
        // 初始化事件
        initEvent();
    }

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 创建用户
        $('.createUser').on('click', createUserHandle);
        // 积分充值
        $('.addMoneyUser').on('click', addMoneyUserHandle);
        // 会员等级修改
        $('.updateLevelUser').on('click', updateLevelUserHandle);
        // 禁用用户
        $('.disabledUser').on('click', {
            type: 0
        }, toggleUserHandle);
        // 启用用户
        $('.enabledUser').on('click', {
            type: 1
        }, toggleUserHandle);
    }

    /**
     * 创建用户的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createUserHandle(events) {
        flyer.open({
            pageUrl: '/html/user_register.html',
            isModal: true,
            area: [440, 350],
            title: '注册用户',
            btns: [{
                text: '保存',
                click: function(ele) {
                    var that = this;
                    $.ajax({
                        url: '/api/createUser',
                        type: 'POST',
                        data: {
                            userName: 'surong',
                            password: 'surong',
                            phone: '18098971690',
                            QQ: '838472035',
                            email: 'keepFur@163.com'
                        },
                        beforeSend: function(jqXHR, settings) {
                            $.lockedBtn($(ele), true, ('保存中'));
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
                            $.unlockBtn($(ele), ('保存'));
                        }
                    });
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

    /**
     *  积分充值的点击事件处理函数
     * 
     * @param {any} events 
     */
    function addMoneyUserHandle(events) {
        var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
        if (selectDatas.length === 1) {
            flyer.open({
                pageUrl: '/html/user_add_money.html',
                isModal: true,
                area: [400, 150],
                title: '积分充值',
                btns: [{
                    text: '充值',
                    click: function(ele) {
                        var that = this;
                        var money = $.trim($('input[name=money]').val());
                        var validAddMoneyUserResult = validAddMoneyUser(money);
                        if (validAddMoneyUserResult.isPass) {
                            $.ajax({
                                url: '/api/userAddMoney',
                                type: 'POST',
                                data: {
                                    money: money,
                                    id: selectDatas[0].id
                                },
                                beforeSend: function(jqXHR, settings) {
                                    $.lockedBtn($(ele), true, ('充值中'));
                                },
                                success: function(data, textStatus, jqXHR) {
                                    flyer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                                    that.close();
                                    getTableDatas(1, 20);
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    flyer.msg(baseDatas.errorMsg);
                                },
                                complete: function(jqXHR, textStatus) {
                                    $.unlockBtn($(ele), '充值');
                                }
                            });
                        } else {
                            flyer.msg(validAddMoneyUserResult.msg);
                        }
                    }
                }, {
                    text: '取消',
                    click: function() {
                        this.close();
                    }
                }]
            });
        } else {
            flyer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 会员等级修改的点击事件处理函数
     * 会员升级一次 1000积分
     * @param {any} events 
     */
    function updateLevelUserHandle(events) {
        var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
        var minMoney = 1000;
        var tipMsg = `<span style="color:#f00;">确定升级吗？</br>升级之后可以享受<strong>九折</strong>优惠!</br>升级会从账户中抵扣${minMoney}积分，</br>请确保账户中有足够的积分！</span>`;
        if (selectDatas.length === 1) {
            // 获取用户的积分，判断月是否大于等于1000
            readUserById(selectDatas[0].id, function(data) {
                if (data.success) {
                    var money = data.data.rows[0].money;
                    if (money >= minMoney) {
                        flyer.confirm(tipMsg, function(result) {}, {
                            btns: [{
                                    text: '确定',
                                    click: function(elm) {
                                        this.close();
                                        $.ajax({
                                            url: '/api/updateLevelUser',
                                            type: 'POST',
                                            data: {
                                                id: selectDatas[0].id,
                                                level: 2
                                            },
                                            success: function(data, textStatus, jqXHR) {
                                                flyer.msg(data.success ? '操作成功' : ('操作失败' + data.message));
                                                getTableDatas(1, 20);
                                            },
                                            error: function(jqXHR, textStatus, errorThrown) {
                                                flyer.msg(baseDatas.netErrMsg);
                                            }
                                        });
                                    }
                                },
                                {
                                    text: ("取消"),
                                    click: function(elm) {
                                        this.close();
                                    }
                                }
                            ],
                            title: "询问框",
                            isModal: true
                        });
                    } else {
                        flyer.msg(`您的积分余额不足${minMoney}， 请充值之后再升级。当前积分余额是 ${money}积分!`);
                    }
                } else {
                    flyer.msg(data.message);
                }
            });
        } else {
            flyer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 切换用户状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleUserHandle(events) {
        var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            flyer.confirm(tipMsg, function(result) {}, {
                btns: [{
                        text: '确定',
                        click: function(elm) {
                            this.close();
                            $.ajax({
                                url: '/api/toggleUser',
                                type: 'POST',
                                data: {
                                    id: selectDatas[0].id,
                                    status: type
                                },
                                success: function(data, textStatus, jqXHR) {
                                    flyer.msg(data.success ? '操作成功' : ('操作失败' + data.message));
                                    getTableDatas(1, 20);
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    flyer.msg(baseDatas.netErrMsg);
                                }
                            });
                        }
                    },
                    {
                        text: ("取消"),
                        click: function(elm) {
                            this.close();
                        }
                    }
                ],
                title: "询问框",
                isModal: true
            });
        } else {
            flyer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 渲染表格结构
     * 
     * @param {jq} $table 表格容器
     * @param {Array} datas 表格数据
     */
    function renderTable($table, datas) {
        if ($table && $table.length && Array.isArray(datas)) {
            baseDatas.$table = flyer.table($table, {
                columns: [{
                    field: "",
                    checkbox: true,
                    styles: {
                        width: 34
                    }
                }, {
                    title: '用户名',
                    field: "userName"
                }, {
                    title: '当前积分',
                    field: "money"
                }, {
                    title: '会员等级',
                    field: "level",
                    formatter: function(row) {
                        return row.level === 1 ? '普通会员' : '金牌会员';
                    }
                }, {
                    title: '邮箱',
                    field: "email"
                }, {
                    title: '电话',
                    field: "phone"
                }, {
                    title: 'QQ',
                    field: "QQ"
                }, {
                    title: '创建时间',
                    field: "createdDate",
                    formatter: function(row, rows) {
                        return flyer.formatDate('yyyy-MM-dd hh:mm', row.createdDate);
                    }
                }, {
                    title: '状态',
                    field: 'status',
                    formatter: function(row) {
                        return row.status === 1 ? '启用' : '停用';
                    }
                }],
                data: datas
            });
        } else {
            flyer.msg(baseDatas.paramErrMsg);
        }
    }

    /**
     * 初始化分页信息
     * 
     * @param {jq} $table 表格初始化之后的实例对象 
     * @param {Array} datas 表格的数据
     */
    function randerDOMPager($table, datas, total, pagerObj) {
        // 没有数据的时候
        core.tableNoMatch($table, '暂时没有用户');
        // 初始化下拉框，显示每页数据条数的下拉框
        baseDatas.pageSizeSelectObj = core.initPagerSizeSelect($('#userPagerSize'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
            callback: getTableDatas,
            pagerObj: baseDatas.pagerObj,
            total: datas.total,
            exports: exports
        });
        // 初始化分页
        baseDatas.pagerObj = core.initPager($('.paper-container-type'), total, pagerObj.pageSize || 20, {
            callback: getTableDatas,
            pageNumber: pagerObj.pageNumber || 1,
            pageSizeSelectObj: baseDatas.pageSizeSelectObj,
            exports: exports
        });
        // 有数据的时候。才需要去初始化
        if (datas.total) {
            // 为表中的checkbox绑定点击事件
            core.bindCheckboxEvent($table);
        }
    }

    /**
     * 设置spanner
     * 
     * @param {any} currentTotal 当前显示数据的总数
     * @param {any} total 总数居
     */
    function setMountValue(currentTotal, total) {
        $('#currentUserMountSpan').text(currentTotal);
        $('#userMountSpan').text(total);
    }

    /**
     * 获取表格数据
     * 
     * @param {Number} pageNumber 当前显示页数，默认为0
     * @param {NUmber} pageSize 煤业显示的数据条数，默认为20
     */
    function getTableDatas(pageNumber, pageSize) {
        var conditions = {
                offset: pageNumber || 1,
                limit: pageSize || 20,
                nocache: window.Date.now(),
                keyword: '',
                companyOrgID: baseDatas.companyOrgID
            },
            $table = $('#userTable');
        $.ajax({
            url: '/api/readUserPage',
            type: 'GET',
            data: conditions,
            beforeSend: function(jqXHR, settings) {
                $.addLoading();
            },
            success: function(data, jqXHR, textStatus) {
                if (data.success) {
                    renderTable($table, data.data.rows);
                    randerDOMPager(baseDatas.$table, data.data.rows, data.data.total, {
                        pageNumber: pageNumber || 1,
                        pageSize: pageSize || 20
                    });
                    setMountValue(data.data.rows.length, data.data.total);
                    core.bindCheckboxEvent(baseDatas.$table);
                } else {
                    flyer.msg(data.message);
                    renderTable($table, []);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                flyer.msg(baseDatas.netErrMsg);
            },
            complete: function(jqXHR, textStatus) {
                $.removeLoading()
            }
        });
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
            success: function(data) {
                callback(data);
            },
            error: function(error) {
                callback(data);
            }
        });
    }

    /**
     * 校验积分金额，正整数，大于1000
     * 
     * @param {Number} money 积分
     */
    function validAddMoneyUser(money) {
        if (!money) {
            return {
                isPass: false,
                msg: '请输入充值金额'
            }
        }

        if (money < 1000) {
            return {
                isPass: false,
                msg: '充值金额不能小于1000'
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

    // 页面入口
    init();
});