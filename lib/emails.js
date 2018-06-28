/*
* 用于 邮件模块功能的业务实现
*/
"use strict";
let Mailgun = require("mailgun-js"),
  MailgunES6 = require("mailgun-es6"),
  Imap = require("imap"),
  inspect = require("util").inspect,
  Receive = require("./db_receive"),
  Config = require("./config"),
  EnumStatus = require("./status"),
  htmlToText = require("html-to-text"),
  Path = require("path"),
  https = require("https"),
  crypto = require("crypto"),
  queryString = require("querystring"),
  DB = require("./db"),
  Core = require("./core"),
  nodemailer = require("nodemailer"),
  RalationAccount = require("./relation_account"),
  Maillog = require('./maillog'),
  maillog = new Maillog(),
  supportEmail = require('./support_email');

MailgunES6.prototype.getInformationAll = function (offset) {

  if (offset && offset.mark) {

    return this._sendRequest("/domains", "GET", {
      queryData: {
        limit: offset.limit,
        skip: offset.skip
      }
    });

  } else if (offset) {
    return this._sendRequestl("/domains", "GET", {
      queryData: {
        limit: 15,
        skip: offset
      }
    });
  } else {
    return this._sendRequest("/domains", "GET", {
      queryData: {
        limit: 1000
      }
    });
  }
}

/**
* Gets either a list of messages or a single message from server storage. If
* no msgId is supplied, this function internally calls getEvents.
* @method getStoredMessages
* @param {String} [msgId] The ID of the single message you want to retrieve
* @param {String} [domain] An alternative domain to fetch messages from
* @return {Promise} The promise with the request results.
*/
MailgunES6.prototype.getStoredMessages = function (msgId, domain) {
  if (/^[a-zA-Z0-9\-]+\.\w+/.test(msgId) === true) {
    //I hope that msgId's don't have periods in them...
    domain = msgId;
    msgId = undefined;
  }

  let begin = new Date(Core.flyer.formatDate("yyyy-mm-dd HH:MM:59")),
    end = new Date(begin.getTime() - Config.iterance.time);
  end = new Date(Core.flyer.formatDate("yyyy-mm-dd HH:MM:00", end));

  if (typeof msgId === "undefined") {
    //Core.flyer.log("当前时间:"+begin.toUTCString() +","+ end.toUTCString());
    return this.getEvents({ event: "stored", begin: begin.toUTCString(), end: end.toUTCString() }, domain);
  } else {
    return this._sendRequest("/domains/<>/messages/" + msgId, "GET", {
      domain: domain
    });
  }
}

/**
  * Does the actual request and response handling
  * @method _sendRequest
  * @param {String} path The resource to access on Mailgun's API
  * @param {String} method The HTTP method being used
  * @param {Object} options Object containing other information needed for the request
  * @return {Promise} The promise with request results.
  * @private
  */
MailgunES6.prototype._sendRequest = function (path, method, options) {
  var form;

  //Make sure we can make a valid request.
  if (typeof path === "undefined" || typeof method === "undefined") {
    throw new Error("You need to specify both the path and method.");
  }

  //Grumble grumble grumble
  if (typeof options === "undefined") {
    options = {};
  } else if (typeof options !== "object") {
    throw new Error(
      "options needs to be an object, Kyle. Stop passing a string.\n" +
      "If you get this error, please notify me on github immediately."
    );
  }

  //Check to see if we were passed an alternative domain name
  options.domain = this._determineDomain(options.domain);
  path = path.replace("<>", options.domain);

  //Add querystring to path if we requested one
  if (options.hasOwnProperty("queryData") === true) {
    path = path + this._buildQueryString(options.queryData);
  }

  //Create HTTPS options
  var httpsOptions = this._genHttpsOptions(path, method, options.publicApi);

  //Check to see if this is a request that needs a form.
  if (options.hasOwnProperty("formData") === true) {
    form = this._buildFormData(options.formData);
  }

  //Make the request.
  return new Promise(function (resolve, reject) {
    //Make the connection
    var req = https.request(httpsOptions, function (res) {
      var data = "";
      res.setEncoding("utf8");

      res.on("data", function (newData) {
        data = data + newData;
      });

      res.on("end", function () {
        //Everything should be an object coming from Mailgun\
        if (data.length !== 0) {
          try {
            data = JSON.parse(data);
          } catch (error) {
            Core.flyer.log('JSON PARSE ERROR===>' + error);
          }
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            if (typeof reject === "function") {
              reject(data);
            } else {
              Core.flyer.log(JSON.stringify(data));
            }

          }
        } else {
          //Core.flyer.log("data.length === 0");
        }
      });
    });

    if (options.hasOwnProperty("jsonData") === true) {
      //If we're poting JSON data
      options.jsonData = JSON.stringify(options.jsonData);

      req.setHeader("Content-Type", "application/json");
      //Why? See: http://stackoverflow.com/questions/4505809/how-to-post-to-a-request-using-node-js
      req.setHeader("Content-Length", Buffer.byteLength(options.jsonData));

      req.write(options.jsonData, "utf8");
      req.end();
    } else if (form && form.dataCount > 0) {
      //If we're posting form data
      req.setHeader("Content-Type", form.contentType);
      form.submitTo(req);
    } else {
      //If we're just getting a request.
      req.end();
    }

    req.on("error", function (e) {
      reject({ message: `Problem connecting to Mailgun API. ${e}` });
    });
  });
}

