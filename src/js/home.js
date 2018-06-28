"use strict";
flyer.define("home", function (exports, module) {
    //定义相关对象以及参数
    var byAccout,
        byAssignstatus,
        byFinishstatus,
        byGroup,
        byPerformance,
        byAccoutOpt,
        byAssignstatusOpt,
        byFinishstatusOpt,
        byGroupOpt,
        byPerformanceOpt,
        result,
        ifManager = {},
        i18nConfig = {},
        // apiHostName = 'http://acfs.aukeyit.com';
        apiHostName = '';
    var init = function () {
        //图形出来前加上加载提示
        $(".flyer-layout-content").children().addClass('no-border');
        $(".loading-home").remove();
        $("<div class = 'loading-home'>" + flyer.i18n.initTitle("首页数据正在疯狂计算中") + "......" + "</div>").insertBefore($("#account-echart"))
        //清除之前的视图
        if (byAccout) {
            byAccout.dispose();
        }
        if (byAssignstatus) {
            byAssignstatus.dispose();
        }
        if (byFinishstatus) {
            byFinishstatus.dispose();
        }
        if (byGroup) {
            byGroup.dispose();
        }
        if (byPerformance) {
            byPerformance.dispose();
        }
        if (core.getUserGroups().orgCode === '9103') {
            $('.searchForm').hide().off('keyup').off('click');
        }
        //初始化i18n值
        initI18n();
        // initEchart();
        initEvent();
        window.$ajaxObject = getData();
    }
    //初始化对象
    function initConfig() {
        //权限控制 
        if (core.getUserGroups().orgCode !== '9101') {//暂时写死（需要从配置文件获取）
            //主管
            ifManager.legend = [i18nConfig['undisposed'], i18nConfig['disposed'], i18nConfig['unassigned'], i18nConfig['assigned'], i18nConfig['resolved']];
            ifManager.color = ['#f27068', '#60d491', '#f9b93b', '#4cabf2', '#28bba2'],
                ifManager[0] = {
                    name: i18nConfig['unassigned'],
                    type: 'bar',
                    data: result && result.account.account_status['unassigned']
                };
            ifManager[1] = {
                name: i18nConfig['assigned'],
                type: 'bar',
                data: result && result.account.account_status['assigned']
            };
            ifManager.istrue = true;
        } else {
            //客服
            ifManager.legend = [i18nConfig['undisposed'], i18nConfig['sent'], i18nConfig['resolved']];
            ifManager.color = ['#f27068', '#60d491', '#28bba2'];
            ifManager[0] = {};
            ifManager[1] = {};
            ifManager.istrue = false;
        }
        byAccoutOpt = {
            color: ifManager.color,
            tooltip: {
                trigger: 'axis',
                formatter: function (a) {
                    var data = (JSON.parse(window.unescape($("#__groupsAll").val()))[a[0].dataIndex]['groupName']) + '</br>';
                    for (var i = 0; i < a.length; i++) {
                        data += a[i].marker + "&nbsp;&nbsp;" + a[i].seriesName + '&nbsp;&nbsp;' + a[i].value + '</br>'
                    }
                    return data;
                }
            },
            legend: {
                data: ifManager.legend,
                top: 30,
                left: 33
            },
            grid: {
                left: 40,
                y2: 80
            },
            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    axisTick: { show: false },
                    data: JSON.parse(window.unescape($("#__groupsAll").val())).map(function (email, index) {
                        return email.groupName
                    }),
                    axisLabel: {
                        interval: 0,
                        rotate: 50
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }

                    },
                    max: (JSON.parse(window.unescape($("#__groupsAll").val())).length > 10) ? 'dataMax' : 18
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }

                    },
                    axisTick: {
                        show: false
                    },
                    minInterval: 1
                }
            ],
            series: [
                {
                    name: i18nConfig['undisposed'],
                    type: 'bar',
                    barGap: 0,

                    data: result && result.account.account_status['undisposed']
                },
                {
                    name: core.getUserGroups().orgCode !== '9101' ? i18nConfig['disposed'] : i18nConfig['sent'],
                    type: 'bar',
                    data: core.getUserGroups().orgCode !== '9101' ? result && result.account.account_status['disposed'] : result.account.account_status['send']
                },
                ifManager.istrue ? ifManager[0] : '',
                ifManager.istrue ? ifManager[1] : '',
                {
                    name: i18nConfig['resolved'],
                    type: 'bar',

                    data: result && result.account.account_status['resolved']
                }

            ]
        };
        byAssignstatusOpt = {
            color: ['#60d491', '#f27068', '#2cc3a9'],
            // grid:{
            //     width:'auto'
            // },//自定义显示颜色
            series: [
                {
                    type: 'pie',
                    radius: ['70%', '90%'],
                    avoidLabelOverlap: true,
                    label: {
                        normal: {
                            show: true,
                            position: 'center',
                            textStyle: {
                                fontSize: '12',
                                fontWeight: 'bold'
                            },
                            formatter: "{b}:{c}\n"
                        }
                    },
                    legendHoverLink: false,
                    hoverAnimation: false,
                    animation: false,
                    data: [
                        core.getUserGroups().orgCode !== '9101' ? { value: result && result.account.status_list.disposed, name: i18nConfig['disposed'] } : { value: result && result.account.status_list.send, name: i18nConfig['sent'] },
                        { value: result && result.account.status_list.undisposed, name: i18nConfig['undisposed'] },
                        { value: result && result.account.status_list.resolved, name: i18nConfig['resolved'] }
                    ]
                }
            ],
            center: ['50%', '50%']
        };
        byFinishstatusOpt = {
            color: ['#4cabf2', '#f9b93b'],//自定义显示颜色
            series: [
                {
                    type: 'pie',
                    radius: ['70%', '90%'],
                    avoidLabelOverlap: true,
                    label: {
                        normal: {
                            show: true,
                            position: 'center',
                            textStyle: {
                                fontSize: '12',
                                fontWeight: 'bold'
                            },
                            formatter: "{b}:{c}\n"
                        }
                    },
                    legendHoverLink: false,
                    hoverAnimation: false,
                    animation: false,
                    data: [
                        { value: result && result.account.status_list.assigned, name: i18nConfig['assigned'] },
                        { value: result && result.account.status_list.unassigned, name: i18nConfig['unassigned'] }
                    ]
                }
            ],

        };
        byGroupOpt = {
            color: ['#f27068', '#60d491', '#2cc3a9'],//自定义显示颜色
            tooltip: {
                trigger: 'axis',
                formatter: function (a) {
                    var data = result && result.account.userlist[a[0].dataIndex]['account'] + '</br>';
                    for (var i = 0; i < a.length; i++) {
                        data += a[i].marker + "&nbsp;&nbsp;" + a[i].seriesName + '&nbsp;&nbsp;' + a[i].value + '</br>'
                    }
                    return data;
                }
            },
            legend: {
                data: [i18nConfig['undisposed'], i18nConfig['sent'], i18nConfig['resolved']],
                top: 30,//分组人员
                left: 33
            },
            grid: {
                left: 40,
                right: 0,
                y2: 100,
                borderColor: "#ddd"
            },
            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    axisTick: { show: false },
                    data: result && result.account.userlist && result.account.userlist.map(function (obj, index) {
                        return obj.name
                    }), //分组人员已处理数组
                    axisLabel: {
                        interval: 0,
                        rotate: 50
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }
                    },
                    max: (result.account.userlist && result.account.userlist.length > 10) ? 'dataMax' : 12
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }

                    },
                    axisTick: {
                        show: false
                    },
                    minInterval: 1
                }
            ],
            series: [
                {
                    name: i18nConfig['undisposed'],
                    type: 'bar',
                    barGap: 0,
                    data: result && result.account.service_list['undisposed']//分组人员未处理数组
                },
                {
                    name: i18nConfig['sent'],
                    type: 'bar',
                    data: result && result.account.service_list['send']
                },
                {
                    name: i18nConfig['resolved'],
                    type: 'bar',
                    data: result && result.account.service_list['resolved']
                }
            ]
        };

    }
    //更新图形
    function initEchart(result) {
        if (result.account.userlist && result.account.userlist.length) {
            var resArr = [];
            var obj = {};
            for (var i = 0; i < result.account.userlist.length; i++) {
                if (!obj[result.account.userlist[i].user_id]) {
                    resArr.push(result.account.userlist[i]);
                    obj[result.account.userlist[i].user_id] = 1;
                }
            }
            result.account.userlist = resArr;
        }

        //改变展示
        initConfig();
        initAccount();
        if (core.getUserGroups().orgCode !== '9101') {
            initFinishstatus();
            initGroup();
            //加载客服绩效的图表
        }
        initAssignstatus();
        $(".flyer-layout-content").children().removeClass('no-border');
        $('.loading-home').remove();
    }
    //获取数据
    function getData() {
        return $.ajax({
            url: apiHostName + '/home_data',
            data: {
                orgGroupIds: JSON.parse(window.unescape($("#__groupsAll").val())).map(function (obj, index) {
                    return obj.orgGroupId
                }),
                orgGroupId: Number(JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId']),
                org_category_id: JSON.parse(window.unescape($("#__groups").val()))[0]['categoryId'],
                org_id: JSON.parse(window.unescape($("#__groups").val()))[0]['orgId'],
                user_id: window.Number($("#__userid").val()),
                orgCode: core.getUserGroups().orgCode,
                time: window.Date.parse(new Date()),
                startDate: $('.start-time').val() || '',
                endDate: $('.end-time').val() || ''
            },
            success: function (data) {
                result = data
                initEchart(result);
                auth();
                //请求客服绩效，暂时放在这个地方,客服主管下面没有客服人员的时候，不需要去加载客服绩效数据
                var managerServices = [], services = [];
                if (result.account.userlist && result.account.userlist.length) {
                    managerServices = result.account.userlist.map(function (obj, index) {
                        return obj.user_id;
                    });
                } else {
                    managerServices = [window.Number($("#__userid").val())];
                }
                services = core.getUserGroups().orgCode !== '9101' ? managerServices : [window.Number($("#__userid").val())];
                $.ajax({
                    url: apiHostName + '/service_performance',
                    data: {
                        services: services,
                        start_time: $('.start-time').val() || '',
                        end_time: $('.end-time').val() || ''
                    },
                    success: function (data) {
                        result.performance = data.performance
                        //加载客服绩效的图表
                        initPerformance();
                    },
                    error: function () {
                    },
                    complete: function () {

                    }
                });
            },
            error: function () {
                flyer.msg(flyer.i18n.initTitle('加载出错'));
            },
            complete: function () {

            }
        });
        // .then(function (data) {
        //     result = data
        //     initEchart(result);
        //     auth();
        //     //请求客服绩效，暂时放在这个地方,客服主管下面没有客服人员的时候，不需要去加载客服绩效数据
        //     var managerServices = [], services = [];
        //     if (result.account.userlist && result.account.userlist.length) {
        //         managerServices = result.account.userlist.map(function (obj, index) {
        //             return obj.user_id;
        //         });
        //     } else {
        //         managerServices = [window.Number($("#__userid").val())];
        //     }
        //     services = core.getUserGroups().orgCode !== '9101' ? managerServices : [window.Number($("#__userid").val())];
        //     $.ajax({
        //         url: apiHostName + '/service_performance',
        //         data: {
        //             services: services,
        //             start_time: $('.start-time').val() || '',
        //             end_time: $('.end-time').val() || ''
        //         },
        //         success: function (data) {
        //             result.performance = data.performance
        //             //加载客服绩效的图表
        //             initPerformance();
        //         },
        //         error: function () {
        //         },
        //         complete: function () {

        //         }
        //     });
        // }, function (err) {
        //     flyer.msg(flyer.i18n.initTitle('加载出错'));
        // });
        // return data;
    }
    function initAccount() {
        if ($("#account-echart").length && result) {
            byAccout = window.echarts.init(document.querySelector("#account-echart"));
            byAccout.setOption(byAccoutOpt);
        }
    }
    function initAssignstatus() {
        if ($("#assign-status-echart").length && result) {
            byAssignstatus = window.echarts.init(document.querySelector("#assign-status-echart"));
            byAssignstatus.setOption(byAssignstatusOpt);
        }
    }
    function initFinishstatus() {
        if ($("#finish-status-echart").length && result) {
            byFinishstatus = window.echarts.init(document.querySelector("#finish-status-echart"));
            byFinishstatus.setOption(byFinishstatusOpt)
        }
    }
    function initGroup() {
        if ($("#group-echart").length && result) {
            byGroup = window.echarts.init(document.querySelector("#group-echart"));
            byGroup.setOption(byGroupOpt);
        }
    }
    function initPerformance() {
        byPerformanceOpt = {
            color: ['#f27068'],//自定义显示颜色
            tooltip: {
                trigger: 'axis',
                formatter: function (a) {
                    var data;
                    if (core.getUserGroups().orgCode !== '9101') {
                        var name;
                        result.account.userlist && result.account.userlist.forEach(function (obj, index) {
                            if (a[0].name === obj.name) {
                                name = obj.account;
                            }
                        });

                        data = name + '</br>';
                        data += $.isNumeric(a[0].value) && a[0].value < 1 ? (a[0].value * 60 > 1) ? (a[0].value * 60).toFixed(0) + 'min' : 1 + 'min' : $.isNumeric(a[0].value) ? (a[0].value).toFixed(2) + 'h' : a[0].value + '</br>'

                    } else {
                        data = $("#__email").val() + '</br>' + ($.isNumeric(a[0].value) && a[0].value < 1 ? (a[0].value * 60 > 1) ? (a[0].value * 60).toFixed(0) + 'min' : 1 + 'min' : $.isNumeric(a[0].value) ? (a[0].value).toFixed(2) + 'h' : a[0].value) + '</br>'

                    }
                    return data;
                }
            },
            legend: {
                data: [i18nConfig['emailTime']],
                top: 30,//分组人员
                left: 33
            },
            grid: {
                left: 40,
                right: 0,
                y2: 100,
                borderColor: "#ddd"
            },
            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    axisTick: { show: false },
                    data: core.getUserGroups().orgCode !== '9101' ? (result && result.account.userlist && result.account.userlist.map(function (obj, index) {
                        if (result.performance[index] !== 'none') {
                            return obj.name
                        } else {
                            return null
                        }
                    }).filter(function (obj, index) {
                        return obj
                    })) : [$('#__username').val()], //分组人员已处理数组
                    axisLabel: {
                        interval: 0,
                        rotate: 50
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }
                    },
                    max: (core.getUserGroups().orgCode !== '9101' ? (result && result.account.userlist && result.account.userlist.map(function (obj, index) {
                        if (result.performance[index] !== 'none') {
                            return obj.name
                        } else {
                            return null
                        }
                    }).filter(function (obj, index) {
                        return obj
                    })).length : [$('#__username').val()].length) > 10 ? "dataMax" : 20
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLine: {
                        lineStyle: {
                            color: '#ccc'
                        }

                    },
                    axisTick: {
                        show: false
                    }

                }
            ],
            series: [
                {
                    name: i18nConfig['emailTime'],
                    type: 'bar',
                    barGap: 0,
                    data: result.performance && result.performance.filter(function (obj, index) {
                        return obj !== 'none';
                    })//分组人员未处理数组
                }
            ]
        };
        if ($("#performance-echart").length && result) {
            byPerformance = window.echarts.init(document.querySelector("#performance-echart"));
            byPerformance.setOption(byPerformanceOpt);
        }
    }
    var timeout = null;

    $(window).bind('resize', function () {
        resize();
    })
    function resize() {
        if (byAccout) {
            byAccout.dispose();
        }
        if (byAssignstatus) {
            byAssignstatus.dispose();
        }
        if (byFinishstatus) {
            byFinishstatus.dispose();
        }
        if (byGroup) {
            byGroup.dispose();
        }
        if (byPerformance) {
            byPerformance.dispose();
        }
        if ($("#finish-status-echart").length) {
            initFinishstatus();
        }
        if ($("#group-echart").length && byGroup) {
            initGroup();
        }
        if ($("#performance-echart").length && byPerformance) {
            initPerformance();
        }
        initAccount();
        initAssignstatus();

    }
    //权限控制
    function auth() {
        if (core.getUserGroups().orgCode !== '9101') {//暂时写死（需要从配置文件获取）
            //主管
        } else {
            //客服
            $("#finish-status-echart").remove();
            $("#assign-status-echart").css({ "width": "32%", "borderRight": "1px solid #ccc" });
            $("#group-echart").remove();
            byAssignstatus.dispose();
            initAssignstatus();
        }
    }
    //初始化时间选择框以及点击刷新首页功能
    function initEvent() {
        //初始化时间插件
        var start_time = flyer.date($('#start-time'), {
            isTime: false,
            format: "yyyy-mm-dd"
        }),
            end_time = flyer.date($('#end-time'), {
                isTime: false,
                format: "yyyy-mm-dd"
            })
        if (!($("#start-time").val() || $("#end-time").val())) {
            initTime();
        }
        //默认显示今天数据
        function initTime() {
            start_time._date = start_time.getYMD(new Date());
            start_time.selector.val(start_time.formatDate());
            end_time._date = end_time.getYMD(new Date());
            end_time.selector.val(end_time.formatDate());
        }
        //今天本周按钮点击的时候联动时间
        $('.time-btn').off('click').on('click', function () {
            $(this).addClass('active').siblings().removeClass('active');
            if ($(this).is('.today')) {
                //加上今天的时间
                initTime();
                //直接更新
                init();
            } else {
                //判断今天是星期几(本周的时间)
                var weekStart, weekEnd;
                if (new Date().getDay() !== 0) {
                    weekStart = new Date().setDate(new Date().getDate() - (new Date().getDay() - 1));
                } else {
                    weekStart = new Date().setDate(new Date().getDate() - 6);
                }
                //fler没有接口所以调用里面涉及的方法实现
                weekEnd = new Date();
                start_time._date = start_time.getYMD(weekStart);
                start_time.selector.val(start_time.formatDate());
                end_time._date = end_time.getYMD(weekEnd);
                end_time.selector.val(end_time.formatDate());
                //直接更新
                init();
            }
        })
        $(".home-tabUl .flyer-btn-default").off('click').on('click', function () {
            checkDate() && init();
        })
        $('.home-refresh button').off('click').on('click', function () {
            //刷新图表
            checkDate() && init();
        })
        //判断时间填写是否符合要求(要有结束时间、结束时间不可以大于开始时间)
        function checkDate() {
            var startDate = new Date($("#start-time").val()),
                endDate = new Date($("#end-time").val())
            var istrue = true;
            if ((startDate - new Date()) > 0) {
                flyer.msg(flyer.i18n.initTitle('开始时间不能超过今天'));
                istrue = false;
            }
            if ($("#start-time").val() && $("#end-time").val() && (endDate - startDate) < 0) {
                flyer.msg(flyer.i18n.initTitle('结束时间不能早于开始时间'));
                istrue = false;
            }
            return istrue
        }
    }
    function initI18n() {
        //初始化会用到的参数
        function initConfig() {
            i18nConfig = {
                undisposed: flyer.i18n.languageObj['未处理'],
                disposed: flyer.i18n.languageObj['已回复'],
                unassigned: flyer.i18n.languageObj['未分派'],
                assigned: flyer.i18n.languageObj['已分派'],
                resolved: flyer.i18n.languageObj['已解决'],
                sent: flyer.i18n.languageObj['已发送'],
                emailTime: flyer.i18n.languageObj['回邮时效']
            }
            flyer.i18n.initTargetData();
        }
        if (flyer.i18n && flyer.i18n.languageObj) {
            initConfig();

        } else {
            flyer.i18n.initData().then(function () {
                initConfig();
            }, function (err) {
                flyer.msg(flyer.i18n.initTitle('加载出错'));
            });
        }
    }
    init();
});
//为时间下拉框获取光标时候边框颜色改变
$("#timeLi input").on("focus", function () {
    $(this).parent("#timeLi").addClass("green");
})
$("#timeLi input").on("blur", function () {
    $(this).parent("#timeLi").removeClass("green");
})


