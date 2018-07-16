// 有赞支付api对接
var YZClient = require('yz-open-sdk-nodejs');
var Token = require('yz-open-sdk-nodejs/Token');
//  应用token
const appToken = '780a3290f196372cae3e568ccde27c88';
var YZClient = new YZClient(new Token(appToken));
// 创建收款二维码
module.exports.createQrCode = function(req, res, data) {
    // 付款理由
    // params['qr_name'] = "积分充值";
    // 付款金额
    // params['qr_price'] = "1";
    // 付款类型
    // params['qr_type'] = "QR_TYPE_NOLIMIT";
    YZClient.invoke('youzan.pay.qrcode.create', '3.0.0', 'GET', data, undefined).then(function(resp) {
        console.log('resp: ' + resp.body);
        var data = JSON.parse(resp.body);
        res.send({
            success: true,
            data: data
        });
    }, function(err) {
        res.send({
            success: false,
            data: ''
        });
    }, function(prog) {
        console.log('prog: ' + prog);
    });
};

// 使用第三方包支付
const Checkstand = require('yz-checkstand');
const checkstand = new Checkstand({
    client_id: '7f92fde6c660deda08',
    client_secret: '016f2852ce7222b838e3c8d493fe0c81',
    kdt_id: '41135926'
});
const DB = require('./db');

// 创建二维码
module.exports.checkStandCreateQr = function(req, res, data) {
    // 第一个参数是收款金额，单位：元
    // 第二个参数是收款理由，可选，如果不填会默认设置为 “收款 xx 元”
    checkstand.createQR(data.qr_price, data.qr_name).then((qr) => {
        res.send({
            success: true,
            data: qr
        });
    });
};

// 获取支付状态
module.exports.getPayStatus = function(req, res, data) {
    checkstand.isPaid(data.qr_id).then((paid) => {
        if (paid) {
            DB.dbQuery.packageManage.readPackageById({
                id: data.addPackageType
            }).then((package) => {
                if (package.length) {
                    const count = package[0].packagePurchaseScore + package[0].packagePresentScore;
                    DB.dbQuery.userManage.addMoneyUser({
                        money: count,
                        id: req.session.userId
                    }).then(() => {
                        DB.dbQuery.logsScoreManage.createLogsScore({
                            userId: req.user.id,
                            userName: req.user.userName,
                            type: 1,
                            count: count
                        }).then(function(logResult) {
                            console.log(`在${new Date()},用户： ${req.user.userName}充值${count}`);
                        });
                    });
                }
            });
        }
        res.send({
            success: true,
            data: {
                status: paid
            }
        });
    });
};

// 获取有赞的推送消息
module.exports.getYouzanPushMessgae = function(req, res) {
    checkstand.getPushStatus(request.body, true).then((orderInfo) => {
        res.send({
            success: true,
            data: {
                status: orderInfo.status
            }
        });
    });
};