let Email = function () {
  this.key = Config.mailgun.privateKey;
  this.domain = Config.mailgun.domain;
  this.publicKey = Config.mailgun.publicKey;
  this.mailgun = new MailgunES6({
    privateApi: Config.mailgun.privateKey,
    publicApi: Config.mailgun.publicKey,
    domainName: Config.mailgun.domain,
    retry: 4
  });

  //将 收到邮件类实例并挂在 emails 类中的getStoredMessages方法中，同时实例化就执行
  this.getStoredMessages();
  this.sendCount = 0;
};

//定时收取 maingun stored 中的 messages
Email.prototype.getStoredMessages = function () {
  let receive = DB.dbQuery.receive;
  receive.init(this.mailgun);
};

// 手动调整抓取邮件的时间间隔
Email.prototype.adjustReceiveEmailTime = function (req, res, time) {
  try {
    time = time || 1000 * 60 * 60 * 8;
    Config.iterance.time = time * 60 * 60 * 1000;
    res.send('操作成功，时间间隔修改为：「' + time + '」小时');
  } catch (error) {
    res.send('操作失败');
  }
};

function otherAccountSend(mailOptions, config, cmParams) {
  const params = {
    host: config.host, // 设置服务
    port: config.port, // 端口
    sercure: true, // 是否使用TLS，true，端口为465，否则其他或者568
    auth: {
      user: config.auth.user, // 邮箱和密码
      pass: config.auth.pass
    }
  }
  const transporter = nodemailer.createTransport(params)
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    sendEmailComplate(cmParams.data, cmParams.storedData, cmParams.res, cmParams.req);
  })
}

//发送邮件
Email.prototype.send = function (req, res, next) {
  //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
  //let mailgun = new MailgunES6({ apiKey: this.key, domain: this.domain });
  let attachmentList = [], attachmentData = [], fs = require('fs');

  if (req.body.fileData) {
    req.body.fileData.forEach(function (val) {
      let path = Path.join(__dirname, "../src/upload/");
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
      attachmentList.push({
        fType: "application/octet-stream",
        fLoc: Path.join(path, val.filePath)
      });
      attachmentData.push({
        name: val.fileName,
        size: val.fileSize,
        md5Name: Core.flyer.getFileNameOnPath(val.filePath)
      });
    });
  }

  let data = {
    id: req.body.id,
    from: req.body.from,
    to: req.body.to,
    subject: decodeURIComponent(req.body.subject),
    html: decodeURIComponent(req.body.body),
    //text: decodeURIComponent(req.body.text), //不再使用flyer-edit中的格式化html的方法，调用引用库中的
    text: htmlToText.fromString(decodeURIComponent(req.body.body), {
      wordwrap: 130,
      hideLinkHrefIfSameAsText: true,
      format: {
        anchor: function (elem, fn, options) {
          return fn(elem.children, options);
        }
      }
    }),
    user_id: req.body.user_id,
    user_name: decodeURIComponent(req.body.user_name),
    attachment: attachmentList,
    attachments: attachmentData
  },
    storedData = {
      tags: [],
      timestamp: new Date().getTime(),
      storage: {
        url: "",
        key: ""
      },
      log_level: 0,
      campaigns: [],
      user_variables: [],
      flags: [],
      message: {
        headers: {
          to: data.to,
          from: data.from,
          subject: data.subject
        },
        attachments: attachmentList,
        recipients: data.to,
        size: 0
      },
      event: "send",
      timer: Core.flyer.formatDate("yyyy-mm-dd hh:MM:ss")
    };

  this.mailgun.domainName = req.body.domain;
  this.domain = req.body.domain;
  let that = this;
  // 如果是support邮箱的话  使用的是java提供的接口
  if (supportEmail.checkSupport(data.from)) {
    supportEmail.sendEmailForSupport(data, function (sendResult, err) {
      if (err) {
        res.send({
          statuCode: 500,
          message: '网络错误，请刷新页面重试'
        });
      } else {
        sendEmailComplate(data, storedData, res, req);
      }
    });
  } else {
    that.mailgun.sendEmail(data, that.domain).then(function (result, reject) {
      if (result && result.id) {
        maillog.createMaillog(req, res, {
          mailID: data.id,
          userID: data.user_id,
          userName: data.user_name,
          content: 'mailgun服务器响应成功，开始写入本地数据库'
        });
        sendEmailComplate(data, storedData, res, req);
      } else {
        res.send({
          statuCode: 500,
          message: '网络错误，请刷新页面重试'
        });
      }
    }).catch(function (error) {
      Core.flyer.log(error);
      res.send({
        statuCode: 500,
        message: '网络错误，请刷新页面重试'
      });
    });
  }
};


