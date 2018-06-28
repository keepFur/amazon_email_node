"use strict"
const Core = require('./core');
class db_statistic{
    constructor(pool){
        this.pool = pool;
    }
    /**
     * 获取单个组的单天的来信量
     * @param  {String} depa_id 当前分组
     * @param  {String} from_date 起始时间
     * @param  {String} end_date 结束时间,间隔一天
     */
    getResult(depa_id,from_date,end_date){
        const Params = this.paramStr(depa_id,from_date,end_date);
        const cmdText = Params.cmdText,
        cmdParams = Params.cmdParams;
        return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
    }
    /**
     * 划分时间查询区间
     * @param  {String} depa_id 当前分组
     * @param  {String} from_date from_date 起始时间
     * @param  {String} end_date 最终结束时间
     */
    paramStr(depa_id,from_date,end_date){
        var _from_date = new Date(from_date).getTime(),
        _end_date = new Date(end_date).getTime(),
        paramTpl = `SELECT count(*) as 'count'
        FROM
            amazon_service_stored store
        INNER JOIN amazon_service_accounts count ON (
            count.mail_address = store._to
            OR count.mail_address = store._from
        )
        WHERE
            (event = 'stored' or event='other')
        AND count.status_id = 1
        AND count.depa_id=?
        AND store.timer>?
        AND store.timer<=?;
        `,
        paramStr = '',
        paramArray;
        this._timeInterval = [];
        for(var i=_from_date;i<=_end_date;i+=24*60*60*1000){
            paramStr += paramTpl;
            paramArray = paramArray || [];
            paramArray = paramArray.concat([
                depa_id,
                Core.flyer.formatDate('yyyy-mm-dd', new Date(i)),
                Core.flyer.formatDate('yyyy-mm-dd', new Date(i+24*60*60*1000))
            ])
            this._timeInterval.push({
                from_date:Core.flyer.formatDate('yyyy-mm-dd', new Date(i)),
                end_date:Core.flyer.formatDate('yyyy-mm-dd', new Date(i+24*60*60*1000))
            })
        }
        return {
            cmdText:paramStr,
            cmdParams:paramArray
        };
    }
}
module.exports = db_statistic;