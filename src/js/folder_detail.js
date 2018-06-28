"use strict";
flyer.define("folder_detail", function (exports, module) {
    function init() {
        initTab();
        initTabEvent();
        //计算气泡参数
        if (flyer.getQueryString('type_id')) {
            core.getBubbleCount();
        }
    }
    //默认展示第一项
    function initTab() {
        //这里不一定是在第一个tab
        if (flyer.getQueryString('currentTab')) {
            $(".flyer-tab-active").removeClass('flyer-tab-active');
            $(".flyer-tab-ul li").eq(flyer.getQueryString('currentTab')).addClass('flyer-tab-active');
        }
        var tabIndex = $(".flyer-tab-active").index();
        $(".flyer-tab-content").find(".flyer-tab-item").eq(tabIndex).show().siblings().hide();
        var papers = ["/html/unfinish.html", "/html/finish.html", "/html/unassigned.html", "/html/assigned.html", "/html/resolved.html"];
        $(".flyer-tab-content .flyer-tab-item").eq(tabIndex).load(papers[tabIndex], function () {
            exports.tabHash = ['unfinish', 'finish', 'unassigned', 'assigned', 'resolved'][tabIndex];
            exports.activeIndex = tabIndex;
            exports.indexHash = papers[tabIndex];
            //添加移除按钮
            addBtn();
            //国际化
            if (flyer.i18n.languageObj) {
                //获取语言包
                flyer.i18n.initTargetData();
            } else {
                flyer.i18n.initData().then(function () {
                    //获取语言包
                    flyer.i18n.initTargetData();
                }, function (err) {
                    flyer.msg(flyer.i18n.initTitle('加载出错'));
                });
            }
        });
    }
    function initTabEvent() {
        //tab点击显示隐藏
        $(".flyer-tab li").on("click", function () {
            if (!$(this).hasClass("flyer-tab-active")) {
                $(this).addClass("flyer-tab-active").siblings().removeClass("flyer-tab-active");
                var indexO = $(this).index();
                $(".flyer-tab-content").find(".flyer-tab-item").eq(indexO).show().siblings().hide();
            }
            var activeIndex = $(this).index();
            var hashArr = ["/html/unfinish.html", "/html/finish.html", "/html/unassigned.html", "/html/assigned.html", "/html/resolved.html"]
            $(".flyer-tab-content .flyer-tab-item").empty();
            exports.activeIndex = activeIndex;
            exports.indexHash = hashArr[activeIndex];
            var tabHashArr = ['unfinish', 'finish', 'unassigned', 'assigned', 'resolved']
            exports.tabHash = tabHashArr[activeIndex]
            $(".flyer-tab-content .flyer-tab-item").eq(activeIndex).load(hashArr[activeIndex], function () {
                //添加移除按钮
                addBtn();
                //国际化
                if (flyer.i18n.languageObj) {
                    //获取语言包
                    flyer.i18n.initTargetData();
                } else {
                    flyer.i18n.initData().then(function () {
                        //获取语言包
                        flyer.i18n.initTargetData();
                    }, function (err) {
                        flyer.msg(flyer.i18n.initTitle('加载出错'));
                    });
                }
            });
        })
        if (core.getUserGroups().orgCode === '9101') {
            //客服隐藏分派未分派
            $(".flyer-tab-ul li:gt(1):not(:last)").hide();
        }
    }
    function addBtn() {
        $(".delete-email").remove();
        $.each($('.btn-container'), function (index, obj) {
            var btn = $('<button class="flyer-btn flyer-btn-default delete-email" title="' + flyer.i18n.initTitle("移出当前文件夹") + '"><i class="fa fa-trash-o"></i></button>');
            btn.insertAfter($(".btn-container").eq(index).find('.newFolder'));
            //给按钮添加点击事件
            btn.off('click').on('click', removeEmailOut);
        })
    }
    function removeEmailOut() {
        //移出相应的文件夹
        function removeEmail() {
            $.ajax({
                url: '/remove_email_fold',
                method: 'get',
                data: {
                    subjects: choicedData('subject_num'),
                    typ_id: flyer.getQueryString('type_id'),
                    timer: window.Date.parse(new Date())
                },
                success: function (data) {
                    flyer.msg(flyer.i18n.initTitle('移出文件夹成功'));
                    //刷新表格
                    $(".flyer-tab-content .flyer-tab-item").eq(exports.activeIndex).load(exports.indexHash, function () {
                        //添加移除按钮
                        addBtn();
                    });
                    //刷新左侧参数
                    window.bubbleData();
                    //刷新当前气泡
                    if (flyer.getQueryString('type_id')) {
                        core.getBubbleCount();
                    }
                },
                error: function (err) {

                }
            })
        }
        //判断是否有选中文件夹
        if ($('tbody input:checked').length === 0) {
            flyer.msg(flyer.i18n.initTitle('请至少选择一个邮件操作'));
        } else {
            flyer.confirm(flyer.i18n.initTitle("确定要移出该邮件吗?"), function (result) {

            }, {
                    btns: [{
                        text: flyer.i18n.initTitle('确定'),
                        skin: "flyer-btn-blue",
                        click: function (elm) {
                            this.close();
                            removeEmail();
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
        }
    }
    //获取选中数据
    function choicedData(field) {
        var Data = $('tbody input:checked:not(".flyer-dialog-content :checked")').map(function (index, ele) {
            var deleteQue = $(ele).parents('tr').index();
            return flyer.exports[exports.tabHash]['tableData'][deleteQue][field];
        })
        var DataArr = [];
        for (var i = 0; i < Data.length; i++) {
            DataArr.push(Data[i]);
        }
        return DataArr;
    }
    init();
});

