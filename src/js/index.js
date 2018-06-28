"use strict";
// 定义一个ajax请求对象实例，如果hash发生改变的时候，就终止上一次的请求
var $ajaxObject = {};

function navEvents() {
    $(".flyer-layout-tree").off("click").on("click", ".flyer-layout-link", function () {
        var href = $(this).data("href");
        // if(href === 'home.html'){
        //     $(".flyer-layout-content").empty().append("<div class = 'loading-home'>首页数据正在疯狂计算中......</div>");
        // }
        if (href === "#index") {
            return false;
        }
        if (!$(this).parent().hasClass("not_link")) {
            location.hash = "#" + href && href.substring(0, href.lastIndexOf('.'));
        }
        // $(".flyer-layout-content").load(href);//这个方法重复导致重复载入模板
        var $links = $(".flyer-layout-tree .flyer-layout-link");
        $links.removeClass("flyer-layout-linkActive");
        $(".myFolderUl li").removeClass("flyer-layout-linkActive");
        $(this).addClass("flyer-layout-linkActive");
        if ($(this).data('href') === 'unfinish.html') {
            // 有新邮件的时候，点击之后，会取消提示颜色
            $('[data-href="unfinish.html"] span').css('background-color', '#2cc3a9');
            // 如果hash没有发生变化的话，需要去重新加载表格
            if (window.location.hash === '#unfinish' && $('[data-href="unfinish.html"] span').data('newemail')) {
                $(".flyer-layout-content").load(core.url + "/html/unfinish.html");
            }
        }
        //超管的话，隐藏邮件的搜索功能
        if (core.getUserGroups().orgCode === '9103') {
            $('.searchForm').hide().off('keyup').off('click');
        }

    });
}

function hashListen() {
    var reg = /#[^?]+/ig,
        mchValue = location.hash.match(reg);
    if (mchValue && mchValue.length > 0) {
        var hashValue = mchValue[0].replace("#", ""),
            $links = $(".flyer-layout-tree").find(".flyer-layout-link");
        if (hashValue.length > 0 && hasPermission(hashValue)) {
            if (flyer.i18n.languageObj) {
                $(".flyer-layout-content").load(core.url + "/html/" + hashValue + ".html", function () {
                    //获取语言包
                    flyer.i18n.initTargetData();
                    changeWindowTitle();
                });
            } else {
                flyer.i18n.initData().then(function () {
                    $(".flyer-layout-content").load(core.url + "/html/" + hashValue + ".html", function () {
                        //获取语言包
                        flyer.i18n.initTargetData();
                        changeWindowTitle();
                    });
                }, function (err) {
                    flyer.msg(flyer.i18n.initTitle('加载出错'));
                });
            }
            $links.removeClass("flyer-layout-linkActive");
            $links.prevObject.find("[data-href='" + hashValue + ".html']").addClass("flyer-layout-linkActive");
        }
    } else {
        core.loadPage("#home");
    }
    if (/#my_folder/.exec(window.location.hash)) {
        $(".myFolderUl li:not(:last)").removeClass("flyer-layout-linkActive");
    }
}

function hasPermission(hashValue) {
    var roles = $("#__roles").val();
    if (roles.length > 0) {
        roles = JSON.parse(roles);
        if (roles && roles instanceof Array) {
            var result = roles.find(function (item) {
                return item.toLowerCase() === hashValue.toLowerCase();
            });
            return result ? true : false;
        }
    }
    return false;
}

Array.prototype.find = Array.prototype.find || function (fn, context) {
    if (typeof fn === "function") {
        for (var i = 0, len = this.length; i < len; i++) {
            if (fn.call(context, this[i], i, this)) {
                return this[i];
            }
        }
    }
}
window.onhashchange = function () {
    if ($ajaxObject && typeof $ajaxObject.abort === 'function') {
        $ajaxObject.abort();
    }
    flyer.closeAll('msg');
    clearInterval(flyer.timer);
    hashListen();
    setTimeout(function () {
        coverOrder();
    }, 500);
    //更改窗口的title  
}
$(window).load(function () {
    //获取语言包
    flyer.i18n.initData().then(function () {//这几个方法是包括中文的
        //关联邮箱
        // addOtherEmail();
        //我的文件夹
        addMyFolder();
        window.Guid = flyer.guid({
            data: [{ 'hash': '#home', 'images': guidData }]
        });
        //版本提示
        versionUpdate();
        //语言 
        initLanguage();
    }, function (err) {
        flyer.msg(flyer.i18n.initTitle('加载出错'));
    });
    $(".group-name").remove();
    $('<span class = "group-name">' + core.getUserGroups().groupName + '</span>').insertAfter($('.nav-top span').eq(1))
    //清掉上次的缓存
    flyer.store.remove("EmailList");
    navEvents();
    hashListen();
    bubbleData();
    core.getEmailList();

    //2min请求一次左侧参数
    // setInterval(function () {
    //     // bubbleData();
    //     // tipUserForNewEmail();
    // }, 1000 * 1 * 60);
});
/**
 * 更改窗口的title
 */
