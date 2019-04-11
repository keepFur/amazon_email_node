'use strict';
layui.use(['element', 'layer', 'table', 'util'], function () {
    var element = layui.element;
    var layer = layui.layer;
    var table = layui.table;
    var util = layui.util;
    // 基于准备好的dom，初始化echarts实例
    var taskCount = echarts.init(document.getElementById('taskCount'));
    var kbCount = echarts.init(document.getElementById('kbCount'));
    var taskType = echarts.init(document.getElementById('taskType'));
    var kbType = echarts.init(document.getElementById('kbType'));
    var addScore = echarts.init(document.getElementById('addScore'));
    var otherShareCode = '';
    var myShareCode = '';
    // 指定图表的配置项和数据--任务数量
    var optionOfTaskCount = {
        title: {
            text: '流量购买量走势图'
        },
        tooltip: {},
        legend: {
            right: 10,
            top: 0,
            data: ['流量购买量']
        },
        xAxis: {
            data: []
        },
        yAxis: {},
        series: [{
            name: '来了购买量',
            type: 'line',
            data: []
        }]
    };
    // 指定图表的配置项和数据-空包数量
    var optionOfKbCount = {
        title: {
            text: '空包购买量走势图'
        },
        tooltip: {},
        legend: {
            right: 10,
            top: 0,
            data: ['空包购买量']
        },
        xAxis: {
            data: []
        },
        yAxis: {},
        series: [{
            name: '空包购买量',
            type: 'line',
            data: []
        }]
    };
    // 任务类型
    var optionOfTaskType = {
        title: {
            text: '流量购买类型分布图',

        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        series: [{
            name: '流量类型',
            type: 'pie',
            radius: '55%',
            center: ['40%', '50%'],
            data: [],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };

    // 空包类型
    var optionOfKbType = {
        title: {
            text: '空包购买类型分布图',
            x: 'right'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        series: [{
            name: '空包类型',
            type: 'pie',
            radius: '55%',
            center: ['40%', '50%'],
            data: [],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };

    var optionOfScore = {
        title: {
            text: '余额充值柱状图'
        },
        tooltip: {},
        legend: {
            right: 10,
            top: 0,
            data: ['余额充值']
        },
        xAxis: {
            data: []
        },
        yAxis: {},
        series: [{
            name: '余额充值',
            type: 'bar',
            data: []
        }]
    };

    /**
     * 入口函数
     * 
     */
    (function init() {
        getTaskCount();
        getKbCount();
        getTaskType();
        getKbType();
        getAddMoney();
        getScore();
        initComponment();
        initEvent();
    })()

    // 初始化组件
    function initComponment() {
        core.getUserInfoById(function (res) {
            otherShareCode = res.data.rows[0].otherShareCode;
            myShareCode = res.data.rows[0].myShareCode;
            renderShareTable();
            // 生成推广链接（注册的时候自动给账号分配一个推广链接），链接形式：www.08v12.com?otherShareCode=adadjasjdiujasdiqwkajskd
            var link = location.host + '/?otherShareCode=' + res.data.rows[0].myShareCode;
            $('input[name=shareLink]').val(link);
            // 生成效果
            $('#jsShareEffect').val(`亲爱的朋友，我正在使用易店科技优化店铺，效果很不错哦，你也可以试试。点击下方为你准备的专属链接${link}进行注册吧。注册就送2.5元。`);
        });
    }

    /**
     * 事件初始化
     * 
     */
    function initEvent() {
        // 一键复制推广文案
        $('#copyShareLink').on('click', copyShareLinkHandle);
        // 查询
        $('#searchBtn').on('click', function () {
            reloadTable({
                userName: $('input[name=username]').val().trim(),
                page: {
                    curr: 1,
                    limit: 10
                }
            });
            return false;
        });
        // 重置
        $('#resetBtn').on('click', function () {
            $('#shareUserSearchForm')[0].reset();
            return false;
        });
        // 切换日期
        $('.js-home-toggle-date').on('click', 'a', function (event) {
            var type = $(this).data('type');
            var day = $(this).data('day');
            $(this).parents('.js-home-toggle-date').find('a').removeClass('layui-btn-normal').addClass('layui-btn-primary');
            $(this).addClass('layui-btn-normal').removeClass('layui-btn-primary');
            switch (type) {
                case 'count':
                    getTaskCount(day);
                    break;
                case 'kbCount':
                    getKbCount(day);
                    break;
                case 'type':
                    getTaskType(day);
                    getKbType(day);
                    break;
                case 'addmoney':
                    getAddMoney(day);
                    break;
                default:
                    getTaskCount(day);
                    break;
            }
            return false;
        });
        // 查看更多通知
        $('#viewMoreNotice').click(function (e) {
            tipNotice();
            return false;
        });
    }

    //  获取用户余额
    function getScore() {
        core.getUserInfoById(function (res) {
            $('.js-user-score').text(core.fenToYuan(res.data.rows[0].money));
        });
    }

    /**
     * 获取发布任务数量的数据
     * 
     * @param {any} date 
     * @param {any} callback 
     */
    function getTaskCount(date) {
        date = date || 7;
        var numDayDate = getNumDayDate(date);
        var createdDateStart = numDayDate[0];
        var createdDateEnd = numDayDate[date - 1];
        optionOfTaskCount.xAxis.data = numDayDate;
        $.get('/api/readTaskCountOfInTime', {
            createdDateStart: createdDateStart,
            createdDateEnd: createdDateEnd
        }, function (res) {
            var rows = res.data.rows;
            numDayDate.forEach(function (item) {
                if (!hasContainerEle(item, rows)) {
                    rows.push({
                        createdDate: $.formatDate('yyyy/mm/dd', item),
                        count: 0
                    });
                }
            });
            rows = rows.map(function (item, index) {
                return {
                    createdDate: $.formatDate('yyyy/mm/dd', item.createdDate),
                    count: item.count
                };
            });
            rows.sort(function (item1, item2) {
                return new Date(item1.createdDate).getTime() - new Date(item2.createdDate).getTime();
            });
            optionOfTaskCount.series[0].data = rows.map(function (item, index) {
                return item.count;
            });
            taskCount.setOption(optionOfTaskCount);
        });
    }

    /**
     * 获取空包数量的数据
     * 
     * @param {any} date 
     * @param {any} callback 
     */
    function getKbCount(date) {
        date = date || 7;
        var numDayDate = getNumDayDate(date);
        var createdDateStart = numDayDate[0];
        var createdDateEnd = numDayDate[date - 1];
        optionOfKbCount.xAxis.data = numDayDate;
        $.get('/api/readKbCountOfInTime', {
            createdDateStart: createdDateStart,
            createdDateEnd: createdDateEnd
        }, function (res) {
            var rows = res.data.rows;
            numDayDate.forEach(function (item) {
                if (!hasContainerEle(item, rows)) {
                    rows.push({
                        createdDate: $.formatDate('yyyy/mm/dd', item),
                        count: 0
                    });
                }
            });
            rows = rows.map(function (item, index) {
                return {
                    createdDate: $.formatDate('yyyy/mm/dd', item.createdDate),
                    count: item.count
                };
            });
            rows.sort(function (item1, item2) {
                return new Date(item1.createdDate).getTime() - new Date(item2.createdDate).getTime();
            });
            optionOfKbCount.series[0].data = rows.map(function (item, index) {
                return item.count;
            });
            kbCount.setOption(optionOfKbCount);
        });
    }

    /**
     * 获取发布任务类型的数据
     * 
     * @param {any} date 
     */
    function getTaskType(date) {
        date = date || 7;
        var numDayDate = getNumDayDate(date);
        var createdDateStart = numDayDate[0];
        var createdDateEnd = numDayDate[date - 1];
        $.get('/api/readTaskTypeOfInTime', {
            createdDateStart: createdDateStart,
            createdDateEnd: createdDateEnd
        }, function (res) {
            var rows = res.data.rows;
            optionOfTaskType.series[0].data = rows.map(function (item) {
                return {
                    name: item.taskTypeName,
                    value: item.count
                };
            });
            taskType.setOption(optionOfTaskType);
        });
    }

    /**
     * 获取购买空包类型的数据
     * 
     * @param {any} date 
     */
    function getKbType(date) {
        date = date || 7;
        var numDayDate = getNumDayDate(date);
        var createdDateStart = numDayDate[0];
        var createdDateEnd = numDayDate[date - 1];
        $.get('/api/readKbTypeOfInTime', {
            createdDateStart: createdDateStart,
            createdDateEnd: createdDateEnd
        }, function (res) {
            var rows = res.data.rows;
            optionOfKbType.series[0].data = rows.map(function (item) {
                return {
                    name: core.getPlantByCode(item.plant) + '(' + item.kbCompany + ')',
                    value: item.count
                };
            });
            kbType.setOption(optionOfKbType);
        });
    }


    /**
     * 获取任务类型名称数组
     * 
     * @returns 
     */
    function getTypes() {
        var types = core.getTypeCodeByValue();
        var typesNames = [];
        for (var key in types) {
            if (types.hasOwnProperty(key)) {
                var element = types[key];
                typesNames.push(element.name);
            }
        }
        return typesNames;
    }

    /**
     * 获取余额充值的数据
     * 
     * @param {any} date 
     */
    function getAddMoney(date) {
        date = date || 7;
        var numDayDate = getNumDayDate(date);
        var createdDateStart = numDayDate[0];
        var createdDateEnd = numDayDate[date - 1];
        optionOfScore.xAxis.data = numDayDate;
        $.get('/api/readAddMoneyOfInTime', {
            createdDateStart: createdDateStart,
            createdDateEnd: createdDateEnd
        }, function (res) {
            var rows = res.data.rows;
            numDayDate.forEach(function (item) {
                if (!hasContainerEle(item, rows)) {
                    rows.push({
                        createdDate: $.formatDate('yyyy/mm/dd', item),
                        count: 0
                    });
                }
            });
            rows = rows.map(function (item, index) {
                return {
                    createdDate: $.formatDate('yyyy/mm/dd', item.createdDate),
                    count: item.count
                };
            });
            rows.sort(function (item1, item2) {
                return new Date(item1.createdDate).getTime() - new Date(item2.createdDate).getTime();
            });
            optionOfScore.series[0].data = rows.map(function (item, index) {
                return core.fenToYuan(item.count);
            });
            addScore.setOption(optionOfScore);
        });
    }

    /**
     * 获取最近num天的日期
     * 并返回一个数组
     * 
     * @param {any} num 最近的天数 默认是七天
     */
    function getNumDayDate(num) {
        num = num || 7;
        if (isNaN(num)) {
            console.log(num);
            return [];
        }
        // 根据时间戳来计算
        var todayTime = new Date().getTime();
        var sumTime = num * 24 * 60 * 60 * 1000;
        var startTime = todayTime - sumTime;
        var oneDayTime = 24 * 60 * 60 * 1000;
        var result = [];
        for (var i = 0; i < num; i++) {
            result[i] = $.formatDate('yyyy/mm/dd', new Date(startTime + (i + 1) * oneDayTime));
        }
        return result;
    }

    /**
     * 判断某一个元素是否在数组中
     * 
     * @param {any} ele 
     * @param {any} arr 
     */
    function hasContainerEle(ele, arr) {
        var has = false;
        if (ele && arr && Array.isArray(arr)) {
            arr.forEach(function (element) {
                if ($.formatDate('yyyy/mm/dd', element.createdDate) === ele) {
                    has = true;
                    return false;
                }
            }, this);
        }
        return has;
    }

    /**
     *首页加载的时候，弹出提示通知
     *
     */
    function tipNotice() {
        layer.open({
            content: `<div  id="noticeContainer" style="min-height:500px;overflow-y:auto;"></div>`,
            area: ['450px'],
            title: '公告列表',
            btn: '关闭',
            scrollbar: false,
            shadeClose: true,
            success: function (layero, index) {
                // 加载通知列表并渲染
                readNoticePage();
            }
        });
    }

    // 获取通知列表
    function readNoticePage() {
        $.ajax({
            url: '/api/readNoticePage',
            data: {
                limit: 5,
                offset: 1
            },
            dataType: 'json',
            success: function (res) {
                randerNoticeList(res.data.rows);
            }
        });
    }

    // 渲染通知
    function randerNoticeList(notice) {
        function generateTpl(n, index) {
            return `<div class="layui-card">
                        <div class="layui-card-header">标题：${n.noticeTitle}</div>
                        <div class="layui-card-body">内容：${n.noticeContent}</div>
                    </div>`;
        }
        $.each(notice, function (index, item) {
            $('#noticeContainer').append(generateTpl(item, index));
        });
        element.render('collapse');
    }

    // 推广攒钱 和我的推广
    /**
     * 一键复制推广文案按钮的点击事件的处理函数
     * 每个账户下有一个otherShareCode（别人分享的）和myShareCode（自己的）：
     * 当用户注册的时候：判断链接中是否有otherShareCode查询参数，如果有的话，说明是通过别人分享的链接进行注册的，否则不是。注册的时候，每个账户分配一个myShareCode，当用户进行充值的时候，根据用户的otherShareCode去判断是否有人通过你分享的链接进行了注册，如果有的话，根据充值金额，按照比例进行佣金的返回并记录日志。
     * 实现步骤（服务端）：
     * 1，user 表增加myShareCode和otherShareCode字断
     * 2，注册的时候，判断查询参数，是否有otherShareCode，如果有写入到otherShareCode字断中，并自动生成一个myOtherCode
     * 3，充值的时候，判断是否是通过别人的链接进行注册的，如果是，返回佣金和记录日志
     * 实现步骤（客户端）：完成
     * 1，获取用户信息（myShareCode），生成推广链接
     * 2，组装推广文案
     * 3，复制推广文案
     * @param {any} e 
     */
    function copyShareLinkHandle(e) {
        core.copyToClipBoard('jsShareEffect');
        layer.msg('推广文案已成功复制到粘贴板，去推广吧');
        return false;
    }

    /**
     * 渲染表格
     * 
     */
    function renderShareTable() {
        table.render({
            elem: '#shareUserTable',
            url: '/api/readShareUserPage',
            page: true,
            where: {
                myShareCode: myShareCode
            },
            cols: [
                [{
                        field: '',
                        title: '序号',
                        width: 60,
                        templet: function (d) {
                            return d.LAY_INDEX;
                        }
                    },
                    {
                        field: 'userName',
                        title: '用户名',
                    },
                    {
                        field: 'createdDate',
                        title: '创建时间',
                        templet: function (d) {
                            return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
                        }
                    }
                ]
            ],
            limits: [10, 20, 50, 100],
            page: {
                theme: '#1E9FFF',
                layout: ['prev', 'page', 'next', 'skip', 'count', 'limit']
            },
            request: {
                pageName: 'offset'
            },
            response: {
                statusCode: true
            },
            parseData: function (res) {
                return {
                    code: res.success,
                    msg: res.msg,
                    count: res.data.total,
                    data: res.data.rows
                }
            }
        });
    }

    /**
     * 重载表格
     * 
     */
    function reloadTable(where) {
        table.reload('shareUserTable', {
            where: where
        });
    }
});