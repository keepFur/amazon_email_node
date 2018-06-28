"use strict";
let MailgunES6 = require("mailgun-es6"),
  inspect = require("util").inspect,
  Receive = require("./db_receive"),
  Config = require("./config"),
  EnumStatus = require("./status"),
  Path = require("path"),
  https = require("https"),
  crypto = require("crypto"),
  queryString = require("querystring"),
  DB = require("./db"),
  Core = require("./core");

  MailgunES6.prototype.getInformationAll = function (offset) {
    if (offset) {
      return this._sendRequest("/domains", "GET", {
        queryData: {
          limit: 15,
          skip: offset
        }
      });
    } else {
      return this._sendRequest("/domains", "GET", {});
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
    if (typeof path == "undefined" || typeof method == "undefined") {
      throw new Error("You need to specify both the path and method.");
    }
  
    //Grumble grumble grumble
    if (typeof options == "undefined") {
      options = {};
    } else if (typeof options != "object") {
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
          if(data.length !== 0){
            data = JSON.parse(data);
            if (res.statusCode == 200) {
              resolve(data);
            } else {
              reject(data);
            }
          }else{
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