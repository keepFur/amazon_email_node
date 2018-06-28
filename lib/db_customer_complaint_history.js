/*
 * 用于 客诉记录 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 客诉记录构造函数
let CustomerComplaintHistory = function (pool) {
    this.pool = pool;
};

// 转换查询参数，传入一个数组，返回字符串
CustomerComplaintHistory.prototype.convertParams = function (arr) {
    let str = '(';
    if (Array.isArray(arr) && arr.length) {
        arr.forEach(function (ele, index) {
            if (index !== arr.length - 1) {
                str += '?,';
            } else {
                str += '?)';
            }
        });
    }
    return str;
};
// 获取所有的基础数据
CustomerComplaintHistory.prototype.readAllBaseDatas = function (data) {
    let cmdText = `
    SELECT ID,store_name AS storeName,company_org_id AS companyOrgID,company_org_name AS companyOrgName,
        create_by_name AS createByName,create_by_id AS createByID ,update_by_id AS updateByID, update_by_name AS updateByName
        FROM amazon_service_stores WHERE disabled = 1 AND company_org_id = ?  ORDER BY CONVERT(store_name USING gb2312) ASC;
    SELECT ID,product_type AS productType,create_by_id AS createByID ,create_by_name AS createByName
        ,update_by_id AS updateByID,update_by_name AS updateByName 
        ,company_org_id AS companyOrgID ,company_org_name AS companyOrgName
        FROM amazon_service_product_types WHERE disabled = 1 AND company_org_id = ? ORDER BY CONVERT(product_type USING gb2312) ASC;
    SELECT ID,product_group_name AS productGroupName,create_by_id AS createByID ,create_by_name AS createByName
        ,update_by_id AS updateByID,update_by_name AS updateByName
        ,company_org_id AS companyOrgID ,company_org_name AS companyOrgName
        FROM amazon_service_product_groups WHERE disabled = 1 AND company_org_id = ? ORDER BY CONVERT(product_group_name USING gb2312) ASC;
    SELECT ID,countries_name AS countriesName,create_by_id AS createByID ,create_by_name AS createByName
        ,update_by_id AS updateByID,update_by_name AS updateByName
        ,company_org_id AS companyOrgID ,company_org_name AS companyOrgName
        FROM amazon_service_countries WHERE disabled = 1 AND  company_org_id = ? ORDER BY CONVERT(countries_name USING gb2312) ASC;
    SELECT ID,question_type AS questionType,create_by_id AS createByID ,create_by_name AS createByName ,
        update_by_id AS updateByID,update_by_name AS updateByName, company_org_id AS companyOrgID ,company_org_name AS companyOrgName
        FROM amazon_service_question_types WHERE disabled = 1 AND company_org_id = ? ORDER BY CONVERT(question_type USING gb2312) ASC;
    SELECT ID,resolve_method_name AS resolveMethodName,create_by_id AS createByID ,create_by_name AS createByName ,
        update_by_id AS updateByID,update_by_name AS updateByName, company_org_id AS companyOrgID ,company_org_name AS companyOrgName
        FROM amazon_service_solutions WHERE disabled = 1 AND company_org_id = ? ORDER BY CONVERT(resolve_method_name USING gb2312) ASC;
    `,
        cmdParams = [data.companyOrgID, data.companyOrgID, data.companyOrgID, data.companyOrgID, data.companyOrgID, data.companyOrgID];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
// 创建一条客诉记录
CustomerComplaintHistory.prototype.createCustomerComplaint = function (data) {
    let cmdText = `INSERT INTO amazon_service_customer_complaint
        (ID,SKU,resolve_time,resolve_user_id,resolve_user_name,
        countries_id,countries_name,store_name,store_id,product_group_id,product_group_name,
        product_type_id,product_type_name,ASIN,product_name,
        customer_complaint_time,order_number,question_type_id,question_type_name,description,
        org_group_id,solution_name,solution_id,number,remark ${data.orderTime ? ',order_time' : ''})
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? ${data.orderTime ? ',?' : ''})`,
        cmdParams = [data.ID, data.SKU, data.resolveTime, data.resolveUserID, data.resolveUserName,
        data.countriesID, data.countriesName, data.storeName, data.storeID, data.productGroupID, data.productGroupName,
        data.productTypeID, data.productTypeName, data.ASIN, data.productName,
        data.customerComplaintTime, data.orderNumber, data.questionTypeID, data.questionTypeName, data.description,
        data.orgGroupID, data.resolveMethodName, data.resolveMethodID, data.number, data.remark];
    if (data.orderTime) {
        cmdParams.push(data.orderTime);
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取客诉记录(需要分页,查询条件：主题号，SKU，时间)
CustomerComplaintHistory.prototype.readCustomerComplaint = function (data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1 || 0) * limit,
        cmdText = `SELECT ID,SKU,resolve_time AS resolveTime ,resolve_user_id AS resolveUserID 
        ,resolve_user_name  AS resolveUserName ,countries_id AS countriesID ,countries_name AS countriesName 
        ,store_name AS storeName,store_id AS storeID, product_group_id AS productGroupID ,product_group_name AS productGroupName
        ,product_type_id AS productTypeID,product_type_name AS productTypeName,ASIN,product_name AS productName
        ,order_time AS orderTime,customer_complaint_time AS customerComplaintTime,order_number AS orderNumber
        ,question_type_id AS questionTypeID,question_type_name AS questionTypeName,description
        ,org_group_id as orgGroupID,solution_name AS resolveMethodName,solution_id AS resolveMethodID, number, remark
         FROM amazon_service_customer_complaint WHERE org_group_id IN `,
        cmdParams = data.orgGroupIDAll;
    cmdText += this.convertParams(data.orgGroupIDAll);
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.countriesID && data.countriesName) {
        cmdText += ` AND countries_id = ?`;
        cmdParams.push(data.countriesID);
    }
    if (data.storeName && data.storeID) {
        cmdText += ` AND store_id = ?`;
        cmdParams.push(data.storeID);
    }
    if (data.productGroupID && data.productGroupName) {
        cmdText += ` AND product_group_id = ?`;
        cmdParams.push(data.productGroupID);
    }
    if (data.productTypeID && data.productTypeName) {
        cmdText += ` AND product_type_id = ?`;
        cmdParams.push(data.productTypeID);
    }
    if (data.questionTypeID && data.questionTypeName) {
        cmdText += ` AND question_type_id = ?`;
        cmdParams.push(data.questionTypeID);
    }
    if (data.resolveMethodID && data.resolveMethodName) {
        cmdText += ` AND solution_id = ?`;
        cmdParams.push(data.resolveMethodID);
    }
    // 订单时间
    if (data.orderStartTime) {
        cmdText += ` AND DATE(order_time) >= ? `;
        cmdParams.push(data.orderStartTime);
    }
    if (data.orderEndTime) {
        cmdText += ` AND DATE(order_time) <= ? `;
        cmdParams.push(data.orderEndTime);
    }
    // 处理时间
    if (data.resolveStartTime) {
        cmdText += ` AND DATE(resolve_time) >= ? `;
        cmdParams.push(data.resolveStartTime);
    }
    if (data.resolveEndTime) {
        cmdText += ` AND DATE(resolve_time) <= ? `;
        cmdParams.push(data.resolveEndTime);
    }
    // 客诉时间
    if (data.serverStartTime) {
        cmdText += ` AND DATE(customer_complaint_time) >= ? `;
        cmdParams.push(data.serverStartTime);
    }
    if (data.serverEndTime) {
        cmdText += ` AND DATE(customer_complaint_time) <= ? `;
        cmdParams.push(data.serverEndTime);
    }
    if (data.keyword) {
        data.keyword = data.keyword.replace(/'|\?/, '');
        cmdText += ` AND (
        SKU LIKE '%${data.keyword}%' 
        OR ASIN LIKE '%${data.keyword}%'
        OR product_name LIKE '%${data.keyword}%'
        OR description LIKE '%${data.keyword}%'
        OR resolve_user_name LIKE '%${data.keyword}%'
        OR order_number LIKE '%${data.keyword}%'
        OR remark LIKE '%${data.keyword}%')`;
    }
    cmdText += ` ORDER BY customer_complaint_time DESC LIMIT ?,?`;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
// 读取客诉记录(不分页,查询条件：主题号，SKU，时间)
CustomerComplaintHistory.prototype.readCustomerComplaintNoPage = function (data) {
    let cmdText = `SELECT ID,SKU,resolve_time AS resolveTime ,resolve_user_id AS resolveUserID 
        ,resolve_user_name  AS resolveUserName ,countries_id AS countriesID ,countries_name AS countriesName 
        ,store_name AS storeName,store_id AS storeID, product_group_id AS productGroupID ,product_group_name AS productGroupName
        ,product_type_id AS productTypeID,product_type_name AS productTypeName,ASIN,product_name AS productName
        ,order_time AS orderTime,customer_complaint_time AS customerComplaintTime,order_number AS orderNumber
        ,question_type_id AS questionTypeID,question_type_name AS questionTypeName,description
        ,org_group_id as orgGroupID,solution_name AS resolveMethodName,solution_id AS resolveMethodID,number ,remark
         FROM amazon_service_customer_complaint WHERE org_group_id IN `,
        cmdParams = data.orgGroupIDAll;
    cmdText += this.convertParams(data.orgGroupIDAll);
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.countriesID && data.countriesID.length && data.countriesName) {
        cmdText += ` AND countries_id = ?`;
        cmdParams.push(data.countriesID[0]);
    }
    if (data.storeName && data.storeID.length && data.storeID) {
        cmdText += ` AND store_id = ?`;
        cmdParams.push(data.storeID);
    }
    if (data.productGroupID && data.productGroupID.length && data.productGroupName) {
        cmdText += ` AND product_group_id = ?`;
        cmdParams.push(data.productGroupID[0]);
    }
    if (data.productTypeID && data.productTypeID.length && data.productTypeName) {
        cmdText += ` AND product_type_id = ?`;
        cmdParams.push(data.productTypeID[0]);
    }
    if (data.resolveMethodID && data.resolveMethodID.length && data.resolveMethodName) {
        cmdText += ` AND solution_id = ?`;
        cmdParams.push(data.resolveMethodID[0]);
    }
    if (data.questionTypeID && data.questionTypeID.length && data.questionTypeName) {
        cmdText += ` AND question_type_id = ?`;
        cmdParams.push(data.questionTypeID[0]);
    }
    // 订单时间
    if (data.orderStartTime) {
        cmdText += ` AND DATE(order_time) >= ? `;
        cmdParams.push(data.orderStartTime);
    }
    if (data.orderEndTime) {
        cmdText += ` AND DATE(order_time) <= ? `;
        cmdParams.push(data.orderEndTime);
    }
    // 处理时间
    if (data.resolveStartTime) {
        cmdText += ` AND DATE(resolve_time) >= ? `;
        cmdParams.push(data.resolveStartTime);
    }
    if (data.resolveEndTime) {
        cmdText += ` AND DATE(resolve_time) <= ? `;
        cmdParams.push(data.resolveEndTime);
    }
    // 客诉时间
    if (data.serverStartTime) {
        cmdText += ` AND DATE(customer_complaint_time) >= ? `;
        cmdParams.push(data.serverStartTime);
    }
    if (data.serverEndTime) {
        cmdText += ` AND DATE(customer_complaint_time) <= ? `;
        cmdParams.push(data.serverEndTime);
    }
    if (data.keyword) {
        data.keyword = data.keyword.replace(/'|\?/, '');
        cmdText += ` AND (
        SKU LIKE '%${data.keyword}%' 
        OR ASIN LIKE '%${data.keyword}%'
        OR product_name LIKE '%${data.keyword}%'
        OR description LIKE '%${data.keyword}%'
        OR resolve_user_name LIKE '%${data.keyword}%'
        OR order_number LIKE '%${data.keyword}%'
        OR remark LIKE '%${data.keyword}%' )`;
    }
    cmdText += ` ORDER BY customer_complaint_time DESC`;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取客诉记录总数
CustomerComplaintHistory.prototype.readCustomerComplaintTotal = function (data) {
    let cmdText = `SELECT COUNT(ID) as total FROM amazon_service_customer_complaint WHERE  org_group_id IN `,
        cmdParams = data.orgGroupIDAll;
    cmdText += this.convertParams(data.orgGroupIDAll);
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.countriesID && data.countriesName) {
        cmdText += ` AND countries_id = ?`;
        cmdParams.push(data.countriesID);
    }
    if (data.storeName && data.storeID) {
        cmdText += ` AND store_id = ?`;
        cmdParams.push(data.storeID);
    }
    if (data.productGroupID && data.productGroupName) {
        cmdText += ` AND product_group_id = ?`;
        cmdParams.push(data.productGroupID);
    }
    if (data.productTypeID && data.productTypeName) {
        cmdText += ` AND product_type_id = ?`;
        cmdParams.push(data.productTypeID);
    }
    if (data.questionTypeID && data.questionTypeName) {
        cmdText += ` AND question_type_id = ?`;
        cmdParams.push(data.questionTypeID);
    }
    if (data.resolveMethodID && data.resolveMethodID.length && data.resolveMethodName) {
        cmdText += ` AND solution_id = ?`;
        cmdParams.push(data.resolveMethodID);
    }
    // 订单时间
    if (data.orderStartTime) {
        cmdText += ` AND DATE(order_time) >= ? `;
        cmdParams.push(data.orderStartTime);
    }
    if (data.orderEndTime) {
        cmdText += ` AND DATE(order_time) <= ? `;
        cmdParams.push(data.orderEndTime);
    }
    // 处理时间
    if (data.resolveStartTime) {
        cmdText += ` AND DATE(resolve_time) >= ? `;
        cmdParams.push(data.resolveStartTime);
    }
    if (data.resolveEndTime) {
        cmdText += ` AND DATE(resolve_time) <= ? `;
        cmdParams.push(data.resolveEndTime);
    }
    // 客诉时间
    if (data.serverStartTime) {
        cmdText += ` AND DATE(customer_complaint_time) >= ? `;
        cmdParams.push(data.serverStartTime);
    }
    if (data.serverEndTime) {
        cmdText += ` AND DATE(customer_complaint_time) <= ? `;
        cmdParams.push(data.serverEndTime);
    }
    if (data.keyword) {
        data.keyword = data.keyword.replace(/'|\?/, '');
        cmdText += ` AND (
            SKU LIKE '%${data.keyword}%' 
            OR ASIN LIKE '%${data.keyword}%'
            OR product_name LIKE '%${data.keyword}%'
            OR description LIKE '%${data.keyword}%'
            OR resolve_user_name LIKE '%${data.keyword}%' 
            OR remark LIKE '%${data.keyword}%')`;
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取一条记录，通过ID
CustomerComplaintHistory.prototype.readCustomerComplaintByID = function (data) {
    let cmdText = `SELECT ID , SKU , resolve_time AS resolveTime ,resolve_user_id AS resolveUserID 
    ,resolve_user_name  AS resolveUserName ,countries_id AS countriesID ,countries_name AS countriesName 
    ,store_name AS storeName,store_id AS storeID, product_group_id AS productGroupID ,product_group_name AS productGroupName
    ,product_type_id AS productTypeID,product_type_name AS productTypeName,ASIN,product_name AS productName
    ,order_time AS orderTime,customer_complaint_time AS customerComplaintTime,order_number AS orderNumber
    ,question_type_id AS questionTypeID,question_type_name AS questionTypeName,description
    ,org_group_id as orgGroupID,solution_name AS resolveMethodName,solution_id AS resolveMethodID, number,remark
     FROM amazon_service_customer_complaint WHERE ID = ? `,
        cmdParams = [data.ID];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};
// 读取一条记录，通过订单号
CustomerComplaintHistory.prototype.readCustomerComplaintByOrderNumber = function (data) {
    let cmdText = `SELECT ID , SKU , resolve_time AS resolveTime ,resolve_user_id AS resolveUserID 
    ,resolve_user_name  AS resolveUserName ,countries_id AS countriesID ,countries_name AS countriesName 
    ,store_name AS storeName,store_id AS storeID, product_group_id AS productGroupID ,product_group_name AS productGroupName
    ,product_type_id AS productTypeID,product_type_name AS productTypeName,ASIN,product_name AS productName
    ,order_time AS orderTime,customer_complaint_time AS customerComplaintTime,order_number AS orderNumber
    ,question_type_id AS questionTypeID,question_type_name AS questionTypeName,description
    ,org_group_id as orgGroupID,solution_name AS resolveMethodName,solution_id AS resolveMethodID, number,remark
     FROM amazon_service_customer_complaint WHERE order_number = ? `,
        cmdParams = [data.orderNumber];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新一条客诉记录
CustomerComplaintHistory.prototype.updateCustomerComplaint = function (data) {
    let cmdText = `UPDATE  amazon_service_customer_complaint SET SKU = ?,ASIN = ?,
                   order_number = ?,number = ?,order_time = ?,product_name = ?,product_group_id = ?,
                   product_group_name = ? , product_type_id = ?,product_type_name = ? ,
                   question_type_id = ?,question_type_name = ? , countries_id = ?,countries_name = ? , 
                   description = ?,solution_id = ?,solution_name = ? , remark = ? `,
        cmdParams = [data.SKU, data.ASIN, data.orderNumber, data.number, data.orderTime,
        data.productName, data.productGroupID, data.productGroupName,
        data.productTypeID, data.productTypeName, data.questionTypeID, data.questionTypeName,
        data.countriesID, data.countriesName, data.description,
        data.resolveMethodID, data.resolveMethodName, data.remark];
    if (data.storeName && data.storeID) {
        cmdText += `, store_name = ? ,store_id = ? `;
        cmdParams.push(data.storeName, data.storeID);
    }
    // if (data.orderTime) {
    //     cmdText += `,order_time = ?`;
    //     cmdParams.push(data.orderTime);
    // }
    // if (data.SKU) {
    //     cmdText += `, SKU = ?`;
    //     cmdParams.push(data.SKU);
    // }
    // if (data.ASIN) {
    //     cmdText += `, ASIN = ?`;
    //     cmdParams.push(data.ASIN);
    // }
    // if (data.orderNumber) {
    //     cmdText += `, order_number = ?`;
    //     cmdParams.push(data.orderNumber);
    // }
    // if (data.number) {
    //     cmdText += `, number = ?`;
    //     cmdParams.push(data.number);
    // }
    // if (data.productName) {
    //     cmdText += `, product_name = ?`;
    //     cmdParams.push(data.productName);
    // }
    // if (data.productGroupID && data.productGroupName) {
    //     cmdText += `, product_group_id = ? ,product_group_name = ?`;
    //     cmdParams.push(data.productGroupID);
    //     cmdParams.push(data.productGroupName);
    // }
    // if (data.productTypeID && data.productTypeName) {
    //     cmdText += `, product_type_id = ?,product_type_name = ? `;
    //     cmdParams.push(data.productTypeID);
    //     cmdParams.push(data.productTypeName);
    // }
    // if (data.questionTypeID && data.questionTypeName) {
    //     cmdText += `, question_type_id = ?,question_type_name = ? `;
    //     cmdParams.push(data.questionTypeID);
    //     cmdParams.push(data.questionTypeName);
    // }
    // if (data.countriesID && data.countriesName) {
    //     cmdText += `, countries_id = ?,countries_name = ? `;
    //     cmdParams.push(data.countriesID);
    //     cmdParams.push(data.countriesName);
    // }
    // if (data.description) {
    //     cmdText += `, description = ?`;
    //     cmdParams.push(data.description);
    // }
    // if (data.resolveMethodID && data.resolveMethodID) {
    //     cmdText += ',solution_id = ?,solution_name = ?';
    //     cmdParams.push(data.resolveMethodID);
    //     cmdParams.push(data.resolveMethodName);
    // }
    // cmdText += `, remark = ?`;
    // cmdParams.push(data.remark);
    if (data.ID) {
        cmdText += ` WHERE ID = ?`;
        cmdParams.push(data.ID);
    }
    // cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新一条客诉记录（针对基础数据，一次只能更新一个数据）
CustomerComplaintHistory.prototype.updateCustomerComplaintForBaseData = function (data) {
    let cmdText = `SELECT * FROM amazon_service_customer_complaint WHERE ID = 0`,
        cmdParams = [];
    if (data.productGroupID && data.productGroupName) {
        cmdText = `UPDATE  amazon_service_customer_complaint SET product_group_name = ? WHERE product_group_id = ? AND org_group_id IN ` + this.convertParams(data.orgGroupIDAll);
        cmdParams = [data.productGroupName, data.productGroupID].concat(data.orgGroupIDAll);
    }
    if (data.productTypeID && data.productTypeName) {
        cmdText = `UPDATE  amazon_service_customer_complaint SET product_type_name = ? WHERE product_type_id = ? AND org_group_id IN ` + this.convertParams(data.orgGroupIDAll);
        cmdParams = [data.productTypeName, data.productTypeID].concat(data.orgGroupIDAll);
    }
    if (data.questionTypeID && data.questionTypeName) {
        cmdText = `UPDATE  amazon_service_customer_complaint SET question_type_name = ? WHERE question_type_id = ? AND org_group_id IN ` + this.convertParams(data.orgGroupIDAll);
        cmdParams = [data.questionTypeName, data.questionTypeID].concat(data.orgGroupIDAll);
    }
    if (data.countriesID && data.countriesName) {
        cmdText = `UPDATE  amazon_service_customer_complaint SET countries_name = ? WHERE countries_id = ? AND org_group_id IN ` + this.convertParams(data.orgGroupIDAll);
        cmdParams = [data.countriesName, data.countriesID].concat(data.orgGroupIDAll);
    }
    if (data.resolveMethodID && data.resolveMethodName) {
        cmdText = `UPDATE  amazon_service_customer_complaint SET solution_name = ? WHERE solution_id = ? AND org_group_id IN ` + this.convertParams(data.orgGroupIDAll);
        cmdParams = [data.resolveMethodName, data.resolveMethodID].concat(data.orgGroupIDAll);
    }
    if (data.storeID && data.storeName) {
        cmdText
            = `UPDATE  amazon_service_customer_complaint SET store_name = ? WHERE store_id = ?`;
        cmdParams = [data.storeName, data.storeID];
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};


// 删除客诉记录（通过ID，支持批量）
CustomerComplaintHistory.prototype.deleteCustomerComplaint = function (data) {
    let cmdText = `DELETE FROM amazon_service_customer_complaint WHERE ID IN `,
        cmdParams = [];
    cmdText += this.convertParams(data.ID);
    cmdParams = data.ID;
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 删除客诉记录（通过基础数据[商品类型、商品分组、国家、问题分类]，支持批量）
CustomerComplaintHistory.prototype.deleteCustomerComplaintForBaseData = function (data) {
    let cmdText = `DELETE FROM amazon_service_customer_complaint WHERE 1 = 1`,
        cmdParams = [];
    if (data.productTypeID && data.productTypeName) {
        cmdText += ' AND product_type_id IN ' + this.convertParams(data.productTypeID);
        cmdParams = data.productTypeID;
    }
    if (data.productGroupID && data.productGroupName) {
        cmdText += ' AND product_group_id IN ' + this.convertParams(data.productGroupID);
        cmdParams = data.productGroupID;
    }
    if (data.countriesID && data.countriesName) {
        cmdText += ' AND countries_id IN ' + this.convertParams(data.countriesID);
        cmdParams = data.countriesID;
    }
    if (data.questionTypeID && data.questionTypeName) {
        cmdText += ' AND question_type_id IN ' + this.convertParams(data.questionTypeID);
        cmdParams = data.questionTypeID;
    }
    if (data.resolveMethodID && data.resolveMethodName) {
        cmdText += ' AND solution_id IN ' + this.convertParams(data.resolveMethodID);
        cmdParams = data.resolveMethodID;
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = CustomerComplaintHistory;