function changeWindowTitle() {
    var keyS = String(location.hash.match(/#[^?]+/ig)).replace(/[ /#]/g, '');
    //  var titleMap = {
    //     home:'首页',
    //     finish:'已处理'
    //  };
    //  var title = titleMap[keyS];
    if (keyS == "my_folder" || keyS === "folder_detail") {
        $(document).attr("title", flyer.i18n.initTitle("亚马逊客服 - 我的文件夹"));
    } else {
        var aO = $('ul.flyer-layout-tree').find(".flyer-layout-linkActive");
        var titleO = $.trim(String(aO.text()).replace(/[ /^0-9]/g, ''));
        $(document).attr("title", flyer.i18n.initTitle("亚马逊客服 - ") + titleO);
    }
}
//气泡参数获取
function bubbleData() {
    $.ajax({
        // url: 'http://acfs.aukeyit.com/status_data_list',
        url: '/status_data_list',
        method: 'get',
        data: {
            orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
            user_id: window.Number($("#__userid").val()),
            orgCode: core.getUserGroups().orgCode,
            time: window.Date.parse(new Date()),
            username: $("#__email").val()
        },
        success: function (data) {
            // 判断是否有新邮件(有则提示用户)

            switch (data) {
                case "logout":
                    //退出登录
                    flyer.closeAll("open");
                    $(".flyer-modal").remove();
                    flyer.open({
                        pageUrl: "",
                        isModal: true,
                        title: flyer.i18n.initTitle("退出登录"),
                        content: '<div style="text-align:center">' + flyer.i18n.initTitle("账号已退出登录,点击确定重新登录") + '</div>',
                        btns: [
                            {
                                text: flyer.i18n.initTitle('确定'),
                                skin: "",
                                click: function () {
                                    window.location.href = "/logout";
                                }
                            }
                        ],
                        cancel: function () {
                            window.location.href = "/logout";
                        }
                    });
                    break
                case "change":
                    //退出登录
                    flyer.closeAll("open");
                    $(".flyer-modal").remove();
                    flyer.open({
                        pageUrl: "",
                        isModal: true,
                        title: flyer.i18n.initTitle("退出登录"),
                        content: '<div style="text-align:center">' + flyer.i18n.initTitle("账号已切换,点击确定重新登录") + '</div>',
                        btns: [
                            {
                                text: flyer.i18n.initTitle('确定'),
                                skin: "",
                                click: function () {
                                    window.location.href = "/logout";
                                }
                            }
                        ],
                        cancel: function () {
                            window.location.href = "/logout";
                        }
                    });
                    break
                default:
                    tipUserForNewEmail(parseInt(data.undisposed), parseInt($('[data-href="unfinish.html"] span').html()));
                    // 未处理
                    $('[data-href="unfinish.html"] span').html(data.undisposed);
                    $(".top-untreated-num").html(data.undisposed);
                    // 已处理
                    $('[data-href="finish.html"] span').html(data.disposed);
                    // 未分配
                    $('[data-href="unassigned.html"] span').html(data.unassigned);
                    //已分配
                    $('[data-href="assigned.html"] span').html(data.assigned);
                    //已解决
                    $('[data-href="resolved.html"] span').html(data.resolved);
                    break
            }
        },
        error: function (err) {
            throw new Error(err);
        }
    });
}
// 过滤关键字
flyer.sensitive = {
    //获取关键字
    getSensitive: function () {
        //需要屏蔽的关键字
        $.ajax({
            url: '/get_sensitive_word',
            timeout: 1000 * 60,
            data: {
                orgGroupId: core.getUserGroups().orgGroupId
            },
            success: function (res) {
                var sensitiveText = [];
                if (res.total && res.data.length) {
                    sensitiveText = res.data.map(function (item) {
                        return item.name;
                    }) || [];
                    // 判断是否含有敏感词
                }
                if (res.responseFail) {
                    console.info(flyer.i18n.initTitle("服务器错误导致无法获取关键字"));
                }
                //获取关键字并进行存储
                flyer.store.set("sensitive" + JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'], JSON.stringify(sensitiveText));
            },
            error: function (err) {
                //错误的时候存入空值避免报错
                console.log(flyer.i18n.initTitle("关键词请求:") + err);
                //获取关键字并进行存储
                flyer.store.set("sensitive" + JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'], JSON.stringify([]));
            },
            complete: function (data) {
                // console.log("关键词请求结束");
            }
        });
    },
    //验证关键字
    filterSensitive: function (content, callback) {
        var sensitive = flyer.store.get("sensitive" + JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId']) && JSON.parse(flyer.store.get("sensitive" + JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId']));
        var containSensitive = [];
        var speacwords = [];
        content = content.replace(/<.*?>/g, ' ').replace(/&nbsp;/g, ' ');
        if (sensitive && sensitive.length) {
            // 先排除用空格分割的敏感词词组
            $.each(sensitive, function (index, item) {
                if (/^(\w+\s+.)/.test(item)) {
                    speacwords.push(item);
                }
            });
            $.each(speacwords, function (index, item) {
                try {
                    if (new RegExp(flyer.sensitive.escapeRegExp(item)).test(content)) {
                        containSensitive.push(item);
                    }
                } catch (error) {
                    flyer.msg(flyer.i18n.initTitle('你添加的敏感词不合规范'));
                }
            });
            $.ajax({
                type: 'post',
                url: core.url + '/filter_text_by_sensitives?nocache=' + new Date().getTime(),
                data: {
                    text: content
                },
                timeout: 1000 * 60 * 3, //设置请求超时3分钟
                success: function (res) {
                    if (res.success) {
                        var words = res.data;
                        if (words.length) {
                            for (var i = 0; i < sensitive.length; i++) {
                                try {
                                    var filterReg = new RegExp('^' + flyer.sensitive.escapeRegExp(sensitive[i]) + '$', 'g');
                                    for (var j = 0; j < words.length; j++) {
                                        if (filterReg.test(words[j])) {
                                            containSensitive.push(sensitive[i]);
                                            continue;
                                        }
                                    }
                                } catch (error) {
                                    flyer.msg(error);
                                }
                            }
                            if (typeof callback === "function") {
                                callback(containSensitive);
                            }
                        } else {
                            callback(containSensitive);
                        }
                    } else {
                        flyer.msg(res.message);
                    }
                },
                error: function (error) {
                    flyer.msg(error.message);
                }
            });
        } else if (typeof callback === "function") {
            callback(containSensitive);
        }
    },
    // 将用户输入转义为正则表达式中的一个字面字符串,
    escapeRegExp: function (string) {
        //$&表示整个被匹配的字符串
        return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$&");
    }
}
//获取关键字并进行存储
// flyer.store.set("sensitive" + JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'], JSON.stringify(flyer.sensitive.getSensitive()));
flyer.sensitive.getSensitive();
// 判断是否有新邮件，有的话，提示用户
function tipUserForNewEmail(newMount, oldMount) {
    if (!isNaN(oldMount) && oldMount !== '#' && newMount > oldMount) {
        // 切换颜色，提示用户查看消息
        var color = '#f27068', messageWindow = $('');
        $('[data-href="unfinish.html"] span').css('background-color', color).data('newemail', true);
        // generateTipWindow({});
    }
}
/**
 * 生成一个新邮件消息提示框
 * 
 * @param {any} options  提示框的各项参数，包括但不限于，登录用户名，发件人名称等
 */
function generateTipWindow(options) {
    var tipWindowId = "message-alert", template = '<div id="' + tipWindowId + '" style="display:none;">'
        + '<div class="message-alert-head">'
        + '<span>' + flyer.i18n.initTitle("您有一封新的邮件！") + '</span>'
        + '<i class="fa fa-times"></i>'
        + '</div>'
        + '<div class="message-alert-body">'
        + '<h5>' + flyer.i18n.initTitle("尊贵的用户") + '</h5>'
        + '<h6>亲爱的[AukeyIt@aukeys.com]</h6>'
        + '<p>' + flyer.i18n.initTitle("你收到一封来自用户[surong@aukeys.com]发来的邮件，请查收！") + '</p>'
        + '</div>'
        + '<div class="message-alert-foot">'
        + '<button class="flyer-btn flyer-btn-blue" id="flyer-btn-view">' + flyer.i18n.initTitle("立即查看") + '</button>'
        + '</div>'
        + '</div>', $template = null;
    destoryTipWindowById(tipWindowId);
    $('body').append(template);
    $template = $('#' + tipWindowId);
    $template.show(500);
    // 事件绑定
    // 立即查看
    $template.on('click', 'button#flyer-btn-view', function (event) {
        // viewEmailDetailById();
        var params = "?exportKey=unfinish&subject_num=" + window.escape(options.subject_num || '20171015171112298327');
        core.loadPage("#frame", params);
        $('[data-href="unfinish.html"] span').css('background-color', '#2cc3a9');
        destoryTipWindowById(tipWindowId);
        return false;
    });
    // 关闭
    $template.on('click', 'i.fa-times', function (event) {
        destoryTipWindowById(tipWindowId);
        return false;
    });
}
/**
 * 销毁一个用户新邮件通知提示框
 * 
 * @param {any} id 提示框的id
 */
function destoryTipWindowById(id) {
    if (id && $('#' + id).length) {
        $('#' + id).hide(500).remove();
    }
}
// 搜索按钮点击事件
$('#searchEamilByKeywordBtn').off('click').on('click', function () {
    let keyword = window.encodeURIComponent($('#searchEamilByKeywordInp').val().trim());//搜索关键字
    if (!keyword) {
        return false;
    }
    core.loadPage('#search_result', '?keyword=' + keyword);
});
// enter触发搜索
$(document).keypress(function (e) {
    let event = e || window.event;
    if (event.keyCode === 13) {
        $('#searchEamilByKeywordBtn').trigger('click');
    }
});
//ajax加载中提示
flyer.loading = {
    // 初始化进度条   
    init: function (element) {
        this.$element = element || $(".table-container");
        return this;
    },
    //添加进度条
    add: function () {
        var icon = $('<div class = "loading-backgroud" style="position:fixed;top:50%;left:50%;width:80px;height:80px;z-index:1000;"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i></div>');
        this.delete();
        icon.appendTo(this.$element);
        return this;
    },
    //删除进度条
    delete: function () {
        this.$element.find(".loading-backgroud").remove();
        return this;
    }
};


//导航
flyer.guid = function (options) {
    var Guid = {
        tpl: '<ul class = "slide-container"><div class = "circle-container"></div><i class="fa fa-chevron-left prev" aria-hidden="true"></i><i class="next fa fa-chevron-right" aria-hidden="true"></i></ul>',
        module: '<li><img></img></li>',
        circle: '<li></li>',//翻页圆圈待完善
        index: 1,
        opt: options,
        urlAll: options.data,
    };
    Guid.run = function () {
        $(".guid-entrance-icon").click();
    }
    //插入显示icon
    if (options) {
        insertIcon();
        //初始化事件
        initEvent();
    }
    function initEvent() {
        //icon点击事件
        $(".guid-entrance-icon").off("click").on("click", function () {
            initOpt();
            Guid.opt = options;
            Guid.isShow = true;
            flyer.open({
                pageUrl: '',
                isModal: true,
                area: [1000, 400],
                title: flyer.i18n.initTitle("操作指引"),
                content: Guid.tpl,
                btns: [
                    {
                        text: flyer.i18n.initTitle('关闭'),
                        skin: "",
                        click: function () {
                            this.close();
                            Guid.isShow = false;
                        }
                    }
                ]
            });
            if (initShowImg()) {
                //初始化按钮状态
                initBtnStatus();
                //左右切换事件
                $('.prev').off("click").on("click", function () {
                    if (Guid.index > 1) {
                        Guid.index--;
                        if (Guid.index >= 1) {
                            switchShow();
                        }
                    }
                    initBtnStatus();
                });
                $('.next').off("click").on("click", function () {
                    if (Guid.urlNow && Guid.index < Guid.urlNow.length) {
                        Guid.index++;
                        if (Guid.urlNow && Guid.index <= Guid.urlNow.length) {
                            switchShow();
                        }
                    }
                    initBtnStatus();
                });
            }
        });
        ifShow() ? Guid.run() : false;
    }
    function insertIcon() {
        var guidicon = $('<span class="top-untreated" ><span>' + flyer.i18n.initTitle("未处理邮件") + '</span><span class="top-untreated-num">#</span></span><span class = "guid-entrance-icon" title = "操作指引"><i class="icon-hint"></i></span>');
        guidicon.insertBefore($(".login").children(":first")).on("click", toUnfinish);;
        $(".top-untreated-num").html($('label[data-i18nkey="未处理邮件"]').next().html());
        $(".guid-entrance-icon").css({
            right: '6px',
            'top': '2px',
            position: 'relative'
        });
        var language = $('<div class = "i18n-container flyer-btn"></div>');
        language.insertBefore($(".top-untreated"));
        $(".i18n-container").css({
            right: '6px',
            top: '0px',
            position: 'relative',
            padding: '0px',
            width: '58px'
        });
    }
    function initBtnStatus() {
        if (Guid.index === 1) {
            $(".prev").addClass("disabled");
            $(".next").removeClass("disabled");
        } else if (Guid.index === Guid.urlNow.length) {//最后一页
            $(".prev").removeClass("disabled");
            $(".next").addClass("disabled");
        } else {
            $(".prev").removeClass("disabled");
            $(".next").removeClass("disabled");
        }
        if (Guid.urlNow.length === 1) {
            $(".next,.prev").addClass('disabled');
        }
    }
    function initShowImg() {
        if (filterHash()) {
            $(".slide-container li").remove();
            $.each(Guid.urlNow, function (index, obj) {
                var li = $(Guid.module);
                $(".slide-container").append(li);
                li.find('img').attr('src', obj);
                if (index === 0) {
                    li.addClass('active').fadeIn();
                    // $(".slide-container .guid-content").html(Guid.urlNow[0]['content']);
                }
            });
            return true;
        } else {
            //暂无引导
            var li = $(Guid.module).html('该模块暂无引导').css({ 'color': '#2cc3a9', 'zIndex': 30, 'textAlign': 'center', 'opacity': 1 });
            $(".slide-container").append(li);
            $(".next,.prev").addClass('disabled');
            return false;
        }
    }
    function filterHash() {
        return Guid.urlNow = Guid.urlAll[0]['images'];
    }
    //切换展示图片
    function switchShow() {
        var index = Guid.index - 1;
        $(".slide-container .active").fadeOut().removeClass('active');
        $(".slide-container li").eq(index).addClass('active').fadeIn();
        initBtnStatus();
        // $(".slide-container .guid-content").html(Guid.urlNow[Guid.index-1]['content']);
    }
    //初始化参数
    function initOpt() {
        Guid.index = 1;
        Guid.urlNow = '';
        Guid.isShow = false;
    }
    //是否第一次以及是否更新判断
    function ifShow() {
        var guid = 'guid' + $("#__userid").val();
        if (!(window.localStorage[guid])) {
            window.localStorage[guid] = true;
            return true;
        } else {
            return false;
        }
    }
    return Guid;
}
var guidData = [];
switch (core.getUserGroups().orgCode) {
    case '9102':
        guidData = ['../imgs/start.png', '../imgs/home_ma.png', '../imgs/add_tpl_ma.png', '../imgs/tpl_list_ma.png',
            '../imgs/send_emai_ma.png', '../imgs/unfinish_ma.png', '../imgs/finish_ma.png', '../imgs/unassign_ma.png', '../imgs/assign_ma.png',
            '../imgs/sensitive.png', "../imgs/change_signs.png", "../imgs/my_folder.png", "../imgs/receiving_email_rules.png", "../imgs/other_email.png"];
        break
    case '9101':
        guidData = ['../imgs/start.png', '../imgs/home_se.png',
            '../imgs/send_email_se.png', '../imgs/unfinish_se.png', '../imgs/finish_se.png',
            '../imgs/change_signs_se.png', '../imgs/my_folder_se.png'];
        break
    default:
        guidData = ['../imgs/start.png', '../imgs/home_ma.png', '../imgs/add_tpl_ma.png', '../imgs/tpl_list_ma.png',
            '../imgs/send_emai_ma.png', '../imgs/unfinish_ma.png', '../imgs/finish_ma.png', '../imgs/unassign_ma.png', '../imgs/assign_ma.png', '../imgs/sensitive.png'];
        break
}

//版本号更新提示
function versionUpdate() {
    var version = window.localStorage['version' + $("#__userid").val()];
    if (!(version && JSON.parse(version).version === $(".version-icon").text())) {
        //如果没有弹操作指引
        if (!window.Guid.isShow) {
            window.Guid.run();
        }
        $(".version-icon .version-update").show();
        //弹出操作指引
        window.localStorage['version' + $("#__userid").val()] = JSON.stringify(
            {
                version: $(".version-icon").text()
            }
        );

    } else {
        $(".version-icon .version-update").hide();
    }
}
//版本号详情
$(".footer-brand").on("click", function () {
    flyer.open({
        pageUrl: '',
        isModal: true,
        area: [500, 300],
        title: flyer.i18n.initTitle("版本更新说明"),
        content: $("#__VersionDesc").val(),
        btns: [
            {
                click: function () {
                    $(".footer-brand .version-update").hide();
                    this.close();
                },
                text: flyer.i18n.initTitle('关闭')
            }
        ],
        cancel: function () {
            $(".footer-brand .version-update").hide();
        }
    });
})
//给我的文件夹添加结构
function addMyFolder() {
    var myfolder = $('<span class="myFolder not_link"><span class="flyer-layout-link"><i class="icon-my-folder" aria-hidden="true"></i><label>' + flyer.i18n.initTitle("我的文件夹") + '</label></span>');
    myfolder.insertAfter($('[data-href="change_signs.html"]').parent()).append("<ul class='myFolderUl'></ul>");
    getFolder();
    $('.myFolder .flyer-layout-link').on("click", function () {
        $(".myFolderUl").toggle(100);
        if (/#my_folder/.exec(window.location.hash)) {
            setTimeout(function () {
                $(".manageFile a").addClass("flyer-layout-linkActive");
                $(".myFolderUl").prev().removeClass("flyer-layout-linkActive");
            }, 100)
        }
        setTimeout(function () {
            if (/#folder_detail/.exec(window.location.hash)) {
                $('[data-typeid=' + flyer.getQueryString("type_id") + ']').addClass("flyer-layout-linkActive");
                $(".myFolderUl").prev().removeClass("flyer-layout-linkActive");
            }
        }, 100);
        if ($(".tree-shrink").width() != 180) {
            $(".tree-shrink").removeClass("transform-shrink");
            $(".flyer-layout-tree").removeClass("small-tree");
            $("section.flyer-layout-content").removeClass("big-content");
        } else {
            return;
        }
    })
}
function getFolder(callback) {
    $.ajax({
        url: '/file_list',
        method: 'get',
        data: {
            depa_id: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
            orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
            orgCode: core.getUserGroups().orgCode,
            create_by_id: window.Number($("#__userid").val())
        },
        success: function (data) {
            $(".myFolderUl").empty().hide();
            if (/#my_folder/.exec(window.location.hash)) {
                $(".myFolderUl").show();
                setTimeout(function () {
                    $(".manageFile a").addClass("flyer-layout-linkActive");
                }, 100)
            }
            if (/#folder_detail/.exec(window.location.hash)) {
                $(".myFolderUl").show();
                setTimeout(function () {
                    $('[data-typeid=' + flyer.getQueryString("type_id") + ']').addClass("flyer-layout-linkActive");
                }, 100)
            }
            //初始化用户文件夹列表
            data['rows'] && $.each(data['rows'], function (index, obj) {
                var li = $('<li data-typeID=' + obj.ID + '>' + obj.type_name + '</li>');
                $(".myFolderUl").append(li);
            });
            $(".myFolderUl").append($('<li class = "manageFile"><a class = "flyer-layout-link" data-href="my_folder.html">' + flyer.i18n.initTitle('管理文件夹') + '</a></li>'));
            //如果是客服的话需要隐藏按钮
            if (core.getUserGroups().orgCode === '9101') {
                $(".myFolderUl li:last").hide();
            }
            flyer.folders = data['rows'];
            //如果是客服不需要新增文件夹
            if (core.getUserGroups().orgCode !== '9101') {
                flyer.folders.push(
                    {
                        ID: 'add',
                        type_name: flyer.i18n.initTitle("新增文件夹"),
                    }
                );
            }
            $(".myFolderUl li:not(:last)").off('click').on('click', function () {
                //跳转单个文件夹详情页面
                var params = "?exportKey=my_folder&type_id=" + $(this).data("typeid");
                //加上选中状态
                $(this).siblings().add(".manageFile a").removeClass("flyer-layout-linkActive");
                $(this).addClass("flyer-layout-linkActive");
                core.loadPage("#folder_detail", params);
            })
            $(".manageFile").off('click').on('click', function () {
                $(this).siblings().removeClass("flyer-layout-linkActive")
            })
            if (flyer.updateFolders) {
                flyer.updateFolders();
            }
            if (callback && typeof callback === 'function') {
                callback();
            }
        },
        error: function (err) {
            throw new Error(err);
        }
    })
}

//给其他邮箱添加结构
function addOtherEmail() {
    $(".flyer-layout-tree").find("a[data-href='other_email.html']").parents("li").addClass("otherEmail");
    $("li.otherEmail").append("<ul id='myFolderUl'></ul>");
    getOtherMail();
}
function getOtherMail() {
    $.ajax({
        url: "/select_other_account_list",
        method: "get",
        data: {
            user_id: window.Number($("#__userid").val()),
            time: window.Date.parse(new Date()),
            depa_ids: JSON.parse(window.unescape($("#__groupsAll").val())).map(function (obj, index) {
                return obj.orgGroupId
            }),
        },
        success: function (data) {
            addMailList(data);
        },
        error: function (err) {
            throw new Error(err);
        }
    });
}
function addMailList(data) {
    $("#myFolderUl").empty();
    $.each(data.rows, function (index, obj) {
        var other_email = '<li data-id=' + obj.ID + ' title=' + obj.account_name + ' data-email = ' + obj.account + '>' + obj.account_name + '</li>'
        $("#myFolderUl").append(other_email);
        if (window.location.hash !== '#other_email' && window.location.hash !== '#other_email_detail') {
            $("#myFolderUl").hide();
        }
    })
    //给单个邮箱绑定点击查看详情事件
    $('.otherEmail #myFolderUl').on("click", "li", function (e) {
        var event = window.event || e;
        event.stopPropagation();
        var _this = $(this);
        //跳转页面
        var params = "?email=" + _this.data('email');
        core.loadPage("#other_email_detail", params);
        //列表颜色控制
        $(this).siblings().css('color', '#777').end().css('color', '#2cc3a9').parent().prev().removeClass('flyer-layout-linkActive');
    })
    $('.flyer-layout-tree li.otherEmail').off('click').on("click", function () {
        if (!$(this).is('.otherEmail') && !$(this).is('#myFolderUl li')) {
            $("#myFolderUl").hide();
        } else {
            $("#myFolderUl").show();
        }
    });
}

var initSelectBoxByRuleObj = {
    /**
     * 初始化下拉框，根据不同的角色
     * 
     * @param {any} options 额外的配置参数
     * @returns 返回实例化之后的参数对象
     */
    initSelectBoxByRule: function (Init, exports, options) {
        var comboboxObj = {};
        options = options || {};
        comboboxObj.email_address = flyer.combobox($(".mutiple-select:first"), {
            isMulti: true,
            placeholder: flyer.i18n.initTitle('邮箱名'),
            allowSearch: false,
            selectAll: false,
            data: JSON.parse($("#__AccountList").val()).map(function (obj, index) {
                return {
                    value: obj['ID'],
                    text: obj['mail_address']
                }
            }),
            fnSelected: function (now, _this, datas) {
                //存储选中邮箱数据
                exports.email_choiced = datas.fieldValue.split(";");
                //刷新表格数据
                if (Init && Init.initTable) {
                    Init.initTable();
                }
            }
        });
        //初始化处理人下拉菜单,判断角色
        if (core.getUserGroups().orgCode !== '9101') {
            if (options.hashName !== 'unassigned') {
                comboboxObj.email_assigner = flyer.combobox($(".mutiple-select").eq(1), {
                    isMulti: true,
                    selectAll: false,
                    placeholder: flyer.i18n.initTitle('处理人'),
                    allowSearch: false,
                    url: '/email_assigner?org_category_id=' + JSON.parse(window.unescape($("#__groups").val()))[0]['categoryId']
                        + '&org_group_id=' + JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                    fnDataProcessing: function () {
                        this.data = this.data.map(function (obj, index) {
                            return {
                                value: obj['user_id'],
                                text: window.decodeURIComponent(obj['name'])
                            }
                        });
                    },//每次选取要重新获取数据
                    fnSelected: function (now, _this, datas) {
                        //存储选中的处理人信息
                        exports.assigner_choiced = datas.fieldKey.split(";");
                        //请求相应的表格数据
                        if (Init && Init.initTable) {
                            Init.initTable();
                        }
                    }
                });
            }
        }
        //初始化文件夹下拉框
        flyer.updateFolders = function () {
            comboboxObj.folders = flyer.combobox($(".mutiple-select:last"), {
                isMulti: false,
                url: flyer.folders ? '' : '/file_list?depa_id=' + JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'] + '&orgCode=' + core.getUserGroups().orgCode + '&orgGroupId=' + JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'] + '&create_by_id=' + window.Number($("#__userid").val()),
                placeholder: flyer.i18n.initTitle('归类为'),
                allowSearch: false,
                selectAll: false,
                i18n: 'rangeFolder',
                data: flyer.folders ? flyer.folders.map(function (obj, index) {
                    return {
                        value: obj['ID'],
                        text: obj['type_name']
                    }
                }) : [],
                fnDataProcessing: function () {
                    var folders = this.data.rows;
                    if (core.getUserGroups().orgCode !== '9101') {
                        folders.push(
                            {
                                ID: 'add',
                                type_name: flyer.i18n.initTitle("新增文件夹")
                            }
                        );
                    }
                    this.data = folders.map(function (obj, index) {
                        return {
                            value: obj['ID'],
                            text: obj['type_name']
                        }
                    });
                },
                fnSelected: function (now, _this, datas) {
                    //划分到文件夹
                    if (datas.fieldKey === 'add') {
                        addFold();
                    } else {
                        if ($('tbody input:checked').length === 0) {
                            flyer.msg(flyer.i18n.initTitle("请至少选择一封邮件进行操作"));
                        } else {
                            if (/;/.exec(datas.fieldValue)) {
                                moveToFolder(datas.fieldValue.split(";")[0], datas.fieldKey);
                            } else {
                                moveToFolder(datas.fieldValue, datas.fieldKey);
                            }
                        }
                    }
                }
            })
        }
        flyer.updateFolders();
        // 移动相关邮件到文件夹
        function moveToFolder(name, id) {
            $.ajax({
                url: '/update_email_file',
                method: 'get',
                data: {
                    fileID: options.choicedData('subject_num'),
                    userID: window.Number($("#__userid").val()),
                    time: window.Date.parse(new Date()),
                    type_id: id,
                    type_name: name,
                    depa_id: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                    userName: $("#__username").val()
                },
                success: function (data) {
                    flyer.msg(flyer.i18n.initTitle("操作成功"));
                    //刷新左侧菜单
                    window.getFolder();
                    //刷新气泡参数
                    window.bubbleData();
                    //刷新表格
                    Init.initTable(Init.pageNumber);
                    window.getFolder();
                    //刷新文件夹气泡参数
                    if (flyer.getQueryString('type_id')) {
                        core.getBubbleCount();
                    }
                },
                error: function (err) {
                    throw new Error(err);
                }
            });
        }
        // 添加文件夹
        function addFold() {
            //更新文件夹名称弹出框
            flyer.open({
                pageUrl: '/html/add_folder.html',
                isModal: true,
                area: [400, 120],
                title: flyer.i18n.initTitle("新增文件夹"),
                btns: [
                    {
                        click: function () {
                            var floderName = $(".folder_name").val().trim(), user_id = window.Number($("#__userid").val());
                            //提交文件名
                            if (floderName.length > 10 || floderName.length === 0) {
                                flyer.msg(flyer.i18n.initTitle("文件夹名称长度在10个字符以内且不为空"));
                            } else {
                                addFoldData(floderName, user_id);
                                this.close();
                            }
                        },
                        text: flyer.i18n.initTitle('保存')
                    },
                    {
                        click: function () {

                            this.close();
                        },
                        text: flyer.i18n.initTitle('关闭')
                    }
                ]
            });
            function addFoldData(floderName, user_id) {
                $.ajax({
                    url: '/ifContainFile',
                    data: {
                        fileName: floderName,//新的名称
                        depa_id: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                        time: window.Date.parse(new Date()),
                    },
                    success: function (data) {
                        if (data['count'] === 0) {
                            $.ajax({
                                url: '/add_filetype',
                                method: 'get',
                                data: {
                                    type_name: floderName,
                                    create_by_name: $("#__username").val(),
                                    depa_id: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                                    time: window.Date.parse(new Date()),
                                },
                                success: function (data) {
                                    flyer.msg(flyer.i18n.initTitle("操作成功"));
                                    //刷新菜单
                                    //刷新左侧菜单
                                    window.getFolder();
                                },
                                error: function (err) {
                                    throw new Error(err);
                                }
                            })
                        } else {
                            flyer.msg(flyer.i18n.initTitle("文件夹已经存在"))
                        }
                    },
                    error: function (err) {
                        throw new Error(err);
                    }
                });
            }
        }
        return comboboxObj;
    }
};
//点击头部的未处理跳转到未处理页面
// BTN2.addEventListener('click', () => {
//     BTN1.onclick(); //按钮2点击后触发按钮1的onclick
//     //BTN1.click(); //按钮2点击后触发按钮1的click 效果一样
// });
window.onload = function () {
    addShrink();
    shrinkNum();
    setTimeout(function () {
        coverOrder();
    }, 500);
    setTimeout(function () {
        addLine()
    }, 2000);
    $(".tree-shrink").on("click", shrinkSize);
}
//添加抽缩的按钮
function addShrink() {
    var shrink = $("<p class='tree-shrink'><i class='fa fa-bars'></i></p>")
    shrink.insertBefore($(".flyer-layout-tree"));
}
//点击改变tree的宽
function shrinkSize() {
    if ($(this).width() == 180) {
        $(this).addClass("transform-shrink");
        $(".flyer-layout-tree").addClass("small-tree");
        $("section.flyer-layout-content").addClass("big-content");
        flyer.store.set("shrinkNum", JSON.stringify({
            expand: false
        }));
    } else {
        $(this).removeClass("transform-shrink");;
        $(".flyer-layout-tree").removeClass("small-tree");
        $("section.flyer-layout-content").removeClass("big-content");
        flyer.store.set("shrinkNum", JSON.stringify({
            expand: true
        }));
    }
};
function shrinkNum() {
    var expand = JSON.parse(flyer.store.get("shrinkNum") || "{\"expand\":false}");
    if (expand.expand) {
        $(".flyer-layout-tree").removeClass("small-tree");
        $(".tree-shrink").removeClass("transform-shrink");
        $("section.flyer-layout-content").removeClass("big-content");
    } else {
        $(".flyer-layout-tree").addClass("small-tree");
        $(".tree-shrink").addClass("transform-shrink")
        $("section.flyer-layout-content").addClass("big-content");
    }
}
//点击头部未处理跳转到未处理页面
function toUnfinish() {
    $("a.flyer-layout-link[data-href='unfinish.html']").click();
}
//遮挡住相关订单
function coverOrder() {
    var cover = $("<div id='coverOrder'></div>")
    cover.insertBefore($("#nomatch"));
}
//当没有新建订单的时候去除上面的横线
function addLine() {
    var liL = $(".newFolder").find("ul li").length;
    if (liL > 1) {
        $(".newFolder").find("ul li[data-key='add']").addClass("line");
    }
    else {
        return;
    }
}
/**
 * 附件预览功能
 * @param  {String} thisRow 当前选中预览元素按钮
 */
function previewFile(thisRow) {
    var _this = this;
    flyer.open({
        pageUrl: '',
        isModal: true,
        area: [800, 400],
        title: flyer.i18n.initTitle('附件预览'),
        content: window.previewTpl($(thisRow).data('md5name')),
        btns: [
            {
                click: function () {
                    this.close();
                },
                text: flyer.i18n.initTitle('关闭')
            }
        ]
    });
}

/**
 * 创建元素
 * 
 * @param {any} src 
 * @param {any} backupsrc 
 * @param {any} type 
 * @returns 
 */
function generateEmbedElement(src, backupsrc, type) {
    var e = document.createElement(type);
    e.setAttribute('src', src);
    e.setAttribute('id', 'preveImg');
    e.setAttribute('alt', flyer.i18n.initTitle("资源不存在"));
    e.className = 'flyer-preview';
    e.onerror = function () {
        e.onerror = null;
        $('#preveImg').attr('src', backupsrc);
    }
    return $(e).wrapAll('<div>').parent().html()
}

/**
 * 生成附件预览模板，根据数据源
 * 
 * @param {any} src 数据源
 * @returns 返回预览模板字符串
 */
function previewTpl(src) {
    var localPreviewSrc = '/upload/' + src,
        localPreviewSrcBackup = '/data/AmazonCustomer_fatchemail/src/upload/' + src,
        localPreviewEmbedHtml = generateEmbedElement(localPreviewSrc, localPreviewSrcBackup, 'embed'),
        localPreviewImgHtml = generateEmbedElement(localPreviewSrc, localPreviewSrcBackup, 'img'),
        netPreviewSrc = 'https://docs.google.com/gview?url=http://' + location.host + '/upload/' + src + '&embedded=true',
        netPreviewSrcBackup = 'https://docs.google.com/gview?url=http://' + location.host + '/data/AmazonCustomer_fatchemail/src/upload/' + src + '&embedded=true',
        netPreviewEmbedHtml = generateEmbedElement(netPreviewSrc, netPreviewSrcBackup, 'embed');
    switch (src.split('.')[1].toLowerCase()) {
        case 'pdf':
            return localPreviewEmbedHtml
            break
        case 'png':
            return localPreviewImgHtml
            break
        case 'jpg':
            return localPreviewImgHtml
            break
        case 'jpeg':
            return localPreviewImgHtml
            break
        case 'txt':
            return localPreviewEmbedHtml
            break
        case 'html':
            return localPreviewEmbedHtml
            break
        case 'doc':
            return netPreviewEmbedHtml
            break
        case 'docx':
            return netPreviewEmbedHtml
            break
        case 'xls':
            return netPreviewEmbedHtml
            break
        case 'xlsx':
            return netPreviewEmbedHtml
            break
        case 'ppt':
            return netPreviewEmbedHtml
            break
        case 'pptx':
            return netPreviewEmbedHtml
            break
    }
}

/**
 * 国际化语言切换
 * auth:yb
 * date:2017-11-27
 * params:languageKey
 */
flyer.i18n = {
    initData: function (languageType) {
        var defaultLanguage = window.localStorage[window.Number($("#__userid").val()) + 'defaultLanguage'];
        if (!defaultLanguage) {
            window.localStorage[window.Number($("#__userid").val()) + 'defaultLanguage'] = 6//默认值
        }
        var _this = this;
        return $.ajax({
            url: core.url + '/language_key_list',
            type: 'get',
            data: {
                time: window.Date.parse(new Date()),
                target: window.localStorage[window.Number($("#__userid").val()) + 'defaultLanguage'],//默认值
                notList: true
            },
            success: function (data, textStatus, jqXHR) {
                _this.data = data.rows.filter(function (obj, index) {
                    return obj.disabled.data[0]
                });
                //得到一个包含所有语言内容的对象方便后续赋值
                _this.languageObj = {};
                _this.data.forEach(function (obj, index) {
                    _this.languageObj[obj['language_key']] = obj['language_text'];
                })
            },
            error: function (jqXHR, textStatus, errorThrown) {
                flyer.log('获取语言包失败');
            }
        });
    },
    initTargetData: function initTargetData() {
        var _this = this;
        if (this.languageObj) {
            initContent();
        } else {
            this.initData().then(function () {
                initContent();
            }, function () {
                flyer.msg(flyer.i18n.initTitle('加载出错'));
            });
        }
        function initContent() {
            $(".i18n").each(function (index, obj) {
                if (($(obj).is('input') || $(obj).is('textarea')) && $(obj).prop('placeholder')) {
                    $(obj).prop('placeholder', _this.languageObj[$(obj).data('i18nkey')] || '未设置');//改变了placeholder
                } else if ($(obj).attr('title')) {
                    $(obj).attr('title', _this.languageObj[$(obj).data('i18nkey')] || '未设置');//改变title
                } else {
                    if (!$(obj).is('div')) {
                        $(obj).text(_this.languageObj[$(obj).data('i18nkey')] || '未设置');//改变了文字
                    }
                }
            })
        }
    },
    initTitle: function (content) {
        //初始化带有title的文案
        if (this.languageObj) {
            return this.languageObj[content] || '未设置';
        }
        return '未设置';
    }
}
function initLanguage() {
    flyer.combobox($('.i18n-container'), {
        isMulti: false,
        selectAll: false,
        allowSearch: false,
        url: core.url + '/language_list',
        i18n: 'language',
        defaultValue: window.localStorage[window.Number($("#__userid").val()) + 'defaultLanguage'] || '6',//先写死
        fnDataProcessing: function () {
            this.data = this.data.rows.filter(function (obj, index) {
                return obj.disabled.data[0]
            }).map(function (obj, index) {
                return {
                    value: obj['ID'],
                    text: window.decodeURIComponent(obj['language_type_name'])
                };
            });
        },//每次选取要重新获取数据
        fnSelected: function (now, _this, datas) {
            window.localStorage[window.Number($("#__userid").val()) + 'defaultLanguage'] = now.fieldKey;
            window.location.reload();
        }
    });
}