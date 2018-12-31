let QcloudSms = require("qcloudsms_js");
class TenMessageApi {
    constructor() {
        // 短信应用SDK AppID
        this.appid = 1400155186; // SDK AppID是1400开头
        // 短信应用SDK AppKey
        this.appkey = "45821b2ddaac481317d6adf04eae6178";
        // 需要发送短信的手机号码
        this.phoneNumbers = ["16675551108"];
        // 短信模板ID，需要在短信应用中申请
        this.templateId = 220039; // NOTE: 这里的模板ID`7839`只是一个示例，真实的模板ID需要在短信控制台中申请
        // 签名
        this.smsSign = "家人时光机"; // NOTE: 这里的签名只是示例，请使用真实的已申请的签名, 签名参数使用的是`签名内容`，而不是`签名ID`
    }

    // 截取当前时间差中的后四位作为验证码
    generateVerfiyCode() {
        return String(Date.now()).match(/\d{4}$/)[0];
    }

    /**
     *生成代码
     *
     * @param {*} req
     * @param {*} res
     * @memberof TenMessageApi
     */
    getVerfiyCode(reqClient, resCLient) {
        // 实例化QcloudSms
        var qcloudsms = QcloudSms(this.appid, this.appkey);
        var ssender = qcloudsms.SmsSingleSender();
        //数组具体的元素个数和模板中变量个数必须一致，例如事例中templateId:5678对应一个变量，参数数组中元素个数也必须是一个
        var params = [this.generateVerfiyCode(), "2"];
        // 签名参数未提供或者为空时，会使用默认签名发送短信
        ssender.sendWithParam(86,
            reqClient.query.userPhone,
            this.templateId,
            params,
            this.smsSign,
            "",
            "",
            function(err, res, resData) {
                if (err) {
                    resCLient.send({
                        success: false,
                        code: '',
                        msg: err.message
                    });
                } else {
                    if (resData.result === 0) {
                        reqClient.session.code = res.req.body.params[0];
                        resCLient.send({
                            success: true,
                            msg: '',
                            code: res.req.body.params[0]
                        });
                    } else {
                        resCLient.send({
                            success: false,
                            code: '',
                            msg: resData.errmsg
                        });
                    }
                    console.log("request data: ", res.req);
                    console.log("response data: ", resData);
                }
            });
    }

}

module.exports = new TenMessageApi();