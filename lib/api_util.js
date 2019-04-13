// api工具类
'use strict'
const crypto = require('crypto')
const http = require('http')
const querystring = require('querystring')
// 构造函数
function APIUtil() {
  // this.userKey = 'c1e5606f7b40e680d3b5bfc7dbb042ff';
  this.userKey = '2798f6d7d5ae3b2a18e2829d0e5025da'
  // this.username = 'u_1657222';
  this.username = 'u_35a420fd8e3f'
  this.domain = 'http://api.lieliu.com:1024/api/'
}

// 生成数字签名（signkey）
APIUtil.prototype.generateSignkey = function(req, res, data) {
  let { apiName } = data
  let { params } = data
  let { urlEncode } = data
  // let str = `${apiName}?${params}&${(this.userKey)}`;
  let str = `${apiName}?${params}&${this.userKey}`
  try {
    // urlEncode = encodeURIComponent(urlEncode + '&' + this.userKey);
    let hash = crypto.createHash('md5')
    res.send({
      success: true,
      msg: '',
      data: {
        signkey: hash.update(urlEncode).digest('hex')
      }
    })
  } catch (error) {
    res.send({
      success: false,
      msg: error.message,
      data: {
        signkey: ''
      }
    })
  }
}

APIUtil.prototype.as = (function() {
  var str =
    '/api/method?a=1&b=2&c=3&timestamp=1384243215&username=test@test.com&ver=4&abcdefghijklmnopqrxtuvwxyz'
  str = encodeURIComponent(str)
  console.log(
    crypto
      .createHash('md5')
      .update(str)
      .digest('hex')
  )
})()

module.exports = new APIUtil()