//邮件发关完成之后
function sendEmailComplate(data, storedData, res, req) {
  data.html = encodeURIComponent(data.html);
  data.text = encodeURIComponent(data.text);

  let emialInsert = DB.dbQuery.email.insert(data);
  emialInsert.then(function (result) {
    if (result.affectedRows > 0) {
      storedData.id = data.id;
      storedData.from = Core.flyer.getEmailAddress(String(storedData.message.headers.from))[0];
      storedData.to = Core.flyer.getEmailAddress(String(storedData.message.headers.to))[0];
      storedData.subject = String(storedData.message.headers.subject).replace(/^(re:)|^(回复：)+/ig, "").trim();
      storedData.subject_num = Core.flyer.getGUID();
      DB.dbQuery.receive.insertStored(storedData).then(function (storedResult) {
        if (storedResult.affectedRows > 0) {

          //Core.flyer.log("写入Stored数据成功" + storedData.id);
          DB.dbQuery.receive.getLastStoredBySubject(storedData).then(function (statusData) {
            if (statusData.length > 0) {
              statusData = statusData[0];
            }
            let autoStatusData = getStatusData(req, statusData);
            let otData = {
              id: storedData.id,
              assigned_id: autoStatusData.assigned_id,
              assigned_name: autoStatusData.assigned_name,
              status_id: autoStatusData.status_id,
              status_name: autoStatusData.status_name,
              disposed_status_id: autoStatusData.disposed_status_id,
              disposed_status_name: autoStatusData.disposed_status_name,
              type_id: autoStatusData.type_id,
              subject_num: statusData.subject_num || Core.flyer.getGUID()
            }
            DB.dbQuery.receive.setStoredStatusById(otData).then(function (upStausResult) {
              //Core.flyer.log("更新状态成功" + storedData.id);
            }).catch(err => {
              Core.flyer.log('更新状态成功出现异常：' + err.message);
            });
          }).catch(err => {
            Core.flyer.log('获取最后一封邮通过主题信息出现异常：' + err.message);
          });
          maillog.createMaillog(req, res, {
            mailID: data.id,
            userID: data.user_id,
            userName: data.user_name,
            content: '邮件写入本地数库据完成'
          });
        }
        res.send({
          statuCode: 200
        });
      }).catch(err => {
        Core.flyer.log('邮件新增出现异常：' + err.message);
      });
    }
  }).catch(function (err) {
    Core.flyer.log('发送邮件失败：' + err.message);
    res.send({
      statuCode: 500,
      message: '网络错误，请刷新页面重试'
    });
  });
}


