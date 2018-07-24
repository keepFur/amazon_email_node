'use strict';
$(function() {
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
            data: [
                'APP流量',
                'PC流量',
                'APP搜索',
                'PC搜索',
                '搜索加购',
                '直接加购'
            ]
        },
        series: [{
            name: '任务类型',
            type: 'pie',
            radius: '55%',
            center: ['40%', '50%'],
            data: [{
                name: 'APP流量',
                value: 10
            }, {
                name: 'PC流量',
                value: 20
            }, {
                name: 'APP搜索',
                value: 10
            }, {
                name: 'PC搜索',
                value: 20
            }, {
                name: '搜索加购',
                value: 10
            }, {
                name: '直接加购',
                value: 33
            }],
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
            text: '积分充值走势图'
        },
        tooltip: {},
        legend: {
            right: 10,
            top: 0,
            data: ['充值积分']
        },
        xAxis: {
            data: getNumDayDate(7)
        },
        yAxis: {},
        series: [{
            name: '充值积分',
            type: 'bar',
            data: [0, 20, 36, 10, 10, 20, 5]
        }]
    };
    // 使用刚指定的配置项和数据显示图表。
    // taskCount.setOption(optionOfCount);
    taskType.setOption(optionOfType);
    addScore.setOption(optionOfScore);


    /**
     * 入口函数
     * 
     */
    function init() {
        getTaskCount();
        initEvent();
    }

    /**
     * 事件初始化
     * 
     */
    function initEvent() {
        // 切换日期
        $('.js-home-toggle-date').on('click', 'a', function(event) {
            var type = $(this).data('type');
            var day = $(this).data('day');
            $(this).parents('.js-home-toggle-date').find('a').removeClass('mdui-text-color-pink');
            $(this).addClass('mdui-text-color-pink');
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
        }, function(res) {
            var rowsLength = res.data.rows.length;
            numDayDate.forEach(function(item, index) {
                if (index >= rowsLength) {
                    res.data.rows[index] = {
                        createdDate: $.formatDate('yyyy/mm/dd hh:MM:ss', new Date()),
                        count: 0
                    };
                }
            });
            res.data.rows.sort(function(item1, item2) {
                return item1.createdDate > item2.createdDate;
            });
            optionOfCount.series[0].data = res.data.rows.map(function(item, index) {
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
        optionOfCount.xAxis.data = numDayDate;
        $.get('/api/readTaskCountOfInTime', {
            createdDateStart: createdDateStart,
            createdDateEnd: createdDateEnd
        }, function(res) {
            var rowsLength = res.data.rows.length;
            numDayDate.forEach(function(item, index) {
                if (index >= rowsLength) {
                    res.data.rows[index] = {
                        createdDate: $.formatDate('yyyy/mm/dd hh:MM:ss', new Date()),
                        count: 0
                    };
                }
            });
            res.data.rows.sort(function(item1, item2) {
                return item1.createdDate > item2.createdDate;
            });
            optionOfCount.series[0].data = res.data.rows.map(function(item, index) {
                return item.count;
            });
            taskCount.setOption(optionOfCount);
        });
    }


    /**
     * 获取积分充值的数据
     * 
     * @param {any} date 
     */
    function getAddMoney(date) {

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

    init();
});