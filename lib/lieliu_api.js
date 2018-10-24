const http = require('http');
const querystring = require('querystring');
const domain = 'http://api.lieliu.com:1024';
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
        http.get(url, function (res) {
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
        http.get(url, function (res) {
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
        http.get(url, function (res) {
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
        http.get(url, function (res) {
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
}

module.exports = new LieliuApi();