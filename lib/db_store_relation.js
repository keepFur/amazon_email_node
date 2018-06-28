"use strict";
let DB = require("./db"),
Core = require("./core"),
store_relation = function(pool) {
  this.pool = pool;
};
//分派店铺
store_relation.prototype.assignStore = function(data){
    let cmdText =`update amazon_service_stores
    set company_org_id=${data.depa_id},company_org_name = '${data.depa_name}' where ID=${data.store_id}
    `,
    //五个状态名
    cmdParams = [];
    return Core.flyer.return_promise(this.pool,cmdText,cmdParams);
}
//查询列表
store_relation.prototype.fetchStore = function(data){
  let offset = Number(data.pageNumber - 1) * data.limit,
  keyword = ``;
  data.keyword.length && data.keyword.forEach(function(obj,index){
    if(index === 0){
      keyword = `where store_name like '%${obj}%'`;
    }else{
      keyword += ` and store_name like '%${obj}%'`
    }
    
  })
  let cmdText =`select count(distinct ID) as 'count' from amazon_service_stores ${keyword};select * from amazon_service_stores ${keyword} order by ID limit ${offset}, ${data.limit} 
  `,
  
  //五个状态名
  cmdParams = [];
  return Core.flyer.return_promise(this.pool,cmdText,cmdParams);
}
//当前分组相关分组
store_relation.prototype.targetGroup = function(data){
  let cmdText =`select company_org_id,company_org_name FROM amazon_service_stores where ID = ${data.store_id};
  `,
  //五个状态名
  cmdParams = [];
  return Core.flyer.return_promise(this.pool,cmdText,cmdParams);
}
module.exports = store_relation;