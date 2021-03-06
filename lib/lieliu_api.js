const http = require('http');
const https = require('https');
const querystring = require('querystring');
const domain = 'http://api.lieliu.com:1024';
const domainLPD = 'www.lipindao.com';
const Core = require('./core');
const config = require('./config');
let DB = require("./db");
/**
 *列流api类
 *
 * @class LieliuApi
 */
class LieliuApi {
    constructor() {

    }

    /**
     *任务查询
     *
     * @param {*} params
     * @memberof LieliuApi
     */
    listTask(req, resClient) {
        const url = domain + '/ll/task_list?' + querystring.stringify(req.query);
        http.get(url, function (res) {
            const {
                statusCode
            } = res;
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            }
            if (error) {
                Core.flyer.log(error.message);
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resClient.send(parsedData);
                } catch (e) {
                    Core.flyer.log(e.message);
                }
            });
        }).on('error', e => {
            Core.flyer.log(e.message);
        });
    }

    /**
     *任务创建
     *
     * @param {*} req
     * @param {*} res
     * @param {*} params
     * @memberof LieliuApi
     */
    createTask(req, resClient) {
        const url = domain + '/ll/task_add?' + querystring.stringify(req.query);
        http.get(url, function (res) {
            const {
                statusCode
            } = res;
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            }
            if (error) {
                Core.flyer.log(error.message);
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resClient.send(parsedData);
                } catch (e) {
                    Core.flyer.log(e.message);
                }
            });
        }).on('error', e => {
            Core.flyer.log(e.message);
        });
    }

    /**
     *取消任务
     *
     * @param {*} req
     * @param {*} res
     * @memberof LieliuApi
     */
    cancelTask(req, resClient) {
        const url = domain + '/ll/task_cancel?' + querystring.stringify(req.query);
        http.get(url, function (res) {
            const {
                statusCode
            } = res;
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            }
            if (error) {
                Core.flyer.log(error.message);
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resClient.send(parsedData);
                } catch (e) {
                    Core.flyer.log(e.message);
                }
            });
        }).on('error', e => {
            Core.flyer.log(e.message);
        });
    }

    /**
     *暂停和启用任务
     *
     * @param {*} req
     * @param {*} res
     * @memberof LieliuApi
     */
    pauseAndResumeTask(req, resClient) {
        const url = domain + '/ll/task_pause?' + querystring.stringify(req.query);
        http.get(url, function (res) {
            const {
                statusCode
            } = res;
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            }
            if (error) {
                Core.flyer.log(error.message);
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resClient.send(parsedData);
                } catch (e) {
                    Core.flyer.log(e.message);
                }
            });
        }).on('error', e => {
            Core.flyer.log(e.message);
        });
    }

    /**
     *查看余额
     *
     * @param {*} req
     * @memberof
     */
    viewLipindaoAccountMoney(req, resClient) {
        const options = {
            hostname: domainLPD,
            path: '/api/goods/getmoney',
            method: 'post',
            port: 443,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                token: config.lipindao.token,
            }
        };
        var hreq = https.request(options, function (res) {
            const {
                statusCode
            } = res;
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            }
            if (error) {
                Core.flyer.log(error.message);
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resClient.send(parsedData);
                } catch (e) {
                    Core.flyer.log(e.message);
                }
            });
        }).on('error', e => {
            Core.flyer.log(e.message);
        });
        hreq.end();
    }

    /**
     *读取礼品列表
     *
     * @param {*} req
     * @memberof
     */
    readPresentList(req, resClient) {
        const options = {
            hostname: domainLPD,
            path: '/api/goods/goodslist',
            method: 'post',
            port: 443,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                token: config.lipindao.token,
            }
        };
        var hreq = https.request(options, function (res) {
            const {
                statusCode
            } = res;
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            }
            if (error) {
                Core.flyer.log(error.message);
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resClient.send(parsedData);
                } catch (e) {
                    Core.flyer.log(e.message);
                }
            });
        }).on('error', e => {
            Core.flyer.log(e.message);
        });
        hreq.end();
    }
    /**
     *读取仓库列表
     *
     * @param {*} req
     * @memberof
     */
    readFromStock(req, resClient) {
        const options = {
            hostname: domainLPD,
            path: '/api/goods/storelist',
            method: 'post',
            port: 443,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                token: config.lipindao.token,
            }
        };
        var hreq = https.request(options, function (res) {
            const {
                statusCode
            } = res;
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            }
            if (error) {
                Core.flyer.log(error.message);
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resClient.send(parsedData);
                } catch (e) {
                    Core.flyer.log(e.message);
                }
            });
        }).on('error', e => {
            Core.flyer.log(e.message);
        });
        hreq.end();
    }

    /**
     *创建礼品订单
     *
     * @param {*} req
     * @memberof
     */
    createPresentOrder(req, resClient) {
        let params = querystring.stringify(req.query);
        let presentOrderInfo = req.query.presentOrderInfo;
        const options = {
            hostname: domainLPD,
            path: '/api/goods/order',
            method: 'post',
            port: 443,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'Content-Length': Buffer.byteLength(params), //参数长度
                token: config.lipindao.token,
            }
        };
        var hreq = https.request(options, function (res) {
            const {
                statusCode
            } = res;
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            }
            if (error) {
                Core.flyer.log(error.message);
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    if (parsedData.code === 1) {
                        presentOrderInfo.taskid = parsedData.data.taskid;
                        // 计算会员的价格
                        const kdPrice = 310;
                        presentOrderInfo.price = Core.flyer.computeTotalPrice(req.user.level, kdPrice) + Number(presentOrderInfo.price); // fen
                        presentOrderInfo.total = presentOrderInfo.price;
                        presentOrderInfo.userId = req.user.id;
                        DB.dbQuery.presentPurchase.createPresentOrder(presentOrderInfo).then(result => {
                            resClient.send({
                                success: result.affectedRows === 1,
                                message: ''
                            });
                        });
                    } else {
                        resClient.send({
                            success: false,
                            message: ''
                        });
                    }
                } catch (e) {
                    Core.flyer.log(e.message);
                    resClient.send({
                        success: false,
                        message: ''
                    });
                }
            });
        }).on('error', e => {
            Core.flyer.log(e.message);
        });
        hreq.write(params);
        hreq.end();
    }

    // 根据礼品订单的任务id获取快递单号
    getPresentKdNumber(req, resClient) {
        if (!req.query.taskid) {
            resClient.send({
                code: 0,
                msg: '任务id不存在'
            });
            return;
        }
        let params = querystring.stringify(req.query);
        const options = {
            hostname: domainLPD,
            path: '/api/goods/get_express',
            method: 'post',
            port: 443,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'Content-Length': Buffer.byteLength(params), //参数长度
                token: config.lipindao.token,
            }
        };
        var hreq = https.request(options, function (res) {
            const {
                statusCode
            } = res;
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            }
            if (error) {
                Core.flyer.log(error.message);
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resClient.send(parsedData);
                } catch (e) {
                    Core.flyer.log(e.message);
                    resClient.send({
                        code: 0,
                        msg: e.message
                    });
                }
            });
        }).on('error', e => {
            Core.flyer.log(e.message);
        });
        hreq.write(params);
        hreq.end();
    }

    // 根据礼品订单的任务id获取快递单号,自动获取单号的接口
    getPresentKdNumberBack(taskid, callback) {
        if (!taskid) {
            callback({
                code: 0,
                msg: '任务id不存在'
            });
            return;
        }
        let params = querystring.stringify({
            taskid
        });
        const options = {
            hostname: domainLPD,
            path: '/api/goods/get_express',
            method: 'post',
            port: 443,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'Content-Length': Buffer.byteLength(params), //参数长度
                token: config.lipindao.token,
            }
        };
        var hreq = https.request(options, function (res) {
            const {
                statusCode
            } = res;
            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            }
            if (error) {
                Core.flyer.log(error.message);
                res.resume();
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    callback(parsedData);
                } catch (e) {
                    Core.flyer.log(e.message);
                    callback({
                        code: 0,
                        message: e.message
                    });
                }
            });
        }).on('error', e => {
            Core.flyer.log(e.message);
        });
        hreq.write(params);
        hreq.end();
    }
}

module.exports = new LieliuApi();