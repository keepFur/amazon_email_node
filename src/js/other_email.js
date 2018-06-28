"use strict";
flyer.define("other_email", function (exports, module) {
    /**
     * 模块入口函数
     * 
     */
    var init = function () {
        this.initTable();
        this.btnEvent();
    };

    /**
     * 初始化表格
     * 
     * @param {any} pageNumber 当前页码
     */
    init.prototype.initTable = function (pageNumber) {
        $.ajax({
            url: core.url + "/select_other_account_list",
            method: "get",
            data: {
                depa_ids: JSON.parse(window.unescape($("#__groupsAll").val())).map(function(obj,index){
                    return obj.orgGroupId
                }),
                pageNumber: (Init && Init.pageNumber) || 1,
                time: window.Date.now(),
            },
            beforeSend: function () {
                flyer.loading.init().add();
            },
            complete: function () {
                flyer.loading.init().delete();
            },
            success: function (data) {
                renderTable(data);
            },
            error: function (err) {
                flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试！'));
                flyer.log(err);
            }
        });
    };


    /**
     * 渲染表格
     * 
     * @param {any} data 数据源
     */
    function renderTable(data) {
        //更新左侧菜单
        window.getOtherMail();
        Init.statusNum = data['status'];
        Init.rows = data.rows;
        var pageAll = data.total;
        var emailCount = data.mailCount;
        var $table = flyer.table($(".table-container"), {
            columns: [
                {
                    title: flyer.i18n.initTitle("其它邮箱账号"),
                    field: "account",
                    styles: {
                        width: 220
                    },
                    formatter: function (row) {
                        return '<span title="' + row.account + '">' + row.account + '</span>';
                    }
                }, {
                    title: flyer.i18n.initTitle("服务器(IMAP)"),
                    field: "imap"
                }, {
                    title: flyer.i18n.initTitle('端口'),
                    field: 'imap_port'
                }, {
                    title: flyer.i18n.initTitle("操作"),
                    field: "editor",
                    styles: {
                        width: 82
                    },
                    formatter: function (row) {
                        return '<a class = "edit_folder table-btn" data-id = ' + row.ID + '><i class = "icon-pen table-btn"></i></a>'
                            + '<a class = "delete_folder table-btn" data-id = ' + row.ID + '><i class = "icon-remove table-btn"></i></a>';
                    }
                }
            ],
            data: Init.rows
        });
        //没有结果的时候
        core.tableNoMatch($table);
        //初始化分页
        Init.pagerObj = core.initPager($('.paper-container'), pageAll, 20, {
            callback: Init.initTable,
            pageNumber: 1,
            pageSizeSelectObj: Init.pageSizeSelectObj,
            exports: exports
        });
        // 初始化下拉框，显示每页数据条数的下拉框
        Init.pageSizeSelectObj = core.initPagerSizeSelect($('.pager-size-container'), core.getPageListByTotal(data.total), String(20), {
            callback: Init.initTable,
            pagerObj: Init.pagerObj,
            total: data.total,
            exports: exports
        });
        // 有数据的时候。才需要去初始化
        if (data.total) {
            // 为表中的checkbox绑定点击事件
            core.bindCheckboxEvent($table);
        }
    }

    /**
     * 事件初始化函数
     * 
     */
    init.prototype.btnEvent = function () {
        // 添加其他邮箱
        $(".other-email-addBtn").on("click", function () {
            var _this = $(this);
            Init.addWindow = flyer.open({
                pageUrl: "/html/change_email.html",
                isModal: true,
                area: [510, 324],
                title: flyer.i18n.initTitle("添加其他邮箱"),
                btns: [{
                    text: flyer.i18n.initTitle('保存'),
                    skin: '',
                    click: function () {
                        var that = this;
                        addOtherEmailAccount(that, '/add_other_account');
                        
                        exports.isUpdate = false;
                    }
                }, {
                    text: flyer.i18n.initTitle('关闭'),
                    click: function () {
                        this.close();
                    }
                }]
            });
        });

        // 置顶显示其他邮箱 todo
        $('.table-container').on('click', '.top_account', function () {
            var $this = $(this),
                id = $this.data('id');
            topOtherEmailAccount('/top_other_account', [id]);
        });

        //修改其他邮箱
        $(".table-container").on("click", ".edit_folder", function () {
            var _this = $(this),
                id = _this.data('id'),
                accountObj = Init.rows[_this.parents('tr').index()];
            // 加载修改邮箱账号的弹出框
            flyer.open({
                pageUrl: "/html/change_email.html",
                isModal: true,
                area: [600, 240],
                title: flyer.i18n.initTitle("修改其他邮箱"),
                btns: [{
                    click: function () {
                        var that = this;
                        updateOtherEmailAccount(that, '/update_other_account', id);
                    },
                    text: flyer.i18n.initTitle('保存')
                }, {
                    text: flyer.i18n.initTitle('关闭'),
                    click: function () {
                        this.close();
                        exports.isUpdate = false;
                    }
                }
                ],
                cancel:function(){
                    exports.isUpdate = false;
                }
            });
            // 设置表单数据
            setFormData(accountObj);
        });

        //删除其它邮箱账户
        $(".table-container").on("click", ".delete_folder", function () {
            var _this = $(this);
            var account = _this.parents('tr').find('td:first').html();
            var id = Number(_this.data("id"));
            flyer.confirm(flyer.i18n.initTitle("确定要删除吗?(删除后账号相关数据全部都会丢失,请确认后再操作)"), function (result, yes) {
            }, {
                    btns: [{
                        text: flyer.i18n.initTitle('确定'),
                        skin: "flyer-btn-blue",
                        click: function (elm) {
                            this.close();
                            deleteOtherEmailAccount('/delete_other_account', [id], account);
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
        });
    };



    /**
     * 获取表单的数据
     * 
     * @param {any} $form  表单对象
     */
    function getFormData($form) {
        var formData = {};
        if ($form && $form.length) {
            formData = {
                account_name: $form.find('input.accont_name').val().trim().split('@')[0],//其它邮箱账户
                account: $form.find('input.accont_name').val().trim(),
                password: $form.find('input.accont_password').val().trim(),//密码
                imap: $form.find("input.imap").val().trim() || 'imap.qq.com',//服务器IMAP
                imap_port: $form.find('input.imap_port').val().trim() || '993',//服务器端口
                time: window.Date.now(),
                user_id: window.Number($("#__userid").val()),
                smtp:$('.smtp').val(),
                smtp_port:$('.smtp-port').val(),
                depa_id:core.getUserGroups().orgGroupId,
                smtp_password:$(".smtp_password").val()
            };
        }
        return formData;
    }

    /**
     * 设置表单的内容
     * 
     * @param {any} $form 表单对象 
     * @param {any} data 数据设置
     */
    function setFormData(data) {
        exports.isUpdate = true;
        exports.row = data;
    }

    /**
     * 验证表单数据
     * 
     * @param {any} $form 
     */
    function vaildForm($form) {
        if ($form.length) {
            var form = flyer.form($form, {}, function () {
                addOtherEmailAccount(Init.addWindow, '/add_other_account');
            });
        }
    }

    /**
     * 判断其他邮箱是否已经添加了
     * 
     * @param {any} accountName 邮箱名称 不包含域名 
     * @param {any} callback 回调函数
     */
    function checkIsExistAccountName(accountName, callback) {
        if (accountName) {
            $.ajax({
                url: core.url + '/justifyCount',
                method: 'post',
                data: {
                    account_name: accountName,
                    user_id: window.Number($("#__userid").val()),
                    nocache: window.Date.now()
                },
                success: function (data) {
                    if (data.count) {
                        flyer.msg(flyer.i18n.initTitle("邮箱") + "[\'" + accountName + "\']" + flyer.i18n.initTitle("已存在"));
                        return;
                    } else if (typeof callback === 'function') {
                        callback();
                    }
                },
                error: function (err) {
                    flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试！'));
                }
            });
        }
    }

    /**
     * 创建账户
     * 
     * @param {any} windowObj 弹出窗口对象 
     * @param {any} url 请求地址
     */
    function addOtherEmailAccount(windowObj, url) {
        var formData = getFormData($('#addOtherAccount'));
        //判断信息是否填写完整
        if(checkFormData(formData)){
            checkIsExistAccountName(formData.account_name, function () {
                $.ajax({
                    url: url,
                    method: 'post',
                    data: formData,
                    beforeSend: function () {
                        core.lockedBtn($(windowObj.$btns[0]), true, flyer.i18n.initTitle('保存中'));
                    },
                    complete: function () {
                        core.unlockBtn($(windowObj.$btns[0]), flyer.i18n.initTitle('保存'));
                    },
                    success: function (data) {
                        if (data && data.message === 'err') {
                            flyer.msg(flyer.i18n.initTitle("添加账号失败,请检查账号信息是否有误"));
                        } else {
                            flyer.msg(flyer.i18n.initTitle("邮箱") + "[\'" + formData.account_name + "\']" + flyer.i18n.initTitle("添加成功"));
                            //刷新表格
                            Init.initTable(Init.pageNumber);
                            windowObj.close();
                        }
                    },
                    error: function (err) {
                        flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试！'));
                    }
                });
            });
        }else{
            flyer.msg(flyer.i18n.initTitle('请将数据填写完整'));
        }
    }

    /**
     *账户置顶显示 
     * 
     * @param {any} url 请求地址
     * @param {any} ids 账户id
     */
    function topOtherEmailAccount(url, ids) {
        if (url && ids.length) {
            $.ajax({
                url: url,
                method: 'post',
                data: {
                    ID: ids[0]
                },
                success: function (data) {
                    flyer.msg(flyer.i18n.initTitle("操作成功"));
                    if (data.success) {
                        Init.initTable(Init.pageNumber);
                    } else {
                        flyer.msg(data.message);
                    }
                },
                error: function (err) {
                    flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试！'));
                }
            });
        } else {
            flyer.msg(flyer.i18n.initTitle('参数错误，请刷新页面重试！'));
        }
    }

    /**
     * 修改其他邮箱信息
     * 
     * @param {any} windowObj 弹出窗口对象
     * @param {any} url 请求地址
     */
    function updateOtherEmailAccount(windowObj, url, id) {
        var formData = getFormData($('#addOtherAccount'));
        formData.ID = id;
        if(checkFormData(formData)){
            if (url) {
                $.ajax({
                    url: url,
                    method: 'post',
                    data: formData,
                    beforeSend: function () {
                        core.lockedBtn($(windowObj.$btns[0]), true, flyer.i18n.initTitle('保存中'));
                    },
                    complete: function () {
                        core.unlockBtn($(windowObj.$btns[0]), flyer.i18n.initTitle('保存'));
                    },
                    success: function (data) {
                        if (data.success) {
                            flyer.msg(flyer.i18n.initTitle("邮箱") + "[\'" + formData.account + "\']" + flyer.i18n.initTitle("修改成功"));
                            Init.initTable(Init.pageNumber);
                            windowObj.close();
                        } else {
                            flyer.msg(flyer.i18n.initTitle("修改账号信息失败,请检查账号信息是否正确匹配"));
                        }
                    },
                    error: function (err) {
                        flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试！'));
                    }
                });
            } else {
                flyer.msg(flyer.i18n.initTitle('请求地址有误，请刷新页面重试！'));
            }
        }else{
            flyer.msg(flyer.i18n.initTitle('请将数据填写完整'));
        }
    }

    /**
     * 删除其他邮箱 支持批量删除
     * 
     * @param {any} url 请求地址
     * @param {any} ids 账户ids
     */
    function deleteOtherEmailAccount(url, ids, account) {
        if (ids.length && url) {
            $.ajax({
                url: url,
                method: 'get',
                data: {
                    ID: ids[0],//要删除的id
                    account: account
                },
                success: function (data) {
                    flyer.msg(flyer.i18n.initTitle("删除成功"));
                    //刷新表格
                    Init.initTable(Init.pageNumber);
                },
                error: function (err) {
                    flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试！'));
                }
            });
        } else {
            flyer.msg(flyer.i18n.initTitle('参数有误，请刷新页面重试！'));
        }
    }
    function checkFormData(data){
        var istrue = true;
        Object.keys(data).forEach(function(obj,index){
            if(!data[obj]){
                istrue = false;
            }
        })
        return istrue;
    }
    // 页面入口
    var Init = new init();
});