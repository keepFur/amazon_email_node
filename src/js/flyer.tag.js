"use strict";
/***
 *@Name: []
 *@Author: []
 *创建于日期：[]
 *@Site : http://www.flyerui.com
 *@License：MIT
 ***/
flyer.extend("tag", function (selector, options) {

    //定义一个Tab 页签组件
    // selector 分页组件完成后要装入的容器
    // options 分页组件时要定制的属性
    function Tag(selector, options) {
        return this.init(selector, options);
    }
    //定义 Tab 页签的样式集合
    var styles = [];

    //默认的定制属性集合
    Tag.DEFAULT = {

    }

    Tag.prototype = {

        //加载 Tab 页签组件的入口
        init: function (elm, options) {

            //拼装 Tab 页签定制属性
            this.options = $.extend(true, {}, Tag.DEFAULT, options);

        }
    }
    return new Tag(selector, options);
});