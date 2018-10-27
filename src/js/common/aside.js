(function ($) {
    // 缓存的key
    var asideStatusKey = 'asiderStatus';
    // 展开状态
    var spread = 'SPREAD';
    // 收缩状态
    var shrink = 'SHRINK';

    // 入口
    function init() {
        initEvent();
        setEleStyleByStatus(getAsideStatus() === shrink);
    }

    // 事件初始化，为按钮绑定点击事件
    function initEvent() {
        $('#asideToggle').click(function (event) {
            // 设置状态
            var status = getAsideStatus();
            setAsideStatus(status === spread ? shrink : spread);
            setEleStyleByStatus(status === spread);
        });
    }

    // 设置元素样式，根据侧边栏状态
    function setEleStyleByStatus(status) {
        $('#asideToggle').toggleClass("transform-shrink", status);
        $(".flyer-layout-tree").toggleClass("small-tree", status);
        $(".flyer-layout-content").toggleClass("big-content", status);
        $('#asideToggle>i').toggleClass('layui-icon-spread-left', status);
        $('#asideToggle>i').toggleClass('layui-icon-shrink-right', !status);
    }

    // 设置侧边栏状态
    function setAsideStatus(status) {
        window.localStorage.setItem(asideStatusKey, status);
    }

    // 获取侧边栏状态
    function getAsideStatus() {
        // 默认是展开状态
        return window.localStorage.getItem(asideStatusKey) || spread;
    }

    init();
})(jQuery)