"use strict";
flyer.define("other_detail", function (exports, module) {
    var indexIn = 0,
        init = function () {
            this.initTable();
            this.btnEvent();
        }
    init.prototype.initTable = function (pageNumber) {
        $('.flyer-layout-blod').html(flyer.getQueryString('email'))
        $.ajax({
            url: "/update_other_email",
            method: "post",
            data: {
                account: flyer.getQueryString('email'),
                user_id:window.Number($("#__userid").val()),
                time: window.Date.parse(new Date()),
                pageNumber: (Init && Init.pageNumber) || 1
            },
            beforeSend: function () {
                flyer.loading.init().add();
            },
            success: function (data) {
                //跳转页面
                if (/Timed out while authenticating with server/.exec(data)) {
                    flyer.msg(flyer.i18n.initTitle('链接超时，请刷新重试'));
                    flyer.loading.init().delete();
                } else {
                    getTableData(data.total);
                    // initTable(data,data.total);
                }

            },
            error: function (err) {
                throw new Error(err);
            }
        });

    }
    init.prototype.switchPaper = function (pageAll) {
        var pageObj = flyer.page($('.paper-container'), {
            totalNum: pageAll,
            curIndex: Init.pageNumber || 1,
            pageSize: 15,
            fnClick: function () {
                //刷新页面
                Init.pageNumber = this.options.curIndex;
                Init.switch = true;
                Init.initTable();
            }
        });
    };
    init.prototype.btnEvent = function () {
        $('.btn-container .flyer-btn').on("click", function () {
            switch ($(this).index()) {
                case 0:
                    //刷新
                    Init.initTable(Init.pageNumber);;
                    break;
            }
        })
    }
    var Init = new init();
    function getTableData(total) {
        $.ajax({
            url: '/other_email_all',
            method: 'get',
            data: {
                pageNumber: 1,
                orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                user_id: window.Number($("#__userid").val()),
                orgCode: core.getUserGroups().orgCode,
                time: window.Date.parse(new Date()),
                email: flyer.getQueryString("email")
            },
            complete: function () {
                flyer.loading.init().delete();
            },
            success: function (data) {
                initTable(data,total);
            },
            error: function (err) {
                throw new Error(err);
            }
        })
    }
    function initTable(data,total) {
        Init.rows = data.rows;
        var pageAll = total;
        Init.pageAll = pageAll;
        $('#email_account').text(Init.rows.length);
        $('#email_account_all').text(Init.pageAll);
        var table = flyer.table($(".table-container"), {
            columns: [{
                field: "",
                checkbox: true,
                styles: {
                    width: 34
                },
            },
            {
                title: flyer.i18n.initTitle("来往"),
                field: "_from",
                styles: {
                    width: 400
                },
                formatter: function (row) {
                    return core.formatEmail(row);
                }
            }, {
                title: flyer.i18n.initTitle("主题"),
                field: "subject",
                formatter: function (row) {
                    return '<span title="' + row.subject + '">' + row.subject + '</span>';
                }
            }, {
                title: flyer.i18n.initTitle("时间"),
                field: "timer",
                styles: {
                    width: 82
                },
                formatter: function (row) {
                    return core.parseDateFormate(row.timer);
                }
            }
            ],
            data: Init.rows, //ajax数据
            rowClick: function (index, row, rows) {
                var account = flyer.getQueryString('email');
                var params = "?exportKey=other_email_detail&subject_num=" + row.subject_num + '&email=' + account;
                core.loadPage("#frame_details", params);
            }
        });

        //没有结果的时候
        if (Init.pageAll === 0) {
            $('.flyer-table-body table tbody').append('<tr class = "empty_title"><td colspan = ' + $('th').length + '>'+((flyer.i18n && flyer.i18n.initTitle('暂时没有相关数据')) || '暂时没有相关数据')+'</td></tr>')
        } else {
            $('.empty_title').remove();
        }
        //初始化分页
        if (!Init.switch) { Init.switchPaper(pageAll); }
        Init.switch = false;
        //减少一页重载表格 以及重置分页
        if (Init.rows.length === 0 && Init.pageNumber && Init.pageNumber !== 1) {
            Init.pageNumber -= 1;
            Init.initTable(Init.pageNumber);
        }
    }
    exports.loadFrame = function (obj) {
        exports.data = $(obj).data();
        var params = "?exportKey=assigned&id=" + exports.data.id;
        core.loadPage("#frame", params);
    };
});