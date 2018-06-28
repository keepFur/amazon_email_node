"use strict";
flyer.define("template_choice", function (exports, module) {
    var init = function () {
        this.initList();
    };
    init.prototype.initList = function (pageNumber) {
        $.ajax({
            url: core.url + "/templateList",
            method: "get",
            data:{
                orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                time:window.Date.parse(new Date())
            },
            success: function (data) {
                var templates = data.rows;
                //生成模板结构
                createTpl(templates);
                //存储当前页数据
                exports.templateChioce = templates;
            },
            error: function (err) {
                var templates = null;
                createTpl(templates);
                throw new Error(err);
            }
        })
    };
    //判断是否生成结构
    function createTpl(templates){
        //初始化
        $(".template-container").empty();
        if(templates && templates.length !==0){
            templates.forEach(addTpl);
            tplEvent();
        }else{
            //提示没有数据
            $("<p>"+flyer.i18n.initTitle("暂无数据")+"</p>").appendTo($(".template-container"))
        }
        //国际化
        flyer.i18n && flyer.i18n.initTargetData();
    }
    //添加结构
    function addTpl(obj,index){
        var content = window.decodeURIComponent(obj.content);
        content = content.replace(/<[^>]*>|[\s\t]*/ig, "");
        var template = $('<div class = "temp"><h2><span>'+flyer.i18n.initTitle("标题：")+'</span>'+ obj.title +'</h2></br><div class = "template-content">'+ content +'</div><div class = "template-attachment"><span>'+flyer.i18n.initTitle("附件")+'</span>('+ JSON.parse(obj.attachment).length +')</div><i class="fa fa-check-circle-o" aria-hidden="true"></i></div>');
        template.appendTo($(".template-container"));
    }
    function tplEvent(){
        $(".template-container").on("click",".temp",function(){
            // var event = window.event || arguments.collee.caller.arguments[0];
            // event.stopPropagation();
            $(".template-container i").not($(this).find('i')).removeClass("active");
            $(this).find("i").toggleClass('active');
        })
    }
    var Init = new init();
});
