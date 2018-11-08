const formidable = require("formidable");
const path = require("path");
function _upload(req, res, path, callback) {
  let AVATAR_UPLOAD_FOLDER = path;
  //创建上传表单
  let form = new formidable.IncomingForm();
  //上传文件，可以以多个文件
  let files = [];
  //设置编码
  form.encoding = "utf-8";
  //设置上传目录
  form.uploadDir = AVATAR_UPLOAD_FOLDER;
  //保留后缀
  form.keepExtensions = true;
  //文件大小 10 M
  form.maxFieldsSize = 10 * 1024 * 1024;
  // 监听事件
  form.on("error", function (err) {
    console.log(err.message);
  }).on("field", function (field, value) {
    req.body[field] = value;
  }).on("file", function (field, file) {
    files.push(file);
  }).on("end", function () {
    callback(files);
  });
  form.parse(req);
}

module.exports = function (req, res) {
  let data = {};
  let uploadFile = path.join(__dirname, "../src/upload/");
  return new Promise(function (resolve, reject) {
    _upload(req, res, uploadFile, function (files) {
      try {
        if (data) {
          resolve(files);
        } else {
          reject();
        }
      } catch (ex) {
        console.log(ex.message);
      }
    });
  });
}
