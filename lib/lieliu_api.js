const http = require('http');
const https = require('https');
const querystring = require('querystring');
const domain = 'http://api.lieliu.com:1024';
const domainLPD = 'www.lipindao.com';
const Core = require('./core');
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
        http.get(url, function(res) {
            const { statusCode } = res;
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
            res.on('data', (chunk) => { rawData += chunk; });
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
        http.get(url, function(res) {
            const { statusCode } = res;
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
            res.on('data', (chunk) => { rawData += chunk; });
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
        http.get(url, function(res) {
            const { statusCode } = res;
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
            res.on('data', (chunk) => { rawData += chunk; });
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
        http.get(url, function(res) {
            const { statusCode } = res;
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
            res.on('data', (chunk) => { rawData += chunk; });
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
     *创建礼品订单
     *
     * @param {*} req
     * @memberof
     */
    createPresentOrder(req, resClient) {
        const url = 'https://' + domainLPD + '/api/goods/order?' + querystring.stringify(req.query);
        const options = {
            hostname: domainLPD,
            path: '/api/goods/order',
            method: 'post',
            port: 80,
            headers: {
                token: '1f2f26f7-878c-42ae-8c46-2968305d53b2',
            }
        };
        var hreq = https.request(options, function(res) {
            const { statusCode } = res;
            console.log(res);
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
            res.on('data', (chunk) => { rawData += chunk; });
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
        hreq.write(querystring.stringify(req.query));
    }
}

module.exports = new LieliuApi();