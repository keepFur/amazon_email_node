"use strict";
flyer.define("search_result", function (exports, module) {
    var init = function (pageNumber, pageSize) {
        this.initTable(exports.curIndex);
        this.btnEvent();
    };
    init.prototype.initTable = function (pageNumber, pageSize) {
        var keyword = $('#searchEamilByKeywordInp').val().trim();
        if (keyword.length === 0) {
            if (!flyer.getQueryString('curIndex')) {
                keyword = window.decodeURIComponent(location.hash.split('keyword=')[1]);
            } else {
                keyword = window.decodeURIComponent(location.hash.split('&curIndex')[0].split('keyword=')[1]);

            }
            $('#searchEamilByKeywordInp').val(keyword);
        }
        $.ajax({
            url: core.url + "/get_email_by_keyword",
            method: "get",
            data: {
                pageNumber: pageNumber || 1,
                pageSize: pageSize || 20,
                keyword: keyword,
                depaId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                userId: $("#__userid").val(),
                orgCode: core.getUserGroups().orgCode,
                time: window.Date.parse(new Date())
            },
            beforeSend: function () {
                flyer.loading.init($('.table-container')).add();
            },
            success: function (data) {
                // 初始化title
                Init.initTitle(keyword, data.total, data.rows.length);
                Init.rows = data.rows;
                var pageAll = data.total;
                Init.pageAll = pageAll;
                var $table = flyer.table($(".table-container"), {
                    columns: [{
                        field: "",
                        checkbox: true,
                        styles: {
                            width: 34
                        }
                    }, {
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
                        title: flyer.i18n.initTitle("处理人"),
                        field: "user_name",
                        styles: {
                            width: 150
                        },
                        formatter: function (row) {
                            return core.titleShow(row);
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
                        exports.data = row;
                        var emailInfo = {
                            subjectNum: row.subject_num,
                            _from: row._from,
                            _to: row._to
                        }, params = "?exportKey=search_result&id=" + window.escape(row.ID) + '&emailInfo=' + window.encodeURIComponent(JSON.stringify(emailInfo)) + '&subject_num=' + row.subject_num;
                        core.loadPage("#search_result_detail", params);
                    }
                });
                //没有结果的时候
                core.tableNoMatch($table);
                // 初始化下拉框，显示每页数据条数的下拉框
                Init.pageSizeSelectObj = core.initPagerSizeSelect($('.pager-size-container'), core.getPageListByTotal(data.total), String(pageSize || 20), {
                    callback: Init.initTable,
                    pagerObj: Init.pagerObj,
                    total: data.total,
                    exports: exports
                });
                //初始化分页
                Init.pagerObj = core.initPager($('.paper-container'), pageAll, pageSize || 20, {
                    callback: Init.initTable,
                    pageNumber: pageNumber || 1,
                    pageSizeSelectObj: Init.pageSizeSelectObj,
                    exports: exports
                });
                // 有数据的时候。才需要去初始化
                if (data.total) {
                    // 为表中的checkbox绑定点击事件
                    core.bindCheckboxEvent($table);
                }
            },
            complete: function () {
                flyer.loading.init($('.table-container')).delete();
            },
            error: function (err) {
                flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试！'));
            }
        });
    };

    init.prototype.btnEvent = function () {
        $('.btn-container .flyer-btn').on("click", function () {
            switch ($(this).index()) {
                case 0:
                    //转为处理
                    Init.turnFinished();
                    break;
                case 1:
                    //分派
                    Init.turnAssigned();
                    break;
            }
        });
        if (core.getUserGroups().orgCode === '9101') {
            //客服去除分派按钮
            $('.btn-container .assign').remove();
        }
    };

    //转为已分派
    init.prototype.turnAssigned = function () {
        if ($('tbody input:checked').length === 0) {
            flyer.msg(flyer.i18n.initTitle('请至少选择一项'));
            return;
        } else {
            //弹出角色选择框
            flyer.open({
                pageUrl: core.url + "/html/assignGroup.html",
                isModal: true,
                area: [600, 300],
                title: flyer.i18n.initTitle("请选择要指派的人员"),
                btns: [{
                    text: flyer.i18n.initTitle('确定'),
                    skin: "",
                    click: function () {
                        if ($(".flyer-dialog-content tbody input:checked").length === 0) {
                            flyer.msg(flyer.i18n.initTitle('请至少选择一项'));
                            return;
                        } else if ($(".flyer-dialog-content tbody input:checked").length > 1) {
                            flyer.msg(flyer.i18n.initTitle('最多选择一项'));
                        } else {
                            //更新数据
                            var _this = this;
                            $.ajax({
                                url: "/turn_status",
                                method: "get",
                                data: {
                                    data: JSON.stringify(Init.choicedData('subject_num')),
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
                                    flyer.msg(flyer.i18n.initTitle('分派成功'));
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
    //转为已解决
    init.prototype.turnFinished = function () {
        if ($('tbody input:checked:not(".flyer-dialog-content :checked")').length === 0) {
            flyer.msg(flyer.i18n.initTitle('请至少选择一项'));
            return;
        } else {
            flyer.confirm(flyer.i18n.initTitle("确定要转为已解决吗?"), function (result) {
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
                                    data: Init.choicedData('subject_num'),
                                    status: 9, //转为已处理
                                    name: '已解决',
                                    time: window.Date.parse(new Date())
                                },
                                success: function (result) {
                                    flyer.msg(flyer.i18n.initTitle('操作成功'));
                                    //刷新表格
                                    Init.switch = true;
                                    Init.initTable(Init.pageNumber);
                                    //刷新左侧数量
                                    window.bubbleData();
                                },
                                error: function (err) {
                                    flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试！'));
                                    throw new Error(err);
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
                    title: flyer.i18n.initTitle('询问框'),
                    isModal: true
                })
        }
    };

    //获取选中数据
    init.prototype.choicedData = function (field) {
        var Data = $('tbody input:checked').not('.flyer-dialog-content input:checked').map(function (index, ele) {
            var deleteQue = $(ele).parents('tr').index();
            return Init.rows[deleteQue][field];
        })
        var DataArr = [];
        for (var i = 0; i < Data.length; i++) {
            DataArr.push(Data[i]);
        }
        return DataArr;
    };
    // 初始化查询结果页面的title信息
    init.prototype.initTitle = function (keyword, total, currentMount) {
        var $span = $('#searchMountSpan');
        $span.html('<span>（' + flyer.i18n.initTitle('查找到包含关键字[\'') + keyword + flyer.i18n.initTitle('\']的邮件共') + total + flyer.i18n.initTitle("封，当前显示") + currentMount + flyer.i18n.initTitle("封") + '）</span>');
    };

    var Init = new init();
});