"use strict";
let DB = require("./db");
class ProductType {
    /**
     * Creates an instance of ProductType.
     * @memberof ProductType
     */
    constructor() {
        // 数据库查询对象
        this.dbProductType = DB.dbQuery.productType;
    }
    /**
     * 读取数据（不需要分页）
     * 
     * @param {Object} req http请求体对象
     * @param {Object} res http响应体对象
     * @param {Object} data 请求参数,包括当前页码，每页数据大小，以及搜索关键字属性 {limit:'',offset:'',keyword:''}
     * @memberof ProductType
     */
    readProductType(req, res, data) {
        DB.dbQuery.productType.readProductType(data).then(result => {
            res.send({
                success: true,
                message: '',
                data: {
                    rows: result
                }
            });
        }).catch(err => res.send({ success: false, message: err.message, data: { rows: [] } }));
    }
    /**
     * 读取数据（需要分页）
     * 
     * @param {Object} req http请求体对象
     * @param {Object} res http响应体对象
     * @param {Object} data 请求参数 {keyword:''}
     * @memberof ProductType
     */
    readProductTypePage(req, res, data) {
        this.dbProductType.readProductTypePage(data).then(result => {
            this.dbProductType.readProductTypeTotal(data).then(total => {
                res.send({
                    success: true,
                    message: '',
                    data: {
                        rows: result,
                        total: total[0].total
                    }
                });
            }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
        }).catch(err => res.send({ success: false, message: err.message, data: { rows: [], total: 0 } }));
    }
    /**
     * 创建数据（支持批量）
     * 
     * @param {Object} req http请求体对象
     * @param {Object} res http响应体对象
     * @param {Object} data 请求参数 {createByName:'',createByID:'',productType:[]}
     * @memberof ProductType
     */
    createProductType(req, res, data) {
        this.dbProductType.createProductType(data).then(result => {
            res.send({
                success: result.affectedRows === data.productType.length,
                message: ''
            });
        }).catch(err => res.send({ success: false, message: err.message }));
    }
    /**
     * 更新数据
     * 
     * @param {Object} req http请求体对象
     * @param {Object} res http响应体对象
     * @param {Object} data 请求参数 {productTypeName:''}
     * @memberof ProductType
     */
    updateProductType(req, res, data) {
        this.dbProductType.updateProductType(data).then(result => {
            res.send({
                success: result.affectedRows === 1,
                message: ''
            });
            // 同时更新客诉记录中的数据
            DB.dbQuery.customerComplaintHistory.updateCustomerComplaintForBaseData({
                productTypeName: data.productType,
                productTypeID: data.ID,
                orgGroupIDAll: data.orgGroupIDAll
            });
            // 同时更新产品中心的数据
            DB.dbQuery.product.updateByBaseData({
                productTypeName: data.productType,
                productTypeID: data.ID,
                companyOrgID: data.companyOrgID
            });
        }).catch(err => res.send({ success: false, message: err.message }));
    }
    /**
     * 删除数据（支持批量）
     * 
     * @param {Object} req http请求体对象
     * @param {Object} res http响应体对象
     * @param {Object} data 请求参数 {IDS:[]}
     * @memberof ProductType
     */
    deleteProductType(req, res, data) {
        this.dbProductType.deleteProductType(data).then(result => {
            res.send({
                success: result.affectedRows === data.IDS.length,
                message: ''
            });
        }).catch(err => res.send({ success: false, message: err.message }));
    }
}
module.exports = ProductType;