//自动识别状态数据
function getStatusData(req, statusData) {

  //先得到是角色分类
  let orgCode = req.body.orgCode;

  switch (orgCode) {

    //主管
    case "9102":
      {
        return {
          assigned_id: statusData.assigned_id || req.body.user_id,
          assigned_name: statusData.assigned_name || req.body.user_name,
          status_id: statusData.status_id || EnumStatus.unassigned.value,
          status_name: statusData.status_name || EnumStatus.unassigned.text,
          disposed_status_id: EnumStatus.disposed.value,
          disposed_status_name: EnumStatus.disposed.text,
          type_id: statusData.type_id
        }
      }
    //客服
    case "9101":
      {
        return {
          assigned_id: statusData.assigned_id || req.body.user_id,
          assigned_name: statusData.assigned_name || req.body.user_name,
          status_id: statusData.status_id || EnumStatus.assigned.value,
          status_name: statusData.status_name || EnumStatus.assigned.text,
          disposed_status_id: EnumStatus.disposed.value,
          disposed_status_name: EnumStatus.disposed.text,
          type_id: statusData.type_id
        }
      }
      break;
  }
}


//获取所有的mailgun账号
Email.prototype.getSmtpUsers = function (res, offset, accountName) {
  let promise = DB.dbQuery.email.getSmtpUsers(offset, accountName);
  promise.then(function (data) {
    res.send({
      total: data[0][0].count,
      rows: data[1]
    });
  }).catch(err => {
    Core.flyer.log('获取所有的mailgun账号出错：' + err.message);
    res.send({
      total: 0,
      rows: []
    });
  });
};

//添加一个Mailgun账号
Email.prototype.addSmtpUsers = function (data, res) {
  var email = this;
  let poccessFun = function (mailgun, username, password, domain) {
    var Mailgun = mailgun
    return Mailgun.addSmtpUser(username, password, domain);
  };
  let promise = DB.dbQuery.email.addSmtpUser(data, this.mailgun, poccessFun);
  promise.then(function (data) {
    if (data) {
      res.send({ 'response': true });
    }
  }, function (err) {
    if (err) {
      res.send({ 'response': false });
    }
  });
};
// 判断账号是否存在
Email.prototype.get_account_by_address = function (res, address) {
  let promise = DB.dbQuery.email.get_account_by_address(address);
  promise.then(function (data) {
    res.send(data);
  }).catch(err => {
    Core.flyer.log('判断是否存在mailgun账号出错：' + err.message);
    res.send({
      err: true
    });
  });
};

//修改一个Mailgun账号
Email.prototype.updateSmtpUsers = function (req, res, next) {
  let promise = this.mailgun.updateSmtpUser(
    req.body.userName,
    req.body.password,
    this.domain
  );
  promise.then(function (resolve, reject) {
    if (resolve) {
      res.send(resolve);
    } else if (reject) {
      res.send(reject);
    }
  }).catch(err => {
    Core.flyer.log('修改mailgun账号出错：' + err.message);
    res.send({

    });
  });
};

//删除一个Mailgun账号
// Email.prototype.deleteSmtpUser = function (username, res) {
//   var email = this;
//   let poccessFun = function (mailgun, username, domain) {
//     var Mailgun = mailgun;
//     return Mailgun.deleteSmtpUser(username[0], domain);
//   }
//   let promise = DB.dbQuery.email.deleteSmtpUser(username, username[0]['user'].split("@")[1], this.mailgun, poccessFun);
//   promise.then(function (data) {
//     if(data){
//       res.send({'response':true});
//     }
//   },function(err){
//     //删除历史无效数据
//     if(err){
//       res.send({'response':true});
//     }
//   });
// };

Email.prototype.deleteSmtpUser = function (username, res) {

  if (username.length > 0) {
    username = username[0];
    this.mailgun.deleteSmtpUser(username, domain);
  }

  var email = this;
  let poccessFun = function (mailgun, username, domain) {
    var Mailgun = mailgun;
    return Mailgun.deleteSmtpUser(username[0], domain);
  }
  let promise = DB.dbQuery.email.deleteSmtpUser(username, username[0]['user'].split("@")[1], this.mailgun, poccessFun);
  promise.then(function (data) {
    if (data) {
      res.send({ 'response': true });
    }
  }, function (err) {
    //删除历史无效数据
    if (err) {
      res.send({ 'response': true });
    }
  });
};

//添加域
Email.prototype.addNewDomain = function (newdomain, res) {
  let mailgun = this.mailgun;
  let promise = mailgun.addNewDomain(newdomain, 123123, "tag", "undefined");
  promise.then(function (resolve, reject) {
    if (resolve) {
      res.send(200);
    } else if (reject) {
      res.send(reject);
    }
  });
};

