'use strict';
flyer.define('emailAbnormalNoTips', function (exports, module) {
    var abnormalNoTipsData = {
        // 表格实例
        $table: null,
        pagerObj: null,
        pageSizeSelectObj: null,
        ajax_timeout: 1000 * 60 * 10,
        // 错误消息
        paramErrMsg: ((flyer.i18n && flyer.i18n.initTitle('参数错误，请刷新页面重试。'))|| '参数错误，请刷新页面重试。'),
        netErrMsg: ((flyer.i18n && flyer.i18n.initTitle('系统已退出登录，请登录系统重试。'))|| '系统已退出登录，请登录系统重试。'),
        operatorErrMsg: ((flyer.i18n && flyer.i18n.initTitle("请至少选择一条数据操作"))|| "请至少选择一条数据操作"),
        rABS: true,
        // 用户所在组
        orgGroupID: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
        userID: $("#__userid").val().trim(), 
        userName: $('#__username').val().trim(),
        // 部门信息
        // companyOrgID: Number(core.getUserGroups().parentId.split(',')[1]),
        // companyOrgName: core.getUserGroups().parentName.split(',')[1]
        fromAddress:core.getUserGroups().parentName.split(',')[1]
    };

    /**
     *页面入口函数 
     * 
     */
    function init() {
        // 获取表格数据
        getTableDatas(1, 20);
    }
    /**
     * 渲染表格结构
     * 
     * @param {any} $table 表格容器
     * @param {any} datas 表格数据
     */
    function renderDOMTable($table, datas) {
        if ($table && $table.length && Array.isArray(datas)) {
            abnormalNoTipsData.$table = flyer.table($table, {
                columns: [
                //     {
                //     field: "",
                //     checkbox: true,
                //     styles: {
                //         width: 34
                //     }
                // }, 
                {
                    title: flyer.i18n.initTitle("对方收信地址"),
                    field: "address"
                }, {
                    title: flyer.i18n.initTitle("错误代码"),
                    field: "code",
                    styles: {
                        width: 150
                    }
                }, {
                    title: flyer.i18n.initTitle("错误原因"),
                    field: "error"
                }, {
                    title: flyer.i18n.initTitle("发生时间"),
                    field: "createdAt"
                }],
                data: datas
            });
        } else {
            flyer.msg(abnormalNoTipsData.paramErrMsg);
        }
    }

    /**
     * 初始化分页信息
     * 
     * @param {any} $table 
     * @param {any} datas 
     */
    function randerDOMPager($table, datas, total, pagerObj) {
        //没有结果的时候
        core.tableNoMatch($table, flyer.i18n.initTitle('暂时没有相关商品'));
        //初始化分页
        abnormalNoTipsData.pagerObj = core.initPager($('.paper-container-product'), total, pagerObj.pageSize || 20, {
            callback: getTableDatas,
            pageNumber: pagerObj.pageNumber || 1,
            pageSizeSelectObj: abnormalNoTipsData.pageSizeSelectObj,
            exports: exports
        });
        // 初始化下拉框，显示每页数据条数的下拉框
        abnormalNoTipsData.pageSizeSelectObj = core.initPagerSizeSelect($('#productPagerSize'), core.getPageListByTotal(total), String(pagerObj.pageSize || 20), {
            callback: getTableDatas,
            pagerObj: abnormalNoTipsData.pagerObj,
            total: datas.total,
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
        $('#noTipsCurrentMountSpan').text(currentTotal);
        $('#noTipsMountSpan').text(total);
    }

    /**
     * 获取表格数据
     */
    function getTableDatas(pageNumber, pageSize) {
        var conditions = {},
            conditionsObj = {},
            conditionsText = '',
            $table = $('#noTipsTable');
        conditions.offset = pageNumber || 1;
        conditions.limit = pageSize || 20;
        conditions.nocache = window.Date.now();
        // conditions.fromAddress = abnormalNoTipsData.fromAddress;
        $.ajax({
            url: core.url + '/read_abnormal_no_tips',
            type: 'GET',
            data: conditions,
            beforeSend: function (jqXHR, settings) {
                flyer.loading.init().add();
            },
            success: function (data, jqXHR, textStatus) {
                if (data.success) {
                    renderDOMTable($table, data.data.rows);
                    randerDOMPager(abnormalNoTipsData.$table, data.data.rows, data.data.total, {
                        pageNumber: pageNumber || 1,
                        pageSize: pageSize || 20
                    });
                    core.bindCheckboxEvent(abnormalNoTipsData.$table);
                    setMountValue(data.data.rows.length, data.data.total);
                } else {
                    flyer.msg(abnormalNoTipsData.netErrMsg);
                    renderDOMTable($table, []);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                flyer.msg(abnormalNoTipsData.netErrMsg);
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
    // 暴露接口
    exports.getTableDatas = getTableDatas;
    // 页面入口
    init();
});