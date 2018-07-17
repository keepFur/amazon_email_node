"use strict";
$(function() {
    /**
     * 首页入口函数
     */
    function init() {
        initEvent();
        loadPageByUrl(getPageUrlByHash());
        core.menuHeightLightByHash(window.location.hash.replace('#', '') || 'home');
        $('.flyer-layout-tree').height(window.innerHeight - 164);
    }

    /**
     * 事件初始化函数
     */
    function initEvent() {
        // 导航栏点击事件
        $(".flyer-layout-tree").on("click", ".flyer-layout-link", function() {
            var pageUrl = $(this).data("url") || 'home.html';
            var pageHash = $(this).data('hash') || 'home';
            var $links = $(".flyer-layout-tree .flyer-layout-link");
            $links.removeClass("flyer-layout-linkActive");
            $(this).addClass("flyer-layout-linkActive");
            setDocumentTitle($(this).data('pagename'));
            core.setWindowHash(pageHash);
        });

        // window hashChange事件
        window.onhashchange = function() {
            var url = getPageUrlByHash();
            triggerHomeClick(window.location.hash);
            loadPageByUrl(url);
        };

        // window的resize事件
        window.onresize = function() {
            $('.flyer-layout-tree').height(window.innerHeight - 164);
        };

        // 版本更新信息点击事件
        $(".footer-brand").on("click", function(event) {
            flyer.open({
                isModal: true,
                area: [500, 300],
                title: '版本更新说明',
                content: $(".footer-brand").data('updatecontent'),
                btns: [{
                    click: function() {
                        this.close();
                    },
                    text: '关闭'
                }]
            });
        });
    }

    /**
     * 根据页面的hash值获取页面的地址
     * @param {string} hash 页面的hash值
     * @return {string} 返回一个页面的地址
     */
    function getPageUrlByHash(hash) {
        hash = hash || window.location.hash;
        return !hash ? 'html/home.html' : 'html/' + hash.replace('#', '') + '.html';
    }

    /**
     * 加载指定的页面地址内容到容器中
     * @param {string} pageUrl 页面的地址
     * @param {jqobject} $container 内容容器
     */
    function loadPageByUrl(pageUrl, $container) {
        $container = $container || $('.flyer-layout-content');
        $.ajax({
            url: pageUrl,
            success: function(res) {
                $container.html(res);
            },
            error: function(error) {
                triggerHomeClick();
                $.writeLog('index-loadPage', '没有找到[' + getPageUrlByHash() + ']页面');
            }
        });
    }

    /**
     * 设置文档的title属性以及面包屑导航
     * @param {string} title title值
     */
    function setDocumentTitle(title) {
        document.title = '易店科技 - ' + title;
        $('.js-nav-text').text(title);
    }

    /**
     * 触发home菜单的点击事件
     */
    function triggerHomeClick(hash) {
        hash = hash.replace('#', '') || 'home';
        $('.flyer-layout-tree').find(`a[data-url='${hash}.html']`).click();
    }

    init();
});