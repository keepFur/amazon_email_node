/*
* 用于 内容模板 模块功能的业务实现
*/
"use strict";
var DB = require("./db");
let Core = require('./core');
const htmlToText = require("html-to-text");
var filterEmail = function () {
  this.tpl = DB.dbQuery.filterEmail;
};
//获取所有的处理人
filterEmail.prototype.getAssigners = function (data, res) {
  let promise = this.tpl.getAssigners(data);
  promise.then(function (data) {
    res.send(data);
  }).catch(err => {
    Core.flyer.log('获取所有处理人出现异常：' + err.message);
  });
};
//过滤邮件
filterEmail.prototype.filterEmail = function (data, res) {
  let promise = data.sentEmail ? this.tpl.filterSentEmail(data) : this.tpl.filterEmail(data);
  promise.then(function (data) {
    var Data = {};
    Data.total = data[0][0]['count'];
    Data.rows = data[1]
    res.send(Data);
  }).catch(err => {
    Core.flyer.log('邮件过滤出现异常：' + err.message);
  });
};


function a(body) {
  console.log(htmlToText.fromString(decodeURIComponent(body), {
    wordwrap: 130,
    hideLinkHrefIfSameAsText: true,
    format: {
      anchor: function (elem, fn, options) {
        return fn(elem.children, options);
      }
    }
  }));
}
a(`%3Cp%20class%3D%22MsoNormal%22%3E%3Ca%20href%3D%22https%3A%2F%2Fdocs.google.com%2Fforms%2Fd%2Fe%2F1FAIpQLScnmEirLHSMntlJO2Vriwz8MJm9gOnCTzbdpHgNHvTPsCbIWA%2Fviewform%3Fc%3D0%26amp%3Bw%3D1%26amp%3Busp%3Dmail_form_link%22%3E%3Cu%3E%3Cspan%20class%3D%2215%22%20style%3D%22font-family%3A%20%26quot%3BTimes%20New%20Roman%26quot%3B%3B%20color%3A%20rgb(0%2C%200%2C%20255)%3B%20font-size%3A%2012pt%3B%22%3EWie%20bewerten%20Sie%20die%20Dienste%20von%20AUKEY%3F%3C%2Fspan%3E%3C%2Fu%3E%3C%2Fa%3E%3Cspan%20style%3D%22mso-spacerun%3A'yes'%3Bfont-family%3A'Times%20New%20Roman'%3Bmso-fareast-font-family%3A%E5%AE%8B%E4%BD%93%3Bcolor%3Argb(28%2C72%2C127)%3Bfont-size%3A12.0000pt%3B%22%3E%3Co%3Ap%3E%3C%2Fo%3Ap%3E%3C%2Fspan%3E%3C%2Fp%3E`);
module.exports = filterEmail;