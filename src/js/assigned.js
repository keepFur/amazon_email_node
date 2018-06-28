"use strict";
flyer.define("assigned", function (exports, module) {
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
        var startDate = conditions.startDate,
            endDate = conditions.endDate,
            keyword = conditions.keyword || '',
            email = conditions.emailName || [],
            assigner = conditions.people || [];
        $.ajax({
            url: '/assigned_email_list',
            method: 'get',
            data: {
                email: email,
                assigner: assigner,
                pageNumber: pageNumber || 1,
                pageSize: pageSize || 20,
                startDate: startDate,
                endDate: endDate,
                keyword: keyword,
                orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                user_id: window.Number($("#__userid").val()),
                orgCode: core.getUserGroups().orgCode,
                time: window.Date.parse(new Date()),
                status_id: 5,
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
                throw new Error(err);
            }
        });
    }
    init.prototype.btnEvent = function () {
        $('.btn-container .flyer-btn').on("click", function () {
            switch ($(this).index()) {
                case 0:
                    //转未分派
                    Init.turnAssigned();
                    break;
                case 1:
                    //回复
                    if ($('tbody input:checked').length !== 0) {
                        flyer.msg(flyer.i18n.initTitle("最多选择一项"));
                    } else {
                        $('.flyer-dialog-content').remove();
                        $('[data-href="send_email.html"]').click();
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
    }
    //转为未分派
    init.prototype.turnAssigned = function () {
        if ($('tbody input:checked').length === 0) {
            flyer.msg(flyer.i18n.initTitle("至少选择一项"));
            return;
        } else {
            //弹出是否转未分派弹窗
            confirm();
        }
    };

    var Init = new init();
    function confirm() {
        flyer.confirm(flyer.i18n.initTitle("确定要转为未分派吗?"), function (result) {

        }, {
                btns: [{
                    text: flyer.i18n.initTitle('确定'),
                    skin: "flyer-btn-blue",
                    click: function (elm) {
                        this.close();
                        uploadTable();
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
        var _this = _this;
        $.ajax({
            url: "/turn_status",
            method: "get",
            data: {
                data: JSON.stringify(choicedData('subject_num')),
                status: 6,
                assignName: '',
                assignId: 0,
                name: '未分派', //转为未分派
                time: window.Date.parse(new Date())
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
            var updateQue = $(ele).parents('tr').index();
            return Init.rows[updateQue][field];
        })
        var DataArr = [];
        for (var i = 0; i < Data.length; i++) {
            DataArr.push(Data[i]);
        }
        return DataArr;
    }
    function initTable(data, pagerObj) {
        Init.rows = data.rows;
        exports.tableData = Init.rows;
        var pageAll = data.total;
        $('#assignedCurrentMountSpan').text(data.rows.length);
        $('#assignedMountSpan').text(pageAll);
        var $table = flyer.table($(".table-container"), {
            columns: [{
                title: "ID",
                field: "",
                checkbox: true,
                styles: {
                    width: 34
                },
                titleTooltip: "ID",
                visible: true,
                i18n: 'ID'
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
                var params = "?exportKey=assigned&subject_num=" + window.escape(exports.data.subject_num),
                    curIndex = 1, limit = 20;
                if (Init.pagerObj) {
                    curIndex = Init.pagerObj.options.curIndex;
                }
                if (Init.pageSizeSelectObj) {
                    limit = Init.pageSizeSelectObj.getSelectedValue();
                }
                if(/folder_detail/gi.exec(window.location.hash)){
                    params += '&type_id=' + flyer.getQueryString('type_id') + '&currentTab=3';
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
    exports.loadFrame = function (obj) {
        exports.data = $(obj).data();
        var params = "?exportKey=assigned&id=" + exports.data.id;
        core.loadPage("#frame", params);
    };
});