"use strict";
flyer.define("maillog_search", function (exports, module) {
    var AdvancedSearch = function () {
    };

    // 获取查询条件
    AdvancedSearch.prototype.getConditions = function () {
        var resultObj = Object.create({}),//返回给服务端的查询条件
            resultObjText = '';//返回给客户端的查询条件
        // 邮件ID
        if ($('#mailID').length) {
            resultObj.mailID = $('#mailID').val().trim().replace(/\?/, '？');
        }
        if (resultObj.mailID) {
            resultObjText += '，邮件ID[' + resultObj.mailID + ']';
        }
        // 操作用户
        if ($('#userName').length) {
            resultObj.userName = $('#userName').val().trim().replace(/\?/, '？');
        }
        if (resultObj.userName) {
            resultObjText += '，操作用户[' + resultObj.userName + ']';
        }
        // 操作内容
        if ($('#content').length) {
            resultObj.content = $('#content').val().trim().replace(/\?/, '？');
        }
        if (resultObj.content) {
            resultObjText += '，操作内容[' + resultObj.content + ']';
        }
        return {
            resultObj: resultObj,
            resultObjText: resultObjText.replace(/^，/, ' ')
        };
    };

    var advancedSearch = new AdvancedSearch();
    // 暴露接口
    exports.getConditions = advancedSearch.getConditions;
});
