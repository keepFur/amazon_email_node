"use strict";
const cheerio = require('cheerio');
function flyer() {
  this.version = "v0.1.0";
}
/**
* 格式化日期,format是格式化的格式，date是要格式化的日期
* @param {any} format 
* @param {any} date 
* @returns 
*/
flyer.prototype.formatDate = function (format, date) {
  if (typeof format !== "string") {
    format = "yyyy-mm-dd hh:MM:ss";
  }
  date = this.getDate(date);
  return format
    .replace(/yyyy/gi, date.year)
    .replace(/mm/, this.fullTime(date.month))
    .replace(/dd/gi, this.fullTime(date.day))
    .replace(/hh/gi, this.fullTime(date.hours))
    .replace(/MM/, this.fullTime(date.minutes))
    .replace(/ss/gi, this.fullTime(date.seconds));
};
/**
* 根据参数返回年月日时分秒对象,为空则返回当前时间
* @param {any} date 
* @returns 
*/
flyer.prototype.getDate = function (date) {
  date = this.isString(date) ? new Date(date) : (date || new Date());
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds()
  }
};

flyer.prototype.getDomainInEmail = function (email) {
  if (this.isString(email)) {
    return email.substring(email.indexOf("@") + 1);
  }
  this.log("warn", "getDomainInEmail:>Is not a valid email address.")
  return "";
}

/**
             * 判断是否是 Array 对象
             * 
             * @param {any} obj 
             */
flyer.prototype.isArray = function (obj) {
  return obj instanceof Array;
}

//邮件默认的类型值
flyer.prototype.getEmailDefaultType = function () {
  return 0;
}

/**
* 
* 判断是否是 string 对象
* @param {any} obj 
* @returns 
*/
flyer.prototype.isString = function (obj) {
  return typeof obj === "string";
}

flyer.prototype.getDomainInUrl = function (url) {
  let reg = /domains\/[^\/]*/ig,
    regValue = url.match(reg);

  if (regValue && regValue.length > 0) {
    return regValue[0].replace("domains/", "");
  }
  return "";
}

//得到Stored时间
flyer.prototype.getStoredTimer = function (str) {
  str = String(str);
  var isNeedParse = str.lastIndexOf('.') >= 0 ? true : false;
  if (isNeedParse) {
    str = parseFloat(str) * 1000;
  } else {
    str = parseFloat(str);
  }
  return this.formatDate("yyyy-mm-dd hh:MM:ss", new Date(parseFloat(str)));
}

//获得邮件地址
flyer.prototype.getEmailAddress = function (str) {
  let reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/ig;
  return str.match(reg);
}

//获得邮箱别名
flyer.prototype.getEmailName = function (str) {
  let reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/ig,
    value = str.replace(reg, "").replace("<>", "");
  return value.length > 0 ? value : str;
}


//获得邮件名称
flyer.prototype.getEmailName = function (str) {
  let reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/ig;
  str = str.replace(reg, "");
  return str.replace(/[<>;]*/ig, "");
}

//得到一个guid值
flyer.prototype.getGUID = function () {
  return this.formatDate("yyyymmddhhMMss") + Math.floor(Math.random() * 10000000);
}

//通过一个文件路径得到文件名
flyer.prototype.getFileNameOnPath = function (strPath) {
  const path = require('path');
  let strSeparator = process.platform === "linux" ? "/" : "\\";
  return path.join(strPath).substr(strPath.lastIndexOf(strSeparator) + 1)
}

/**
* 
* 填充时间,判断时间是否是十位数，不是则前位补0
* @param {any} time 
* @returns 
*/
flyer.prototype.fullTime = function (time) {
  return time >= 10 ? time : ("0" + time);
};

