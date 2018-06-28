'use strict';
flyer.define('satisfaction', function (exports, module) {
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
        paramErrMsg: flyer.i18n.initTitle('参数错误'),
        netErrMsg: flyer.i18n.initTitle('网络错误，请刷新页面重试'),
        operatorErrMsg: {
            single: flyer.i18n.initTitle('最多选择一项'),
            batch: flyer.i18n.initTitle('至少选择一项')
        },
        // 接口域名
        apiHostName: 'http://192.168.29.208:8032',
    };

    /**
     *页面入口函数 
     * 
     */
    function init() {
        // 获取表格数据
        getTableDatas(baseDatas.curIndex, baseDatas.limit);
        // 初始化事件
        initEvent();
    }

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 导出为excel
        $('.exportToExcel').on('click', exportToExcelHandle);
        // 高级搜索
        $('#advancedSearchBtn').on('click', advancedSearchHandle);
        // 清空搜索条件
        $('#clearSearchConditionsBtn').on('click', clearSearchConditionsHandle);
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
     * 高级搜索按钮的点击事件处理函数
     * 
     * @param {any} events 
     * @returns 
     */
    function advancedSearchHandle(events) {
        $('.flyer-search-conditions').data('conditions', null).data('conditionstext', null);
        showAdvancedSearchWindow();
        return false;
    }

    /**
     * 清空高级搜索按钮点击事件处理函数
     * 
     * @returns 
     */
    function clearSearchConditionsHandle() {
        $('.flyer-search-conditions').html('').data('conditions', null).data('conditionstext', null);
        flyer.exports.customer_complaint_search = false;
        getTableDatas(1, 20);
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
                    field: '',
                    checkbox: true,
                    styles: {
                        width: 34
                    }
                }, {
                    title: flyer.i18n.initTitle("订单号"),
                    field: '',
                    styles: {
                        width: 150
                    },
                    formatter: function (row) {
                        return row.orderId ? row.orderId : '-';
                    }
                }, {
                    title: '调查结果',
                    field: '',
                    styles: {
                        width: 100
                    },
                    formatter: function (row) {
                        return row.rateStatus === '1' ? '好评' : '差评';
                    }
                }, {
                    title: '其他评论',
                    field: '',
                    formatter: function (row) {
                        return row.comment ? row.comment : '-';
                    }
                }, {
                    title: flyer.i18n.initTitle('邮箱'),
                    field: '',
                    styles: {
                        width: 100
                    },
                    formatter: function (row) {
                        return row.emailAddress ? row.emailAddress : '-';
                    }
                }, {
                    title: '时间',
                    field: '',
                    styles: {
                        width: 130
                    },
                    formatter: function (row) {
                        return core.parseDateFormate(row.createTime);
                    }
                }],
                data: datas
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
        core.tableNoMatch($table, flyer.i18n.initTitle('暂时没有相关数据'));
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
        // 有数据的时候，才需要去初始化
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
        $('#currentCommentMountSpan').text(currentTotal);
        $('#commentMountSpan').text(total);
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
            conditionsObj = getConditions() || {};
            conditions = conditionsObj.resultObj;
            conditionsText = conditionsObj.resultObjText ? flyer.i18n.initTitle('，搜索条件：') + conditionsObj.resultObjText : '';
            $flyerSearchConditions.html(conditionsText).data('conditions', JSON.stringify(conditions)).data('conditionstext', conditionsText);
        }
        var $table = $('#dataTable');
        conditions.pageNumber = pageNumber || 1;
        conditions.pageSize = pageSize || 20;
        conditions.nocache = window.Date.now();
        $.ajax({
            url: baseDatas.apiHostName + '/report/getReportList',
            type: 'GET',
            data: conditions,
            timeout: 5000,
            contentType: 'application/json',
            beforeSend: function (jqXHR, settings) {
                flyer.loading.init().add();
            },
            success: function (data, jqXHR, textStatus) {
                // 渲染表格
                renderTable($table, data.rows);
                // 渲染表中的分页
                randerDOMPager(baseDatas.$table, data.rows, data.total, {
                    pageNumber: pageNumber || 1,
                    pageSize: pageSize || 20
                });
                // 设置总数和当前数量
                setMountValue(data.rows.length, data.total);
                // 绑定全选事件
                core.bindCheckboxEvent(baseDatas.$table);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                flyer.msg(baseDatas.netErrMsg);
                renderTable($table, []);
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
    function showAdvancedSearchWindow() {
        flyer.open({
            content: generateSearchTpl(),
            isModal: true,
            area: [400, 340],
            title: flyer.i18n.initTitle('高级搜索'),
            cancel: function () {
                hideDatePicker();
            },
            btns: [{
                text: flyer.i18n.initTitle('搜索'),
                click: function (elm) {
                    getTableDatas(1, 20);
                }
            }, {
                text: flyer.i18n.initTitle('关闭'),
                click: function (elm) {
                    this.close();
                    hideDatePicker();
                }
            }],
            afterCreated: function () {
                initDatePicker($('#beginDate'));
                initDatePicker($('#endDate'));
            }
        });
    }

    /**
     * 获取高级搜索中字符串模板
     * 
     */
    function generateSearchTpl(option) {
        return `<div class="flyer-form-item public-butModal customer-advanced-search">
                    <form class="flyer-form">
                        <div class="flyer-form-item">
                            <label class="i18n">调查结果</label>
                            <label class="flyer-radio" style="margin-left:8px;">
                                <input type="radio" name="commentResult" value="2" title="全部" checked>
                                <i></i>
                            </label>
                            <span>全部</span>
                            <label class="flyer-radio" style="margin-left:8px;">
                                <input type="radio" name="commentResult" value="1" title="好评">
                                <i></i>
                            </label>
                            <span>好评</span>
                            <label class="flyer-radio" style="margin-left:8px;">
                                <input type="radio" name="commentResult" value="0" title="差评">
                                <i></i>
                            </label>
                            <span>差评</span>
                        </div>
                        <div class="public-butModal-inputBox">
                            <label class='i18n' data-i18nKey='订单号'>订单号</label>
                            <input type="text" class="flyer-input i18n" style="width:298px;" name="orderID">
                        </div>
                        <div class="public-butModal-inputBox">
                            <label class='i18n' data-i18nKey='邮件ID'>邮件ID</label>
                            <input type="text" class="flyer-input i18n" style="width:298px;" name="emailID">
                        </div>
                        <div class="public-butModal-inputBox">
                            <label class='i18n' data-i18nKey='邮箱'>邮箱</label>
                            <input type="text" class="flyer-input i18n" style="width:298px;" name="emailAddress">
                        </div>
                        <div class="public-butModal-inputBox public-butModal-search">
                            <label class='i18n' data-i18nKey='其他评论'>其他评论</label>
                            <input type="text" class="flyer-input i18n" style="width:298px;" name="otherComment" placeholder="支持模糊查询">
                        </div>
                        <div class="public-butModal-inputBox">
                            <label class='i18n' data-i18nKey='调查时间'>调查时间</label>
                            <input type="text" placeholder="开始时间" class="flyer-input public-butModal-datepicker i18n" id="beginDate" readonly data-i18nKey='开始时间'
                                style="width:142px;">
                            <span class="datepicker-spilt">-</span>
                            <input type="text" placeholder="结束时间" class="flyer-input public-butModal-datepicker i18n" id="endDate" readonly data-i18nKey='结束时间'
                                style="width:142px;">
                        </div>
                    </form>
                </div>`;
    }

    /**
     * 初始化日期选择器
     * 
     * @param {any} $container 
     * @returns 
     */
    function initDatePicker($container) {
        var DateObj = {};
        DateObj = flyer.date($container, {
            isTime: false,
            format: 'yyyy-mm-dd'
        });
        return DateObj;
    }

    /**
     * 隐藏日期选择面板
     * 
     */
    function hideDatePicker() {
        $('#flyer-date-beginDate').hide();
        $('#flyer-date-endDate').hide();
    }

    /**
     * 获取查询条件
     * 
     * @returns 
     */
    function getConditions() {
        var resultObj = Object.create({}),//返回给服务端的查询条件
            resultObjText = '', //返回给客户端的查询条件
            commentResult = ['差评', '好评', '全部'],
            $commentResult = $('input[name=commentResult]'),
            $orderID = $('input[name=orderID]'),
            $emailID = $('input[name=emailID]'),
            $emailAddress = $('input[name=emailAddress]'),
            $otherComment = $('input[name=otherComment]'),
            $beginDate = $('#beginDate'),
            $endDate = $('#endDate')
            ;
        // 调查结果 好评 1，差评 0 ，所有的 2，默认传0（差评）
        if ($commentResult.length) {
            resultObj.commentResult = $('input[name=commentResult]:checked').val();
            if (resultObj.commentResult) {
                resultObjText = flyer.i18n.initTitle('调查结果') + '[' + commentResult[resultObj.commentResult] + ']';
            }
        }
        // 订单号
        if ($orderID.length && $orderID.val().trim()) {
            resultObj.purchaseOrderId = $orderID.val().trim().replace(/\?/, '？');
        }
        if (resultObj.purchaseOrderId) {
            resultObjText += '，' + flyer.i18n.initTitle('订单号') + '[' + resultObj.purchaseOrderId + ']';
        }
        // 邮件ID
        if ($emailID.length && $emailID.val().trim()) {
            resultObj.emailID = $emailID.val().trim().replace(/\?/, '？');
        }
        if (resultObj.emailID) {
            resultObjText += '，' + flyer.i18n.initTitle('邮件ID') + '[' + resultObj.emailID + ']';
        }
        // 邮箱
        if ($emailAddress.length && $emailAddress.val().trim()) {
            resultObj.emailAddress = $emailAddress.val().trim().replace(/\?/, '？');
        }
        if (resultObj.emailAddress) {
            resultObjText += '，' + flyer.i18n.initTitle('邮箱') + '[' + resultObj.emailAddress + ']';
        }
        // 其他评论
        if ($otherComment.length && $otherComment.val().trim()) {
            resultObj.otherComment = $otherComment.val().trim().replace(/\?/, '？');
        }
        if (resultObj.otherComment) {
            resultObjText += '，' + flyer.i18n.initTitle('其他评论') + '[' + resultObj.otherComment + ']';
        }
        // 调查时间
        // 开始
        if ($beginDate.length && $beginDate.val()) {
            resultObj.beginDate = $beginDate.val().trim();
        }
        if (resultObj.beginDate) {
            resultObjText += '，' + flyer.i18n.initTitle('调查开始时间') + '[' + resultObj.beginDate + ']';
        }
        // 结束
        if ($endDate.length && $endDate.val()) {
            resultObj.endDate = $endDate.val().trim();
        }
        if (resultObj.endDate) {
            resultObjText += '，' + flyer.i18n.initTitle('调查结束时间') + '[' + resultObj.endDate + ']';
        }
        return {
            resultObj: resultObj,
            resultObjText: resultObjText.replace(/^，/, ' ')
        };
    }

    // 页面入口
    init();
});