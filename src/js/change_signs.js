"use strict";
flyer.define("change_signs", function () {
    function init(){

        getAllGroups();
        var htmls = render();
        $(".change-signs-groups").html(htmls);
        initEvent();
    }

    //得到分组的数据
    function getAllGroups(){
        var data = window.unescape($("#__groupsAll").val());
        data = JSON.parse(data);
        return data;
    }

    //渲染页面
    function render(){
        var htmls = [],
            data = getAllGroups(),
            curGroup = core.getUserGroups();
        for(var i=0,len=data.length;i<len;i++){
            htmls.push('<div data-id="'+data[i].orgGroupId+'" class="change-signs-group'+(curGroup.orgGroupId === data[i].orgGroupId?" active":"")+'">'+data[i].groupName+'</div>');
        }

        return htmls.join("");
    }

    //加载元素事件
    function initEvent(){
        $(".change-signs-groups").find(".change-signs-group").off("click").on("click",function(){
            var orgGroupId = $(this).data("id");
            $.getJSON("/change_group?orgGroupId="+orgGroupId,function(data){
                if(data.code === 200 ){
                    flyer.cookie.set("orgGroupId"+$("#__email").val(),orgGroupId);
                    location.reload();
                }else{
                    flyer.msg(data.msg);
                }
            });
        });
    }
    $("#changeGrope").html(core.getUserGroups().groupName);
    init();
});