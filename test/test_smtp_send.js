"use strict";
let nodemailer = require("nodemailer");
const params = {
    host: 'smtp.exmail.qq.com', // 设置服务
    port: 465, // 端口
    sercure: true, // 是否使用TLS，true，端口为465，否则其他或者568
    auth: {
        user: "zhengpengfei@aukeys.com", // 邮箱和密码
        pass: "Ken123456^"
    }
}

const toList = ['kenzpf@gmail.com']

// 邮件信息
const mailOptions = {
    from: "zhengpengfei@aukeys.com", // 发送邮箱
    to: "272546896@qq.com", // 接受邮箱
    subject: "hi mailgun", // 标题般通过一个简单的POJO（Plain Ordinary Java Object）来表示，其本质
    html: "<p>其中，模型是用于封装数据的载体，例如，在Java中一是一个普通的Java Bean，包含一系列的成员变量及其getter/setter方法。对于视图而言，它更加偏重于展现，也就是说，视图决定了界面到底长什么样子，在Java中可通过JSP来充当视图，或者通过纯HTML的方式进行展现，而后者才是目前的主流。模型和视图需要通过控制器来进行粘合，例如，用户发送一个HTTP请求，此时该请求首先会进入控制器，然后控制器去获取数据并将其封装为模型，最后将模型传递到视图中进行展现。</p>"
}

setInterval(function () {
    // mailOptions.to = toList[Math.floor(Math.random() * 10)];
    //mailOptions.subject = "hi mailgun" + Math.floor(Math.random() * 100);
    // 发送邮件
    const transporter = nodemailer.createTransport(params)
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        // success
        // ...
    })
}, 1000 * 10)


function otherAccountSend(mailOptions,config){
    const params = {
        host: config.host, // 设置服务
        port: config.port, // 端口
        sercure: true, // 是否使用TLS，true，端口为465，否则其他或者568
        auth: {
            user: config.auth, // 邮箱和密码
            pass: config.pass
        }
    }
    const transporter = nodemailer.createTransport(params)
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        // success
        // ...
    })
}