"use strict";
flyer.define("templates", function (exports, module) {
    var init = function () {
        $('.loadTip').remove();
        this.initTable();
        this.btnEvent();
    }
    init.prototype.initTable = function (pageNumber) {
        $.ajax({
            url: core.url + "/manageTemplate",
            method: "get",
            data: {
                pageNumber: this.pageNumber || 1,
                orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                time: window.Date.parse(new Date())
            },
            beforeSend: function () {
                flyer.loading.init().add();
            },
            complete: function () {
                flyer.loading.init().delete();
            },
            success: function (data) {
                Init.rows = data.rows;
                var pageAll = data.total;
                Init.pageAll = pageAll;
                $('#templateMountSpan').html(data.total);
                $('#templateCurrentMountSpan').html(data.rows.length);
                var table = flyer.table($(".table-container"), {
                    columns: [{
                        field: "",
                        checkbox: true,
                        styles: {
                            width: 34
                        }
                    }, {
                        title: flyer.i18n.initTitle("标题"),
                        field: "title",
                        formatter: function (rows) {
                            var content = window.decodeURIComponent(rows.content);
                            content = content.replace(/<[^>]*>|[\s\t]*/ig, "");
                            return '<span class = "template-title" title="' + rows.title + content + '">' + rows.title + '</span><span class = "template-content" title="' + rows.title + content + '">' + content + '</span>';
                        }
                    }, {
                        title: flyer.i18n.initTitle("创建人"),
                        field: "createByName",
                        formatter: function (rows) {
                            if (!rows.create_by_name) {
                                return '-';
                            } else {
                                return rows.create_by_name;
                            }
                        },
                        styles: {
                            width: 200
                        }
                    }, {
                        title: flyer.i18n.initTitle("更新日期"),
                        field: "update_date",
                        styles: {
                            width: 120
                        },
                        formatter: function (row) {
                            return core.parseDateFormate(row.update_date);
                        }
                    }],
                    data: Init.rows, //ajax数据
                    rowClick: function (index, row, rows) {
                        //跳转创建模板页面
                        exports.loadFrame(row.ID);
                    }
                });
                //没有结果的时候
                if (Init.pageAll === 0) {
                    $('.flyer-table-body table tbody').append('<tr class = "empty_title"><td colspan = ' + $('th').length + '>' + flyer.i18n.initTitle('暂时没有数据') + '</td></tr>');
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
                // 为表中的checkbox绑定点击事件
                core.bindCheckboxEvent(table);
            },
            error: function (err) {
                throw new Error(err);
            }
        });
    };

    init.prototype.btnEvent = function () {
        $('.btn-container .flyer-btn').on("click", function () {
            switch ($(this).index()) {
                case 0:
                    //跳转创建模板页面
                    $('[data-href="add_template.html"]').click();
                    break;
                case 1:
                    //编辑数据
                    Init.editorTemplate();
                    break;
                default:
                    //shanchu当前选中数据
                    Init.deleteData();
                    break;
            }
        });
    };

    //删除当前选中的数据
    init.prototype.deleteData = function () {

        var deleteData = $('tbody input:checked').map(function (index, ele) {
            var deleteQue = $(ele).parents('tr').index();
            return Init.rows[deleteQue]['ID'];
        });

        var data = [];
        for (var i = 0; i < deleteData.length; i++) {
            data.push(deleteData[i]);
        }

        if ($('tbody input:checked').length === 0) {
            flyer.msg(flyer.i18n.initTitle('至少选择一项'));
            return;
        } else {
            flyer.confirm(flyer.i18n.initTitle("确定要删除吗?"), function (result) {
            }, {
                btns: [{
                    text: flyer.i18n.initTitle('确定'),
                    skin: "flyer-btn-blue",
                    click: function (elm) {
                        this.close();
                        $.ajax({
                            url: "/deleteTemplate",
                            method: "get",
                            data: {
                                data: JSON.stringify(data),
                                time: window.Date.parse(new Date())
                            },
                            success: function (result) {
                                //刷新表格
                                Init.switch = true;
                                Init.initTable(Init.pageNumber);
                            },
                            error: function (err) {
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
                    title: flyer.i18n.initTitle("询问框"),
                    isModal: true
                });
        }
    };

    init.prototype.switchPaper = function (pageAll) {
        var pageObj = flyer.page($('.paper-container'), {
            totalNum: pageAll,
            curIndex: Init.pageNumber || 1,
            pageSize: 15,
            fnClick: function () {
                //刷新页面
                Init.pageNumber = this.options.curIndex;
                Init.switch = true;
                Init.initTable(Init.pageNumber);
            }
        });
    };
    //编辑模板
    init.prototype.editorTemplate = function () {
        if ($('tbody input:checked').length !== 1) {
            flyer.msg(flyer.i18n.initTitle("最多选择一项"));
        } else {
            var DataId = Init.rows[$('table input:checked').parents('tr').index()]['ID'];
            //跳转创建模板页面
            exports.loadFrame(DataId);
        }
    };
    //跳转编辑页面标识
    exports.loadFrame = function (obj) {
        var params = "?exportKey=templates&id=" + obj;
        core.loadPage("#add_template", params);
    };
    var Init = new init();
});