let Core = require("./core");
let LieLiuAPI = require('./lieliu_api');
let DB = require("./db");
class PresentIntervalTask {
    constructor() {}
    startTask() {
        console.log('轮询任务开始。。。。。。');
        // 配置多久轮训一次
        const time = 1000 * 10 * 20;
        // 1，查询出所有未获取物流单号的订单
        setInterval(function () {
            DB.dbQuery.presentPurchase.readPresentOrderNoKdNumber().then(result => {
                if (result.length) {
                    console.log('有订单');
                    // 2，调用api接口去分别获取物流单号
                    result.forEach(item => {
                        LieLiuAPI.getPresentKdNumber(item.taskid, function (ret) {
                            if (ret.code === 1) {
                                // 2,然后将单号写进数据库中，更新订单信息
                                DB.dbQuery.presentPurchase.updatePresentOrderById({
                                    id: item.id,
                                    taskid: ret.data.taskid,
                                    kdNumber: ret.data.express_no
                                }).then(updateRet => {
                                    Core.flyer.log(updateRet.affectedRows.length === 1 ? '快递单号更新成功' : '快递单号更新成功');
                                }).catch(err => {
                                    Core.flyer.log(err.message);
                                });
                                // 3，同时新增一个通知给下单的用户
                                DB.dbQuery.noticeManage.createNoticePerson({
                                    title: '快递单号有更新啦',
                                    content: `订单号为${item.orderNumber}的礼品订单，成功的更新了物流单号：${ret.data.express_no},请知晓！`,
                                    userId: item.userId,
                                    remark: '礼品订单通知'
                                }).then(createRet => {
                                    Core.flyer.log(createRet.affectedRows.length === 1 ? '通知创建成功' : '通知创建失败');
                                }).catch(err => {
                                    Core.flyer.log(err.message);
                                });
                            } else {
                                Core.flyer.log(ret.msg);
                                console.log(ret.msg);
                            }
                        });
                    });
                } else {
                    Core.flyer.log('暂时没有该状态的订单！');
                    console.log('暂时没有该状态的订单！');
                }
            }).catch(err => {
                Core.flyer.log('获取快递单号出现异常：' + err.message);
                console.log('获取快递单号出现异常：' + err.message);
            });
        }, time);
    }
}
module.exports = new PresentIntervalTask();