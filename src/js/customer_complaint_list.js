'use strict';
flyer.define('customer_complaint_list', function (exports, module) {
    var baseDatas = {
        // 用户所在组
        orgGroupID: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
        orgGroupCode: JSON.parse(window.unescape($("#__groups").val()))[0]['orgCode'],
        // 所有组
        orgGroupIDAll: JSON.parse(window.unescape($("#__groupsAll").val())).map(function (item) {
            return item.orgGroupId;
        }),
        // 部门信息
        companyOrgID: Number(core.getUserGroups().parentId ? core.getUserGroups().parentId.split(',')[1] : 0),
        companyOrgName: core.getUserGroups().parentName ? core.getUserGroups().parentName.split(',')[1] : '无组织',
        // 表格实例
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
        }
    };

    /**
     *页面入口函数 
     * 
     */
    function init() {
        // setCurrentWeek();
        // 获取表格数据
        getTableDatas(baseDatas.curIndex, baseDatas.limit);
        // 初始化事件
        initEvent();
        // 初始化页面元素
        initPage();
    }

    /**
     *设置默认搜索时间是本周 
     * 
     */
    function setCurrentWeek() {
        var currentMonth = getCurrentWeekDate(),
            serverStartTime = currentMonth.start,
            serverEndTime = currentMonth.end;
        $('.flyer-search-conditions').data('conditions', JSON.stringify({
            serverStartTime,
            serverEndTime
        })).data('conditionstext', flyer.i18n.initTitle('，搜索条件：（默认显示本周）客诉开始时间[') + serverStartTime + flyer.i18n.initTitle(']，客诉结束时间[') + serverEndTime + ']');
    }

    /**
     * 初始化也页面元素，根据不同的权限显示不同的操作按钮
     * 主管才显示删除按钮
     */
    function initPage() {
        if (baseDatas.orgGroupCode !== '9102') {
            $('.deleteCustomerComplaint').hide();
        }
    }

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 创建
        $('.createCustomerService').on('click', createCustomerServiceHandle);
        // 导出为excel
        $('.exportToExcel').on('click', exportToExcelHandle);
        // 显示本月数据
        $('.showCurrentMonthBtn').on('click', showCurrentMonthHandle);
        // 删除客诉记录（支持批量）
        $('.deleteCustomerComplaint').on('click', deleteCustomerComplaintHandle);
        // 高级搜索
        $('#advancedSearchBtn').on('click', advancedSearchHandle);
        // 清空搜索条件
        $('#clearSearchConditionsBtn').on('click', clearSearchConditionsHandle);
    }

    /**
     * 创建客诉记录
     * 
     * @param {any} events 
     */
    function createCustomerServiceHandle(events) {
        var params = '?curIndex=' + baseDatas.curIndex + '&ID=' + window.Date.now() + '&isCreate=true&exportKey=customer_complaint_list';
        core.loadPage('#customer_complaint_form', params);
        return false;
    }

    /**
     * 导出为excel事件的点击事件处理函数
     * 
     * @param {any} events 
     */
    function exportToExcelHandle(events) {
        var conditions = { orgGroupIDAll: baseDatas.orgGroupIDAll },
            selectedDatas = getTableCheckedDatas(baseDatas.$table);
        try {
            conditions = JSON.parse($('.flyer-search-conditions').data('conditions')) || {};
        } catch (error) {
            conditions = { orgGroupIDAll: baseDatas.orgGroupIDAll };
        }
        conditions.orgGroupIDAll = baseDatas.orgGroupIDAll || [];
        var aElement = document.createElement('a');
        aElement.setAttribute('href', core.url + '/export_to_excel_customer_complaint?conditions=' + encodeURIComponent(JSON.stringify(conditions)) + '&selectedDatas=' + encodeURIComponent(JSON.stringify(selectedDatas)));
        aElement.setAttribute('id', 'exportToExcel');
        var clickEvent = window.document.createEvent("MouseEvents");
        clickEvent.initMouseEvent("click", false, true);
        aElement.dispatchEvent(clickEvent);
    }

    /**
     * 显示本月数据
     * 
     * @param {any} events 
     */
    function showCurrentMonthHandle(events) {
        var currentMonth = getCurrentMonthDate(),
            serverStartTime = currentMonth.start,
            serverEndTime = currentMonth.end;
        $('.flyer-search-conditions').data('conditions', JSON.stringify({
            serverStartTime,
            serverEndTime
        })).data('conditionstext', flyer.i18n.initTitle('，搜索条件：（本月）客诉开始时间[') + serverStartTime + flyer.i18n.initTitle(']，客诉结束时间[') + serverEndTime + ']');
        getTableDatas(1, 20);
        return false;
    }

    /**
     * 删除客诉记录按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function deleteCustomerComplaintHandle(events) {
        var selectDatas = getTableCheckedDatas(baseDatas.$table);
        if (selectDatas.length) {
            flyer.confirm(flyer.i18n.initTitle("确定删除吗?"), function (result) {
            }, {
                    btns: [{
                        text: flyer.i18n.initTitle('确定'),
                        skin: "flyer-btn-blue",
                        click: function (elm) {
                            this.close();
                            var ids = selectDatas.map(function (item) {
                                return item.ID;
                            });
                            $.ajax({
                                url: core.url + '/delete_customer_complaint',
                                type: 'POST',
                                data: {
                                    ID: ids
                                },
                                success: function (data, textStatus, jqXHR) {
                                    flyer.msg(data.success ? flyer.i18n.initTitle('操作成功') : flyer.i18n.initTitle('操作失败'));
                                    getTableDatas(1, 20);
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    flyer.msg(baseDatas.netErrMsg);
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
        } else {
            flyer.msg(baseDatas.operatorErrMsg.batch);
        }
        return false;
    }

    /**
     * 高级搜索按钮的点击事件处理函数
     * 
     * @param {any} events 
     * @returns 
     */
    function advancedSearchHandle(events) {
        $('.flyer-search-conditions').data('conditions', null).data('conditionstext', null);
        showAdvancedSearchWindow(getTableDatas);
        return false;
    }

    /**
     * 清空高级搜索按钮点击事件处理函数
     * 
     * @returns 
     */
    function clearSearchConditionsHandle() {
        // setCurrentWeek();
        $('.flyer-search-conditions').html('').data('conditions', null).data('conditionstext', null);
        flyer.exports.customer_complaint_search = false;
        getTableDatas(1, 20);
        return false;
    }

    /**
     * 查看问题描述详情
     * 
     * 
     * @param {any} events 
     */
    function toggleQuestionInfoHandle(events) {
        var descriptionI18n = flyer.i18n.initTitle("问题描述"),
            description = $(events.target).data('description'),
            questionTypeNameI18n = flyer.i18n.initTitle("问题类型"),
            questionTypeName = $(events.target).data('questiontypename'),
            resolvetimeI18n = flyer.i18n.initTitle("处理时间"),
            resolvetime = $(events.target).data('resolvetime'),
            resolveUserNameI18n = flyer.i18n.initTitle("处理人"),
            resolveUserName = $(events.target).data('resolveusername'),
            questionTypeNameLabel = '',
            openWindow = flyer.open({
                content: "<div style='color:#666;'>"
                    + "<p>" + questionTypeNameI18n + '：' + questionTypeName + "</p>"
                    + "<p style='margin:10px 0;'>" + descriptionI18n + '：' + "<span style='display:inline-block;height:160px;word-break:break-word;'>" + description + "</span></p>"
                    + "<p><span style='float:left;'>" + resolvetimeI18n + '：' + resolvetime + "</span>"
                    + "<span style='display:inline-block;width:20px;'></span>"
                    + "<span style='float:right;'>" + resolveUserNameI18n + '：' + resolveUserName + "</span></p>"
                    + "</div>",
                title: flyer.i18n.initTitle("问题详情"),
                area: [500, 300],
                isModal: true,
                btns: [{
                    text: flyer.i18n.initTitle('关闭'),
                    click: function () {
                        this.close();
                    }
                }]
            });
        return false;
    }

    /**
     * 查看备注信息
     * 
     * @param {any} events 
     */
    function toggleRemarkInfoHandle(events) {
        var $this = $(events.target),
            styleStr = '',
            remark = $this.data('remark') || '-',
            remarkI18n = flyer.i18n.initTitle("备注信息"),
            SKU = $this.data('sku') || '-',
            ASIN = $this.data('asin') || '-',
            number = $this.data('number') || '-',
            numberI18n = flyer.i18n.initTitle("数量"),
            productType = $this.data('producttype') || '-',
            productTypeI18n = flyer.i18n.initTitle("品类"),
            openWindow = flyer.open({
                content: "<div style='color:#666;'><span style='display: inline-block; width: 50%; word-break: break-all;'>SKU：" + SKU + "</span>"
                    + "<span style='display: inline-block; float: right; width: 50%;text-align: right; word-break: break-all;'>ASIN：" + ASIN + "</span>"
                    + "<p style='margin:10px 0;'><span style='display: inline-block; width: 50%; word-break: break-all;'>" + productTypeI18n + "：" + productType + "</span>"
                    + "<span style='display: inline-block; float: right; width: 50%;text-align: right; word-break: break-all;'>" + numberI18n + "：" + number + "</span></p>"
                    + "<p style='margin:10px 0;clear:both;'>" + remarkI18n + '：' + "<span style='display:inline-block;height:120px;word-break:break-word;'>" + remark + "</span></p>"
                    + "</div>",
                title: flyer.i18n.initTitle('备注信息'),
                area: [400, 280],
                isModal: true,
                btns: [{
                    text: flyer.i18n.initTitle('关闭'),
                    click: function () {
                        this.close();
                    }
                }]
            });
        return false;
    }

    /**
     * 渲染表格结构
     * 
     * @param {jq} $table 表格容器
     * @param {Array} datas 表格数据
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
                    title: flyer.i18n.initTitle("店铺"),
                    field: "",
                    styles: {
                        width: 100
                    },
                    formatter: function (row) {
                        var storeName = row.storeName || '-',
                            title = flyer.i18n.initTitle("店铺") + '：' + storeName;
                        return '<span title="' + title + '">' + storeName + '</span>';
                    }
                }, {
                    title: flyer.i18n.initTitle("订单号"),
                    field: '',
                    styles: {
                        width: 180
                    },
                    formatter: function (row) {
                        var orderNumber = row.orderNumber ? row.orderNumber : '-',
                            remark = row.remark,
                            ASIN = row.ASIN,
                            SKU = row.SKU,
                            number = row.number,
                            productType = row.productTypeName === 'N/A' ? '-' : row.productTypeName,
                            question_info_icon = '<i class="fa fa-eye fa-lg table-btn toggle-remark-info" data-remark="' + remark + '" data-sku="' + SKU + '" data-asin="' + ASIN + '" data-number="' + number + '" data-producttype="' + productType + '"'
                                + 'style="display:inline-block;margin-right:10px;color:#2cc3a9;" aria-hidden="true" ></i>',
                            title = flyer.i18n.initTitle("订单号") + '：' + orderNumber;
                        return question_info_icon + '<span title="' + title + '">' + orderNumber + '</span>';
                    }
                }, {
                    title: flyer.i18n.initTitle("订单时间"),
                    field: '',
                    styles: {
                        width: 120
                    },
                    formatter: function (row) {
                        return row.orderTime === '1970-01-01T00:00:00.000Z' ? '-' : core.parseDateFormate(row.orderTime);
                    }
                }, {
                    title: flyer.i18n.initTitle("国家"),
                    field: "",
                    styles: {
                        width: 70
                    },
                    formatter: function (row) {
                        if (row.countriesName && row.countriesName !== 'N/A') {
                            return row.countriesName;
                        }
                        return '-';
                    }
                }, {
                    title: flyer.i18n.initTitle('分组'),
                    field: "",
                    styles: {
                        width: 60
                    },
                    formatter: function (row) {
                        if (row.productGroupName && row.productGroupName !== 'N/A') {
                            return row.productGroupName;
                        }
                        return '-';
                    }
                }, {
                    title: flyer.i18n.initTitle('处理方式'),
                    field: '',
                    styles: {
                        width: 80
                    },
                    formatter: function (row) {
                        if (row.resolveMethodName && row.resolveMethodName !== 'N/A') {
                            return row.resolveMethodName;
                        }
                        return '-';
                    }
                }, {
                    title: flyer.i18n.initTitle('处理人'),
                    field: 'resolveUserName',
                    styles: {
                        width: 80
                    }
                }, {
                    title: flyer.i18n.initTitle('问题描述'),
                    field: "",
                    formatter: function (row) {
                        var description = row.description ? row.description : '-',
                            questionTypeName = row.questionTypeName === 'N/A' ? '-' : row.questionTypeName,
                            resolveTime = core.parseDateFormate(row.customerComplaintTime),
                            resolveUserName = row.resolveUserName,
                            question_info_icon = '<i class="fa fa-eye fa-lg toggle-question-info table-btn"'
                                + 'data-questiontypename="' + questionTypeName + '" data-description="' + description + '"'
                                + 'data-resolvetime="' + resolveTime + '" data-resolveusername="' + resolveUserName + '"'
                                + 'style="display:inline-block;margin-right:10px;color:#2cc3a9;"aria-hidden="true"></i>',
                            title = flyer.i18n.initTitle("问题描述") + '：' + description;
                        return '<span>' + question_info_icon + '<span title="' + title + '">' + description + '</span></span>';
                    }
                }, {
                    title: flyer.i18n.initTitle('客诉时间'),
                    field: '',
                    styles: {
                        width: 125
                    },
                    formatter: function (row) {
                        return core.parseDateFormate(row.customerComplaintTime);
                    }
                }],
                data: datas,
                rowClick: function (index, row, rows, e) {
                    // 单击进入编辑页面
                    var curIndex = 1, limit = 20;
                    if (baseDatas.pagerObj) {
                        curIndex = baseDatas.pagerObj.options.curIndex;
                    }
                    if (baseDatas.pageSizeSelectObj) {
                        limit = baseDatas.pageSizeSelectObj.getSelectedValue();
                    }
                    if (!$(e.target).hasClass('table-btn')) {
                        core.loadPage('#customer_complaint_form', '?ID=' + row.ID + '&exportKey=customer_complaint_list&curIndex=' + curIndex + '&limit=' + limit);
                    }
                }
            });
        } else {
            flyer.msg(baseDatas.paramErrMsg);
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
        core.tableNoMatch($table, flyer.i18n.initTitle('暂时没有相关客诉记录'));
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
        // 有数据的时候。才需要去初始化
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
        $('#currentCustomerServerMountSpan').text(currentTotal);
        $('#customerServerMountSpan').text(total);
    }

    /**
     * 获取表格数据
     * 
     * 
     * @param {Number} pageNumber 当前显示页数，默认为0
     * @param {NUmber} pageSize 煤业显示的数据条数，默认为20
     */
    function getTableDatas(pageNumber, pageSize) {
        var conditions = {}, conditionsObj = {}, conditionsText = '', $flyerSearchConditions = $('.flyer-search-conditions');
        if ($flyerSearchConditions.data('conditions')) {
            conditions = JSON.parse($flyerSearchConditions.data('conditions'));
            conditionsText = $flyerSearchConditions.data('conditionstext');
            $flyerSearchConditions.html(conditionsText);
        } else {
            if (flyer.exports.customer_complaint_search && typeof flyer.exports.customer_complaint_search.getConditions === 'function') {
                conditionsObj = flyer.exports.customer_complaint_search.getConditions() || {};
                conditions = conditionsObj.resultObj;
                conditionsText = conditionsObj.resultObjText ? flyer.i18n.initTitle('，搜索条件：') + conditionsObj.resultObjText : '';
                $flyerSearchConditions.html(conditionsText).data('conditions', JSON.stringify(conditions)).data('conditionstext', conditionsText);
            }
        }
        var $table = $('#dataTable');
        conditions.offset = pageNumber || 1;
        conditions.limit = pageSize || 20;
        conditions.orgGroupIDAll = baseDatas.orgGroupIDAll;
        conditions.nocache = window.Date.now();
        $.ajax({
            url: core.url + '/read_customer_complaint',
            type: 'GET',
            data: conditions,
            beforeSend: function (jqXHR, settings) {
                flyer.loading.init().add();
            },
            success: function (data, jqXHR, textStatus) {
                if (data.success) {
                    renderTable($table, data.data.rows);
                    randerDOMPager(baseDatas.$table, data.data.rows, data.data.total, {
                        pageNumber: pageNumber || 1,
                        pageSize: pageSize || 20
                    });
                    setMountValue(data.data.rows.length, data.data.total);
                    core.bindCheckboxEvent(baseDatas.$table);
                    // 查看问题描述详细信息
                    $('.toggle-question-info').off('click').on('click', toggleQuestionInfoHandle);
                    // 查看备注信息
                    $('.toggle-remark-info').off('click').on('click', toggleRemarkInfoHandle);
                } else {
                    flyer.msg(baseDatas.netErrMsg);
                    renderTable($table, []);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                flyer.msg(baseDatas.netErrMsg);
            },
            complete: function (jqXHR, textStatus) {
                flyer.loading.init().delete();
            }
        });
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
     * 显示高级搜索弹出框
     * 
     */
    function showAdvancedSearchWindow(callback) {
        var open = flyer.open({
            pageUrl: core.url + '/html/customer_complaint_search.html',
            isModal: true,
            area: [555, 555],
            title: flyer.i18n.initTitle('高级搜索'),
            cancel: function () {
                flyer.exports.customer_complaint_search.hideDatePicker();
            },
            btns: [{
                text: flyer.i18n.initTitle('搜索'),
                click: function (elm) {
                    if (typeof callback === 'function') {
                        callback(0, 20);
                        this.close();
                    }
                }
            }, {
                text: flyer.i18n.initTitle('关闭'),
                click: function (elm) {
                    this.close();
                    flyer.exports.customer_complaint_search.hideDatePicker();
                }
            }]
        });
        setOffset(open);
    }

    /**
     * 获取本月的开始时间和结束时间，返回一个对象{start：'',end:''}
     * 
     */
    function getCurrentMonthDate() {
        var obj = {},
            d = new Date(),
            year = d.getFullYear(),
            currentMonth = d.getMonth() + 1;
        obj.start = flyer.formatDate('yyyy-mm-dd', year + '-' + currentMonth + '-' + '01');
        obj.end = flyer.formatDate('yyyy-mm-dd');
        return obj;
    }

    /**
     *获取本周的开始时间和结束时间， 返回一个对象{start：'',end:''}
     * 
     */
    function getCurrentWeekDate() {
        var obj = {},
            d = new Date(),
            year = d.getFullYear(),
            currentMonth = d.getMonth() - 1,
            day = d.getDay();
        obj.start = flyer.formatDate('yyyy-mm-dd', new Date(d.getTime() - (day - 1) * 24 * 60 * 60 * 1000));
        obj.end = flyer.formatDate('yyyy-mm-dd');
        return obj;
    }

    /**
     * 获取屏幕中心的坐标位置
     * 
     * @param {any} self 弹出框
     * @returns 
     */
    function getOffset(self) {
        try {
            var mode = "body";
            var bodyX = $(mode).width();
            var bodyY = window.screen.height;
            var selfX = typeof self !== "undefined" ? self.offsetWidth : 0;
            var selfY = typeof self !== "undefined" ? self.offsetHeight : 0;
            return {
                x: bodyX / 2 - selfX / 2,
                y: bodyY / 3 - selfY / 2,
                w: mode.offsetWidth,
                h: mode.clientHeight
            };
        } catch (ex) {
            console.error(ex);
        }
    }
    /**
     * 设置高级搜索中的弹出框的坐标
     * 
     * @param {any} open 
     */
    function setOffset(open) {
        switch (open.options.offset) {
            case "auto":
                {
                    var xy = getOffset(open.$el.get(0));
                    open.$el.css({
                        top: String(xy.y > 0 ? xy.y : 0) + "px",
                        left: String(xy.x > 0 ? xy.x : 0) + "px"
                    });
                }
                break;
        }
    }
    // 页面入口
    init();
});