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
        // 删除用户
        $('.deleteUser').on('click', deleteUserHandle);
    }

    /**
     * 创建用户的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createUserHandle(events) {
        flyer.open({
            pageUrl: '/html/create_user.html',
            isModal: true,
            area: [440, 340],
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
     * 删除客诉记录按钮点击事件处理函数(批量删除)
     * 
     * @param {any} events 
     */
    function deleteUserHandle(events) {
        var selectDatas = flyer.exports.baseData.getTableCheckedDatas(baseDatas.$table);
        if (selectDatas.length !== 1) {
            flyer.confirm("确定删除吗?", function(result) {}, {
                btns: [{
                        text: ('确定'),
                        skin: "flyer-btn-blue",
                        click: function(elm) {
                            this.close();
                            $.ajax({
                                url: '/api/deleteUser',
                                type: 'POST',
                                data: {
                                    id: selectDatas[0].id
                                },
                                success: function(data, textStatus, jqXHR) {
                                    flyer.msg(data.success ? ('操作成功') : ('操作失败'));
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
                    title: '创建时间',
                    field: "createdDate"
                }, {
                    title: '等级',
                    field: "level"
                }, {
                    title: '状态',
                    field: 'status'
                }, {
                    title: '操作',
                    styles: {
                        width: 120
                    },
                    formatter: function(row) {
                        return '<span class="table-btn" title="编辑"><i class="icon-pen table-btn flyer-edittype-btn" data-id="' + row.ID + '" data-producttype = "' + row.productType + '" style="padding-right:8px;"></i></span>' +
                            '<span class="table-btn" title="删除" style="display:none;"><i class="icon-remove table-btn flyer-deletetype-btn" data-id="' + row.ID + '" style="padding-right:8px;"></i></span>'
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
        core.tableNoMatch($table, '暂时没有相关商品品类记录');
        // 初始化下拉框，显示每页数据条数的下拉框
        baseDatas.pageSizeSelectObj = core.initPagerSizeSelect($('#proTypePagerSize'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
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
        $('#currentProTypeMountSpan').text(currentTotal);
        $('#proTypeMountSpan').text(total);
    }

    /**
     * 获取表格数据
     * 
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
                    // 修改商品品类
                    // $('.flyer-edittype-btn').off('click').on('click', updateProTypeHandle);
                    // 删除商品品类(单个操作)
                    // $('.flyer-deletetype-btn').off('click').on('click', deleteProTypeSingleHandle);
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
     * 判断是否已经存在这个类型了，存在的会自动去除掉，
     * 
     * 
     * @param {Array} arr 需要判断的数组
     * @returns 返回经过筛选之后的数组，如果传入的参数，是非数组或者数组长度为0的话，返回一个空数组
     */
    function hasProductType(inputArr, orginArr) {
        var returnArr = [];
        if (inputArr && inputArr.length) {
            for (var i = 0; i < inputArr.length; i++) {
                if (orginArr.indexOf(inputArr[i]) === -1) {
                    returnArr.push(inputArr[i]);
                }
            }
        }
        return returnArr;
    }

    /**
     * 导入基础数据，品类列表
     * 
     */
    function importDatas() {
        var productType = flyer.exports.baseData.unniqueArr(flyer.store.get('datasasa').split(','));
        $.ajax({
            url: core.url + '/create_product_type',
            type: 'POST',
            data: {
                productType: productType,
                createByID: baseDatas.userID,
                createByName: baseDatas.userName,
                companyOrgID: baseDatas.companyOrgID,
                companyOrgName: baseDatas.companyOrgName
            },
            success: function(data, textStatus, jqXHR) {
                getTableDatas(1, 20);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                flyer.msg(baseDatas.errorMsg);
            }
        });
    }
    // 导入数据
    exports.importDatas = importDatas;
    // 页面入口
    init();
});