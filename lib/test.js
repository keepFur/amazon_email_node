"use strict";
var htmlToText = require('html-to-text');

var text = htmlToText.fromString('<a href="www.baidu.com">Hello World</a>', {
    format: {
        anchor: function (elem, fn, options) {
            var h = fn(elem.children, options);
            return '====\n' + h + '\n====';
        }
    }
});

console.log(text);