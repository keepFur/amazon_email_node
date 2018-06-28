"use strict"
const XLSX = require('xlsx'),
    _db = require('./db'),
    mkdir = '/src/download/',
    path = require('path');
class Statistic {
    init(reqData, res) {
        this.data = {
            depa_ids: reqData.depa_ids,
            depa_names: reqData.depa_names,
            from_date: reqData.from_date,
            end_date: reqData.end_date,
            res: res
        }
        this.getSingleDepaResult();
    }

    /**
     * 根据每个不同depa单独查询
     */
    getSingleDepaResult() {
        this.count = 0;
        this.returnValue = [];
        if (Object.prototype.toString.call(this.data.depa_ids) === "[object Array]") {
            this.depa_length = this.data.depa_ids.length;
        } else {
            this.depa_length = 1;
        }
        var _this = this;
        if (Object.prototype.toString.call(this.data.depa_ids) === "[object Array]") {
            this.data.depa_ids.forEach(function (obj, index) {
                _this.getResult(obj, _this.data.from_date, _this.data.end_date);
            })
        } else {
            _this.getResult(_this.data.depa_ids, _this.data.from_date, _this.data.end_date);
        }
    }
    /**
     * @param  {String} depa_ids 所属分组
     * @param  {String} from_date 时间段
     * @param  {String} end_date 时间段
     */
    getResult(depa_id, from_date, end_date) {
        var _this = this;
        var _dbStatistic = _db.dbQuery.statistic;
        _dbStatistic.getResult(depa_id, from_date, end_date).then(
            function (data) {
                _this.returnValue.push(dataProcessing(data));
                _this.checkFinish(data, _dbStatistic);
            }, function (err) {
                _this.returnValue.push('Null');
                _this.checkFinish(err, _dbStatistic);
            });
    }
    checkFinish(data, _dbStatistic) {
        if (++this.count === this.depa_length) {
            //导出excel
            exportExcel(_dbStatistic._timeInterval, this, this.data.res);
        }
    }
}
/**
 * 组装单个数据到总数据
 * @param  {Array} data 单个小组的每天数据
 */
var dataProcessing = (data) => {
    var defaultArray = [],
        defaultDepaid;
    data.forEach(function (obj, index) {
        if (Object.prototype.toString.call(obj) === "[object Array]") {
            defaultArray.push(obj[0].count);
        } else {
            defaultArray.push(obj.count);
        }
    });
    return {
        data: defaultArray
    }
}
/**
 * 下载excel
 * @param  {Array} timeInterval 查询时间区间
 * @param  {Object} _this 类Statistic
 * @param  {Object} res res
 */
var exportExcel = (timeInterval, _this, res) => {
    var _headers = timeInterval.map(function (obj, index) {
        return obj.from_date;
    });
    _headers.unshift('depa_id');
    var _data = [];
    //组装excel数据
    _this.returnValue.forEach(function (obj, index) {
        if (obj !== 'Null') {
            var dataSingle = {
                depa_id: _this.data.depa_names[index]
            };
            obj.data.forEach(function (ob, idx) {
                dataSingle[timeInterval[idx]['from_date']] = String(ob);
            });
            _data.push(dataSingle);
        }
    })
    var headers = _headers
        .map((v, i) => Object.assign({}, {
            v: v, position:
                transcoding(i) + 1
        }))
        .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {}),
        data = _data
            .map((v, i) => _headers.map((k, j) => Object.assign({}, {
                v: v[k], position:
                    transcoding(j) + (i + 2)
            })))
            .reduce((prev, next) => prev.concat(next))
            .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {}),
        output = Object.assign({}, headers, data),
        outputPos = Object.keys(output),
        ref = outputPos[0] + ':' + outputPos[outputPos.length - 1],
        wb = {
            SheetNames: ['收信量'],
            Sheets: {
                '收信量': Object.assign({}, output, { '!ref': ref })
            }
        };
    //下载excel
    var filePath = path.join(path.resolve(), mkdir),
        fileName = Date.now() + '.xlsx';
    XLSX.writeFileAsync(filePath + fileName, wb, () => {
        res.download(filePath + fileName)
    });
}

/**
 * 转换excel坐标码
 * @param  {Number} num charCode
 */
var transcoding = (num) => {
    var codeArr = [];
    for (var i = 0; i < 26; i++) {
        codeArr.push(String.fromCharCode(i + 65));
    }
    if (num <= 25) {
        return String.fromCharCode(num + 65);
    } else {
        return codeArr[parseInt(num / 26) - 1] + codeArr[num % 26];
    }
}
module.exports = Statistic;