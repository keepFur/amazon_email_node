"use strict";
flyer.define("unfinish", function (exports, module) {
    var indexIn = 0,
        init = function () {
            var curIndex = Number(flyer.getQueryString('curIndex') || 1),
                limit = Number(flyer.getQueryString('limit') || 20);
            initExports();
            this.initTable(curIndex, limit);
            this.btnEvent();
            this.pagerObj = null;
            this.pageSizeSelectObj = null;
        }
    init.prototype.initTable = function (pageNumber, pageSize) {
        var conditions = {}, conditionsObj = {}, conditionsText = '', $flyerSearchConditions = $('.flyer-search-conditions');
        if ($flyerSearchConditions.data('conditions')) {
            conditions = JSON.parse($flyerSearchConditions.data('conditions'));
            conditionsText = $flyerSearchConditions.data('conditionstext');
            $flyerSearchConditions.html(conditionsText);
        } else {
            if (flyer.exports.advanced_search && typeof flyer.exports.advanced_search.getConditions === 'function') {
                conditionsObj = flyer.exports.advanced_search.getConditions() || {};
                conditions = conditionsObj.resultObj;
                conditionsText = conditionsObj.resultObjText ? '，' + flyer.i18n.initTitle('搜索条件') + '：' + conditionsObj.resultObjText : '';
                $flyerSearchConditions.html(conditionsText).data('conditions', JSON.stringify(conditions)).data('conditionstext', conditionsText);
            }
        }
        var startDate = conditions.startDate || '',
            endDate = conditions.endDate || '',
            keyword = conditions.keyword || '',
            email = conditions.emailName || [],
            assigner = conditions.people || [];
        $.ajax({
            url: '/unfinish_email_list',
            method: 'get',
            data: {
                email: email,
                assigner: assigner,
                pageNumber: pageNumber || 1,// 当前页码
                pageSize: pageSize || 20,// 每页显示条数
                startDate: startDate,// 时间范围
                endDate: endDate,
                keyword: keyword,// 邮件关键字搜索
                orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                user_id: window.Number($("#__userid").val()),
                orgCode: core.getUserGroups().orgCode,
                time: window.Date.parse(new Date()),
                disposed_status_id: 8,
                filterFold: flyer.getQueryString("type_id") || false
            },
            beforeSend: function () {
                flyer.loading.init().add();
            },
            complete: function () {
                flyer.loading.init().delete();
            },
            success: function (data) {
                initTable(data, {
                    pageNumber: pageNumber,
                    pageSize: pageSize
                });
                //初始化邮箱下拉菜单
                if (indexIn++ === 0) {
                    // 调用index页面中的初始化下拉框方法
                    var comboboxObj = window.initSelectBoxByRuleObj.initSelectBoxByRule(Init, exports, { choicedData: choicedData });
                    Init.email_address = comboboxObj.email_address;
                    Init.email_assigner = comboboxObj.email_assigner;
                    Init.folders = comboboxObj.folders;
                }
            },
            error: function (err) {
                flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试'));
            }
        });
    };

    init.prototype.btnEvent = function () {
        //根据账号判断是否需要显示
        if (core.getUserGroups().orgCode !== '9101') {
            //主管
            $('.btn-container>.flyer-btn:not(:first)').show();
        } else {
            $('.btn-container>.flyer-btn:not(:first)').hide();
            $('.btn-container.footer-upper>.flyer-btn:first').show();
        }
        $('.btn-container .flyer-btn').on("click", function () {
            switch ($(this).index()) {
                case 0:
                    //转为已解决解决
                    Init.turnResolved();
                    break;
                case 1:
                    //分派
                    if ($('tbody input:checked').length === 0) {
                        flyer.msg(flyer.i18n.initTitle("至少选择一项"));
                    } else {
                        $('.flyer-dialog-content').remove();
                        //分派
                        Init.turnAssigned();
                    }
                    break;
                case 2:
                    //转未分派
                    if ($('tbody input:checked').length === 0) {
                        flyer.msg(flyer.i18n.initTitle("至少选择一项"));
                    } else {
                        $('.flyer-dialog-content').remove();
                        Init.turnUnassigned();
                    }
                    break;
            }
        });
        // 高级搜索
        $(".btn-container #advancedSearchBtn").on("click", function () {
            $('.flyer-search-conditions').data('conditions', null).data('conditionstext', null);
            core.showAdvancedSearchWindow(Init.initTable);
            return false;
        });
        // 清空搜索条件
        $('.btn-container #clearSearchConditionsBtn').on('click', function () {
            $('.flyer-search-conditions').html('').data('conditions', null).data('conditionstext', null);
            flyer.exports.advanced_search = false;
            Init.initTable(1, 20);
            return false;
        });
    };

    //转为已解决
    init.prototype.turnResolved = function () {
        if ($('tbody input:checked').length === 0) {
            flyer.msg(flyer.i18n.initTitle('至少选择一项'));
            return;
        } else {
            flyer.confirm(flyer.i18n.initTitle("确定要转为已解决吗?"), function (result, yes) {
            }, {
                    btns: [{
                        text: flyer.i18n.initTitle('确定'),
                        skin: "flyer-btn-blue",
                        click: function (elm) {
                            this.close();
                            $.ajax({
                                url: "/turn_disposed_status",
                                method: "get",
                                data: {
                                    data: choicedData('subject_num'),
                                    status: 9, //转为已处理
                                    name: '已解决',
                                    time: window.Date.parse(new Date())
                                },
                                success: function (result) {
                                    //刷新表格
                                    Init.switch = true;
                                    Init.initTable(Init.pageNumber);
                                    //刷新左侧数量
                                    window.bubbleData();
                                    flyer.msg(flyer.i18n.initTitle("操作成功"));
                                    //气泡参数
                                    if (flyer.getQueryString('type_id')) {
                                        core.getBubbleCount();
                                    }
                                },
                                error: function (err) {
                                    throw new Error(err);
                                }
                            })
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
                })
        }
    }

    //转为未分派
    init.prototype.turnUnassigned = function () {
        if ($('tbody input:checked').length === 0) {
            flyer.msg(flyer.i18n.initTitle('至少选择一项'));
            return;
        } else {
            //弹出是否转未分派弹窗
            confirm();
        }
    };
    //转为已分派
    init.prototype.turnAssigned = function () {
        if ($('tbody input:checked').not('.flyer-dialog-content input:checked').length === 0) {
            flyer.msg(flyer.i18n.initTitle('至少选择一项'));
            return;
        } else {
            //弹出角色选择框
            flyer.open({
                pageUrl: core.url + "/html/assignGroup.html",
                isModal: true,
                area: [600, 300],
                title: flyer.i18n.initTitle('请选择要指派的人员'),
                btns: [{
                    text: flyer.i18n.initTitle('确定'),
                    skin: "",
                    click: function () {
                        if ($(".flyer-dialog-content tbody input:checked").length !== 1) {
                            flyer.msg(flyer.i18n.initTitle('最多选择一项'));
                            return;
                        } else {
                            //更新数据
                            var _this = this;
                            $.ajax({
                                url: "/turn_status",
                                method: "get",
                                data: {
                                    data: JSON.stringify(choicedData('subject_num')),
                                    status: 5,
                                    assignName: window.encodeURIComponent(flyer.exports.assignGroup.group[$(".flyer-dialog-content tbody input:checked").parents('tr').index()].name),
                                    assignId: flyer.exports.assignGroup.group[$(".flyer-dialog-content tbody input:checked").parents('tr').index()].user_id,
                                    name: '已分派', //转为已分派
                                    time: window.Date.parse(new Date())
                                },
                                success: function (result) {
                                    //刷新表格
                                    Init.switch = true;
                                    _this.close();
                                    Init.initTable(Init.pageNumber);
                                    //刷新左侧参数
                                    window.bubbleData();
                                    flyer.msg(flyer.i18n.initTitle('操作成功'));
                                    //气泡参数
                                    if (flyer.getQueryString('type_id')) {
                                        core.getBubbleCount();
                                    }
                                },
                                error: function (err) {
                                    throw new Error(err);
                                }
                            })
                        }
                    }
                }]
            });
        }
    };
    function confirm() {
        flyer.confirm(flyer.i18n.initTitle("确定要转为未分派吗?"), function (result) {
        }, {
                btns: [{
                    text: flyer.i18n.initTitle('确定'),
                    skin: "flyer-btn-blue",
                    click: function (elm) {
                        function hasUnassign() {
                            var istrue = true;
                            $.each(choicedData('status_id'), function (index, obj) {
                                if (obj === 6) {
                                    flyer.msg(flyer.i18n.initTitle("选择项中包含未分派邮件"));
                                    istrue = false;
                                    return istrue;
                                }
                            });
                            return istrue;
                        }
                        //更新数据
                        var _this = this;
                        this.close();
                        //判断是否分派
                        if (hasUnassign()) {
                            uploadTable();
                        }
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
    }
    //更新数据
    function uploadTable() {
        $.ajax({
            url: "/turn_status",
            method: "get",
            data: {
                data: JSON.stringify(choicedData('subject_num')),
                status: 6,
                assignName: '',
                assignId: 0,
                name: '未分派',
                time: window.Date.parse(new Date()) //转为已分派
            },
            success: function (result) {
                //刷新表格
                Init.switch = true;
                Init.initTable(Init.pageNumber);
                //刷新左侧参数
                window.bubbleData();
                //提示成功
                flyer.msg(flyer.i18n.initTitle('操作成功'));
                //气泡参数
                if (flyer.getQueryString('type_id')) {
                    core.getBubbleCount();
                }
            },
            error: function (err) {
                flyer.msg(flyer.i18n.initTitle('操作失败'));
            }
        })
    }
    //获取选中数据
    function choicedData(field) {
        var Data = $('tbody input:checked:not(".flyer-dialog-content :checked")').map(function (index, ele) {
            var deleteQue = $(ele).parents('tr').index();
            return Init.rows[deleteQue][field];
        })
        var DataArr = [];
        for (var i = 0; i < Data.length; i++) {
            DataArr.push(Data[i]);
        }
        return DataArr;
    }
    //生成表格
    function initTable(data, pagerObj) {
        Init.rows = data.rows;
        exports.tableData = data.rows;
        var pageAll = data.total;
        $('#undisposedCurrentMountSpan').html(data.rows.length);
        $('#undisposedMountSpan').html(pageAll);
        var $table = flyer.table($(".table-container"), {
            columns: [{
                field: "",
                checkbox: true,
                styles: {
                    width: 34
                }
            },
            {
                title: flyer.i18n.initTitle('来往'),
                field: "_from",
                styles: {
                    width: 400
                },
                formatter: function (row) {
                    return core.formatEmail(row);
                }
            }, {
                title: flyer.i18n.initTitle('主题'),
                field: "subject",
                formatter: function (row) {
                    return core.formatSubject(row);
                }
            }, {
                title: flyer.i18n.initTitle('处理人'),
                field: "user_name",
                styles: {
                    width: 150
                },
                formatter: function (row) {
                    return core.titleShow(row);
                }
            }, {
                title: flyer.i18n.initTitle('时间'),
                field: "max_time",
                styles: {
                    width: 82
                },
                formatter: function (row) {
                    return core.parseDateFormate(row.max_time);
                }
            }
            ],
            data: Init.rows, //ajax数据
            rowClick: function (index, row, rows) {
                exports.data = row;
                var params = "?exportKey=unfinish&subject_num=" + window.escape(exports.data.subject_num),
                    curIndex = 1, limit = 20;
                if (Init.pagerObj) {
                    curIndex = Init.pagerObj.options.curIndex;
                }
                if (Init.pageSizeSelectObj) {
                    limit = Number(Init.pageSizeSelectObj.getSelectedValue() || 20);
                }
                if(/folder_detail/gi.exec(window.location.hash)){
                    params += '&type_id=' + flyer.getQueryString('type_id') + '&currentTab=0';
                }else{
                    params += '&curIndex=' + curIndex + '&limit=' + limit;
                }
                core.loadPage("#frame", params);
            }
        });
        //没有结果的时候
        core.tableNoMatch($table);
        // 初始化下拉框，显示每页数据条数的下拉框
        Init.pageSizeSelectObj = core.initPagerSizeSelect($('.pager-size-container'), core.getPageListByTotal(data.total), String(pagerObj.pageSize || 20), {
            callback: Init.initTable,
            pagerObj: Init.pagerObj,
            total: data.total,
            exports: exports
        });
        //初始化分页
        Init.pagerObj = core.initPager($('.paper-container'), pageAll, pagerObj.pageSize || 20, {
            callback: Init.initTable,
            pageNumber: pagerObj.pageNumber || 1,
            pageSizeSelectObj: Init.pageSizeSelectObj,
            exports: exports
        });
        // 有数据的时候。才需要去初始化
        if (data.total) {
            // 为表中的checkbox绑定点击事件
            core.bindCheckboxEvent($table);
        }
    }
    //重置某些exports参数
    function initExports() {
        if (exports.email_choiced && exports.email_choiced.length) {
            exports.email_choiced = [];
        }
        if (exports.assigner_choiced && exports.assigner_choiced.length) {
            exports.assigner_choiced = [];
        }
    }
    var Init = new init();
})