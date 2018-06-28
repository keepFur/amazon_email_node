"use strict";
//reuqire
const formidable = require("formidable"),
  fs = require("fs"),
  path = require("path"),
  Core = require("./core"),
  crypto = require("crypto");
var returnMeg = {};
let fileMD5Name;
function _upload(req, res, path, callback) {
  let md5 = crypto.createHash("md5"),

    //上传图片
    AVATAR_UPLOAD_FOLDER = path,

    //创建上传表单
    form = new formidable.IncomingForm(),

    //修改后的文件名
    newFileName,

    //保存上传表单input的name值
    formField = {},
    extNameArr = [],

    //已数组方式返回上传文件，
    returnFiles = [],

    //上传文件，可以以多个文件
    files = [];

  //设置编码
  form.encoding = "utf-8";
  form.multiples = true;

  //设置上传目录
  form.uploadDir = AVATAR_UPLOAD_FOLDER;

  //保留后缀
  form.keepExtensions = true;

  //文件大小 10 M
  form.maxFieldsSize = 10 * 1024 * 1024;


  form.on("error", function (err) {

    //各种错误
    Core.flyer.log(err);
  }).on("field", function (field, value) {
    formField[field] = value;

    //上传文件
  }).on("file", function (field, file) {
    if (file && file.size <= this.maxFieldsSize && file.size > 0) {
      file.path = Core.flyer.getFileNameOnPath(file.path);
      files.push(file);
    } else if (file.size === 0) {
      fs.unlink(file.path);
      res.send({ msg: "选择的文件中的含空内容的附件,请重新选择", invalid: true });
    } else {
      fs.unlink(file.path);
      res.send({ msg: "选择的文件中含大小超出了10M的附件,请重新选择", invalid: true });
    }
  }).on("end", function () {
    callback(files);
  });
  form.parse(req);
}

//delete
function deleteFile(filePath, callback) {
  fs.unlink(filePath, callback);
}

//导出方法
module.exports = function (req, res) {
  let groupName = req.session.permissionData.data.groups[0].groupName;
  if (req.body.method === "delete") {
    let filePath = path.join(__dirname, "../src/upload/" + groupName, req.body.fileName);
    deleteFile(filePath, function () {
      res.send("success");
    });
  }

  let data = {},
    //设置上传路径
    uploadFile = path.join(__dirname, "../src/upload/");
  //Core.flyer.log("当前上传路径:" + uploadFile);
  return new Promise(function (resolve, reject) {
    _upload(req, res, uploadFile, function (files) {
      try {
        if (data) {
          resolve(files);
        } else {
          reject();
        }
      } catch (ex) {
        Core.log.log(ex);
      }
    });
  });
};
