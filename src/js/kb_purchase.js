"use strict";
layui.use(['form', 'element'], function () {
    var form = layui.form;
    (function init() {
        form.render('select');
        form.render('radio');
    })();
});