flyer.prototype.return_promise = function (pool, cmdText, cmdParams) {
  return new Promise(function (resolve, reject) {
    try {
      pool.getConnection(function (err, connection) {
        if (err) {
          reject(err);
        } else {
          connection.query(cmdText, cmdParams, function (err, result) {
            if (err) {
              flyer.prototype.log(err);
              reject(err);
            } else {
              resolve(result);
            }

          });
        }
        if (connection) {
          connection.release();
        }
      });
    } catch (err) {
      this.log(err);
    }
  });
};
flyer.prototype.return_promise_Transaction = function (
  pool,
  cmdText,
  cmdParams,
  argument
) {
  return new Promise(function (reSolve, reJect) {
    if (/^replace/.exec(cmdText)) {
      argument.poccessFun(
        argument.mailgun,
        cmdParams[0],
        123456,
        argument.domain
      ).then(function (data) {
        pool.getConnection(function (err, connection) {
          if (err) {
            reJect(err);
          } else {
            //两步操作
            connection.query(cmdText, cmdParams, function (err, result) {
              if (err) {
                reJect(err);
              } else {
                reSolve(data);
              }
            });
          }
        });
      }, function (err) {
        reJect(err);
      });
    } else if (/^update/.exec(cmdText)) {
    } else if (/^delete/.exec(cmdText)) {
      var poccessFun = argument.poccessFun(argument.mailgun, argument.user.split("@"), argument.domain);
      poccessFun.then(function (data) {
        if (data) {
          pool.getConnection(function (err, connection) {
            if (err) {
              reJect(err);
            } else {
              //两步操作
              connection.query(cmdText, cmdParams, function (err, result) {
                if (err) {
                  reJect(err);
                } else {
                  reSolve(result);
                }
              });
            }
          });
        } else {
          reSolve(false);
        }
      }, function (err) {
        //这里用来清除历史无效数据
        pool.getConnection(function (err, connection) {
          if (err) {
            reJect(err);
          } else {
            //两步操作
            connection.query(cmdText, cmdParams, function (err, result) {
              if (err) {
                reJect(err);
              } else {
                reSolve(result);
              }
            });
          }
        });
      });
    }
  });
};

/**
* 在控制台输入信息，可自定义打印消息类型
* 
* @param {any} type 
* @param {any} msg 
*/
flyer.prototype.log = function (type, msg) {
  if (typeof console) {
    var args = Array.prototype.slice.call(arguments);
    if (args.length === 1) {
      msg = type;
      console.log(this.formatDate(new Date()) + ":" + msg);
    } else if (args.length > 1) {
      console[type](this.formatDate(new Date()) + ":" + msg);
    }
  }
}

/**
 * 较正邮件内容正文,按指定的需求输出
 */
flyer.prototype.justEmailHtml = function (text, html) {

  text = clearRemark(text);
  if (text.length === 0 || text === "null" || text === "undefined") {
    let bodyStart = html.search(/<body[^>]*>/ig),
      bodyEnd = html.search(/<\/body>/ig);

    if (bodyStart > -1 && bodyEnd > -1) {
      html = html.replace(html.substring(0, bodyStart), "");
      html = html.replace(html.substring(bodyEnd), "");
    }
    text = html.trim();
    text = clearRemark(text);
    return text;
  } else {
    return text;
  }
}