//删除域
Email.prototype.deleteDomain = function (res, deleteDomain) {
  let mailgun = this.mailgun;
  deleteDomain.forEach(function (obj, index) {
    let promise = mailgun.deleteDomain(obj);
    promise.then(function (resolve, reject) {
      if (resolve) {
        res.send(resolve);
      } else if (reject) {
        res.send(reject);
      }
    });
  });
};

//查询域
Email.prototype.getInformation = function (res, offset) {
  let mailgun = this.mailgun;
  let promise = mailgun.getInformationAll(offset);
  promise.then(function (resolve, reject) {
    if (resolve) {
      res.send(resolve);
    } else if (reject) {
      res.send(reject);
    }
  });
};

//查询已发送邮件
Email.prototype.get_post_email = function (res, data) {
  let promise = DB.dbQuery.email.select_post_email(data);
  promise.then(function (data) {
    res.send({
      total: data[0][0].count,
      rows: data[1]
    });
  }).catch(err => {
    Core.flyer.log('查询已发送邮件出错:' + err.message);
    res.send({
      total: 0,
      rows: []
    });
  });
};

//查询未处理邮件
Email.prototype.get_unfinish_email = function (res, data) {
  var promise;
  if (data.orgCode === Config.const.managerCode) {
    //主管
    promise = DB.dbQuery.email.select_unfinish_email_manager(data);
  } else {
    //客服
    promise = DB.dbQuery.email.select_unfinish_email(data);
  }
  promise.then(function (data) {
    res.send({
      total: data[0][0].count,
      rows: data[1].filter(function (item) { return item.ID !== null; })
    });
  }).catch(err => {
    Core.flyer.log('查询未处理邮件出错:' + err.message);
    res.send({
      total: 0,
      rows: []
    });
  });
};

//查询已处理邮件
Email.prototype.get_finish_email = function (res, data) {
  var promise;
  if (data.orgCode === Config.const.managerCode) {
    //主管
    promise = DB.dbQuery.email.select_finish_email_manager(data);
  } else {
    //客服
    promise = DB.dbQuery.email.select_finish_email(data);
  }
  promise.then(function (data) {
    res.send({
      total: data[0][0].count,
      rows: data[1].filter(function (item) { return item.ID !== null; })
    });
  }).catch(err => {
    Core.flyer.log('查询已处理邮件出错:' + err.message);
    res.send({
      total: 0,
      rows: []
    });
  });
};

//查询已解决邮件
Email.prototype.resolved_email_list = function (res, data) {
  var promise;
  if (data.orgCode === Config.const.managerCode) {
    //主管
    promise = DB.dbQuery.email.resolved_email_list_manager(data);
  } else {
    //客服
    promise = DB.dbQuery.email.resolved_email_list(data);
  }
  promise.then(function (data) {
    res.send({
      total: data[0][0].count,
      rows: data[1].filter(function (item) { return item.ID !== null; })
    });
  }).catch(err => {
    Core.flyer.log('查询已解决邮件出错:' + err.message);
    res.send({
      total: 0,
      rows: []
    });
  });
};
//查询未分派邮件
Email.prototype.get_unassigned_email = function (res, data) {
  let promise = DB.dbQuery.email.select_unassigned_email(data);
  promise.then(function (data) {
    res.send({
      total: data[0][0].count,
      rows: data[1].filter(function (item) { return item.ID !== null; })
    });
  }).catch(err => {
    Core.flyer.log('查询未分派邮件出错:' + err.message);
    res.send({
      total: 0,
      rows: []
    });
  });
};

//查询已分派邮件
Email.prototype.get_assigned_email = function (res, offset) {
  let promise = DB.dbQuery.email.select_assigned_email(offset);
  promise.then(function (data) {
    res.send({
      total: data[0][0].count,
      rows: data[1].filter(function (item) { return item.ID !== null; })
    });
  }).catch(err => {
    Core.flyer.log('查询已分派邮件出错:' + err.message);
    res.send({
      total: 0,
      rows: []
    });
  });
};

//查询发送邮件邮箱下拉框数据
Email.prototype.email_list = function (res, data) {
  let promise = DB.dbQuery.email.email_list(data);
  promise.then(function (data) {
    res.send(data);
  }).catch(err => {
    Core.flyer.log('查询发送邮件邮箱下拉框数据:' + err.message);
    res.send([]);
  });
};

//通过subject获取往来邮件列表
Email.prototype.subject_list = function (res, data) {
  let promise = DB.dbQuery.email.subject_list(data);
  promise.then(function (data) {
    res.send(data);
  }).catch(err => {
    Core.flyer.log('通过subject获取往来邮件列表出错:' + err.message);
    res.send([]);
  });
};

