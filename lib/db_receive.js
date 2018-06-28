/*
 * 用于 收取邮件 模块功能的数据实现
 */
"use strict";
let Core = require("./core"),
  EnumStatus = require("./status"),
  Mailgun = require("./mailgun"),
  AutoEmailRules = require("./db_auto_email_rules"),
  //OtherReceive = require("./db_other_receive"),
  htmlToText = require("html-to-text"),
  Imap = require('imap'),
  inspect = require('util').inspect,
  simpleParser = require('mailparser').simpleParser,
  MailParser = require('mailparser').MailParser,
  fs = require('fs'),
  crypto = require('crypto'),
  Config = require("./config");

let Receive = function (pool) {
  this.timer = Config.iterance.stored;
  this.otherTimer = Config.iterance.other;
  this.pool = pool;
  this.msgDetailTimer = Config.iterance.message;
  this.collect = Config.collect;
};

Receive.prototype = {
  //程序入口
  init: function (mailgun) {
    let _this = this;
    _this.mailgun = mailgun;

    _this.myMaingun = new Mailgun({
      privateApi: Config.mailgun.privateKey,
      publicApi: Config.mailgun.publicKey,
      domainName: Config.mailgun.domain
    });

    _this.autoEmailRules = new AutoEmailRules(_this.pool, _this);
    // _this.otherReceive = new OtherReceive(_this.pool);
    // _this.otherReceive.imapReceive();

    // setInterval(function () {
    //   try {
    //     _this.getOtherEmail();
    //   } catch (err) {
    //     Core.flyer.log(err);
    //   }
    // }, _this.otherTimer)

    if (this.collect) {

      _this.autoEmailRules.getAllEmailRules().then(function (data) {
        _this.allEmailRules = data;
        _this.getAllStored();
      }).catch(err => {
        Core.flyer.log('获取所有邮件规则出现异常：' + err.message);
      });

      try {
        _this.getAllMessages();
      } catch (err) {
        Core.flyer.log(err);
      }


      // try {
      //   _this.getOtherEmail();
      // } catch (err) {
      //   Core.flyer.log(err);
      // }

      setInterval(function () {
        Core.flyer.log("开始收信...");
        _this.autoEmailRules.getAllEmailRules().then(function (data) {
          _this.allEmailRules = data;
          Core.flyer.log("收到收信规则数量:" + data.length + "条");
          _this.getAllStored();
        }).catch(err => {
          Core.flyer.log('根据一条规则去匹配所有的现有邮箱出现异常：' + err.message);
        });
      }, _this.timer);

      setInterval(function () {
        _this.getAllMessages();
      }, _this.msgDetailTimer);

      // setInterval(function () {
      //   try {
      //     _this.getOtherEmail();
      //   } catch (err) {
      //     Core.flyer.log(err);
      //   }
      // }, _this.otherTimer)
    }
  },

  //获取其它账号的信息
  getAccountInfo: function () {
    let cmdText = `SELECT * FROM amazon_service_other_accounts`;
    return Core.flyer.return_promise(this.pool, cmdText, []);
  },

  //是否存在该记录
  isExist: function (data) {
    let cmdText = "select id from amazon_service_stored where ID = ?",
      cmdParams = [data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
  },

  //判断是否存在邮件
  isExistMessage: function (data) {
    let cmdText = "select id from amazon_service_emails where ID = ?",
      cmdParams = [data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
  },

  //获取所有的 Stored 数据
  getStored: function (domain) {
    return this.mailgun.getStoredMessages(domain);
  },

  //获取数据库里所有的邮件列表
  getStoredInSql: function () {
    let cmdText = "select ID as id,storage_key,storage_url from amazon_service_stored where date_sub(now(), INTERVAL ? MINUTE) <= timer order by timer desc",
      cmdParams = [Config.iterance.sql_minute]
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
  },

  //通过邮件ID获取到相关的邮件详情
  getStoredById: function (data) {
    let hostname = data.storage_url.substring(0, data.storage_url.lastIndexOf("v3") - 1),
      domain = Core.flyer.getDomainInUrl(data.storage_url);
    hostname = hostname.replace("https://", "");
    return this.myMaingun.getStoredMessages(data.storage_key, hostname, domain);
  },

  insertMessage: function (data) {
    let arry = new Array(22),
      strIndex = arry.join("?,");
    strIndex = strIndex.substring(0, strIndex.length - 1);
    let cmdText =
      "insert into amazon_service_emails(ID,_from,_to,_from_name,_to_name,_subject,html,text,status_id,status_name,date_time,attachment) values(?,?,?,?,?,?,?,?,?,?,?,?)",
      cmdParams = [
        data.id,
        Core.flyer.getEmailAddress(data.From)[0],
        Core.flyer.getEmailAddress(data.To)[0],
        Core.flyer.getEmailName(data.From),
        Core.flyer.getEmailName(data.To),
        data.Subject,
        encodeURIComponent(data["body-html"] || ""),
        encodeURIComponent(data["body-plain"] || ""),
        EnumStatus.undisposed.value,
        EnumStatus.undisposed.text,
        Core.flyer.formatDate(),
        JSON.stringify(data.attachments)
      ];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
  },

  //写入一条未找到的空数据集，这种情况一般是数据丢失
  insertEmptyMessage: function (data) {
    let cmdText =
      "insert into amazon_service_emails(ID,_subject,html,date_time) values(?,?,?,?)",
      cmdParams = [
        data.id,
        "Message not found.",
        "Message not found.",
        Core.flyer.formatDate(new Date())
      ];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
  },

  //存入单条 Stored 数据
  insertStored: function (data) {
    let arry = new Array(34),
      strIndex = arry.join("?,");
    strIndex = strIndex.substring(0, strIndex.length - 1);
    let cmdText = "insert into amazon_service_stored values(" + strIndex + ")",
      cmdParams = [
        String(data.id),
        JSON.stringify(data.tags),
        String(data.timestamp),
        String(data.storage.url),
        String(data.storage.key),
        String(data.log_level),
        String(data.campaigns),
        String(data.user_variables),
        JSON.stringify(data.flags),
        String(data.message.headers.to),
        String(data.message.headers.from),
        String(data.message.headers["message-id"]),
        String(data.message.headers.subject).substr(0, 998),
        String(JSON.stringify(data.message.attachments)),
        String(data.message.recipients),
        String(data.message.size),
        String(data.event),
        EnumStatus.unassigned.value,
        EnumStatus.unassigned.text,
        EnumStatus.undisposed.value,
        EnumStatus.undisposed.text,
        data.from,
        data.to,
        data.timer || Core.flyer.getStoredTimer(data.timestamp),
        '',
        0,
        data.subject.substr(0, 998),
        1,
        (data.message.attachments.length > 0 ? 1 : 0),
        '',
        data.subject_num,
        0,
        'stored'
      ];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
  },

  //判断是否是已经分派的话题
  getStoredBySubject: function (data) {
    let cmdText = `select max(assigned_id) as assigned_id,assigned_name,status_id,status_name,disposed_status_id,disposed_status_name,subject_num 
                   from amazon_service_stored where subject = ? and ((_from = ? and _to = ?) or (_to = ? and _from = ?))
                   group by SUBJECT order by timer desc;`,
      cmdParams = [data.subject, data.from, data.to, data.from, data.to];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
  },

  //得到最后一次数据的状态
  getLastStoredBySubject: function (data) {
    let cmdText = `select max(assigned_id) as assigned_id,assigned_name,status_id,status_name,disposed_status_id,disposed_status_name,subject_num,type_id
                     from amazon_service_stored where subject = ? and ((_from = ? and _to = ?) or (_to = ? and _from = ?)) and id <> ?
                     group by SUBJECT order by timer desc;`,
      cmdParams = [data.subject, data.from, data.to, data.from, data.to, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
  },

  //较正数据的状态
  setStoredStatusById: function (data) {

    //目前只有收信和收信规则自动回复里没有设置type_id
    data.type_id = data.type_id || 0;
    let cmdText = `update amazon_service_stored set assigned_id =?,assigned_name=?,status_id=?,status_name=?,disposed_status_id=?,disposed_status_name=?,subject_num=?,type_id=? where subject_num=? or ID = ?`,
      cmdParams = [data.assigned_id, data.assigned_name, data.status_id, data.status_name, data.disposed_status_id, data.disposed_status_name, data.subject_num, data.type_id, data.subject_num, data.id];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
  },

  //开始收集其它邮箱数据
  getOtherEmail: function () {
    let _this = this;
    this.getAccountInfo().then(data => {
      if (data instanceof Array) {
        let beginDate = _this.getBeginDate();
        data.forEach(val => {
          //Core.flyer.log(decipher.update(val.password,'hex','utf8')+decipher.final('utf8'));
          let key = new Buffer("aukey-hj-amazon"),
            decipher = crypto.createDecipher('aes-256-cbc', key);
          let accountInfo = {
            user: val.account,
            password: decipher.update(val.password, 'hex', 'utf8') + decipher.final('utf8'),
            host: val.imap,
            port: val.imap_port
          }
          _this.imapReceive(accountInfo, beginDate);
        })
      }
    }).catch(err => {
      Core.flyer.log('获取账户信息出现异常：' + err.message);
    });
  },

  //获取得附件并down到本地
  getStoredFiles: function (data, session) {
    let hostname = data.url.substring(0, data.url.lastIndexOf("v3") - 1),
      path = data.url.replace(hostname, "");
    hostname = hostname.replace("https://", "");
    return this.myMaingun.getStoredFiles(path, hostname, data.md5Name, session);
  },

  findAllStored: function (data, cumulative, domain, callback) {
    let _this = this;
    let url = data.paging.next;
    let hostname = url.substring(0, url.lastIndexOf("v3") - 1),
      path = url.replace(hostname, ""),
      msgId = url.substr(url.lastIndexOf("/") + 1);
    hostname = hostname.replace("https://", "");
    this.myMaingun.domainName = domain;
    this.myMaingun.getStoredOnPage(msgId, hostname).then(function (resData) {
      cumulative = cumulative.concat(resData.items);
      if (resData.paging.last !== data.paging.next && resData.items.length > 0) {
        _this.findAllStored(resData, cumulative, domain, callback);
      } else {
        callback(cumulative);
      }
    }, function (err) {
      Core.flyer.log("收集数据响应超时:" + err);
    });

  },

  //获得所有的域
  getAllStored: function () {
    let _this = this, allItems = [], limit = 100, skip = 0;
    this.mailgun.getInformationAll({ limit: limit, skip: skip, mark: true }).then(function (data) {

      let items = data.items.filter(function (item) {
        return item.name !== Config.filterDoMain;
      });
      Core.flyer.log("收到一批域名:" + data.items.length + "条");
      items.forEach(function (val) {
        _this.getAllStoredBydoMain(val.name);
      });

      while (skip < data.total_count) {
        _this.mailgun.getInformationAll({ limit: limit, skip: skip, mark: true }).then(function (data) {
          let items = data.items.filter(function (item) {
            return item.name !== Config.filterDoMain;
          });

          Core.flyer.log("收到一批域名:" + data.items.length + "条");
          items.forEach(function (val) {
            _this.getAllStoredBydoMain(val.name);
          });

        }, function (err) {
          Core.flyer.log("收集域名响应超时:" + err);
        });
        skip = skip + limit;
      }

    }, function (err) {
      Core.flyer.log("收集域名响应超时:" + err);
    });

  },

  //通过指定的域得到所有的账号存诸信息
  getAllStoredBydoMain: function (domain) {
    //Core.flyer.log(domain);
    let _this = this,
      stored = _this.getStored(domain);
    stored.then(function (data) {
      let cumulative = data.items;
      _this.mailgun.domainName = domain;
      _this.findAllStored(data, cumulative, domain, function (cumulative) {

        if (cumulative.length > 0) {
          Core.flyer.log("当前域[" + domain + "]收集数据完成,共[" + cumulative.length + "],开始写入数据");
        }

        cumulative.forEach(function (val, index, ary) {

          _this.isExist(val).then(function (result) {

            //如果返回的结果是0，则说明不存在记录，执行数据写入
            if (result.length === 0) {
              val.from = Core.flyer.getEmailAddress(String(val.message.headers.from))[0];
              val.to = Core.flyer.getEmailAddress(String(val.message.headers.to))[0];
              val.subject = String(val.message.headers.subject).replace(/^(re:)|^(回复：)+/ig, "").trim();
              val.subject_num = Core.flyer.getGUID();

              _this.insertStored(val).then(function (result) {
                //执行成功
                //Core.flyer.log("写入Stored数据" + val.id);
                _this.getLastStoredBySubject(val).then(function (statusData) {

                  if (statusData.length > 0) {
                    statusData = statusData[0];
                    let otData = {
                      id: val.id,
                      //被分派人的ID
                      assigned_id: statusData.assigned_id,
                      //被分派人的姓名
                      assigned_name: statusData.assigned_name,
                      //分派状态ID
                      status_id: statusData.status_id || EnumStatus.unassigned.value,
                      //分派状态文本
                      status_name: statusData.status_name || EnumStatus.unassigned.text,
                      //凡是收到的新邮件都是未处理的
                      disposed_status_id: EnumStatus.undisposed.value,
                      disposed_status_name: EnumStatus.undisposed.text,
                      subject_num: statusData.subject_num || Core.flyer.getGUID()
                    };
                    _this.setStoredStatusById(otData).then(function (upStausResult) {
                      //Core.flyer.log("更新状态成功" + val.id);
                      val.subject_num = otData.subject_num;
                      _this.autoEmailRules.checkEmailRulesByItem(_this.allEmailRules, val);
                    }).catch(err => {
                      Core.flyer.log('获取最后一封邮件信息通过状态出现异常：' + err.message);
                    });
                  } else {
                    _this.autoEmailRules.checkEmailRulesByItem(_this.allEmailRules, val);
                  }
                }).catch(err => {
                  Core.flyer.log('获取最后一封邮件信息通过主题出现异常：' + err.message);
                });
              }, function (err) {
                Core.flyer.log(val.id + ":" + err.message);
              });
            }
          }).catch(err => {
            Core.flyer.log('判断邮件是否存在出现异常：' + err.message);
          });
        });
      });
    }).catch(err => {
      Core.flyer.log('获取邮件信息出现异常：' + err.message);
    });
  },

  getAllMessages: function () {
    let _this = this;
    _this.getStoredInSql().then(function (data) {

      data.forEach(function (item, index, ary) {

        //判断email详表中是否有数据
        _this.isExistMessage(item).then(function (existResult) {

          //如果返回的结果是0，则说明不存在记录，执行数据写入
          if (existResult.length === 0) {
            _this.getStoredById(item).then(function (resStored) {
              resStored["id"] = item.id;
              if (resStored.attachments.length > 0) {
                resStored.attachments.forEach(function (val, index) {
                  resStored.attachments[index]["md5Name"] = Core.flyer.getGUID() + val.name.substr(val.name.lastIndexOf("."));
                  _this.getStoredFiles(resStored.attachments[index]);
                });
              }
              _this.insertMessage(resStored).then(
                function (dbResult) {
                  //执行成功
                  //Core.flyer.log("写入Emails数据" + resStored.id);
                },
                function (err) {
                  Core.flyer.log(resStored.id + ":" + err.message);
                }
              );
            }, function (err) {
              Core.flyer.log(item.id + " _getStoredById:" + err.message);
            });
          }
        }, function (err) {
          Core.flyer.log(item.id + " _isExistMessage:" + err.message);
        });
      });
    }).catch(err => {
      Core.flyer.log('获取数据出现异常：' + err.message);
    });
  },

  //编写一个收信代码方法
  imapReceive: function (accountInfo, beginDate) {
    Core.flyer.log("开始收信关联邮箱账号:" + accountInfo.user);

    //实例化一个imap
    let imap = new Imap({
      user: accountInfo.user,
      password: accountInfo.password,
      host: accountInfo.host,
      port: accountInfo.port,
      tls: true
    }), _this = this;

    let message = [];
    function openInBox(cb) {
      imap.openBox('INBOX', true, cb);
    }

    imap.once('ready', function () {
      openInBox(function (err, box) {
        //Core.flyer.log('open');
        if (err) {
          throw err;
        }

        imap.search(['UNSEEN', ['SINCE', beginDate]], function (err, results) {
          if (err) {
            throw err;
          }
          if (results && results.length === 0) {
            return;
          }
          Core.flyer.log("关联邮箱" + accountInfo.user + "收取到" + results.length + "封邮件");
          let f = imap.fetch(results, { bodies: '' });
          f.on('message', function (msg, seqno) {
            _this.prefixEmailContent(msg, seqno);
          });
          f.once('error', function (err) {
            Core.flyer.log('Fetch error: ' + err);
          });
          f.once('end', function () {
            imap.end();
          });
        });
      });
    });

    imap.once('error', function (err) {
      Core.flyer.log("err:" + err);
    });

    imap.once('end', function () {
      Core.flyer.log('Connection ended');
    });
    imap.connect();
  },

  //得到收取邮件的起始时间
  getBeginDate: function () {

    let begin = new Date(),
      end = begin.getTime() - Config.iterance.time;
    end = new Date(end);

    return end.toUTCString();
  },

  //写入邮件列表数据
  writeEmailList: function (val) {
    let _this = this;
    _this.isExist(val).then(function (result) {

      //如果返回的结果是0，则说明不存在记录，执行数据写入
      if (result.length === 0) {

        val.from = Core.flyer.getEmailAddress(String(val.message.headers.from))[0];
        val.to = Core.flyer.getEmailAddress(String(val.message.headers.to))[0];
        val.subject = String(val.message.headers.subject).replace(/^(re:)|^(回复：)+/ig, "").trim();
        val.subject_num = Core.flyer.getGUID();

        _this.insertStored(val).then(function (result) {
          //执行成功
          //Core.flyer.log("写入Stored数据" + val.id);
          _this.getLastStoredBySubject(val).then(function (statusData) {

            if (statusData.length > 0) {

              //将更新后的数据状态赋值给 otData
              let otData = _this.justDataStatus(statusData[0], val);
              _this.setStoredStatusById(otData).then(function (upStausResult) {
                val.subject_num = otData.subject_num;
                _this.autoEmailRules.checkEmailRulesByItem(_this.allEmailRules, val);
              }).catch(err => {
                Core.flyer.log('写入邮件信息操作获取邮件状态的时候出现异常：' + err.message);
              });
            } else {
              _this.autoEmailRules.checkEmailRulesByItem(_this.allEmailRules, val);
            }
          }).catch(err => {
            Core.flyer.log('写入邮件信息操作中获取最近一封邮件的时候出现异常：' + err.message);
          });
        }, function (err) {
          Core.flyer.log(val.id + ":" + err.message);
        });
      }
    }).catch(err => {
      Core.flyer.log('写入邮件信息操作判断邮件是否存在的时候出现异常：' + err.message);
    });
  },

  //写入邮件详情数据
  writeEmailDetails: function (item) {
    let _this = this;
    //判断email详表中是否有数据
    _this.isExistMessage(item).then(function (existResult) {
      //如果返回的结果是0，则说明不存在记录，执行数据写入
      if (existResult.length === 0) {
        _this.insertMessage(item).then(function (dbResult) {
        }, function (err) {
          Core.flyer.log(item.id + ":" + err.message);
        });
      }
    }, function (err) {
      Core.flyer.log(item.id + " _isExistMessage:" + err.message);
    });
  },

  //较正相对应的数据值状态
  justDataStatus: function (statusData, val) {
    let otData = {
      id: val.id,
      //被分派人的ID
      assigned_id: statusData.assigned_id,
      //被分派人的姓名
      assigned_name: statusData.assigned_name,
      //分派状态ID
      status_id: statusData.status_id || EnumStatus.unassigned.value,
      //分派状态文本
      status_name: statusData.status_name || EnumStatus.unassigned.text,
      //凡是收到的新邮件都是未处理的
      disposed_status_id: EnumStatus.undisposed.value,
      disposed_status_name: EnumStatus.undisposed.text,
      subject_num: statusData.subject_num || Core.flyer.getGUID()
    };
    return otData;
  },

  //实例化成可操作的数据对象
  initQueryData: function (mail, seqno) {
    mail.text = this.fnHtmlToText(mail.text, mail.html);
    let val = {
      id: mail.from.value[0].address.replace(/[~!@#$%^&*()<>\.\+\-\='"]/ig, "") + seqno,
      //id: seqno,
      message: {
        headers: {
          to: mail.to.text,
          from: mail.from.text,
          subject: mail.subject,
          size: 0
        },
        attachments: mail.attachments
      },
      storage: {
        key: '',
        url: ''
      },
      event: 'other',
      text: mail.text,
      timer: mail.date
    },
      item = {
        id: val.id,
        From: String(val.message.headers.from),
        To: String(val.message.headers.to),
        Subject: mail.subject,
        'body-html': mail.html,
        'body-plain': mail.text,
        attachments: val.message.attachments
      }
    return {
      val: val,
      item: item
    }
  },

  //格式化HTML 转换成 TEXT
  fnHtmlToText: function (text, html) {
    if (!text) {
      text = htmlToText.fromString(html, {
        wordwrap: 130,
        hideLinkHrefIfSameAsText: true,
        format: {
          anchor: function (elem, fn, options) {
            return fn(elem.children, options);
          }
        }
      });
    }
    return text;
  },

  //解析邮件内容
  prefixEmailContent: function (msg, seqno) {

    let _this = this;
    msg.on('body', function (stream, info) {

      let buffer = '';
      stream.on('data', function (chunk) {
        buffer += chunk.toString('utf8');
      });

      stream.once('end', function () {
        simpleParser(buffer, (err, mail) => {
          //没有message-id的数据视为无效数据或者抄送的数据
          if (!mail.messageId) {
            Core.flyer.log("subject:" + mail.subject + " to:" + mail.to + "邮件没有消息ID被过滤...");
            return;
          }
          mail.attachments = _this.prefixAttachment(mail.attachments);
          let qData = _this.initQueryData(mail, seqno);
          //将邮件信息写入邮件列表
          _this.writeEmailList(qData.val);

          //将邮件详情版写入邮件详情
          _this.writeEmailDetails(qData.item);
        });
      });
    });
  },

  //解析并下载附件
  prefixAttachment: function (attachments) {
    let attch = [], path = require('path');
    if (!Array.isArray(attachments)) {
      attachments = new Array(attachments);
    }

    attachments.forEach(item => {
      item["md5Name"] = Core.flyer.getGUID() + item.filename.substr(item.filename.lastIndexOf("."));
      attch.push({
        "content-type": item.contentType,
        md5Name: item.md5Name,
        name: item.filename,
        size: item.size
      });
      fs.writeFile(path.join(path.resolve('Amazonservice'), "src/upload/", item.md5Name), item.content, "binary", function () {
        //Core.flyer.log('成功dowan到文件' + path.join(path.resolve(), "/src/upload/", item.filename));
      });
    });

    return attch;
  }
};


module.exports = Receive;
