"use strict";
flyer.define("receiving_email_rules", function (exports, module) {
    // 分页数据
    var pagerData = {
        switch: false,
        total: 0,
        pageNumber: 1
    }, $table = null;

    /**
     * 页面初始化函数
     * 
     */
    function init() {
        // 初始化表格
        initTable(formatterUrl('/get_receiving_email_rule_list'), 1);
        // 初始化事件
        initEvents();
    }

    /**
     * 事件初始化函数
     * 
     */
    function initEvents() {
        /**
         * 表格外部数据操作
         */
        // 创建收信规则
        $('.flyerCreateBtn').on('click', function () {
            core.loadPage('#creat_receiving_email_rule');
            return false;
        });

        // 编辑收信规则
        $('#flyerEditBtn').on('click', function (event) {
            var tableCheckedDatas = getTableCheckedDatas($table), id = '';
            if (tableCheckedDatas.length === 1) {
                id = tableCheckedDatas[0].ID;
                core.loadPage('creat_receiving_email_rule', '?ID=' + id);
            } else {
                flyer.msg(flyer.i18n.initTitle('最多选择一项'));
            }
            return false;
        });

        // 删除收信规则
        $('#flyerDeleteBtn').on('click', function (event) {
            var tableCheckedDatas = getTableCheckedDatas($table), ids = [];
            flyer.closeAll();//先关闭之前的
            if (tableCheckedDatas.length) {
                ids = tableCheckedDatas.map(function (item) {
                    return item.ID;
                });
                flyer.confirm(flyer.i18n.initTitle("确定删除吗?"), function (result) {
                }, {
                        btns: [{
                            text: flyer.i18n.initTitle('确定'),
                            skin: "flyer-btn-blue",
                            click: function (elm) {
                                this.close();
                                deleteReceivingEmailRulesById(ids);
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
            } else {
                flyer.msg(flyer.i18n.initTitle('至少选择一项'));
            }
            return false;
        });

        /**
         * 表格内部数据操作
         */
        // 启用或停用
        $('.table-container').on('click', 'input[name=flyer-active-radio]', function (event) {
            var e = event || window.event, $this = $(e.target), id = $this.val(), active = $this.data('active'), title = active === 'checked' ? '确定停用吗?' : '确定启用吗?';
            flyer.closeAll();
            refreshReceivingEmailRulesById(id, active === 'checked' ? '0' : '1');
            return false;
        });

        // 删除收信规则
        $('.table-container').on('click', '.flyer-delete-btn', function (event) {
            var e = event || window.event, $this = $(e.target), id = $this.data('id');
            flyer.closeAll();//先关闭之前的
            flyer.confirm(flyer.i18n.initTitle("确定删除吗?"), function (result) {
            }, {
                    btns: [{
                        text: flyer.i18n.initTitle('确定'),
                        skin: "flyer-btn-blue",
                        click: function (elm) {
                            this.close();
                            deleteReceivingEmailRulesById([id]);
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

        // 编辑收信规则
        $('.table-container').on('click', '.flyer-edit-btn', function (event) {
            var e = event || window.event, $this = $(e.target), id = $this.data('id');
            core.loadPage('creat_receiving_email_rule', '?ID=' + id);
        });

        // 匹配所有邮件
        $('.table-container').on('click', '.flyer-run-btn', function (event) {
            var e = event || window.event, $this = $(e.target),
                id = $this.data('id'),
                orgGroupId = JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                isReply = $this.data('rules'),
                tips = isReply ? flyer.i18n.initTitle("'确定是要将该规则对现有的邮件进行一次匹配吗?") + '</br></br><span style="color:#f27068;">' + flyer.i18n.initTitle("该规则中包含了自动回复选项，点击确定会批量发送邮件给对方") + '</span>' : flyer.i18n.initTitle('确定是要将该规则对现有的邮件进行一次匹配吗?');
            flyer.closeAll();//先关闭之前的
            flyer.confirm(tips, function (result) {
            }, {
                    btns: [{
                        text: flyer.i18n.initTitle('确定'),
                        skin: "flyer-btn-blue",
                        click: function (elm) {
                            this.close();
                            runReceivingEmailRulesById({
                                id: id,
                                orgGroupId: orgGroupId
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
        });
    }

    /**
     * 表格初始化函数
     * 
     * @param {any} url 表格数据请求地址
     * @param {any} pageNumber 当前页码
     * @returns 
     */
    function initTable(url, pageNumber) {
        if (url) {
            $.ajax({
                url: url,
                type: 'get',
                data: {
                    orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                    pageNumber: pageNumber || 1,
                },
                beforeSend: function () {
                    flyer.loading.init().add();
                },
                complete: function () {
                    flyer.loading.init().delete();
                },
                success: function (data) {
                    var rows = data.data,
                        total = data.total,
                        $tableContainer = $('.table-container'),
                        options = {
                            columns: [{
                                field: "",
                                checkbox: true,
                                styles: {
                                    width: 34
                                }
                            }, {
                                title: flyer.i18n.initTitle('收信规则'),
                                field: "_subject",
                                formatter: function (row) {
                                    var result = formatterRules(row);
                                    return '<span title="' + result + '">' + result + '</span>';
                                }
                            },
                            {
                                title: flyer.i18n.initTitle('匹配邮箱'),
                                field: 'mail_address',
                                styles: {
                                    width: 200
                                },
                                formatter: function (row) {
                                    var accountName = row.mail_address_name;
                                    if (accountName) {
                                        return '<span title="' + flyer.i18n.initTitle("匹配邮箱") + '"：' + accountName + '">' + accountName + '</span>';
                                    }
                                    return '-';
                                }
                            },
                            {
                                title: flyer.i18n.initTitle('状态'),
                                field: "active",
                                styles: {
                                    width: 120
                                },
                                formatter: function (row) {
                                    var active = row.active === '1' ? 'checked' : '', title = row.active === '1' ? flyer.i18n.initTitle("停用收信规则") : flyer.i18n.initTitle("启用收信规则");
                                    return '<label class="flyer-onswitch receiving-rules-onswitch table-btn" title="' + title + '"><input type= "checkbox" class = "table-btn" name= "flyer-active-radio" ' + active + ' value="' + row.ID + '" data-active="' + active + '"><i class = "table-btn"><span class = "table-btn">' + flyer.i18n.initTitle("启用") + '</span><span class = "table-btn">' + flyer.i18n.initTitle("停用") + '</span></i></label>';
                                }
                            }, {
                                title: flyer.i18n.initTitle('最后编辑用户'),
                                field: 'created_by_name',
                                styles: {
                                    width: 120
                                }
                            },
                            {
                                title: flyer.i18n.initTitle('操作'),
                                field: "remove",
                                styles: {
                                    width: 120
                                },
                                formatter: function (row) {
                                    var replyRuleObj = JSON.parse(row.reply_rule), isReply = replyRuleObj.isChecked;
                                    return '<span class="receiving-rules-handle table-btn" title="' + flyer.i18n.initTitle("编辑") + '"><i class="icon-pen table-btn flyer-edit-btn" data-id="' + row.ID + '" style="padding-right:8px;"></i></span>'
                                        + '<span class="receiving-rules-handle table-btn" title="' + flyer.i18n.initTitle("删除") + '"><i class="icon-remove table-btn flyer-delete-btn" data-id="' + row.ID + '" style="padding-right:8px;"></i></span>'
                                        + '<span class="receiving-rules-handle table-btn" title="' + flyer.i18n.initTitle("将该规则对现有的邮件进行一次匹配") + '"><i class="icon-global flyer-run-btn table-btn" data-id="' + row.ID + '" data-rules = "' + isReply + '"></i></span>'
                                }
                            }],
                            data: rows,
                            rowClick: function (index, row, rows, e) {
                                if (!$(e.target).hasClass('table-btn')) {
                                    var params = "?ID=" + row.ID;
                                    core.loadPage("#creat_receiving_email_rule", params);
                                }
                            }
                        };
                    $table = flyer.table($tableContainer, options); // 实例化表格
                    if (total > 0) {
                        matchData();
                    } else {
                        noMatchData();
                    }
                    //初始化分页
                    if (!pagerData.switch) {
                        switchPaper(total);
                    }
                    //减少一页重载表格 以及重置分页
                    if (rows.length === 0 && pagerData.pageNumber && pagerData.pageNumber !== 1) {
                        pagerData.pageNumber -= 1;
                        initTable(formatterUrl('get_receiving_email_rule_list'), pagerData.pageNumber);
                    }
                    // 为表中的checkbox绑定点击事件
                    core.bindCheckboxEvent($table);
                    // 为分页数据赋值
                    $('#ruleCurrentMountSpan').html(rows.length);
                    $('#ruleMountSpan').html(total);
                },
                error: function (err) {
                    flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试'));
                }
            });
        } else {
            flyer.msg(flyer.i18n.initTitle('请求数据地址不正确'));
            return;
        }
    }
    /**
     * 表格切换分页函数
     * 
     * @param {any} total 数据总数
     * @returns pageObj 分页对象实例
     */
    function switchPaper(total) {
        var $pagerContainer = $('.paper-container'), pagerOptions = {
            totalNum: total,// 总数量
            curIndex: pagerData.pageNumber || 1,// 当前页码
            pageSize: 15,// 每页显示数量
            fnClick: function () {
                pagerData.pageNumber = this.options.curIndex;
                pagerData.switch = true;
                initTable(formatterUrl('get_receiving_email_rule_list'), pagerData.pageNumber);
            }//切换页数的处理函数
        }, pageObj = flyer.page($pagerContainer, pagerOptions);
        return pageObj;
    }


    /**
     * 获取表格中选中的数据,返回选中数据的一个数组
     * 
     * @param {any} $table 数据表格
     * @returns 返回一个数组，没有则返回空数据
     */
    function getTableCheckedDatas($table) {
        var arr = [], rows = [];
        if ($table && Array.isArray(rows)) {
            var checkedDatas = $table.$body.find('input[type=checkbox][name!=flyer-active-radio]:checked');
            rows = $table.getDatas();
            $.each(checkedDatas, function (index, item) {
                var $item = $(item), $index = $item.parents('tr').data('index');
                arr[index] = rows[$index];
            });
        }
        return arr;
    }

    /**
     * 处理列表没有查询到数据的函数
     * 
     */
    function noMatchData() {
        if ($('.empty_title').length === 0) {
            $('.flyer-table-body table tbody').append('<tr class = "empty_title"><td colspan = ' + $('.flyer-table-body th').length + '>' + flyer.i18n.initTitle("暂时没有数据") + '</td></tr>');
        }
    }

    /**
     * 处理列表中有查询到数据的函数
     * 
     */
    function matchData() {
        if ($('.empty_title').length) {
            $('.empty_title').remove();
        }
    }
    /**
     * 
     * 
     * @param {any} originUrl 需要格式化的url
     * @returns 格式化后的url
     */
    function formatterUrl(originUrl) {
        var newUrl = '', nocache = new Date().getTime();
        if (originUrl) {
            return originUrl + '?nocache=' + nocache;
        }
        return '';
    }

    function formatterRules(row) {
        // 规则格式，如果怎么样，就怎么样
        var str = flyer.i18n.initTitle('如果：'),
            containerText = flyer.i18n.initTitle('不包含'),
            fromObj = JSON.parse(row._from),
            toObj = JSON.parse(row._to),
            domainObj = JSON.parse(row.domain),
            subjectObj = JSON.parse(row._subject),
            sizeObj = JSON.parse(row.size),
            timeObj = JSON.parse(row.time),
            typeRuleObj = JSON.parse(row.email_type_rule),
            assignedRuleObj = JSON.parse(row.assigned_rule),
            finishRuleObj = JSON.parse(row.finish_rule),
            replyRuleObj = JSON.parse(row.reply_rule),
            languageObj = JSON.parse(row.mail_language)
            ;
        if (fromObj.isChecked && fromObj.text) {
            containerText = fromObj.isContainer ? flyer.i18n.initTitle('包含') : flyer.i18n.initTitle('不包含');
            str += flyer.i18n.initTitle('发件人') + containerText + '[ ' + fromObj.text + ' ]';
        }
        if (toObj.isChecked && toObj.text) {
            containerText = toObj.isContainer ? flyer.i18n.initTitle('包含') : flyer.i18n.initTitle('不包含');
            str += flyer.i18n.initTitle('、收件人') + containerText + '[ ' + toObj.text + ' ]';
        }
        if (domainObj.isChecked && domainObj.text) {
            containerText = domainObj.isContainer ? flyer.i18n.initTitle('包含') : flyer.i18n.initTitle('不包含');
            str += flyer.i18n.initTitle('、发件域') + containerText + '[ ' + domainObj.text + ' ]';
        }
        if (subjectObj.isChecked && subjectObj.text) {
            containerText = subjectObj.isContainer ? flyer.i18n.initTitle('包含') : flyer.i18n.initTitle('不包含');
            str += flyer.i18n.initTitle('、主题') + containerText + '[ ' + subjectObj.text + ' ]';
        }
        if (sizeObj.isChecked && sizeObj.text) {
            containerText = subjectObj.isContainer ? flyer.i18n.initTitle('大于等于') : flyer.i18n.initTitle('小于');
            str += '、邮件大小' + containerText + '[ ' + sizeObj.text + ' ]' + flyer.i18n.initTitle('字节');
        }
        if (timeObj.isChecked) {
            str += flyer.i18n.initTitle('、收件时间从当日 [') + timeObj.startTime + flyer.i18n.initTitle(' ]至 [ ') + timeObj.endTime + ' ]';
        }
        if (languageObj.isChecked) {
            str += flyer.i18n.initTitle('、邮件内容语种为 [') + languageObj.languageName + "]";
        }
        str += flyer.i18n.initTitle('，则：');
        // 结果
        if (row.handle_type === '1') {
            if (typeRuleObj.isChecked) {
                str += flyer.i18n.initTitle('归类为[ ') + typeRuleObj.typeName + ' ]';
            }
            if (assignedRuleObj.isChecked) {
                str += flyer.i18n.initTitle('、自动分派给[ ') + assignedRuleObj.assingedEmailName + ' ]';
            }
            if (finishRuleObj === 1) {
                str += flyer.i18n.initTitle('、标记为[ 已解决 ]');
            }
            if (replyRuleObj.isChecked && replyRuleObj.body) {
                str += flyer.i18n.initTitle('、自动回复，回复内容是[ ') + JSON.parse(replyRuleObj.body).content + ' ]';
            }
        } else if (row.handle_type === '0') {
            str += flyer.i18n.initTitle('直接删除邮件');
        }
        return str.replace(/如果：、/, '如果：').replace(/则：、/, '则：').replace(/in case:,/i, 'in case:').replace(/then:,/i, 'then:');
    }
    /**
     *   删除收信规则（支持批量）
     * 
     * @param {any} that 
     */
    function deleteReceivingEmailRulesById(ids) {
        if (ids.length) {
            $.ajax({
                url: formatterUrl('delete_receiving_email_rules_by_id'),
                type: 'post',
                data: {
                    ids: ids
                },
                success: function (res) {
                    if (res.success) {
                        flyer.msg(flyer.i18n.initTitle('操作成功'));
                        initTable(formatterUrl('get_receiving_email_rule_list'), 1);
                    } else {
                        flyer.msg(res.message);
                    }
                },
                error: function (err) {
                    flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试'));
                }
            });
        } else {
            flyer.msg(flyer.i18n.initTitle('参数错误，请刷新页面重试'));
        }
    }

    /**
     * 更改状态
     * 
     * @param {any} id 数据id 
     * @param {any} state 需要修改的状态 0是禁用，1是启用
     */
    function refreshReceivingEmailRulesById(id, state) {
        if (id && state) {
            $.ajax({
                url: formatterUrl('refresh_receiving_email_rules_by_id'),
                type: 'post',
                data: {
                    ids: [id],
                    state: state
                },
                success: function (res) {
                    if (res.success) {
                        flyer.msg(flyer.i18n.initTitle('操作成功'));
                        initTable(formatterUrl('get_receiving_email_rule_list'), 1);
                    } else {
                        flyer.msg(res.message);
                    }
                },
                error: function (err) {
                    flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试'));
                }
            });
        } else {
            flyer.msg(flyer.i18n.initTitle('参数错误，请刷新页面重试'));
        }
    }

    /**
     * 
     * 运行邮件规则，对所有的邮件 
     */
    function runReceivingEmailRulesById(params) {
        if (params && params.id && params.orgGroupId) {
            $.ajax({
                url: formatterUrl('run_receiving_email_rules_by_id'),
                type: 'post',
                data: params,
                success: function (res) {
                    if (res.success) {
                        flyer.msg(flyer.i18n.initTitle('操作成功'));
                        // 刷新左侧菜单数据
                        window.bubbleData();
                    } else {
                        flyer.msg(res.message);
                    }
                },
                error: function (err) {
                    flyer.msg(flyer.i18n.initTitle('网络错误，请刷新页面重试'));
                }
            });
        } else {
            flyer.msg(flyer.i18n.initTitle('参数错误，请刷新页面重试'));
        }
    }
    // 初始化页面
    init();
});
