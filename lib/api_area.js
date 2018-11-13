var area = require('./area.json');

// 获取所有的省份
module.exports.getProvince = function (req, res) {
    var ret = [];
    try {
        for (const key in area) {
            if (area.hasOwnProperty(key)) {
                const element = area[key];
                ret.push({
                    code: key,
                    name: element.name
                });
            }
        }
        res.send({
            success: true,
            rows: ret,
            msg: ''
        });
    } catch (error) {
        res.send({
            success: false,
            rows: [],
            msg: error.message
        });
        console.log(error.message);
    }
};

// 获取所有的省份（服务端）
module.exports.getProvinceServer = function () {
    var ret = [];
    try {
        for (const key in area) {
            if (area.hasOwnProperty(key)) {
                const element = area[key];
                ret.push({
                    code: key,
                    name: element.name
                });
            }
        }
        return {
            success: true,
            rows: ret,
            msg: ''
        };
    } catch (error) {
        return {
            success: false,
            rows: [],
            msg: error.message
        };
    }
};

// 通过省份code获取省份信息
function getProvinceByCode(code) {
    return area[code];
}

// 通过省份code获取市
module.exports.getCityByCode = function (req, res) {
    try {
        const { code } = req.query;
        const p = area[code];
        const citys = p.child;
        const ret = [];
        for (const key in citys) {
            if (citys.hasOwnProperty(key)) {
                const element = citys[key];
                ret.push({
                    code: key,
                    name: element.name
                });
            }
        }
        res.send({
            success: true,
            rows: ret,
            msg: ''
        });
    } catch (error) {
        res.send({
            success: false,
            rows: [],
            msg: error.message
        });
        console.log(error.message);
    }
};

// 通过市的code获取区
module.exports.getAreaByCode = function (req, res) {
    var { pCode, cCode } = req.query;
    // 省份的信息
    try {
        var p = getProvinceByCode(pCode);
        var city = p.child[cCode];
        var ret = [];
        var areas = city.child;
        for (const key in areas) {
            if (areas.hasOwnProperty(key)) {
                const element = areas[key];
                ret.push({
                    name: element,
                    code: key
                });
            }
        }
        res.send({
            success: true,
            rows: ret,
            msg: ''
        });
    } catch (error) {
        res.send({
            success: false,
            rows: [],
            msg: error.message
        });
        console.log(error.message);
    }
};