/*
* 用于 首页数据 模块功能的业务实现
*/
"use strict";
let DB = require("./db"),
    Config = require("./config"),
    Core = require('./core');
let Home = function () {
    this.tpl = DB.dbQuery.home;
};

//获取邮箱数据
Home.prototype.getData = function (res, data) {
    var result = {
        account: {
            account_status: {},
            status_list: {},
            service_list: {}
        }
    },
        promise, promiseService, poccessIndex = 0;//用于标记当前两个进度的进展用于何时返回数据依据
    if (data.orgCode === Config.const.managerCode || Config.const.adminCode === data.orgCode) {
        //主管
        promise = this.tpl.getAccountManager(data);
        promiseService = this.tpl.getGroupdata(data);
    } else {
        //客服
        promise = this.tpl.getAccountService(data);
    }
    var _this = this.tpl;
    var rqData = data;
    promise.then(function (data) {
        var statusArr = data,
            status = rqData.orgCode === Config.const.managerCode || Config.const.adminCode === rqData.orgCode ? ['undisposed', 'disposed', 'unassigned', 'assigned', 'resolved'] :
                ['undisposed', 'send', 'resolved'],
            newStatusArr = statusArr.map(function (obj, index) {
                var returnObj = {};
                obj.forEach(function (ob, ind) {
                    returnObj[ob.depa_id] = ob['count']
                });
                return returnObj
            })
        //组合每个小组5个状态的值
        newStatusArr.forEach(function (obj, index) {
            //当前处理状态
            var statuName = status[index];
            //初始化值
            result.account.account_status[statuName] = [];
            rqData.orgGroupIds.forEach(function (ob, ind) {
                if (ob.depa_id ? obj[ob.depa_id] : obj[ob]) {
                    result.account.account_status[statuName].push(ob.depa_id ? obj[ob.depa_id] : obj[ob]);
                } else {
                    result.account.account_status[statuName].push(0);
                }
            })
        })
        //右侧的数据可以直接加起来算
        status.forEach(function (obj, index) {
            result.account.status_list[obj] = 0;
            for (var i = 0; i < rqData.orgGroupIds.length; i++) {
                result.account.status_list[obj] += result.account.account_status[obj][i];
            }
        })
        if (++poccessIndex === 2 || (rqData.orgCode !== Config.const.managerCode && Config.const.adminCode !== rqData.orgCode)) {
            res.send(result);
        }
    }).catch(err => {
        Core.flyer.log('获取账号数据错误：' + err.message);
    });
    promiseService && promiseService.then(function (data) {
        result.account.userlist = data;
        if (data.length > 0) {
            let promise = _this.getServicedata(data, rqData.orgGroupIds, rqData);
            promise.then(function (data) {
                var statusArr = data,
                    status = ['undisposed', 'send', 'resolved'],
                    newStatusArr = statusArr.map(function (obj, index) {
                        var returnObj = {};
                        obj.forEach(function (ob, ind) {
                            returnObj[ob.user_id] = ob['count']
                        });
                        return returnObj
                    })
                //组合3个状态的值
                newStatusArr.forEach(function (obj, index) {
                    //当前处理状态
                    var statuName = status[index];
                    //初始化值
                    result.account.service_list[statuName] = [];
                    result.account.userlist && result.account.userlist.forEach(function (ob, ind) {
                        if (obj[ob.user_id]) {
                            result.account.service_list[statuName].push(obj[ob.user_id]);
                        } else {
                            result.account.service_list[statuName].push(0);
                        }
                    });
                })
                if (++poccessIndex === 2) {
                    res.send(result);
                }
            }).catch(err => {
                Core.flyer.log('获取客服的数据出错：' + err.message);
            });
        } else {
            if (++poccessIndex === 2) {
                res.send(result);
            }
        }
    }).catch(err => {
        Core.flyer.log('获取组的数据出错：' + err.message);
    });
};
//客服绩效相关
Home.prototype.getServicePerformance = function (res, data) {
    //获取所有客服各自的账号下的相关邮件
    var rqdata = data;
    DB.dbQuery.home.getServiceAllMails(data).then(function (data) {
        //用来存放所有客服的绩效时间
        var performanceDataArr = [];
        if (rqdata.services.length > 1) {
            //data是所有的客服自己的所有的相关的邮件
            data.forEach(function (obj, index) {
                //统计每个客服的绩效计算单元（一个连续往来算一个单元）
                if (obj.length) {
                    performanceDataArr.push(new PerformanceComputed(obj).removeUncorrectData());
                } else {
                    performanceDataArr.push('none')
                }
            })
        } else {
            if (data.length) {
                performanceDataArr.push(new PerformanceComputed(data).removeUncorrectData());
            } else {
                performanceDataArr.push('none')
            }
        }
        //根据时间区间计算每个客服的绩效最终数据
        var performanceDataArrNew = performanceDataArr.map(function (obj, index) {
            var timers = obj !== 'none' ? obj.map(function (obj, index) {
                return (new Date(obj.emailOut) - new Date(obj.emailIn))
            }) : '',
                timesTamp = 0;
            timers.length && timers.forEach(function (obj, index) {
                timesTamp += obj;
            })
            var timesTampSingle = timesTamp / timers.length;
            //算出平均值
            return (timesTampSingle && timesTampSingle / (1000 * 60 * 60)) || 'none';
        })
        //将结果回传
        res.send({
            performance: performanceDataArrNew
        });
    }).catch(err => {
        Core.flyer.log('获取客服绩效相关的数据出错：' + err.message);
    });
}
//统计每个客服的绩效计算单元
class PerformanceComputed {
    //除去不对的数据
    constructor(data) {
        this.data = data;
        this.usedData = [];
    }
    removeUncorrectData() {
        // //除去第一个非event='stored'的数据
        if (this.data[0].event === 'send') {
            this.data.shift();
        }
        //除去最后一个不是event='send'的数据
        if (this.data.length && this.data[this.data.length - 1].event !== 'send') {
            this.data.pop();
        }
        //获取所有单元
        if (this.data.length > 1) {
            trampoline(removeUnnecessary(this.data, this));
        } else {
            this.usedData = 'none'
        }
        return (this.usedData.length > 0 && this.usedData) || 'none'
        //按话题将最近的两个往来整合
        function removeUnnecessary(data, _this) {
            var startLength = data.length;
            //重新过滤头部尾部
            if (data.length > 1 && data[0].event === 'send') {
                data.splice(0, 1);
                if (data.length) {
                    return removeUnnecessary.bind(null, data, _this);
                } else {
                    return
                }

            }
            if (data.length > 1 && data[data.length - 1].event !== 'send') {
                data.splice(data.length - 1, 1);
                return removeUnnecessary.bind(null, data, _this);
            }
            for (let i = 1; i < data.length; i++) {
                //如果有相同的话题(得到其中一个回复单元)
                if (data[0].subject_num === data[i].subject_num && (data[0].event === 'stored' || data[0].event === 'other') && data[i].event === 'send') {
                    //将这组数据存起来
                    _this.usedData.push({
                        emailIn: data[0].timer,
                        emailOut: data[i].timer
                    })
                    //清除数组中的相应两条数据
                    data.splice(0, 1);
                    data.splice(i - 1, 1);
                    break;
                }
            }
            var endLength = data.length;
            if (startLength !== endLength && endLength !== 1) {
                //成功筛选了（重新执行）
                return removeUnnecessary.bind(null, data, _this);
            } else if (endLength === startLength && endLength > 2) {
                data.splice(0, 1);
                return removeUnnecessary.bind(null, data, _this);
            } else {
                return
            }

        }
        //防止堆栈溢出
        function trampoline(f) {
            while (f && f instanceof Function) {
                f = f();
            }
            return f;
        }
    }
}
module.exports = Home;
