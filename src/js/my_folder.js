"use strict";
flyer.define("my_folder", function (exports, module) {
    var indexIn = 0,
        init = function () {
            $(".loadTip").remove();
            this.initTable();
            this.btnEvent();
            initTab();
        }
    init.prototype.initTable = function (pageNumber) {
        $.ajax({
            url: '/file_list',
            method: 'get',
            data: {
                pageNumber: (Init && Init.pageNumber) || 1,
                depa_id: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                orgCode: core.getUserGroups().orgCode,
                create_by_id: window.Number($("#__userid").val()),
                isList: true
            },
            beforeSend: function () {
                flyer.loading.init().add();
            },
            complete: function () {
                flyer.loading.init().delete();
            },
            success: function (data) {
                initTable(data);
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
                    //新增文件夹
                    addFold();
                    break;
                case 1:
                    //删除文件夹
                    if ($('tbody input:checked').length === 0) {
                        flyer.msg(flyer.i18n.initTitle("请至少选择一个文件夹进行操作"));
                    } else {
                        //删除文件夹
                        deleteFolder();
                    }
                    break;
            }
        })
        //编辑功能按钮
        $(".table-container").on("click", ".edit_folder", function () {
            var _this = $(this);
            exports.editorIndex = Init.rows[_this.parents('tr').index()];
            //更新文件夹名称弹出框
            flyer.open({
                pageUrl: '/html/editor_folder.html',
                isModal: true,
                area: [400, 200],
                title: flyer.i18n.initTitle("编辑文件夹"),
                btns: [
                    {
                        click: function () {
                            //提交新名称
                            updateFolderName(_this);
                        },
                        text: flyer.i18n.initTitle('确定')
                    },
                    {
                        click: function () {

                            this.close();
                        },
                        text: flyer.i18n.initTitle('关闭')
                    }
                ]
            });
        })
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
                Init.initTable(Init.pageNumber);
            }
        });
    };
    var Init = new init();
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
    function initTable(data) {
        Init.statusNum = data['Status'];
        Init.rows = data.rows;
        var pageAll = data.total;
        Init.pageAll = pageAll;
        $('#CurrentMountSpan').text(data.rows.length);
        $('#totalAll').text(pageAll);
        var options = {
            columns: [{
                title: "ID",
                field: "",
                checkbox: true,
                styles: {
                    width: 34
                },
                titleTooltip: "ID",
                visible: true
            },
            {
                title: flyer.i18n.initTitle("文件夹"),
                field: "type_name",
                styles: {
                    width: 160
                },
                formatter: function (row) {
                    return '<span title="' + row.type_name + '">' + row.type_name + '</span>';
                }
            }, {
                title: flyer.i18n.initTitle("未处理邮件数量"),
                field: "unfinish",
                formatter: function (row, b, c) {
                    return Init.statusNum[row['ID']][0];
                }
            }, {
                title: flyer.i18n.initTitle("已回复邮件数量"),
                field: "user_name",
                formatter: function (row) {
                    return Init.statusNum[row['ID']][1];
                }
            }, {
                title: flyer.i18n.initTitle("未分配邮件数量"),
                field: "timer",
                formatter: function (row) {
                    return Init.statusNum[row['ID']][2];
                }
            }, {
                title: flyer.i18n.initTitle("已分配邮件数量"),
                field: "timer",
                formatter: function (row) {
                    return Init.statusNum[row['ID']][3];
                }
            }, {
                title: flyer.i18n.initTitle("已解决邮件数量"),
                field: "timer",
                formatter: function (row) {
                    return Init.statusNum[row['ID']][4];
                }
            }, {
                title: flyer.i18n.initTitle("邮件总数量"),
                field: "total",
                formatter: function (row) {
                    return Init.statusNum[row['ID']][5];
                }
            }, {
                title: flyer.i18n.initTitle("编辑"),
                field: "editor",
                styles: {
                    width: 82
                },
                formatter: function (row) {
                    return '<a class = "edit_folder table-btn" data-id = ' + row.ID + '><i class="fa  fa-pencil table-btn"></i></a>';
                }
            }
            ],
            data: Init.rows, //ajax数据
            rowClick: function (index, row, rows, e) {
                if (!$(e.target).hasClass('table-btn')) {
                    exports.data = row;
                    var params = "?exportKey=my_folder&type_id=" + window.escape(exports.data.ID);
                    core.loadPage("#folder_detail", params);
                    $('[data-typeid=' + flyer.getQueryString("type_id") + ']').addClass("flyer-layout-linkActive");
                }
            }
        }
        if (core.getUserGroups().orgCode === '9101') {
            options.columns.splice(4, 2);
        }
        var table = flyer.table($(".table-container"), options);
        //没有结果的时候
        if (Init.pageAll === 0) {
            $('.flyer-table-body table tbody').append('<tr class = "empty_title"><td colspan = ' + $('th').length + '>' + flyer.i18n.initTitle("暂时没有数据") + '</td></tr>')
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
        core.bindCheckboxEvent(table);
    }
    function initTab() {
        //tab点击显示隐藏
        $(".flyer-tab li").on("click", function () {
            if (!$(this).hasClass("flyer-tab-active")) {
                $(this).addClass("flyer-tab-active").siblings().removeClass("flyer-tab-active");
                var indexO = $(this).index();
                $(".flyer-tab-content").find(".flyer-tab-item").eq(indexO).show().siblings().hide();
            }
        })
    }
    function updateFolderName(_this) {
        //确认名称符合要求提交并名称是否已存在然后提交
        if (filterName()) {
            ifHasName($(".folder_name_new").val().trim(), function (result) {
                if (result) {
                    flyer.msg(flyer.i18n.initTitle('文件名已存在'));
                    $(".folder_name_new").focus();
                    return;
                }
                $.ajax({
                    url: '/update_filename',
                    method: 'get',
                    data: {
                        type_name: $(".folder_name_new").val(),//新的名称
                        depa_id: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                        update_name: $("#__username").val(),
                        fileID: _this.data("id"),
                        time: window.Date.parse(new Date()),
                        isKpi: $('[name="mail-aging"]').prop("checked") ? 1 : 0
                    },
                    success: function (data) {
                        flyer.msg(flyer.i18n.initTitle("更新成功"));
                        //刷新表格
                        Init.initTable(Init.pageNumber);
                        //刷新左侧菜单
                        window.getFolder();
                        flyer.closeAll();
                    },
                    error: function (err) {
                        throw new Error(err);
                    }
                });
            });
        }
    }
    function filterName() {
        //确认名称符合要求
        if ($(".folder_name_new").val().length > 10) {
            flyer.msg(flyer.i18n.initTitle("请控制字符的长度在10个以内"));
            return false
        } else if ($(".folder_name_new").val().length === 0) {
            flyer.msg(flyer.i18n.initTitle("文件夹名不能为空"))
            return false
        } else {
            return true
        }
    }
    function ifHasName(fileName, callback) {
        //确认名称是否已经存在
        $.ajax({
            url: '/ifContainFile',
            method: 'get',
            data: {
                fileName: fileName,//新的名称
                depa_id: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                time: window.Date.parse(new Date()),
            },
            success: function (data) {
                if (data['count']) {
                    callback(true);
                } else {
                    callback(false);
                }
            },
            error: function (err) {
                throw new Error(err);
            }
        });
    }
    function addFold() {
        //更新文件夹名称弹出框
        flyer.open({
            pageUrl: '/html/add_folder.html',
            isModal: true,
            area: [400, 120],
            title: flyer.i18n.initTitle("新增文件夹"),
            btns: [
                {
                    click: function () {
                        //提交文件名
                        if ($(".folder_name").val().length > 10) {
                            flyer.msg(flyer.i18n.initTitle("请控制字符的长度在10个以内"))
                        } else if ($(".folder_name").val().length === 0) {
                            flyer.msg(flyer.i18n.initTitle("文件夹名不能为空"))
                        } else {
                            addFoldData();
                        }
                    },
                    text: flyer.i18n.initTitle('确定')
                },
                {
                    click: function () {
                        this.close();
                    },
                    text: flyer.i18n.initTitle('关闭')
                }
            ]
        });
        function addFoldData() {
            ifHasName($(".folder_name").val().trim(), function (result) {
                if (result) {
                    flyer.msg(flyer.i18n.initTitle("已存在同名文件夹"));
                    $(".folder_name").focus();
                    return;
                }
                $.ajax({
                    url: '/add_filetype',
                    method: 'get',
                    data: {
                        type_name: $(".folder_name").val().trim(),
                        create_by_name: $("#__username").val(),
                        depa_id: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                        time: window.Date.parse(new Date())
                    },
                    success: function (data) {
                        flyer.msg(flyer.i18n.initTitle("添加文件夹成功"));
                        //刷新表格
                        Init.initTable(Init.pageNumber);
                        //刷新左侧菜单
                        window.getFolder(Init.initTable);
                        flyer.closeAll();
                    },
                    error: function (err) {
                        throw new Error(err);
                    }
                });
            });
        }
    }
    //删除文件夹
    function deleteFolder() {
        confirm();
        //删除文件
        function deleteFolders(elm) {
            $.ajax({
                url: '/delete_file',
                method: 'get',
                data: {
                    fileID: choicedData('ID'),
                    time: window.Date.parse(new Date()),
                },
                beforeSend: function () {
                    core.lockedBtn($(elm), true, flyer.i18n.initTitle("删除中"));
                },
                success: function (data) {
                    flyer.closeAll();
                    flyer.msg(flyer.i18n.initTitle("操作成功"));
                    //刷新表格
                    Init.initTable(Init.pageNumber);
                    //刷新左侧菜单
                    window.getFolder();
                    //刷新左侧气泡参数
                    window.bubbleData();
                },
                error: function (err) {
                    throw new Error(err);
                },
                complete: function () {
                    core.unlockBtn($(elm), flyer.i18n.initTitle("确定"));
                }
            });
        }
        //确认是否要删除
        function confirm() {
            flyer.confirm(flyer.i18n.initTitle("确定要删除文件夹吗?"), function (result, yes) {
            }, {
                    btns: [{
                        text: flyer.i18n.initTitle('确定'),
                        skin: "flyer-btn-blue",
                        click: function (elm) {
                            deleteFolders(elm);
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
    }

});

