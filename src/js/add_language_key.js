'use strict';
flyer.define('language_key_manage', function (exports, module) {
    function init(){
        initLanguageList();
    }
    function initLanguageList(){
        exports.languageList = flyer.combobox($('.public-butModal-language'), {
            isMulti: false,
            selectAll: false,
            placeholder: ((flyer.i18n && flyer.i18n.initTitle('语言'))|| '语言'),
            allowSearch: false,
            url: core.url + '/language_list?',
            fnDataProcessing: function () {
                this.data = this.data.rows.filter(function (obj, index) {
                    return obj.disabled.data[0]
                }).map(function(obj,index){
                    return {
                        value: obj['ID'],
                        text: window.decodeURIComponent(obj['language_type_name'])
                    };
                });
            },//每次选取要重新获取数据
            fnSelected: function (now, _this, datas) {
            }
        });
    }
    init();
})