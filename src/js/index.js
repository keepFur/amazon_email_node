"use strict";
// 定义一个ajax请求对象实例，如果hash发生改变的时候，就终止上一次的请求
var $ajaxObject = {};

function navEvents() {
    $(".flyer-layout-tree").off("click").on("click", ".flyer-layout-link", function() {
        var href = $(this).data("href");
        if (href === "#index") {
            return false;
        }
        if (!$(this).parent().hasClass("not_link")) {
            location.hash = "#" + href && href.substring(0, href.lastIndexOf('.'));
        }
        var $links = $(".flyer-layout-tree .flyer-layout-link");
        $links.removeClass("flyer-layout-linkActive");
        $(".myFolderUl li").removeClass("flyer-layout-linkActive");
        $(this).addClass("flyer-layout-linkActive");
    });
}

function hashListen() {
    var reg = /#[^?]+/ig,
        mchValue = location.hash.match(reg);
    if (mchValue && mchValue.length > 0) {
        var hashValue = mchValue[0].replace("#", ""),
            $links = $(".flyer-layout-tree").find(".flyer-layout-link");
        if (hashValue.length > 0 && hasPermission(hashValue)) {
            changeWindowTitle();
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
    return true;
}
window.onhashchange = function() {
    if ($ajaxObject && typeof $ajaxObject.abort === 'function') {
        $ajaxObject.abort();
    }
    flyer.closeAll('msg');
    clearInterval(flyer.timer);
    hashListen();
    setTimeout(function() {
        coverOrder();
    }, 500);
}
$(window).load(function() {
    navEvents();
    hashListen();
});
/**
 * 更改窗口的title
 */
function changeWindowTitle() {
    var keyS = String(location.hash.match(/#[^?]+/ig)).replace(/[ /#]/g, '');
    var aO = $('ul.flyer-layout-tree').find(".flyer-layout-linkActive");
    var titleO = $.trim(String(aO.text()).replace(/[ /^0-9]/g, ''));
    $(document).attr("title", '亚马逊客服 - ' + (titleO || '首页'));
}

// 搜索按钮点击事件
$('#searchEamilByKeywordBtn').off('click').on('click', function() {
    let keyword = window.encodeURIComponent($('#searchEamilByKeywordInp').val().trim()); //搜索关键字
    if (!keyword) {
        return false;
    }
    core.loadPage('#search_result', '?keyword=' + keyword);
});

// enter触发搜索
$(document).keypress(function(e) {
    let event = e || window.event;
    if (event.keyCode === 13) {
        $('#searchEamilByKeywordBtn').trigger('click');
    }
});

//ajax加载中提示
flyer.loading = {
    // 初始化进度条   
    init: function(element) {
        this.$element = element || $(".table-container");
        return this;
    },
    //添加进度条
    add: function() {
        var icon = $('<div class = "loading-backgroud" style="position:fixed;top:50%;left:50%;width:80px;height:80px;z-index:1000;"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i></div>');
        this.delete();
        icon.appendTo(this.$element);
        return this;
    },
    //删除进度条
    delete: function() {
        this.$element.find(".loading-backgroud").remove();
        return this;
    }
};

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
        window.localStorage['version' + $("#__userid").val()] = JSON.stringify({
            version: $(".version-icon").text()
        });

    } else {
        $(".version-icon .version-update").hide();
    }
}
//版本号详情
$(".footer-brand").on("click", function() {
    flyer.open({
        pageUrl: '',
        isModal: true,
        area: [500, 300],
        title: flyer.i18n.initTitle("版本更新说明"),
        content: $("#__VersionDesc").val(),
        btns: [{
            click: function() {
                $(".footer-brand .version-update").hide();
                this.close();
            },
            text: flyer.i18n.initTitle('关闭')
        }],
        cancel: function() {
            $(".footer-brand .version-update").hide();
        }
    });
});


// 点击头部的未处理跳转到未处理页面
window.onload = function() {
    addShrink();
    shrinkNum();
    $(".tree-shrink").on("click", shrinkSize);
};
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