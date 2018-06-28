"use strict";
flyer.define("sent_emails", function (exports, module) {
    var indexIn = 0,
        init = function () {
            this.initTable(exports.curIndex, exports.pageSize);
            this.btnEvent();
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
        var startDate = conditions.startDate ,
            endDate = conditions.endDate,
            keyword = conditions.keyword || '',
            email = conditions.emailName || [];
        $.ajax({
            url: '/post_email_list',
            method: 'get',
            data: {
                email: exports.email_choiced && exports.email_choiced.filter(function (obj, index) {
                    return obj !== '';
                }) || [],
                pageNumber: pageNumber || 1,
                pageSize: pageSize || 20,
                startDate: startDate,
                endDate: endDate,
                keyword: keyword,
                orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                user_id: window.Number($("#__userid").val()),
                orgCode: core.getUserGroups().orgCode,
                time: window.Date.parse(new Date()),
                sentEmail: true
            },
            success: function (data) {
                initTable(data, {
                    pageNumber: pageNumber,
                    pageSize: pageSize
                });
            },
            error: function (err) {
                flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试'));
            },
            beforeSend: function () {
                flyer.loading.init().add();
            },
            complete: function () {
                flyer.loading.init().delete();
            }
        });
    };

    init.prototype.btnEvent = function () {
        // 高级搜索
        $('#advancedSearchBtn').on('click', function () {
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

    function initTable(data, pagerObj) {
        Init.rows = data.rows;
        var pageAll = data.total;
        $('#sendMountSpan').text(pageAll);
        $('#sendCurrentMountSpan').text(data.rows.length);
        var $table = flyer.table($(".table-container"), {
            columns: [{
                field: "",
                checkbox: true,
                styles: {
                    width: 34
                }
            }, {
                title: flyer.i18n.initTitle('来往'),
                field: "_from",
                styles: {
                    width: 400
                },
                formatter: function (row) {
                    var attachment = JSON.parse(row.attachment);
                    if (flyer.isArray(attachment) && attachment.length > 0) {
                        row.has_attachments = 1;
                    } else {
                        row.has_attachments = 0;
                    }
                    return core.formatEmail(row);
                }
            }, {
                title: flyer.i18n.initTitle('主题'),
                field: "_subject",
                formatter: function (row) {
                    return '<span title="' + row._subject + '">' + (row._subject || '-') + '</span>';
                }
            }, {
                title: flyer.i18n.initTitle('发件人'),
                field: "user_name",
                styles: {
                    width: 150
                }
            }, {
                title: flyer.i18n.initTitle('发送时间'),
                field: "date_time",
                styles: {
                    width: 120
                },
                formatter: function (row) {
                    return core.parseDateFormate(row.date_time);
                }
            }
            ],
            data: Init.rows, //ajax数据
            rowClick: function (index, row, rows) {
                exports.data = {};
                exports.data.ID = row.ID;
                var params = "?exportKey=sent_emails&id=" + exports.data.ID;
                core.loadPage("#frame_details", params);
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
    var Init = new init();
})