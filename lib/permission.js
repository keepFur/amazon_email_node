"use strict";
let http = require("http"),
    Config = require("./config"),
    permissionData = require("./permission_data");

class Roles {
    constructor(options) {
        this.userName = options.userName;
    }

    //获取权限数据
    getRolesData(groups) {

        let roles = [],
            menus = [];

        groups.forEach(function(item) {
            let menuData = [],
                _roles = permissionData.roles[item.orgCode];
            roles.push({ orgGroupId: item.orgGroupId, rolesData: _roles });
            _roles.forEach(function(val, index, data) {
                menuData.push(permissionData.modules[val]);
            });
            menus.push({ orgGroupId: item.orgGroupId, menuData: menuData });
        });

        return {
            roles: roles,
            menus: menus
        }
    }

    //获得用户权限
    getRoles() {
        let _this = this;
        return new Promise(function(resolve, reject) {
            let httpOptions = {
                hostname: Config.url_list.permission_url,
                path: `/cas_api/work_flow/gain_user_org_and_group_by_account?account=${_this.userName}`,
                method: "GET"
            }
            let req = http.request(httpOptions, function(res) {
                let data = "";
                res.setEncoding("utf-8");
                res.on("data", function(newData) {
                    data = data + newData;
                });
                res.on("end", function() {
                    if (res.statusCode === 200) {
                        data = JSON.parse(data);
                        if (data.data) {
                            let group = data.data.groups.filter(function(val) {
                                return val.categoryId == "91";
                            });
                            if (group) {
                                data.data.groups = [];
                                data.data.groups = data.data.groups.concat(group);
                                data["permission"] = _this.getRolesData(group);
                                resolve(data);
                            } else {
                                reject(data);
                            }

                        } else {
                            reject(data);
                        }
                    } else {
                        reject(data);
                    }
                });
            });
            req.end();
        });
    }
}

module.exports = Roles;