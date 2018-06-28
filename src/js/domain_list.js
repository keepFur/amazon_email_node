"use strict";
flyer.define("domain_list", function () {
    var init = function () {
        $(".loadTip").remove();
        this.initTable();
        this.btnEvent();
    }
    init.prototype.initTable = function (pageNumber) {
        $.ajax({
            url: "/domainList",
            method: "get",
            data: {
                pageNumber: this.pageNumber || 1,
                time:window.Date.parse(new Date())
            },
            success: function (data) {
                //过滤域
                var rows = data.items;
                rows.forEach(function (ele, index) {
                    if (ele.name == "sandbox3d390fea777441cb8283b0ed5ffcfe61.mailgun.org") {
                        rows.splice(index, 1);
                    }
                })
                Init.rows = rows;
                var pageAll = data.total_count;
                Init.pageAll = pageAll;
                var table = flyer.table($(".table-container"), {
                    columns: [{
                        title: "ID",
                        field: "",
                        checkbox: true,
                        styles: {
                            width: 50
                        },
                        titleTooltip: "ID",
                        visible: true
                    }, {
                        title: flyer.i18n.initTitle("域名"),
                        field: "name",
                        styles: {
                            width: 700
                        },
                    }, {
                        title: flyer.i18n.initTitle("创建时间"),
                        field: "created_at",
                        styles: {
                            width: 200
                        },
                        formatter: function (data) {
                            return flyer.formatDate('yyyy-mm-dd hh:MM:ss', new Date(data.created_at));
                        }
                    }, {
                        title: flyer.i18n.initTitle("创建人"),
                        field: "Update_priv",
                        formatter: function (row) {
                            if (!row.createUser) {
                                return '-';
                            }
                        }
                    }],
                    data: Init.rows//ajax数据
                });
                //没有结果的时候
                if (Init.pageAll === 0) {
                    $('.flyer-table-body table tbody').append('<tr class = "empty_title"><td colspan = ' + $('th').length + '>'+flyer.i18n.initTitle("暂时没有数据")+'</td></tr>')
                } else {
                    $('.empty_title').remove();
                }
                //初始化分页
                if (!Init.switch){
                    Init.switchPaper(pageAll);
                }
                Init.switch = false;
                //减少一页重载表格 以及重置分页
                if (Init.rows.length === 0 && Init.pageNumber && Init.pageNumber !== 1) {
                    Init.pageNumber -= 1;
                    Init.initTable(Init.pageNumber);
                }
            },
            error: function (err) {
                throw new Error(err);
            }
        })
    }
    init.prototype.btnEvent = function () {
        $('.btn-container .flyer-btn').on("click", function () {
            switch ($(this).index()) {
                case 0:
                    //跳转添加域页面
                    $('[data-href="add_domain.html"]').click();
                    break;
                default:
                    //shanchu当前选中数据
                    Init.deleteData();
                    break;
            }
        })
    }
    //删除当前选中的数据
    init.prototype.deleteData = function () {
        if ($('table input:checked').length === 0) {
            flyer.msg(((flyer.i18n && flyer.i18n.initTitle('请选择一项'))|| '请选择一项'));
        }
        var deleteData = $('table input:checked').map(function (index, ele) {
            var deleteQue = $(ele).parents('tr').index();
            return Init.rows[deleteQue]['name'];
        });
        var data = [];
        for (var i = 0; i < deleteData.length; i++) {
            data.push(deleteData[i]);
        }
        if ($('table input:checked').length === 0) {
            flyer.msg(((flyer.i18n && flyer.i18n.initTitle('请至少选择一项'))|| '请至少选择一项'));
            return;
        } else {
            flyer.confirm(flyer.i18n.initTitle("确定要删除吗?"), function (result) {
            },{
                btns: [{
                    text: flyer.i18n.initTitle('确定'),
                    skin: "flyer-btn-blue",
                    click: function (elm) {
                        this.close();
                        $.ajax({
                            url: "/deleteDomain",
                            method: "get",
                            data: {
                                data: JSON.stringify(data),
                                time:window.Date.parse(new Date())
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
                isModal:true
            });
        }
    };

    init.prototype.switchPaper = function (pageAll) {
        var pageObj = flyer.page($('.paper-container'),
            {
                totalNum: pageAll,
                curIndex: Init.pageNumber || 1,
                pageSize: 15,
                fnClick: function () {
                    //刷新页面
                    Init.pageNumber = this.options.curIndex;
                    Init.switch = true;
                    Init.initTable(Init.pageNumber);
                }
            }
        );
    };

    var Init = new init();
});
