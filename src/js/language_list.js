'use strict';
flyer.define('language_list', function (exports, module) {
    var baseDatas = {
        // 用户所在组
        orgGroupID: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
        userID: $("#__userid").val().trim(),
        userName: $('#__username').val().trim(),
        // 表格实例
        $table: null,
        pagerObj: null,
        pageSizeSelectObj: null,
        curIndex: Number(flyer.getQueryString('curIndex') || 1),
        // 错误消息
        paramErrMsg:flyer.i18n.initTitle( '参数错误，请刷新页面重试。'),
        netErrMsg: flyer.i18n.initTitle('系统已退出登录，请登录系统重试。'),
        operatorErrMsg: {
            single: flyer.i18n.initTitle('请选择一条数据操作'),
            batch: flyer.i18n.initTitle('请至少选择一条数据操作')
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
        // 创建解决方式（支持批量）
        $('.createLanguage').on('click', createLanguage);
        // 删除解决方式（支持批量）
        // $('.deleteResolveMth').on('click', deleteResolveMethodBatchHandle);
    }

    /**
     * 创建解决方式（支持批量）的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createLanguage() {
        //编辑框
        var _thisobj = $(this);
        flyer.open({
            pageUrl: core.url + '/html/add_language.html',
            isModal: true,
            area: [440, 160],
            title: flyer.i18n.initTitle("创建语言类型"),
            btns: [{
                text: flyer.i18n.initTitle('保存'),
                click: function () {
                    var _this = this;
                    if ($("#languageName").val()) {
                        $.ajax({
                            url: core.url + '/create_language_type',
                            type: 'get',
                            data: {
                                languageName:$("#languageName").val(),
                                disabled:true
                            },
                            beforeSend: function (jqXHR, settings) {
                                core.lockedBtn($("#flyer-dialog-content .flyer-dialog-footer button:first"), true, flyer.i18n.initTitle('保存中'));
                            },
                            success: function (data, textStatus, jqXHR) {
                                if (data.status) {
                                    flyer.msg(flyer.i18n.initTitle('输入的语言已存在'));
                                } else {
                                    _this.close();
                                    flyer.msg(flyer.i18n.initTitle('语言添加成功'));
                                    //刷新表格
                                    if(core.getUserGroups().orgCode === '9103'){
                                        getTableDatas(1, 20);
                                    }else{
                                        $('.flyer-tab-item:first').load("./html/language_list.html");
                                    }
                                }
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                flyer.msg(flyer.i18n.initTitle('店铺添加失败'));
                            },
                            complete: function (jqXHR, textStatus) {
                                core.unlockBtn($("#flyer-dialog-content .flyer-dialog-footer button:first"), flyer.i18n.initTitle('保存'));
                            }
                        });
                    } else {
                        flyer.msg(flyer.i18n.initTitle('输入的名称为空'));
                        return
                    }
                }
            }, {
                text: flyer.i18n.initTitle('取消'),
                click: function () {
                    this.close();
                }
            }]
        });
        return false;
    }

    /**
     * 删除解决方式按钮点击事件处理函数(批量删除)
     * 
     * @param {any} events 
     */
    function deleteResolveMethodBatchHandle(events) {
        var selectDatas = flyer.exports.baseData.getTableCheckedDatas(baseDatas.$table);
        if (selectDatas.length) {
            flyer.confirm(flyer.i18n.initTitle("确定删除吗?"), function (result) {
            }, {
                btns: [{
                    text: flyer.i18n.initTitle('确定'),
                    skin: "flyer-btn-blue",
                    click: function (elm) {
                        this.close();
                        var IDS = selectDatas.map(function (item) {
                            return item.ID;
                        });
                        $.ajax({
                            url: core.url + '/delete_resolve_method',
                            type: 'POST',
                            data: {
                                IDS: IDS
                            },
                            success: function (data, textStatus, jqXHR) {
                                flyer.msg(data.success ? flyer.i18n.initTitle('操作成功') : flyer.i18n.initTitle('操作失败'));
                                getTableDatas(1, 20);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                flyer.msg(baseDatas.netErrMsg);
                            }
                        });
                    }
                },
                {
                    text: flyer.i18n.initTitle("取消"),
                    skin: "",
                    click: function (elm) {
                        this.close();
                    }
                }
                ],
                    title: flyer.i18n.initTitle("询问框"),
                    isModal: true
                });
        } else {
            flyer.msg(baseDatas.operatorErrMsg.batch);
        }
        return false;
    }

    /**
     * 删除解决方式点击事件处理函数(单个删除)
     * 
     * @param {any} events 
     */
    function deleteLanguage(events) {
        var ID = Number($(events.target).data('id'));
        if (ID) {
            flyer.confirm(flyer.i18n.initTitle("确定删除吗?"), function (result) {
            }, {
                btns: [{
                    text: flyer.i18n.initTitle('确定'),
                    skin: "flyer-btn-blue",
                    click: function (elm) {
                        this.close();
                        $.ajax({
                            url: core.url + '/delete_resolve_method',
                            type: 'POST',
                            data: {
                                IDS: [ID]
                            },
                            success: function (data, textStatus, jqXHR) {
                                flyer.msg(data.success ?flyer.i18n.initTitle('操作成功') : flyer.i18n.initTitle('操作失败'));
                                getTableDatas(1, 20);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                flyer.msg(baseDatas.netErrMsg);
                            }
                        });
                    }
                },
                {
                    text: flyer.i18n.initTitle("取消"),
                    skin: "",
                    click: function (elm) {
                        this.close();
                    }
                }
                ],
                    title: flyer.i18n.initTitle("询问框"),
                    isModal: true
                });
        } else {
            flyer.msg(baseDatas.operatorErrMsg.batch);
        }
        return false;
    }

    /**
     * 更新决解方式按钮点击事件处理函数，需要判断是否存在跟这个品类相关的客诉记录，如果存在，需要更新相应的客诉记录
     * @param {any} events 
     */
    function updateLanguage() {
        var _thisobj = $(this);
        var open = flyer.open({
            pageUrl: core.url + '/html/add_language.html',
            isModal: true,
            area: [440, 160],
            title: flyer.i18n.initTitle("更新语言名称"),
            btns: [{
                text: flyer.i18n.initTitle('保存'),
                click: function () {
                    var _this = this;
                    if ($("#languageName").val()) {
                        $.ajax({
                            url: core.url + '/update_language_name',
                            type: 'get',
                            data: {
                                name:$("#languageName").val(),
                                id:_thisobj.data('id'),
                                timer: Date.now()
                            },
                            beforeSend: function (jqXHR, settings) {
                                core.lockedBtn($("#flyer-dialog-content .flyer-dialog-footer button:first"), true, (flyer.i18n && flyer.i18n.initTitle('保存中')) || '保存中');
                            },
                            success: function (data, textStatus, jqXHR) {
                                if (data.status) {
                                    flyer.msg(flyer.i18n.initTitle('输入的语言名已存在'));
                                } else {
                                    _this.close();
                                    flyer.msg(flyer.i18n.initTitle('语言修改成功'));
                                    getTableDatas(1, 20);
                                }
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                flyer.msg(flyer.i18n.initTitle('店铺修改失败'));
                            },
                            complete: function (jqXHR, textStatus) {
                                core.unlockBtn($("#flyer-dialog-content .flyer-dialog-footer button:first"), (flyer.i18n && flyer.i18n.initTitle('保存')) || '保存');
                            }
                        });
                    } else {
                        flyer.msg(flyer.i18n.initTitle('输入的名称为空'));
                        return
                    }
                }
            }, {
                text: flyer.i18n.initTitle('取消'),
                click: function () {
                    this.close();
                }
            }]
        });
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
                    checkbox: true,
                    field: "",
                    styles: {
                        width: 34
                    }
                }, {
                    title: flyer.i18n.initTitle("语言名称"),
                    field: "language_type_name",
                    i18n:'LanguageName'
                },{
                    title:flyer.i18n.initTitle("状态"),
                    field: "disabled",
                    styles: {
                        width: 120
                    },
                    formatter: function (row) {
                        var active = row.disabled.data[0] ? 'checked' : '', title = row.disabled.data[0] ? flyer.i18n.initTitle("停用收信规则") : flyer.i18n.initTitle("启用收信规则");
                        return '<label class="flyer-onswitch receiving-rules-onswitch table-btn" title="' + title + '"><input type= "checkbox" class = "table-btn" name= "flyer-active-radio" ' + active + ' value="' + row.ID + '" data-active="' + active + '"><i class = "table-btn"><span class = "table-btn">'+flyer.i18n.initTitle("启用")+'</span><span class = "table-btn">'+flyer.i18n.initTitle("停用")+'</span></i></label>';
                    },
                    i18n:'Status'
                },{
                    title: flyer.i18n.initTitle("操作"),
                    styles: {
                        width: 120
                    },
                    formatter: function (row) {
                        return '<span class="receiving-rules-handle table-btn" title="'+flyer.i18n.initTitle("编辑")+'"><i class="icon-pen table-btn flyer-edit-btn" data-id="' + row.ID + '" data-storename="' + row.store_name + '" data-companyorgid="' + row.company_org_id + '" style="padding-right:8px;"></i></span>'
                    },
                    i18n:'Operations'
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
        core.tableNoMatch($table, flyer.i18n.initTitle('暂时没有店铺记录'));
        // 初始化下拉框，显示每页数据条数的下拉框
        baseDatas.pageSizeSelectObj = core.initPagerSizeSelect($('#LanguageListSize'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
            callback: getTableDatas,
            pagerObj: baseDatas.pagerObj,
            total: datas.total,
            exports: exports
        });
        // 初始化分页
        baseDatas.pagerObj = core.initPager($('.paper-container-language'), total, pagerObj.pageSize || 20, {
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
        $('#currentLanguageListSpan').text(currentTotal);
        $('#LanguageListMountSpan').text(total);
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
            limit: pageSize || 20,
            pageNumber: pageNumber || 1,
            time: window.Date.parse(new Date()),
        },
            $table = $('#LanguageList');
        $.ajax({
            url: core.url + '/language_list',
            type: 'GET',
            data: conditions,
            beforeSend: function (jqXHR, settings) {
                flyer.loading.init().add();
            },
            success: function (data, jqXHR, textStatus) {
                renderTable($table, data.rows);
                randerDOMPager(baseDatas.$table, data.rows, data.total, {
                    pageNumber: pageNumber || 1,
                    pageSize: pageSize || 20
                });
                setMountValue(data.rows.length, data.total);
                core.bindCheckboxEvent(baseDatas.$table);
                // 修改解决方式
                $('#LanguageList .flyer-edit-btn').off('click').on('click', updateLanguage);
                // 删除解决方式(单个操作)
                $('.flyer-delete-btn').off('click').on('click', deleteLanguage);
                // 存到缓存中
                getResolveMethod();

            },
            error: function (jqXHR, textStatus, errorThrown) {
                flyer.msg(baseDatas.netErrMsg);
            },
            complete: function (jqXHR, textStatus) {
                flyer.loading.init().delete();
            }
        });
    }

    /**
     * 获取所有的商品品类数据，并缓存到浏览器中
     * 
     */
    function getResolveMethod() {
        $.ajax({
            url: core.url + '/read_resolve_method',
            type: 'GET',
            data: {
                nocache: window.Date.now()
            },
            success: function (data, jqXHR, textStatus) {
                flyer.store.set('resolveMethod', JSON.stringify(data.success ? data.data.rows : []));
            },
            error: function (jqXHR, textStatus, errorThrown) {
                flyer.msg(baseDatas.netErrMsg);
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
    function hasResolveMethod(inputArr, orginArr) {
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
    // 启用或停用
    $('.table-container').on('click', 'input[name=flyer-active-radio]', function (event) {
        
        refreshLanguageStatus($(event.target).val())
        // return false;
    });
    
    function refreshLanguageStatus(id) {
        console.log($('[name="flyer-active-radio"]').prop('checked'))
        if (id) {
            $.ajax({
                url: '/update_language_status',
                type: 'get',
                data: {
                    id: [id],
                    disabled: $('[name="flyer-active-radio"]').prop('checked')
                },
                success: function (res) {
                    flyer.msg(flyer.i18n.initTitle('操作成功'));
                    getTableDatas(1, 20);
                },
                error: function (err) {
                    flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试'));
                }
            });
        } else {
            flyer.msg(flyer.i18n.initTitle('参数错误，请刷新页面重试'));
        }
    }
    // 页面入口
    init();
});