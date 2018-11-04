// 有赞支付api对接
const config = require('./config');
var YZClient = require('yz-open-sdk-nodejs');
var Token = require('yz-open-sdk-nodejs/Token');
//  应用token
const appToken = 'f73c4872e02130b399d234a15c5d00d9';
var YZClient = new YZClient(new Token(appToken));
// 创建收款二维码
module.exports.createQrCode = function (req, res, data) {
    // 付款理由
    // params['qr_name'] = "积分充值";
    // 付款金额
    // params['qr_price'] = "1";
    // 付款类型
    // params['qr_type'] = "QR_TYPE_NOLIMIT";
    YZClient.invoke('youzan.pay.qrcode.create', '3.0.0', 'GET', data, undefined).then(function (resp) {
        console.log('resp: ' + resp.body);
        var data = JSON.parse(resp.body);
        res.send({
            success: true,
            data: data
        });
    }, function (err) {
        res.send({
            success: false,
            data: ''
        });
    }, function (prog) {
        console.log('prog: ' + prog);
    });
};

// 使用第三方包支付
const Checkstand = require('yz-checkstand');
const checkstand = new Checkstand({
    client_id: config.pay_api.client_id,
    client_secret: config.pay_api.client_secret,
    kdt_id: config.pay_api.kdt_id
});
const DB = require('./db');

// 创建二维码
module.exports.checkStandCreateQr = function (req, res, data) {
    // 第一个参数是收款金额，单位：元
    // 第二个参数是收款理由，可选，如果不填会默认设置为 “收款 xx 元”
    DB.dbQuery.packageManage.readPackageById({ id: data.packageId }).then((package) => {
        let qr_price = package.length ? package[0].packagePurchaseMoney : 0.01;
        checkstand.createQR(qr_price, data.qr_name).then((qr) => {
            res.send({
                success: true,
                data: qr
            });
        }).catch(err => {
            res.send({
                success: false,
                data: '',
                message: err.message
            });
        });
    }).catch(err => {
        res.send({
            success: false,
            data: '',
            message: err.message
        })
    });
};

// 获取支付状态
module.exports.getPayStatus = function (req, res, data) {
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
                            count: count,
                            orderNumber: data.orderNumber,
                            balance: parseInt(req.user.money) + (count | 0)
                        }).then(function (logResult) {
                            console.log(`在${new Date()},用户： ${req.user.userName}充值${count}积分`);
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
module.exports.getYouzanPushMessgae = function (req, res) {
    checkstand.getPushStatus(request.body, true).then((orderInfo) => {
        res.send({
            success: true,
            data: {
                status: orderInfo.status
            }
        });
    });
};