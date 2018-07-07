"use strict";
flyer.define("advanced_search", function(exports, module) {
    var AdvancedSearch = function() {
        this.HandlePeople = null;
        this.emailName = null;
    };

    // 初始化
    AdvancedSearch.prototype.init = function() {
        this.ininSelectBox();
        this.initEvent();
        this.initPage();
    };

    // 事件初始化
    AdvancedSearch.prototype.initEvent = function() {
        // 搜索

    };

    //  初始化页面元素的显示（根据不同的角色和邮件状态）
    AdvancedSearch.prototype.initPage = function() {
        if (window.location.hash === '#unassigned' || window.location.hash === '#sent_emails' || core.getUserGroups().orgCode === '9101') {
            $('.dialog-form-container-people').parents('.dialog-form-item').hide();
        }
    };

    // 初始化下拉框
    AdvancedSearch.prototype.ininSelectBox = function() {
        var that = this,
            startDate = null,
            endDate = null;
        this.clearConditions();
        // 处理人
        if (core.getUserGroups().orgCode !== '9101') {
            if (window.location.hash !== '#unassigned') {
                this.HandlePeople = flyer.combobox($('.dialog-form-container-people'), {
                    isMulti: true,
                    selectAll: false,
                    placeholder: flyer.i18n.initTitle('处理人'),
                    allowSearch: false,
                    url: core.url + '/email_assigner?org_category_id=' + JSON.parse(window.unescape($("#__groups").val()))[0]['categoryId'] +
                        '&org_group_id=' + JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                    fnDataProcessing: function() {
                        this.data = this.data.map(function(obj, index) {
                            return {
                                value: obj['user_id'],
                                text: window.decodeURIComponent(obj['name'])
                            };
                        });
                    }, //每次选取要重新获取数据
                    fnSelected: function(now, _this, datas) {}
                });
            }
        }
        // 邮箱名
        this.emailName = flyer.combobox($('.dialog-form-container-email'), {
            isMulti: true,
            placeholder: flyer.i18n.initTitle('邮箱名'),
            allowSearch: false,
            selectAll: false,
            data: JSON.parse($("#__AccountList").val()).map(function(obj, index) {
                return {
                    value: obj['ID'],
                    text: obj['mail_address']
                }
            }),
            fnSelected: function(now, _this, datas) {}
        });
        // 开始时间
        startDate = flyer.date($('#dialog-form-container-startTime'), {
            //最大允许选择的时间范围
            isTime: false,
            format: 'yyyy-mm-dd',
            choose: function(dateStr, dateObj) {
                // endDate.setMinDate(dateStr);
                return false;
            }
        });
        // 结束时间
        endDate = flyer.date($('#dialog-form-container-endTime'), {
            //最大允许选择的时间范围
            isTime: false,
            format: 'yyyy-mm-dd',
            choose: function(dateStr, dateObj) {
                // startDate.setMaxDate(dateStr);
                return false;
            }
        });
    };

    // 获取查询条件
    AdvancedSearch.prototype.getConditions = function() {
        var resultObj = Object.create({}), //返回给服务端的查询条件
            resultObjText = ''; //返回给客户端的查询条件
        // 处理人
        if (advancedSearch.HandlePeople) {
            resultObj.people = advancedSearch.HandlePeople.getSelectedValue().split(';').filter(function(item) {
                return item !== 'undefined' && item;
            });
            resultObj.peopleText = advancedSearch.HandlePeople.getSelectedText().split(';').filter(function(item) {
                return item !== 'undefined' && item;
            });
            if (resultObj.peopleText.length) {
                resultObjText = flyer.i18n.initTitle('处理人') + '[' + resultObj.peopleText + ']';
            }
        }
        // 邮箱名
        if (advancedSearch.emailName) {
            resultObj.emailName = advancedSearch.emailName.getSelectedText().split(';').filter(function(item) {
                return item !== 'undefined' && item;
            });
            if (resultObj.emailName.length) {
                resultObjText += '，' + flyer.i18n.initTitle('邮箱名') + '[' + resultObj.emailName + ']';
            }
        }
        // 开始时间
        if ($('.dialog-form-container-startTime').length) {
            resultObj.startDate = $('.dialog-form-container-startTime').val().trim();
        }
        if (resultObj.startDate) {
            resultObjText += '，' + flyer.i18n.initTitle('开始时间') + '[' + resultObj.startDate + ']';
        }
        // 结束时间
        if ($('.dialog-form-container-endTime').length) {
            resultObj.endDate = $('.dialog-form-container-endTime').val().trim();
        }
        if (resultObj.endDate) {
            resultObjText += '，' + flyer.i18n.initTitle('结束时间') + '[' + resultObj.endDate + ']';
        }
        // 关键字
        if ($('.dialog-form-container-search input[name=keyword]').length) {
            resultObj.keyword = $('.dialog-form-container-search input[name=keyword]').val().trim().replace(/\?/, '？');
        }
        if (resultObj.keyword) {
            resultObjText += '，' + flyer.i18n.initTitle('关键字') + '[' + resultObj.keyword + ']';
        }
        return {
            resultObj: resultObj,
            resultObjText: resultObjText.replace(/^，/, ' ')
        };
    };

    // 清空查询条件
    AdvancedSearch.prototype.clearConditions = function() {
        if (advancedSearch.HandlePeople) {
            advancedSearch.HandlePeople.empty();
        }
        if (advancedSearch.emailName) {
            advancedSearch.emailName.empty();
        }
        $('.dialog-form-container-endTime').val('');
        $('.dialog-form-container-startTime').val('');
        $('.dialog-form-container-search input[name=keyword]').val('');
        this.startDate = null;
        this.endDate = null;
    };

    var advancedSearch = new AdvancedSearch();
    advancedSearch.init();
    // 暴露接口
    exports.getConditions = advancedSearch.getConditions;
    exports.clearConditions = advancedSearch.clearConditions;
});