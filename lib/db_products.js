/*
 * 用于 产品 模块功能的数据实现
 */
"use strict";
let Core = require("./core");

// 产品构造函数
let Product = function (pool) {
    this.pool = pool;
};

// 转换查询参数，传入一个数组，返回字符串
Product.prototype.convertParams = function (arr) {
    var str = '(';
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

// 创建一条产品记录
Product.prototype.createProduct = function (data) {
    let cmdText = `INSERT INTO amazon_service_products
        (store_name,SKU,countries_id,countries_name,
        product_group_id,product_group_name,
        product_type_id,product_type_name,ASIN,
        product_name,company_org_id,company_org_name)
        VALUES `,
        cmdParams = [];
    if (Array.isArray(data.products)) {
        data.products.forEach(function (product, index) {
            if (index !== data.products.length - 1) {
                cmdText += '(?,?,?,?,?,?,?,?,?,?,?,?),';
            } else {
                cmdText += '(?,?,?,?,?,?,?,?,?,?,?,?)';
            }
            cmdParams.push(product.storeName);
            cmdParams.push(product.SKU);
            cmdParams.push(product.countriesID || 0);
            cmdParams.push(product.countriesName);
            cmdParams.push(product.productGroupID || 0);
            cmdParams.push(product.productGroupName);
            cmdParams.push(product.productTypeID || 0);
            cmdParams.push(product.productTypeName);
            cmdParams.push(product.ASIN);
            cmdParams.push(product.productName);
            cmdParams.push(product.companyOrgID);
            cmdParams.push(product.companyOrgName);
        });
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 修正产品数据
Product.prototype.adjustProduct = function (data) {
    let cmdText = `UPDATE amazon_service_products p
      JOIN amazon_service_countries c ON p.countries_name = c.countries_name
      SET p.countries_id = c.ID;
      UPDATE amazon_service_products p
      JOIN amazon_service_product_groups c ON p.product_group_name = c.product_group_name
      SET p.product_group_id = c.ID;
      UPDATE amazon_service_products p
      JOIN amazon_service_product_types c ON p.product_type_name = c.product_type
      SET p.product_type_id = c.ID;`, cmdParams = [];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录，不分页
Product.prototype.readProductNoPage = function (data) {
    let cmdText = `SELECT SKU,ASIN,countries_name AS countriesName ,store_name AS storeName,disabled ,product_group_name AS productGroupName
                   FROM amazon_service_products WHERE company_org_id = ? AND disabled = 1  
                   ORDER BY CONVERT(product_type_name USING gb2312) ASC`,
        cmdParams = [data.companyOrgID];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取记录(需要分页,查询条件：ID，SKU,ASIN等)
Product.prototype.readProduct = function (data) {
    let limit = Number(data.limit || 20),
        offset = Number(data.offset - 1) * limit,
        cmdText = `SELECT ID, store_name AS storeName,SKU,countries_id AS countriesID ,countries_name AS countriesName 
        ,product_group_id AS productGroupID ,product_group_name AS productGroupName
        ,product_type_id AS productTypeID,product_type_name AS productTypeName,ASIN,product_name AS productName
        ,company_org_id AS companyOrgID ,company_org_name AS companyOrgName,disabled
         FROM amazon_service_products WHERE disabled = 1 AND company_org_id = ? `,
        cmdParams = [data.companyOrgID];
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.SKU) {
        cmdText += ` AND SKU LIKE '%${data.SKU}%' `;
    }
    if (data.ASIN) {
        cmdText += ` AND ASIN LIKE '%${data.ASIN}%' `;
    }
    if (data.countriesID && data.countriesName) {
        cmdText += ` AND countries_id = ? `;
        cmdParams.push(data.countriesID);
    }
    if (data.productGroupID && data.productGroupName) {
        cmdText += ` AND product_group_id = ? `;
        cmdParams.push(data.productGroupID);
    }
    if (data.productTypeID && data.productTypeName) {
        cmdText += ` AND product_type_id = ?`;
        cmdParams.push(data.productTypeID);
    }
    if (data.productName) {
        data.productName = data.productName.replace(/'|\?/, '');
        cmdText += ` AND product_name LIKE '%${data.productName}%' `;
    }
    if (data.storeName && data.storeID) {
        cmdText += ` AND store_name LIKE '%${data.storeName}%' `;
    }
    cmdText += ` ORDER BY CONVERT(product_type_name USING gb2312) ASC LIMIT ?,? `;
    cmdParams.push(offset, limit);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取总数根据条件
Product.prototype.readProductTotal = function (data) {
    let cmdText = `SELECT COUNT(ID) as total FROM amazon_service_products WHERE disabled = 1 AND company_org_id = ? `,
        cmdParams = [data.companyOrgID];
    if (data.ID) {
        cmdText += ` AND ID = ?`;
        cmdParams.push(data.ID);
    }
    if (data.SKU) {
        cmdText += ` AND SKU LIKE '%${data.SKU}%' `;
    }
    if (data.ASIN) {
        cmdText += ` AND ASIN LIKE '%${data.ASIN}%' `;
    }
    if (data.countriesID && data.countriesName) {
        cmdText += ` AND countries_id = ?`;
        cmdParams.push(data.countriesID);
    }
    if (data.productGroupID) {
        cmdText += ` AND product_group_id = ?`;
        cmdParams.push(data.productGroupID);
    }
    if (data.productTypeID) {
        cmdText += ` AND product_type_id = ?`;
        cmdParams.push(data.productTypeID);
    }
    if (data.productName) {
        data.productName = data.productName.replace(/'|\?/, '');
        cmdText += ` AND product_name LIKE '%${data.productName}%'`;
    }
    if (data.storeName && data.storeID) {
        cmdText += ` AND store_name LIKE '%${data.storeName}%'`;
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取一条记录（读取启用的数据），通过ID
Product.prototype.readProductByID = function (data) {
    let cmdText = `SELECT ID,store_name AS storeName,SKU,countries_id AS countriesID ,countries_name AS countriesName 
    ,product_group_id AS productGroupID ,product_group_name AS productGroupName
    ,product_type_id AS productTypeID,product_type_name AS productTypeName,ASIN,product_name AS productName
    ,company_org_id AS companyOrgID ,company_org_name AS companyOrgName
     FROM amazon_service_products WHERE disabled = 1 AND ID = ?`,
        cmdParams = [data.ID];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 读取一条记录，通过SKU
Product.prototype.readProductBySKU = function (data) {
    let cmdText = `SELECT ID,store_name AS storeName,SKU,countries_id AS countriesID ,countries_name AS countriesName 
    ,product_group_id AS productGroupID ,product_group_name AS productGroupName
    ,product_type_id AS productTypeID,product_type_name AS productTypeName,ASIN,product_name AS productName
    ,company_org_id AS companyOrgID ,company_org_name AS companyOrgName
     FROM amazon_service_products WHERE disabled = 1 AND SKU = ? AND company_org_id = ?`,
        cmdParams = [data.SKU, data.companyOrgID];
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新
Product.prototype.updateProduct = function (data) {
    let cmdText = `UPDATE  amazon_service_products SET `,
        cmdParams = [];
    if (data.productGroupID && data.productGroupName) {
        cmdText += `, product_group_id = ? ,product_group_name = ?`;
        cmdParams.push(data.productGroupID, data.productGroupName);
    }
    if (data.productTypeID && data.productTypeName) {
        cmdText += `, product_type_id = ?,product_type_name = ? `;
        cmdParams.push(data.productTypeID, data.productGroupName);
    }
    if (data.storeName) {
        cmdText += `,store_name = ?`;
        cmdParams.push(data.storeName);
    }
    if (data.SKU) {
        cmdText += `, SKU = ?`;
        cmdParams.push(data.SKU);
    }
    if (data.countriesID && data.countriesName) {
        cmdText += `, countries_name=? ,countries_id = ? `;
        cmdParams.push(data.countriesName, data.countriesID);
    }
    if (data.ASIN) {
        cmdText += `,ASIN = ? `;
        cmdParams.push(data.ASIN);
    }
    if (data.productName) {
        cmdText += `, product_name = ? `;
        cmdParams.push(data.productName);
    }
    cmdText += ` WHERE ID = ?`;
    cmdParams.push(data.ID);
    cmdText = cmdText.replace(/SET ,/ig, 'SET ');
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 更新商品数据，通过对基础数据的更新（商品品类、商品分组、国家、店铺,一次只更新一种基础数据）
Product.prototype.updateByBaseData = function (data) {
    let cmdParams = [], cmdText = `SELECT * FROM amazon_service_products WHERE ID = 0`;
    if (data.productGroupID && data.productGroupName) {
        cmdText = `UPDATE  amazon_service_products SET product_group_name = ? WHERE product_group_id = ? AND company_org_id = ?`;
        cmdParams = [data.productGroupName, data.productGroupID, data.companyOrgID];
    }
    if (data.productTypeID && data.productTypeName) {
        cmdText = `UPDATE  amazon_service_products SET  product_type_name = ? WHERE product_type_id = ? AND company_org_id = ?`;
        cmdParams = [data.productTypeName, data.productTypeID, data.companyOrgID];
    }
    if (data.countriesID && data.countriesName) {
        cmdText = `UPDATE  amazon_service_products SET  countries_name = ? WHERE countries_id = ? AND company_org_id = ?`;
        cmdParams = [data.countriesName, data.countriesID, data.companyOrgID];
    }
    if (data.storeName && data.oldStoreName) {
        cmdText = `UPDATE  amazon_service_products SET  store_name = ? WHERE store_name = ? AND company_org_id = ?`;
        cmdParams = [data.storeName, data.oldStoreName, data.companyOrgID];
    }
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

// 删除
Product.prototype.deleteProduct = function (data) {
    let cmdText = `UPDATE  amazon_service_products SET disabled = 0 WHERE ID IN `,
        cmdParams = data.ID;
    // cmdParams = cmdParams.concat(data.ID);
    cmdText += this.convertParams(data.ID);
    return Core.flyer.return_promise(this.pool, cmdText, cmdParams);
};

module.exports = Product;