//清掉附带的备注
function clearRemark(text) {

  //英文 US
  text = text.replace(/For Your Information:[^\n]+not be transmitted./ig, "");
  text = text.replace(/We want you to buy with confidence anytime you purchase products on Amazon.com. Learn more about Safe Online Shopping[^\n]+/ig, "");
  text = text.replace(/To mark this message as no response needed, click here: http:[^\n]+/ig, "");
  text = text.replace(/If you believe this message is suspicious, please report it to us here: http:[^\n]+/ig, "");
  text = text.replace(/To mark this message as no response needed, click here:[^\n]+/ig, "");
  text = text.replace(/\[commMgrTok:[^\]]+\]/ig, "");
  text = text.replace(/A[\w\s\r\n]*Amazon.com./ig, "");
  text = text.replace(/Was this email helpful?[\n]*http[^\n]+/ig, "");

  //德文 DE
  text = text.replace(/Wichtiger Hinweis:[^\n]+diesem Vorgehen einverstanden[\.]*/ig, "");
  text = text.replace(/Wir möchten, dass Sie stets mit Vertrauen einkaufen, wenn[^\)]+/ig, "");
  text = text.replace(/\) und unsere Garantie für den sicheren Einkauf[^\)]+\)[\.]*/ig, "");
  text = text.replace(/Wenn Sie glauben, dass diese Nachricht ein Betrugsversuch sein könnte,[^\]]+/ig, "");
  text = text.replace(/Um anzugeben, dass für diese Nachricht keine Antwort erforderlich ist, klicken Sie hier:[^\]]+/ig, "");

  //法文 FR
  text = text.replace(/[>]*Important :[^\n]+ces conditions\./ig, "");
  text = text.replace(/[>]*Faites vos achats sur Amazon.fr en toute confiance. En savoir plus sur l’achat en ligne sécurisé[^\)]+/ig, "");
  text = text.replace(/\) et sur notre garantie d’achat sécurisé http[^\]]+\)\./ig, "");
  text = text.replace(/[>]*Si vous trouvez ce message suspicieux, merci de nous le faire savoir ici[^\]]+/ig, "");
  text = text.replace(/[>]*Pour marquer ce message comme ne nécessitant pas de réponse, cliquez ici[^\]]+/ig, "")

  //英国 UK
  text = text.replace(/For Your Information:[^\n]+using this method./ig, "");
  text = text.replace(/Important[\s]*:[^\n]+card transactions./ig, "");
  text = text.replace(/We want you to buy with confidence whenever you purchase products on Amazon.co.uk. Learn more about Safe Online Shopping[^\]]+/ig, "");
  text = text.replace(/\) and our safe buying guarantee[^\]]+\)\./ig, "");
  text = text.replace(/\) safe buying guarantee.[^\]]+/ig, "");
  text = text.replace(/这封电子邮件有帮助吗？ https:[^\]]+=/ig, "");

  //西班牙 ES
  text = text.replace(/Nota informativa:[^\]]+dicho filtro./ig, "");
  text = text.replace(/Cada vez que realices una compra en Amazon.es[^\]]+\)\./ig, "");
  text = text.replace(/Si desconfías del contenido de este mensaje,[^\]]+/ig, "");
  text = text.replace(/Para marcar este mensaje e indicar que no requiere respuesta[^\]]+/ig, "");

  //意大利 IT
  text = text.replace(/Nota informativa:[^\]]+saranno trasmessi./ig, "");
  text = text.replace(/La sicurezza dei tuoi acquisti su Amazon.it è il nostro primo obiettivo. Per maggiori informazioni su come[^\]]+/ig, "");
  text = text.replace(/Se questo messaggio ti sembra sospetto, ti preghiamo di segnalarcelo qui[^\]]+/ig, "");
  text = text.replace(/Per contrassegnare che questo messaggio non richiede una risposta, clicca qui:[^\]]+/ig, "");

  text = text.replace(/-{5,} [^-]+ -{5,}/ig, "").trim();
  text = text.replace(/(<!--[^>]+>)|(<![^-]+-->)|<[\/]*xml[^>]*>|<w:[^>]+>[^<]*<\/w:[^>]+>/ig, "");
  let regIndex = text.search(/[>]*On[^<]+<[\s\r\n]*\[[^\]]+\]>\s*wrote:/g);

  if (regIndex < 0) {
    regIndex = text.search(/<div class="flyer-write-title">/ig);
  }

  if (regIndex < 0) {
    regIndex = text.search(/[>]*[\s]*Am [^<]*<[\s\r\n]*\[[^\]]+\]>:/g);
  }

  if (regIndex < 0) {
    regIndex = text.search(/[>]*[\s]*From:[\s\n\r]*[^<]*<[\s\r\n]*\[[^\]]+\]>/g);
  }

  if (regIndex < 0) {
    regIndex = text.search(/[>]*Von:[\r\s\n]*[^-]*-[\r\n\s]*Amazon[\r\s\n]*Payments[\r\s\n]*<\[[^\]]+\]>/g);
  }

  if (regIndex < 0) {
    regIndex = text.search(/[>]*Le.+Marketplace d'Amazon.fr a écrit/g);
  }

  if (regIndex < 0) {
    regIndex = text.search(/[>]*Le[^-]*-[\r|\n|\s]*Marketplace[\r|\s|\n]*d'Amazon.fr[\r\s\n]*<[\s\r\n]*\[[^\]]+\]>/g);
  }

  if (regIndex < 0) {
    regIndex = text.search(/[>]*El [^<]+<[\s\r\n]*\[[^\]]+\]>\s*escribió:/ig);
  }

  if (regIndex < 0) {
    regIndex = text.search(/[>]*Il\s[^-]+-[\s]+Marketplace Amazon[\s]+<[\s\r\n]*\[[^\]]+\]>\s*ha scritto:/g);
  }

  regIndex = regIndex < 0 ? text.length : regIndex;

  let bodyText = text.substring(0, regIndex),
    reText = text.substring(regIndex);
  bodyText = addLinks(bodyText);
  reText = addLinks(reText);

  bodyText = bodyText.replace(/[\r\n]{1,}/ig, "<br/>");
  bodyText = bodyText.replace(/(class|style)=\"[^"]+\"/ig, "");
  reText = reText.replace(/[\r\n]{1,}/ig, "<br/>");

  return bodyText + (reText.length > 0 ? ("<div class=\"expandBtn\">...</div><div class='flyer-email-recored'>" + reText + "</div>") : "");
}

