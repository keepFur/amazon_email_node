'use strict';
layui.use([], function () {
    // 基于准备好的dom，初始化echarts实例
    var taskCount = echarts.init(document.getElementById('taskCount'));
    var taskType = echarts.init(document.getElementById('taskType'));
    var addScore = echarts.init(document.getElementById('addScore'));
    // 指定图表的配置项和数据
    var optionOfCount = {
        title: {
            text: '创建任务量走势图'
        },
        tooltip: {},
        legend: {
            right: 10,
            top: 0,
            data: ['任务量']
        },
        xAxis: {
            data: []
        },
        yAxis: {},
        series: [{
            name: '任务量',
            type: 'line',
            data: []
        }]
    };
    var optionOfType = {
        title: {
            text: '创建任务类型分布图'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            type: 'scroll',
            orient: 'vertical',
            right: 10,
            top: 0,
            bottom: 20,
            data: ['APP搜索']
        },
        series: [{
            name: '任务类型',
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
            text: '积分充值柱状图'
        },
        tooltip: {},
        legend: {
            right: 10,
            top: 0,
            data: ['积分充值']
        },
        xAxis: {
            data: []
        },
        yAxis: {},
        series: [{
            name: '积分充值',
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
        getTaskType();
        getAddMoney();
        getScore();
        initEvent();
    })()

    /**
     * 事件初始化
     * 
     */
    function initEvent() {
        // 切换日期
        $('.js-home-toggle-date').on('click', 'a', function (event) {
            var type = $(this).data('type');
            var day = $(this).data('day');
            $(this).parents('.js-home-toggle-date').find('a').removeClass('layui-text-pink');
            $(this).addClass('layui-text-pink');
            switch (type) {
                case 'count':
                    getTaskCount(day);
                    break;
                case 'type':
                    getTaskType(day);
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
    }

    //  获取用户积分
    function getScore() {
        core.getUserInfoById($('#userName').data('user-id'), function (res) {
            $('.js-user-score').text(res.data.rows[0].money);
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
        optionOfCount.xAxis.data = numDayDate;
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
            optionOfCount.series[0].data = rows.map(function (item, index) {
                return item.count;
            });
            taskCount.setOption(optionOfCount);
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
            optionOfType.series[0].data = rows.map(function (item) {
                return {
                    name: core.getTypeCodeByValue(item.taskChildType).name,
                    value: item.count
                };
            });
            taskType.setOption(optionOfType);
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
     * 获取积分充值的数据
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
                return item.count;
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
});