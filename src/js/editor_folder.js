"use strict";
flyer.define("editor_folder", function (exports, module) {
    function init(){
        //填充原始名称
        $(".folder_name_origin").val(flyer.exports.my_folder.editorIndex['type_name']);
        //填充原始选中状态
        $('[name="mail-aging"]').prop('checked',flyer.exports.my_folder.editorIndex['is_KPI']['data'][0])
    }
    init();
});

