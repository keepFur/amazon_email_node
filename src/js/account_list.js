"use strict";
flyer.define("account_list", function (exports, module) {
    var init = function () {
        $('.loadTip').remove();
        this.initTable();
        this.btnEvent();
    };
    init.prototype.initTable = function (pageNumber) {
        $.ajax({
            url: "/accountList",
            method: "get",
            data: {
                pageNumber: this.pageNumber || 1,
                time: window.Date.parse(new Date()),
                accountName: $('.flyer-account-input').val().trim().replace(/\s+|,+|，+/ig, ',').split(',')
            },
            success: function (data) {
                Init.rows = data.rows;
                var pageAll = data.total;
                Init.pageAll = pageAll;
                var table = flyer.table($(".table-container"), {
                    columns: [{
                        checkbox: true,
                        field: "",
                        styles: {
                            width: 34
                        }
                    }, {
                        title: flyer.i18n.initTitle("账号"),
                        field: "mail_address"
                    }, {
                        title: flyer.i18n.initTitle("域名"),
                        field: "domain"
                    }, {
                        title: flyer.i18n.initTitle("创建时间"),
                        field: "created_at",
                        styles: {
                            width: 200
                        },
                        formatter: function (data) {
                            return core.parseDateFormate(data.created_at);
                        }
                    }, {
                        title: flyer.i18n.initTitle("归属"),
                        field: "depa_name",
                        formatter: function (data) {
                            if (data.depa_name) {
                                return data.depa_name;
                            } else {
                                return '-';
                            }
                        }
                    }],
                    data: Init.rows//ajax数据
                });

                //没有结果的时候
                if (Init.rows.length === 0) {
                    $('.flyer-table-body table tbody').append('<tr class = "empty_title"><td colspan = ' + $('th').length + '>' + flyer.i18n.initTitle("暂时没有数据") + '</td></tr>')
                } else {
                    $('.empty_title').remove();
                }
                //初始化分页
                if (!Init.switch) { Init.switchPaper(pageAll) };
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
        })
    };
    init.prototype.btnEvent = function () {
        $('.btn-container .flyer-btn').on("click", function () {
            switch ($(this).index()) {
                case 0:
                    //跳转创建账号页面
                    $('[data-href="add_account.html"]').click();
                    break;
                case 1:
                    //跳转更新账号页面
                    $('[data-href="add_account.html"]').click();
                    break;
                case 2:
                    //弹出分配账号弹窗
                    Init.allot();
                    break;
                default:
                    //删除当前选中数据
                    Init.deleteData();
                    break;
            }
        });
        // 邮件搜索功能,支持批量查询，单个精确匹配，多个模糊匹配
        $('.flyer-account-search').on('click', function (event) {
            Init.initTable(1);
            return false;
        });
        $(document).on('keyup', function (event) {
            var e = event || window.event, keycode = e.keyCode;
            if (keycode === 13) {
                Init.initTable(1);
            }
        });
    };
    //删除当前选中的数据
    init.prototype.deleteData = function () {
        var deleteData = $('tbody input:checked').map(function (index, ele) {
            var deleteQue = $(ele).parents('tr').index()
            return { 'ID': Init.rows[deleteQue]['ID'], 'user': Init.rows[deleteQue]['mail_address'] };
        })
        var data = [];
        for (var i = 0; i < deleteData.length; i++) {
            data.push(deleteData[i]);
        }

        if ($('tbody input:checked').length === 0) {
            flyer.msg(((flyer.i18n && flyer.i18n.initTitle('请选择一项')) || '请选择一项'));
            return;
        } else if ($('tbody input:checked').length > 1) {
            flyer.msg(((flyer.i18n && flyer.i18n.initTitle('请选择单条数据')) || '请选择单条数据'));
            return;
        } else {
            flyer.confirm(flyer.i18n.initTitle("确定要删除吗?"), function (result, yes) {
            }, {
                    btns: [{
                        text: flyer.i18n.initTitle('确定'),
                        skin: "flyer-btn-blue",
                        click: function (elm) {
                            this.close();
                            core.lockedBtn($("button.flyer-btn-default"), true, flyer.i18n.initTitle('删除中'));
                            $.ajax({
                                url: "/deleteAccount",
                                method: "get",
                                data: {
                                    data: JSON.stringify(data),
                                    time: window.Date.parse(new Date()),
                                },
                                success: function (result) {
                                    if (result.response) {
                                        flyer.msg(((flyer.i18n && flyer.i18n.initTitle('删除成功')) || '删除成功'));
                                        //刷新表格
                                        Init.switch = true;
                                        Init.initTable(Init.pageNumber);
                                    } else {
                                        flyer.msg(((flyer.i18n && flyer.i18n.initTitle('删除失败')) || '删除失败'));
                                    }
                                    core.unlockBtn($("button.flyer-btn-default"), flyer.i18n.initTitle('删除'));
                                },
                                error: function (err) {
                                    flyer.msg(((flyer.i18n && flyer.i18n.initTitle("服务器出错")) || "服务器出错"))
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
        var pageObj = flyer.page($('.paper-container').not(".flyer-dialog .paper-container"),
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
    init.prototype.allot = function () {
        if ($('tbody input:checked').length === 0) {
            flyer.msg(((flyer.i18n && flyer.i18n.initTitle('请至少选择一项')) || '请至少选择一项'));
            return;
        } else {
            var email_address = this.getSelectedDatas('mail_address');
            flyer.open({
                pageUrl: "/html/group_choice.html",
                isModal: true,
                area: [600, 420],
                title: flyer.i18n.initTitle("选择分组"),
                cancel: function () {
                    $(document).off('keyup').on('keyup', function (e) {
                        if (e.keyCode === 13) {
                            Init.initTable(1);
                        }
                        return false;
                    });
                    return false;
                },
                btns: [
                    {
                        text: flyer.i18n.initTitle('确定'),
                        skin: "",
                        click: function () {
                            if ($(".flyer-dialog-content tbody input:checked").length === 0) {
                                flyer.msg(((flyer.i18n && flyer.i18n.initTitle("请至少选择一项")) || "请至少选择一项"));
                                return;
                            } else if ($(".flyer-dialog-content tbody input:checked").length > 1) {
                                flyer.msg(((flyer.i18n && flyer.i18n.initTitle("最多选择一项")) || "最多选择一项"));
                                return;
                            } else {
                                //执行分配组操作
                                var _this = this;
                                var choicedIndex = $('.flyer-dialog-content :checked').parents('tr').index();
                                // 锁定按钮
                                core.lockedBtn($(_this.$btns[0]), true, flyer.i18n.initTitle('分配中'));
                                $.ajax({
                                    url: '/update_group',
                                    method: 'post',
                                    data: {
                                        name: window.flyer.exports.group_choice.groupData[choicedIndex].name,
                                        id: window.flyer.exports.group_choice.groupData[choicedIndex].id,
                                        time: window.Date.parse(new Date()),
                                        email_address: email_address
                                    },
                                    success: function (data) {
                                        flyer.msg(((flyer.i18n && flyer.i18n.initTitle('添加分组成功')) || '添加分组成功'));
                                        $('.flyer-layout-accountMan :checked').prop('checked', false);
                                        //取消选中状态
                                        setTimeout(function () {
                                            //刷新状态
                                            Init.initTable();
                                            _this.close();
                                            $('.flyer-dialog-content').remove();
                                            $(document).off('keyup').on('keyup', function (e) {
                                                if (e.keyCode === 13) {
                                                    Init.initTable(1);
                                                }
                                                return false;
                                            });
                                        }, 600);
                                    },
                                    error: function () {
                                        flyer.msg(((flyer.i18n && flyer.i18n.initTitle('添加分组失败')) || '添加分组失败'))
                                    },
                                    complete: function () {
                                        // 解锁按钮
                                        core.unlockBtn($(_this.$btns[0]), flyer.i18n.initTitle('确定'));
                                    }
                                });
                            }
                        }
                    }]
            });
        }
    };
    // 获取选中的数据
    init.prototype.getSelectedDatas = function (field) {
        let Data = $('tbody input:checked:not(".flyer-dialog-content :checked")').map(function (index, ele) {
            let updateQue = $(ele).parents('tr').index()
            return Init.rows[updateQue][field];
        })
        let DataArr = [];
        for (let i = 0; i < Data.length; i++) {
            DataArr.push(Data[i]);
        }
        return DataArr;
    }
    var Init = new init();
});
