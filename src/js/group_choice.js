"use strict";
flyer.define("group_choice", function (exports, module) {
    var init = function () {
        this.initTable();
        initEvent();
    }
    init.prototype.initTable = function (pageNumber) {
        $.ajax({
            url: core.url + "/group_list",
            method: "get",
            data: {
                pageNumber: this.pageNumber || 1,
                time: window.Date.parse(new Date()),
                names: $('.flyer-dialog .flyer-assigned-input').val() && $('.flyer-dialog .flyer-assigned-input').val().trim().replace(/\s+|,+|，+/ig, ',').split(',').filter(function (item) {
                    if (item) {
                        return item;
                    }
                })
            },
            success: function (data) {
                Init.rows = data.rows;
                exports.groupData = Init.rows;
                var pageAll = data.total;
                Init.pageAll = pageAll;
                var table = flyer.table($(".flyer-dialog-content .table-container"), {
                    columns: [{
                        title: "ID",
                        field: "",
                        checkbox: true,
                        styles: {
                            width: 60
                        },
                        titleTooltip: "ID",
                        visible: true
                    }, {
                        title: flyer.i18n.initTitle("客服分组"),
                        field: "name",
                        styles: {
                            width: 400
                        }
                    }],
                    data: Init.rows//ajax数据
                });
                //没有结果的时候
                if (Init.pageAll === 0) {
                    $('.flyer-dialog-content tbody').append('<tr class = "empty_title"><td colspan = ' + $('.flyer-dialog-content th').length + '>' + flyer.i18n.initTitle("暂时没有数据") + '</td></tr>')
                } else {
                    $('.empty_title').remove();
                }
                //初始化分页
                if (!Init.switch) {
                    Init.switchPaper(pageAll);
                }
                Init.switch = false;
                //减少一页重载表格 以及重置分页
                if (Init.rows.length === 0 && Init.pageNumber && Init.pageNumber !== 1) {
                    Init.pageNumber -= 1;
                    Init.initTable(Init.pageNumber);
                }
                // 有数据的时候。才需要去初始化
                if (Init.rows.length) {
                    // 为表中的checkbox绑定点击事件
                    core.bindCheckboxEvent(table);
                }
            },
            error: function (err) {
                throw new Error(err);
            }
        });
    };

    init.prototype.switchPaper = function (pageAll) {
        var pageObj = flyer.page($('.paper-container'),
            {
                totalNum: pageAll,
                curIndex: Init.pageNumber || 1,
                pageSize: 8,
                fnClick: function () {
                    //刷新页面
                    Init.pageNumber = this.options.curIndex;
                    Init.switch = true;
                    Init.initTable(Init.pageNumber);
                }
            }
        );
    };
    // 事件绑定
    function initEvent() {
        //  搜索按钮
        $('.flyer-account-search').on('click', function (e) {
            Init.initTable(1);
            return false;
        });
        // 回车键搜索
        $(document).off('keyup').on('keyup', function (e) {
            var code = e.keyCode;
            if (code === 13) {
                Init.initTable(1);
            }
            return false;
        });
    }
    var Init = new init();
});