//通过ID得到单条邮件详情
Email.prototype.getStoredMessageDetailsByID = function (res, data, session) {

  let receive = DB.dbQuery.receive, _this = this;

  //1、先判断是否存在邮件数据
  //2、没有数据从mailgun里取数据
  //3、写入mailgun数据到数据库
  //4、将数据库中的数据返回到页面
  let proExist = receive.isExistMessage(data);
  proExist.then(function (resExist) {
    if (resExist.length === 0) {
      let proStored = receive.getStoredById(data);
      proStored.then(function (resStored) {
        if (resStored) {
          resStored["id"] = data.id;

          if (resStored.attachments.length > 0) {
            resStored.attachments.forEach(function (val, index) {
              resStored.attachments[index]["md5Name"] = Core.flyer.getGUID() + val.name.substr(val.name.lastIndexOf("."));
              receive.getStoredFiles(resStored.attachments[index], session);
            });
          }

          let proMessage = receive.insertMessage(resStored);
          proMessage.then(function (resMessage) {
            let proDetails = DB.dbQuery.email.getStoredMessageDetailsByID(data);
            proDetails.then(function (result) {
              if (result.length > 0) {
                _this.isQAEmail(data, result, function (flag) {
                  if (flag) {
                    result[0]["html"] = decodeURIComponent(result[0]["html"]);
                  } else {
                    result[0]["html"] = Core.flyer.justEmailHtml(decodeURIComponent(result[0]["text"]), decodeURIComponent(result[0]["html"]));
                  }
                  res.send(result);
                  result[0]["text"] = decodeURIComponent(result[0]["text"]);
                });
              }
            }).catch(err => {
              Core.flyer.log('获取邮件详情出错了：' + err.message);
              res.send([]);
            });
          }).catch(err => {
            Core.flyer.log('插入邮件信息出错：' + err.message + '，邮件详情：' + JSON.stringify(resStored));
          });
        }
      }, function (err) {
        Core.flyer.log(err);
      });
    } else {
      let proDetails = DB.dbQuery.email.getStoredMessageDetailsByID(data);
      proDetails.then(function (result) {
        if (result.length > 0) {
          // if (result[0].status_id === 3) {
          //   result[0]["text"] = encodeURIComponent(result[0]["text"]);
          // }
          _this.isQAEmail(data, result, function (flag) {
            if (flag) {
              result[0]["html"] = decodeURIComponent(result[0]["html"]);
            } else {
              result[0]["html"] = Core.flyer.justEmailHtml(decodeURIComponent(result[0]["text"]), decodeURIComponent(result[0]["html"]));
            }
            result[0]["text"] = decodeURIComponent(result[0]["text"]);
            res.send(result);
          });
        }
      }).catch(err => {
        Core.flyer.log('获取邮件详情出错了：' + err.message);
        res.send([]);
      });
    }
  }).catch(err => {
    Core.flyer.log('判断是否存在邮件数据出错：' + err.message);
    res.send({});
  });
};
// 查询所有的邮件，通过关键字
Email.prototype.get_email_by_keyword = function (res, data) {
  let promise = DB.dbQuery.email.get_email_by_keyword(data);
  promise.then(function (data) {
    res.send({
      total: data[0][0].count,
      rows: data[1]
    });
  }).catch(err => {
    Core.flyer.log('根据关键字查询邮件出错了：' + err.message);
    res.send({
      total: 0,
      rows: []
    });
  });
};

// 判断邮件是否是从QA过来的
Email.prototype.isQAEmail = function (email, emailInfo, callback) {
  let type_id = email.type_id;
  if (type_id !== '0' && type_id) {
    DB.dbQuery.email.get_type_info_by_id(type_id).then(function (data) {
      callback(/QA/.test(data[0].type_name));
    });
  } else {
    callback(false);
  }
};

// 判断邮件是否是是support邮箱的
Email.prototype.isSupportEmail = function (emailInfo) {
  const supports = ['support@aukey.com', 'support.us@aukey.com', 'support.ca@aukey.com', 'support.eu@aukey.com'];
  if (emailInfo && Array.isArray(emailInfo) && emailInfo.length) {
    return supports.indexOf(emailInfo[0]._from) !== -1 || supports.indexOf(emailInfo[0]._to) !== -1;
  }
  return false;
};
module.exports = Email;
