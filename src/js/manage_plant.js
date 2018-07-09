// 平台管理模块
'use strict';
flyer.define('plant_manage', function(exports, module) {
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
        // 创建平台
        $('.createPlant').on('click', createPlantHandle);
        // 修改平台信息
        $('.updatePlant').on('click', updatePlantHandle);
        // 禁用平台
        $('.disabledPlant').on('click', {
            type: 0
        }, togglePlantHandle);
        // 启用平台
        $('.enabledPlant').on('click', {
            type: 1
        }, togglePlantHandle);
    }

    /**
     * 创建平台的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createPlantHandle(events) {
        flyer.open({
            pageUrl: '/html/plant_create.html',
            isModal: true,
            area: [400, 200],
            title: '创建平台',
            btns: [{
                text: '创建',
                click: function(ele) {
                    var that = this;
                    var plantInfo = core.getFormValues($('form[name=plantCreateForm]'));
                    var validPlantInfoResult = validPlantInfo(plantInfo);
                    if (validPlantInfoResult.isPass) {
                        $.ajax({
                            url: '/api/createPlant',
                            type: 'POST',
                            data: plantInfo,
                            beforeSend: function(jqXHR, settings) {
                                $.lockedBtn($(ele), true, ('创建中'));
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
                                $.unlockBtn($(ele), ('创建'));
                            }
                        });
                    } else {
                        flyer.msg(validPlantInfoResult.msg);
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

    /**
     * 平台信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updatePlantHandle(events) {
        var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
        if (selectDatas.length === 1) {
            var plantName = selectDatas[0].plantName;
            var description = selectDatas[0].description;
            flyer.open({
                content: `<div class="flyer-form-item dialog-form-container">
                            <form class="flyer-form" name="plantUpdateForm">
                                <div class="dialog-form-item">
                                    <label>名称</label>
                                    <input type="text" placeholder="可以是中文、字母、数字、下划线5-20位" class="flyer-input inline" name="plantName" value="${plantName}">
                                </div>
                                <div class="dialog-form-item">
                                    <label>描述</label>
                                    <input type="text" placeholder="简单的描述平台" class="flyer-input inline" name="description" value="${description}">
                                </div>
                            </form>
                          </div>`,
                isModal: true,
                area: [400, 200],
                title: '平台信息修改',
                btns: [{
                    text: '确定',
                    click: function(ele) {
                        var that = this;
                        var plantInfo = core.getFormValues($('form[name=plantUpdateForm]'));
                        var validPlantInfoResult = validPlantInfo(plantInfo);
                        plantInfo.id = selectDatas[0].id;
                        if (validPlantInfoResult.isPass) {
                            $.ajax({
                                url: '/api/updatePlant',
                                type: 'POST',
                                data: plantInfo,
                                beforeSend: function(jqXHR, settings) {
                                    $.lockedBtn($(ele), true, ('修改中'));
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
                                    $.unlockBtn($(ele), ('确定'));
                                }
                            });
                        } else {
                            flyer.msg(validPlantInfoResult.msg);
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
     * 切换平台状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function togglePlantHandle(events) {
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
                                url: '/api/togglePlant',
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
                    title: '平台名称',
                    field: "plantName"
                }, {
                    title: '描述',
                    field: "description"
                }, {
                    title: '创建时间',
                    field: "createdDate",
                    formatter: function(row, rows) {
                        return flyer.formatDate('yyyy-mm-dd hh:MM', row.createdDate);
                    }
                }, {
                    title: '最后修改时间',
                    field: "updateDate",
                    formatter: function(row, rows) {
                        return row.updateDate ? flyer.formatDate('yyyy-mm-dd hh:MM', row.updateDate) : '-';
                    }
                }, {
                    title: '状态',
                    field: 'status',
                    styles: {
                        width: 56
                    },
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
        core.tableNoMatch($table, '暂时没有平台');
        // 初始化下拉框，显示每页数据条数的下拉框
        baseDatas.pageSizeSelectObj = core.initPagerSizeSelect($('#plantPagerSize'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
            callback: getTableDatas,
            pagerObj: baseDatas.pagerObj,
            total: datas.total,
            exports: exports
        });
        // 初始化分页
        baseDatas.pagerObj = core.initPager($('.paper-container'), total, pagerObj.pageSize || 20, {
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
        $('#currentPlantMountSpan').text(currentTotal);
        $('#plantMountSpan').text(total);
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
            $table = $('#plantTable');
        $.ajax({
            url: '/api/readPlantPage',
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
    function readPlantById(id, callback) {
        if (!id) {
            if (typeof callback === 'function') {
                callback({
                    success: false,
                    message: '平台id不能为空'
                });
            }
            return;
        }
        $.ajax({
            url: '/api/readPlantById',
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
     * 校验平台信息
     * 
     * @param {Object} plantInfo 平台信息对象
     */
    function validPlantInfo(plantInfo) {
        if (!plantInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }

        if (!plantInfo.plantName) {
            return {
                isPass: false,
                msg: '平台名称不能为空'
            }
        }

        if (!plantInfo.description) {
            return {
                isPass: false,
                msg: '平台描述不能为空'
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