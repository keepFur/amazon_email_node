"use strict";
let https = require("https"),
    Core = require("./core"),
    fs = require("fs");

class Mailgun {
    constructor(options) {
        if (
            typeof options === "undefined" ||
            (typeof options.privateApi === "undefined" &&
                typeof options.publicApi === "undefined")
        ) {
            throw new Error(
                "Some options are required in order to use this program." +
                "Please see the documentation for more information."
            );
        }
        //Assign the Public and Private API and domain to the object
        //Users are expected to know what key they need for what functions.
        this.privateApi = options.privateApi || null;
        this.publicApi = options.publicApi || null;
        this.domainName = options.domainName || null;
    }

    _genHttpsOptions(path, method, publicApi, hostname) {
        return {
            hostname: hostname,
            port: 443,
            path: `/v3${path}`,
            method: `${method}`,
            auth:
                publicApi === true ? `api:${this.publicApi}` : `api:${this.privateApi}`
        };
    }

    getStoredMessages(msgId, hostname, domain) {

        return this._sendRequest("/domains/<>/messages/" + msgId, "GET", {
            domain: domain,
            hostname: hostname
        });
    }

    //得到所有的Stored
    getStoredOnPage(msgId, hostname, domain) {
        return this._sendRequest("/<>/events/" + msgId, "GET", {
            domain: this.domainName,
            hostname: hostname
        });
    }

    getStoredFiles(path, hostname, filename, session) {
        path = path.replace("/v3", "");
        let options = { publicApi: this.publicApi, hostname: hostname },
            httpsOptions = this._genHttpsOptions(path, "GET", options.publicApi, options.hostname), groupName = session ? session.permissionData.data.groups[0].groupName : '';

        return new Promise(function (resolve, reject) {
            https.get(httpsOptions, function (res) {
                res.setEncoding('binary');
                let Data = '', path = require('path');
                res.on('data', function (data) {
                    Data += data;
                }).on('end', function () {
                    fs.writeFile(path.join(path.resolve(), "/src/upload/", filename), Data, "binary", function () {
                        Core.flyer.log('成功dowan到文件' + path.join(path.resolve(), "/src/upload/", filename));
                    });
                })
            })
        });
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
    _sendRequest(path, method, options) {
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

        path = path.replace("<>", options.domain);

        //Create HTTPS options
        var httpsOptions = this._genHttpsOptions(path, method, options.publicApi, options.hostname);

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
                    //Everything should be an object coming from Mailgun
                    try {
                        if (data.length !== 0) {
                            data = JSON.parse(data);
                            if (res.statusCode == 200) {
                                resolve(data);
                            } else {
                                reject(data);
                            }
                        } else {
                            //Core.flyer.log("data.length === 0");
                        }
                    } catch (err) {
                        Core.flyer.log(err);
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
                Core.flyer.log(`Problem connecting to Mailgun API. ${e}`);
                //reject({ message: `Problem connecting to Mailgun API. ${e}` });
            });
        });
    }
}
module.exports = Mailgun;