//给所有的http添加上链接
function addLinks(text) {
  let links = text.match(/[http|https]+:\/\/[^\s]*/ig);
  if (links instanceof Array) {
    links.forEach(function (item) {
      text = text.replace(item, `<a target='_blank' class='email-text-link' href='${item}'>${item}</a>`);
    });
  }
  return text;
}

function getRegValue(reg, text) {
  let str = text.match(reg);
  if (str && str.length > 0) {
    str = str[0];
  } else {
    str = "";
  }
  return str;
}

function getStringIndex(value) {
  if (value < 0) {
    return 0;
  }
}

function hasSubstring(start, end, text) {
  if (start < 0) {
    start = 0;
  }

  if (end < 0) {
    end = text.length;
  }

  text = text.substring(start, end);

  if (text.search(/<o:pixelsperinch>96<\/o:pixelsperinch>/ig) < 0) {
    text = "<pre>" + text + "</pre>";
  }
  return text.replace(/<o:pixelsperinch>96<\/o:pixelsperinch>/ig, "");
}

/**
 * 将对象进行深copy
 */
flyer.prototype.deepCopy = function (source) {
  let result = {};
  for (var key in source) {
    result[key] = typeof source[key] === 'object' ? this.deepCopy(source[key]) : source[key];
  }
  return result;
}

/**
 * 通过orgGroupID得到指定的权限
 *
 */
flyer.prototype.findPermissionByGroupID = function (orgGroupId, permissionData) {
  orgGroupId = parseInt(orgGroupId);
  let newPermissionData = this.deepCopy(permissionData),
    findGroup = permissionData.data.groups.find(function (group) { return group.orgGroupId === orgGroupId; }),
    findMenu = permissionData.permission.menus.find(function (menu) { return menu.orgGroupId === orgGroupId; }),
    findRole = permissionData.permission.roles.find(function (role) { return role.orgGroupId === orgGroupId; });
  if (findGroup) {
    newPermissionData.data.groups = [];
    newPermissionData.data.groups.push(findGroup);
    newPermissionData.permission.menus = [];
    newPermissionData.permission.menus.push(findMenu);
    newPermissionData.permission.roles = [];
    newPermissionData.permission.roles.push(findRole);
  } else {
    newPermissionData.data.groups = [];
    newPermissionData.data.groups.push(permissionData.data.groups[0]);
    newPermissionData.permission.menus = [];
    newPermissionData.permission.menus.push(permissionData.permission.menus[0]);
    newPermissionData.permission.roles = [];
    newPermissionData.permission.roles.push(permissionData.permission.roles[0]);
  }
  return newPermissionData;

}
module.exports.flyer = new flyer();
