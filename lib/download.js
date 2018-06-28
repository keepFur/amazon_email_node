"use strict";
const path = require("path"),
    fs = require("fs"),
    Core = require("./core"),
    queryString = require("querystring");
module.exports = function (req, res) {
    let fileName = req.query.name && req.query.name.replace(/\s|\,/ig, ""),
        md5Name = req.query.md5Name,
        currFile = path.join(path.resolve(), "/src/upload/", md5Name),
        currFileTemp = path.join('/data/AmazonCustomer_fatchemail/src/upload/', md5Name),
        fReadStream;
    fs.exists(currFile, function (exist) {
        if (exist) {
            download(currFile);
        } else {
            fs.exists(currFileTemp, function (existTemp) {
                if (existTemp) {
                    download(currFileTemp);
                } else {
                    fs.exists(md5Name, function (onmoretime) {
                        if (onmoretime) {
                            download(md5Name);
                        } else {
                            res.set("Content-type", "text/html");
                            res.send("file not exist!");
                            res.end();
                        }
                    });
                }
            });
        }
    });

    function download(file) {
        let data = '';
        res.set({
            "Content-type": "application/octet-stream",
            "Content-Disposition": "attachment;filename=" + encodeURI(fileName)
        });
        fReadStream = fs.createReadStream(file);
        fReadStream.on("data", (chunk) => res.write(chunk, "binary"));
        fReadStream.on("error", (err) => {
            res.set("Content-type", "text/html");
            res.send("file not exist!");
            res.end();
        });
        fReadStream.on("end", function () {
            res.end();
        });
    }
}