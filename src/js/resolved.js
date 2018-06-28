"use strict";
flyer.define("resolved", function (exports, module) {
    // 模块中使用到的基础数据
    var baseDatas = {
        $table: null,
        pagerObj: null,
        pageSizeSelectObj: null,
        curIndex: Number(flyer.getQueryString('curIndex') || 1),
        limit: Number(flyer.getQueryString('limit') || 20),
        // 错误消息
        paramErrMsg: flyer.i18n.initTitle('错误'),
        netErrMsg: flyer.i18n.initTitle('错误'),
        operatorErrMsg: {
            single: flyer.i18n.initTitle('最多选择一项'),
            batch: flyer.i18n.initTitle('至少选择一项')
        },
        // 个人信息
        depaID: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
        orgCode: core.getUserGroups().orgCode,
        orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
        userID: window.Number($("#__userid").val()),
        userName: window.Number($("#__username").val()),
        // api接口域名地址
        apiHost: 'http://192.168.29.208:8032'
    };

    /**
     * 模块入口函数
     * 
     */
    function init() {
        // 初始化归类为下拉框
        initClassSelectCombobox();
        // 初始化按钮显示，根据不同的角色
        initPageByRole();
        // 获取表格数据
        getTableDatas(baseDatas.curIndex, baseDatas.limit);
        // 初始化按钮事件
        initEvents();
    }

    /**
     * 根据当前角色初始化页面显示的按钮
     * 
     */
    function initPageByRole() {
        // 如果不是主管的话，移除转未分派按钮
        if (core.getUserGroups().orgCode !== '9102') {
            $("button.turn-unassigned").remove();
        }
    }

    /**
     * 初始化归类为下拉框
     * 
     */
    function initClassSelectCombobox() {
        var url = flyer.folders ? '' : '/file_list?depa_id=' + baseDatas.depaID + '&orgCode=' + baseDatas.orgCode + '&orgGroupId=' + baseDatas.orgGroupId + '&create_by_id=' + baseDatas.userID;
        flyer.combobox($('#classSelectContainer'), {
            url: url,
            placeholder: flyer.i18n.initTitle('归类为'),
            selectAll: false,
            allowSearch: false,
            isMulti: false,
            i18n: 'rangeFolder',
            data: flyer.folders ? flyer.folders.map(function (obj) {
                return {
                    value: obj['ID'],
                    text: obj['type_name']
                }
            }) : [],
            fnDataProcessing: function () {
                var folders = this.data.rows;
                // 主管可以新增文件夹
                if (core.getUserGroups().orgCode !== '9101') {
                    folders.push(
                        {
                            ID: 'add',
                            type_name: flyer.i18n.initTitle("新增文件夹")
                        }
                    );
                }
                this.data = folders.map(function (obj) {
                    return {
                        value: obj['ID'],
                        text: obj['type_name']
                    }
                });
            },
            fnSelected: function (now, _this, datas) {
                // 划分到文件夹
                if (datas.fieldKey === 'add') {
                    addFolder();
                } else {
                    if (/;/.exec(datas.fieldValue)) {
                        moveEmailToFolder(datas.fieldValue.split(";")[0], datas.fieldKey);
                    } else {
                        moveEmailToFolder(datas.fieldValue, datas.fieldKey);
                    }
                }
            }
        });
    }

    /**
     * 新增文件夹
     * 
     * @param {any} floderName 文件夹名字
     */
    function addFolder() {
        flyer.open({
            pageUrl: '/html/add_folder.html',
            isModal: true,
            area: [400, 120],
            title: flyer.i18n.initTitle("新增文件夹"),
            btns: [
                {
                    text: flyer.i18n.initTitle('保存'),
                    click: function () {
                        var floderName = $(".folder_name").val().trim(), that = this;
                        // 校验文件夹名称（是个字符内且不为空）
                        if (floderName.length > 10 || floderName.length === 0) {
                            flyer.msg(flyer.i18n.initTitle("文件夹名称长度在10个字符以内且不为空"));
                        } else {
                            // 判重操作
                            $.ajax({
                                url: '/ifContainFile',
                                data: {
                                    fileName: floderName,// 新的名称
                                    depa_id: baseDatas.depaID,
                                    time: window.Date.parse(new Date()),
                                },
                                success: function (data) {
                                    if (data['count'] === 0) {
                                        $.ajax({
                                            url: '/add_filetype',
                                            data: {
                                                type_name: floderName,
                                                create_by_name: baseDatas.userName,
                                                depa_id: baseDatas.depaID,
                                                time: window.Date.parse(new Date()),
                                            },
                                            success: function () {
                                                flyer.msg(flyer.i18n.initTitle("操作成功"));
                                                // 刷新左侧菜单中的文件夹数量,并且重新初始化下拉框
                                                window.getFolder(initClassSelectCombobox);
                                                that.close();
                                            },
                                            error: function (err) {
                                                flyer.msg(flyer.i18n.initTitle("操作失败"));
                                            }
                                        });
                                    } else {
                                        flyer.msg(flyer.i18n.initTitle("文件夹已经存在"));
                                    }
                                },
                                error: function (err) {
                                    flyer.msg(flyer.i18n.initTitle("操作失败"));
                                    that.close();
                                }
                            });
                        }
                    }
                },
                {
                    text: flyer.i18n.initTitle('取消'),
                    click: function () {
                        this.close();
                    }
                }
            ]
        });
    }

    /**
     * 邮件移动到文件夹中 
     * 
     */
    function moveEmailToFolder(name, id) {
        var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
        if (selectDatas.length === 0) {
            flyer.msg(flyer.i18n.initTitle(baseDatas.operatorErrMsg.batch));
            initClassSelectCombobox();
            return;
        }
        $.ajax({
            url: '/update_email_file',
            data: {
                fileID: selectDatas.map(function (item) {
                    return item.subject_num;
                }),
                userID: baseDatas.userID,
                time: window.Date.parse(new Date()),
                type_id: id,
                type_name: name,
                depa_id: baseDatas.depaID,
                userName: baseDatas.userName
            },
            success: function (data) {
                flyer.msg(flyer.i18n.initTitle("操作成功"));
                // 刷新左侧菜单
                window.getFolder(initClassSelectCombobox);
                // 刷新气泡参数
                window.bubbleData();
                // 刷新表格
                getTableDatas(1, 20);
                // 刷新文件夹气泡参数
                if (flyer.getQueryString('type_id')) {
                    core.getBubbleCount();
                }
            },
            error: function (err) {
                flyer.msg(flyer.i18n.initTitle(baseDatas.netErrMsg));
            }
        });
    }

    /**
    * 获取表格数据 从服务端
    * 
    */
    function getTableDatas(pageNumber, pageSize) {
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
        var startDate = conditions.startDate,
            endDate = conditions.endDate,
            keyword = conditions.keyword || '',
            email = conditions.emailName || [],
            assigner = conditions.people || [];
        var $tableContainer = $('#tableContainer');
        $.ajax({
            url: '/resolved_email_list',
            data: {
                email: email,
                assigner: assigner,
                pageNumber: pageNumber || 1,
                pageSize: pageSize || 20,
                startDate: startDate,
                endDate: endDate,
                keyword: keyword,
                orgGroupId: baseDatas.orgGroupId,
                user_id: baseDatas.userID,
                orgCode: baseDatas.orgCode,
                time: window.Date.parse(new Date()),
                disposed_status_id: 9,
                filterFold: flyer.getQueryString("type_id") || false
            },
            beforeSend: function () {
                flyer.loading.init().add();
            },
            success: function (data) {
                // 渲染表格
                renderTable($tableContainer, data.rows);
                // 渲染分页信息
                randerDOMPager(baseDatas.$table, data, data.total, {
                    pageNumber: pageNumber || 1,
                    pageSize: pageSize || 20
                });
                // 设置总数和当前数量
                setMountValue(data.rows.length, data.total);
                // 绑定点击事件
                core.bindCheckboxEvent(baseDatas.$table);
            },
            error: function (err) {
                flyer.msg(baseDatas.netErrMsg);
            },
            complete: function () {
                flyer.loading.init().delete();
            }
        });
    }

    /**
     * 渲染表格
     * 
     * @param {any} pageNumber 当前页码
     * @param {any} pageSize 当前显示条数
     */
    function renderTable($table, datas) {
        if ($table && $table.length && Array.isArray(datas)) {
            baseDatas.$table = flyer.table($table, {
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
                        return core.formatEmail(row);
                    }
                }, {
                    title: flyer.i18n.initTitle('主题'),
                    field: "subject",
                    formatter: function (row) {
                        return core.formatSubject(row);
                    }
                }, {
                    title: flyer.i18n.initTitle('处理人'),
                    field: "user_name",
                    styles: {
                        width: 150
                    },
                    formatter: function (row) {
                        return core.titleShow(row);
                    }
                }, {
                    title: flyer.i18n.initTitle('时间'),
                    field: "max_time",
                    styles: {
                        width: 82
                    },
                    formatter: function (row) {
                        return core.parseDateFormate(row.max_time);
                    }
                }
                ],
                data: datas,
                rowClick: function (index, row, rows) {
                    exports.data = row;
                    var params = "?exportKey=resolved&subject_num=" + window.escape(exports.data.subject_num),
                        curIndex = 1,
                        limit = 20;
                    if (baseDatas.pagerObj) {
                        curIndex = baseDatas.pagerObj.options.curIndex;
                    }
                    if (baseDatas.pageSizeSelectObj) {
                        limit = Number(baseDatas.pageSizeSelectObj.getSelectedValue() || 20);
                    }
                    if (/folder_detail/gi.exec(window.location.hash)) {
                        params += '&type_id=' + flyer.getQueryString('type_id') + '&currentTab=4';
                    } else {
                        params += '&curIndex=' + curIndex + '&limit=' + limit;
                    }
                    core.loadPage("#frame", params);
                }
            });
        }
    }

    /**
     * 初始化分页信息
     * 
     * @param {jq} $table 表格初始化之后的实例对象 
     * @param {Array} datas 表格的数据
     */
    function randerDOMPager($table, datas, total, pagerObj) {
        // 没有数据的时候
        core.tableNoMatch($table, flyer.i18n.initTitle('暂时没有相关记录'));
        // 初始化下拉框，显示每页数据条数的下拉框
        baseDatas.pageSizeSelectObj = core.initPagerSizeSelect($('.pager-size-container'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
            callback: getTableDatas,
            pagerObj: baseDatas.pagerObj,
            total: datas.total,
            exports: exports
        });
        // 初始化分页
        baseDatas.pagerObj = core.initPager($('.paper-container'), total, pagerObj.pageSize || 20, {
            callback: getTableDatas,
            pageNumber: pagerObj.pageNumber || 1,
            pageSizeSelectObj: baseDatas.pageSizeSelectObj,
            exports: exports
        });
        // 有数据的时候,才需要去初始化
        if (datas.total) {
            // 为表中的checkbox绑定点击事件
            core.bindCheckboxEvent($table);
        }
    }
    /**
     * 设置spanner
     * 
     * @param {any} currentTotal 当前显示数据的总数
     * @param {any} total 总数居
     */
    function setMountValue(currentTotal, total) {
        $('#assignedCurrentMountSpan').text(currentTotal);
        $('#assignedMountSpan').text(total);
    }

    /**
     * 事件初始化
     * 
     */
    function initEvents() {
        // 转未处理
        $('button.turn-unfinish').on('click', turnUnfinishHandle);
        // 转未分派
        $('button.turn-unassigned').on('click', turnUnassignedHandle);
        // 发送满意度调查(已屏蔽此功能)
        // $('button.send-satisfaction').on('click', sendSatisfactionHandle);
        // 高级搜索
        $("#advancedSearchBtn").on("click", advancedSearchHandle);
        // 清空搜索条件
        $('#clearSearchConditionsBtn').on('click', clearSearchConditionsHandle);
    }

    /**
     * 转未处理点击事件处理函数 
     * 支持批量操作
     */
    function turnUnfinishHandle() {
        var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
        if (selectDatas.length === 0) {
            flyer.msg(baseDatas.operatorErrMsg.batch);
            return false;
        }
        flyer.confirm(flyer.i18n.initTitle("确定要转为未处理吗?"), function (ele, value) {
            var that = this;
            // 确定
            if (value) {
                $.ajax({
                    url: "/turn_disposed_status",
                    data: {
                        data: selectDatas.map(function (item) {
                            return item.subject_num;
                        }),
                        status: 8,
                        name: '未处理', // 转为未处理
                        time: window.Date.parse(new Date())
                    },
                    success: function () {
                        // 提示成功
                        flyer.msg(flyer.i18n.initTitle('操作成功'));
                        // 刷新数据
                        getTableDatas(1, 20);
                        // 刷新左侧参数
                        window.bubbleData();
                        // 刷新提示气泡(如果是在文件夹下)
                        if (flyer.getQueryString('type_id')) {
                            core.getBubbleCount();
                        }
                    },
                    error: function (err) {
                        flyer.msg(flyer.i18n.initTitle('操作失败'));
                    },
                    complete: function () {
                        that.close();
                    }
                });
            } else {
                // 取消
                this.close();
            }
        }, {
                title: flyer.i18n.initTitle("询问框"),
                isModal: true
            });
    }

    /**
     * 转未分派点击事件处理函数 
     * 支持批量操作
     */
    function turnUnassignedHandle() {
        var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
        if (selectDatas.length === 0) {
            flyer.msg(baseDatas.operatorErrMsg.batch);
            return false;
        }
        // 弹出提示框
        flyer.confirm(flyer.i18n.initTitle("确定要转为未分派吗?"), function (ele, value) {
            var that = this;
            // 点击确定
            if (value) {
                $.ajax({
                    url: "/turn_status",
                    method: "get",
                    data: {
                        data: JSON.stringify(selectDatas.map(function (item) {
                            return item.subject_num;
                        })),
                        status: 6,
                        assignName: '',
                        assignId: 0,
                        name: '未分派', //转为未分派
                        time: window.Date.parse(new Date())
                    },
                    success: function (result) {
                        // 提示成功
                        flyer.msg(flyer.i18n.initTitle('操作成功'));
                        // 刷新表格
                        getTableDatas(1, 20);
                        // 刷新左侧参数
                        window.bubbleData();
                        // 气泡参数(如果是在文件夹下面)
                        if (flyer.getQueryString('type_id')) {
                            core.getBubbleCount();
                        }
                    },
                    error: function (err) {
                        flyer.msg(flyer.i18n.initTitle('操作失败'));
                    },
                    complete: function () {
                        that.close();
                    }
                });
            } else {
                // 点击取消
                this.close();
            }
        }, {
                title: flyer.i18n.initTitle("询问框"),
                isModal: true
            });
    }

    /**
     * 发送满意度调查点击事件处理函数
     * 单个操作
     */
    function sendSatisfactionHandle() {
        var selectDatas = core.getTableCheckedDatas(baseDatas.$table);
        if (selectDatas.length !== 1) {
            flyer.msg(baseDatas.operatorErrMsg.single);
            return false;
        }
        flyer.open({
            content: generateSendSatisfactionTemplate(selectDatas[0]),
            isModal: true,
            area: [400, 380],
            title: "发送满意度调查",
            btns: [{
                text: flyer.i18n.initTitle('确定'),
                click: function (elm) {
                    var $btn = $(elm), that = this;
                    // 请求后台，先生成一个请求链接，组装成邮件内容
                    $.ajax({
                        url: baseDatas.apiHost + '/report/createSatisfaction',
                        type: 'POST',
                        contentType: 'application/json',
                        data: {
                            emailID: selectDatas[0].ID,
                            orderID: selectDatas[0].subject.match(/[\d]{1,}-[\d]{1,}-[\d]{1,}/ig),
                            emailAddress: core.isSelfEmail(selectDatas[0]._from) ? selectDatas[0]._to : selectDatas[0]._from
                        },
                        beforeSend: function () {
                            core.lockedBtn($btn, true, '发送中');
                        },
                        success: function (res) {
                            // 根据返回的结果生成邮件的内容
                            var emailDatas = generateSendSatisfactionContent(res.data, selectDatas[0]);
                            // 然后调用mailgun服务器发送邮件
                            sendEmail(emailDatas, function (result) {
                                if (result.statuCode === 200) {
                                    // 修改邮件的状态
                                    updateEmailStatus(emailDatas.subject);
                                } else {
                                    flyer.msg(flyer.i18n.initTitle('操作失败'));
                                }
                            });
                        },
                        error: function () {
                            flyer.msg(flyer.i18n.initTitle('操作失败'));
                        },
                        complete: function () {
                            core.unlockBtn($btn, flyer.i18n.initTitle('确定'));
                            that.close();
                        }
                    });
                }
            }, {
                text: flyer.i18n.initTitle('取消'),
                click: function (elm) {
                    this.close();
                }
            }]
        });
    }

    /**
     * 生成发送问卷调查的模板
     * 
     * @param {any} options 可选参数
     */
    function generateSendSatisfactionTemplate(options) {
        return `<div class="flyer-form-item public-butModal customer-advanced-search">
                    <form class="flyer-form">
                        <div class="public-butModal-inputBox">
                            <label class='i18n' data-i18nKey='发件人' style="width:70px;">发件人</label>
                            <input type="text"  class="flyer-input flyer-disabled i18n" style="width:78%;"  value="${core.isSelfEmail(options._from) ? options._from : options._to}" readonly>
                        </div>
                        <div class="public-butModal-inputBox">
                            <label class='i18n' data-i18nKey='收件人' style="width:70px;">收件人</label>
                            <input type="text"  class="flyer-input flyer-disabled i18n" style="width:78%;" id="" value="${core.isSelfEmail(options._from) ? options._to : options._from}" readonly>
                        </div>
                        <div class="public-butModal-inputBox">
                            <label class='i18n' data-i18nKey='邮件主题' style="width:70px;">邮件主题</label>
                            <input type="text"  class="flyer-input i18n" style="width:78%;" id="emailSubject">
                        </div>
                        <div class="public-butModal-inputBox">
                            <label class='i18n' data-i18nKey='邮件内容' style="width:70px;">邮件内容</label>
                            <textarea style="width:78%;resize:none;margin-left:10px;display:inline-block;height:auto;" rows='5' class="flyer-input" id="emailContent"></textarea>
                        </div>
                    </form>
                </div>`;
    }

    /**
     * 生成满意度调查内容
     * 
     * 
     * @param {any} formLink 问卷调查的链接
     * @param {any} emailInfo 当前选中的邮件信息
     * @returns 
     */
    function generateSendSatisfactionContent(formLink, emailInfo) {
        var content = {
            id: core.getGUID(),
            from: emailInfo.from,
            to: emailInfo.to,
            subject: emailInfo.subject || '',
            body: emailInfo.body || '',
            text: emailInfo.text || '',
            fileData: [],
            user_name: baseDatas.userName,
            user_id: baseDatas.userID,
            orgCode: baseDatas.orgCode,
            domain: core.findInfoByEmail(emailInfo.from) || '',
            time: window.Date.now()
        };
        return content;
    }

    /**
     * 发送邮件 
     * 
     * @param {any} data 邮件内容
     * @param {any} callback 发送完成之后的回掉函数
     */
    function sendEmail(data, callback) {
        $.ajax({
            url: core.url + "/sendEmail",
            type: "post",
            timeout: 10000,
            data: data,
            success: function (result) {
                callback(result);
            },
            error: function (err) {
                flyer.msg(baseDatas.errorMsg);
            }
        });
    }

    /**
     * 更新邮件状态为 已发送问卷调查 
     * 
     */
    function updateEmailStatus(subjectNum) {
        $.ajax({
            url: '/update_email_status',
            type: 'POST',
            data: {
                subjectNum: subjectNum
            },
            beforeSend: function () {

            },
            success: function (res) {

            },
            error: function () {
                flyer.msg(flyer.i18n.initTitle(baseDatas.netErrMsg));
            },
            complete: function () {

            }
        });
    }

    /**
     * 高级搜索点击事件处理函数
     * 
     * @returns 
     */
    function advancedSearchHandle() {
        $('.flyer-search-conditions').data('conditions', null).data('conditionstext', null);
        core.showAdvancedSearchWindow(getTableDatas);
        return false;
    }

    /**
     * 清空搜索条件点击事件处理函数
     * 
     * @returns 
     */
    function clearSearchConditionsHandle() {
        $('.flyer-search-conditions').html('').data('conditions', null).data('conditionstext', null);
        flyer.exports.advanced_search = false;
        getTableDatas(1, 20);
        return false;
    }

    // 入口
    init();
});