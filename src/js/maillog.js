'use strict';
flyer.define('countries', function (exports, module) {
    var baseDatas = {
        // 用户所在组
        userID: $("#__userid").val().trim(),
        userName: $('#__username').val().trim(),
        // 表格实例
        $table: null,
        pagerObj: null,
        pageSizeSelectObj: null,
        curIndex: Number(flyer.getQueryString('curIndex') || 1),
        // 错误消息
        paramErrMsg: flyer.i18n.initTitle('参数错误，请刷新页面重试'),
        netErrMsg: flyer.i18n.initTitle('系统已退出登录，请登录系统重试'),
        operatorErrMsg: {
            single: flyer.i18n.initTitle('请选择一条数据操作'),
            batch: flyer.i18n.initTitle('请至少选择一条数据操作')
        }
    };

    /**
     *页面入口函数 
     * 
     */
    function init() {
        // 获取表格数据
        getTableDatas(baseDatas.curIndex, 20);
        initEvent()
    }

    /**
    * 初始化DOM元素事件
    * 
    */
    function initEvent() {
        // 高级搜索
        $('#advancedSearchBtn').on('click', advancedSearchHandle);
        // 清空搜索条件
        $('#clearSearchConditionsBtn').on('click', clearSearchConditionsHandle);
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
        $('.flyer-search-conditions').html('').data('conditions', null).data('conditionstext', null);
        flyer.exports.maillog_search = false;
        getTableDatas(1, 20);
        return false;
    }

    /**
     * 显示高级搜索弹出框
     * 
     */
    function showAdvancedSearchWindow(callback) {
        flyer.open({
            pageUrl: core.url + '/html/log_search.html',
            isModal: true,
            area: [400, 200],
            title: flyer.i18n.initTitle('高级搜索'),
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
                }
            }]
        });
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
                    title: "邮件ID",
                    field: "mailID",
                    styles: {
                        width: 200
                    }
                }, {
                    title: "操作用户",
                    field: "userName",
                    styles: {
                        width: 150
                    }
                }, {
                    title: "操作内容",
                    field: "content",
                }, {
                    title: "操作时间",
                    field: 'starttime',
                    styles: {
                        width: 200
                    },
                    formatter: function (item) {
                        return flyer.formatDate('yyyy-mm-dd hh:MM:ss', item.starttime);
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
        core.tableNoMatch($table, flyer.i18n.initTitle('暂时没有数据'));
        // 初始化下拉框，显示每页数据条数的下拉框
        baseDatas.pageSizeSelectObj = core.initPagerSizeSelect($('#logPagerSize'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
            callback: getTableDatas,
            pagerObj: baseDatas.pagerObj,
            total: datas.total,
            exports: exports
        });
        // 初始化分页
        baseDatas.pagerObj = core.initPager($('.paper-container-log'), total, pagerObj.pageSize || 20, {
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
        $('#logCurrentMountSpan').text(currentTotal);
        $('#logMountSpan').text(total);
    }

    /**
     * 获取表格数据
     * 
     * 
     * @param {Number} pageNumber 当前显示页数，默认为0
     * @param {NUmber} pageSize 煤业显示的数据条数，默认为20
     */
    function getTableDatas(pageNumber, pageSize) {
        var conditions = {},
            conditionsObj = {},
            conditionsText = '',
            $flyerSearchConditions = $('.flyer-search-conditions'),
            $table = $('#dataTable');
        if ($flyerSearchConditions.data('conditions')) {
            conditions = JSON.parse($flyerSearchConditions.data('conditions'));
            conditionsText = $flyerSearchConditions.data('conditionstext');
            $flyerSearchConditions.html(conditionsText);
        } else {
            if (flyer.exports.maillog_search && typeof flyer.exports.maillog_search.getConditions === 'function') {
                conditionsObj = flyer.exports.maillog_search.getConditions() || {};
                conditions = conditionsObj.resultObj;
                conditionsText = conditionsObj.resultObjText ? '，' + flyer.i18n.initTitle('搜索条件') + '：' + conditionsObj.resultObjText : '';
                $flyerSearchConditions.html(conditionsText).data('conditions', JSON.stringify(conditions)).data('conditionstext', conditionsText);
            }
        }
        conditions.offset = pageNumber || 1;
        conditions.limit = pageSize || 20;
        conditions.nocache = window.Date.now();
        $.ajax({
            url: core.url + '/read_mail_log_page',
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

    // 页面入口
    init();
});