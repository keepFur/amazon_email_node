"use strict";
var core = {
    // 是否是开发环境
    isDevEnv() {
        return !!window.location.href.match('localhost');
    },

    // 设置页面的hash
    setWindowHash: function (hash, params) {
        if (params) {
            location.hash = hash + params;
        } else {
            location.hash = hash;
        }
    },

    // 为表格中checkbox绑定点击事件
    bindCheckboxEvent: function ($table) {
        if ($table) {
            try {
                var selector = 'input[type=checkbox][name=""]';
                $table.$body.find(selector).on('click', function () {
                    var $this = $(this),
                        datalength = $table.options.data.length,
                        checkedDataLength = 0;
                    // 选中
                    if ($this.is(':checked')) {
                        checkedDataLength = $table.$body.find(selector + ':checked').length;
                        if (datalength === checkedDataLength) {
                            $table.$header.find(selector).prop('checked', true);
                        }
                    } else {
                        // 取消选中
                        $table.$header.find(selector).prop('checked', false);
                    }
                });
            } catch (error) {
                layer.msg(error);
            }
        }
    },

    /**
     * 
     * 切换分页
     * @param {any} pageContainer 分页容器
     * @param {any} totalNum 总数量
     * @param {any} pageSize  每页显示数量
     * @param {any} options  可选参数包括但不限于  {pageNumber：当前显示的页数，callback：回掉函数}
     * @return {Obj} pageObj  分页的实例对象
     */
    initPager: function ($pageContainer, totalNum, pageSize, options) {
        var pageObj = flyer.page($pageContainer, {
            totalNum: totalNum,
            curIndex: options.pageNumber || 1,
            pageSize: pageSize,
            fnClick: function () {
                var pageSize = 20;
                if (options.pageSizeSelectObj) {
                    pageSize = parseInt(options.pageSizeSelectObj.getSelectedValue());
                }
                // 刷新表格
                options.callback(this.options.curIndex, pageSize);
                options.exports.curIndex = this.options.curIndex;
            } //分页回调函数
        });
        // options.exports.curIndex = pageObj.options.curIndex;
        return pageObj;
    },

    /**
     * 初始化每页显示的条数的下拉框
     * 
     * @param {any} $pageSizeContainer 下拉框容器
     * @param {any} pageList 可供选择的页数 默认是[20,50,100,200]
     * @param {any} currentSize 当前大小
     * @param {any} callback 点击回掉函数
     * @return {Obj} 下拉框实例
     */
    initPagerSizeSelect: function ($pageSizeContainer, pageList, currentSize, options) {
        var pageSizeSelectObj = null,
            that = this;
        if ($pageSizeContainer.length && pageList.length) {
            $pageSizeContainer.show();
            pageSizeSelectObj = flyer.combobox($pageSizeContainer, {
                fieldKey: "key",
                fieldValue: "val",
                isMulti: false,
                allowSearch: false,
                defaultValue: currentSize || '20',
                data: pageList,
                fnSelected: function (item, elm, items) {
                    if (typeof options.callback === 'function') {
                        var pageNumber = 1;
                        // if (options.pagerObj) {
                        //     pageNumber = options.pagerObj.options.curIndex;
                        // }
                        // 刷新表格
                        options.callback(pageNumber, parseInt(item.fieldKey));
                        options.exports.curIndex = pageNumber;
                    }
                } //点击选中事件
            });
        } else if ($pageSizeContainer.length) {
            $pageSizeContainer.hide();
        }
        return pageSizeSelectObj;
    },
    /**
     * 根据每页显示的数据，生成一个字符串
     * 
     * @param {number} length 显示的长度
     */
    generatePageText: function (length) {
        length = length || 20;
        var perPageText = '每页按' + length + '条显示';
        return (flyer.i18n && flyer.i18n.initTitle(perPageText)) || perPageText;
    },

    /**
     * 根据总数获取一个分页的列表数组
     * @param {any} total 数据总数
     * @return {Obj} 一个数组
     */
    getPageListByTotal: function (total) {
        var tempArr = [],
            perPage20 = core.generatePageText(20),
            perPage50 = core.generatePageText(50),
            perPage100 = core.generatePageText(100),
            perPage200 = core.generatePageText(200);
        if (!isNaN(total) && total > 20) {
            // 如果总数大于当前每页显示的数据的话
            if (total <= 50) {
                tempArr.push({
                    key: 20,
                    val: perPage20
                }, {
                        key: 50,
                        val: perPage50
                    });
            } else if (total > 50 && total <= 100) {
                tempArr.push({
                    key: 20,
                    val: perPage20
                }, {
                        key: 50,
                        val: perPage50
                    }, {
                        key: 100,
                        val: perPage100
                    });
            } else if (total > 100) {
                tempArr.push({
                    key: 20,
                    val: perPage20
                }, {
                        key: 50,
                        val: perPage50
                    }, {
                        key: 100,
                        val: perPage100
                    }, {
                        key: 200,
                        val: perPage200
                    });
            }
        }
        return tempArr;
    },

    /**
     * 当表格没有数据的时候，显示没有匹配记录信息
     * 
     * @param {any} $table 表格实例化对象
     * @param {any} totalNum 数据总数
     * @param {any} colspan 需要合并的列数
     * @param {any} message 显示的信息
     */
    tableNoMatch: function ($table, message) {
        if ($table) {
            var msg = '暂时没有数据',
                colspan = $table.$header.find('th').length,
                totalNum = $table.getDatas().length,
                $ele = $('<tr class = "empty_title"><td colspan = ' + colspan + '>' + msg + '</td></tr>');
            if (totalNum) {
                $table.$body.find($ele).remove();
            } else {
                $table.$body.append($ele);
            }
        }
    },



    /**
     * 根据当前的hash值，使左侧菜单高亮
     * 
     * @param {str} hash 当前页面的hash值
     */
    menuHeightLightByHash: function (hash) {
        if (hash) {
            $('ul.flyer-layout-tree').find('a[data-url="' + hash + '.html' + '"]').addClass('flyer-layout-linkActive');
        } else {
            console.log('参数不符合规范。');
        }
    },

    /**
     * 获取表格中选中的数据,返回选中数据的一个数组
     * 
     * @param {any} $table 数据表格
     * @returns 返回一个数组，没有则返回空数据
     */
    getTableCheckedDatas: function ($table) {
        var arr = [],
            rows = [];
        if ($table) {
            var checkedDatas = $table.$body.find('input[type=checkbox][name!=flyer-active-radio]:checked');
            rows = $table.getDatas();
            $.each(checkedDatas, function (index, item) {
                var $item = $(item),
                    $index = $item.parents('tr').data('index');
                arr[index] = rows[$index];
            });
        }
        return arr;
    },

    /**
     * 获取表单的value
     * 
     * @param {any} $form 表单对象
     * @returns 返回一个对象
     */
    getFormValues: function ($form) {
        var formValueObject = {};
        var serializeArray = [];
        if (!$form || !$form.length) {
            $.writeLog('core-getFormValues', '参数错误');
            return {};
        }
        serializeArray = $form.serializeArray();
        serializeArray.forEach(function (element) {
            formValueObject[element.name] = $.trim(element.value);
        }, this);
        return formValueObject;
    },

    /**
     * 计算两个日期想差的天数
     * 
     * @param {stringany} date1 
     * @param {string} date2 
     * @returns 返回差值
     */
    computeDifferentDay: function (date1, date2) {
        var diffDay = 1;
        if (!date1 || !date2) {
            return diffDay;
        }
        date1 = flyer.formatDate('yyyy/mm/dd', date1);
        date2 = flyer.formatDate('yyyy/mm/dd', date2);
        diffDay = (new Date(date2).getTime() - new Date(date1).getTime()) / (1000 * 60 * 60 * 24);
        diffDay ? diffDay : 1;
        return diffDay;
    },

    /**
     * 根据key获取流量入口value
     * 
     * @param {stringany} typeKey 
     * @returns 返回value
     */
    getTaskChildType: function (typeKey) {
        var types = {
            APP_TRAFFIC: 'APP流量',
            PC_TRAFFIC: 'PC流量',
            DIRECT_TRAFFIC: '直访流量',
            SEARCH_COLLECT: '搜索收藏',
            PRODUCT_COLLECT: '商品收藏',
            SHOP_COLLECT: '店铺收藏',
            JUHUASUNAN: '聚划算',
            SEARCH_ADDCART: '搜索加购',
            DIRECT_ADDCART: '直接加购',
            EXPERT_ATTENTION_P: '达人关注（普通粉）',
            EXPERT_ATTENTION_G: '达人关注（高级粉）',
            WEITAO_GOOD: '微淘点赞',
            LIVE_WATCH: '直播观看',
            APPOINTMENT_SOLD: '预约抢购',
            SHOP_ATTENTION: '店铺关注',
            EXPERT_ATTENTION_P: '达人关注',
        };
        if (!typeKey) {
            return types.APP_TRAFFIC;
        }
        return types[typeKey];
    },

    /**
     * 根据key获取流量入口code和name
     * 
     * @param {stringany} typeKey 
     * @returns 返回code
     */
    getTypeCodeByValue: function (typeKey) {
        var types = {
            APP_SEARCH: {
                code: 0,
                price: 10,
                origin: 4,
                name: 'APP搜索',
                plant: 'TB'
            },
            PC_SEARCH: {
                code: 1,
                price: 20,
                origin: 10,
                name: 'PC搜索',
                plant: 'TB'
            },
            DIRECT_SHOP: {
                code: 2,
                price: 20,
                origin: 10,
                name: '直仿店铺',
                plant: 'TB'
            },
            DIRECT_PRODUCT: {
                code: 3,
                price: 20,
                origin: 10,
                name: '直仿商品',
                plant: 'TB'
            },
            SHOP_COLLECT_APP: {
                code: 6,
                price: 50,
                origin: 25,
                name: '店铺收藏APP端',
                plant: 'TB'
            },
            PRODUCT_COLLECT_APP: {
                code: 7,
                price: 50,
                origin: 25,
                name: '商品收藏APP端',
                plant: 'TB'
            },
            SEARCH_COLLECT_APP: {
                code: 9,
                price: 60,
                origin: 29,
                name: '搜索收藏APP端',
                plant: 'TB'
            },
            SEARCH_ADDCART: {
                code: 10,
                price: 85,
                origin: 44,
                name: '搜索加购',
                plant: 'TB'
            },
            DIRECT_ADDCART: {
                code: 11,
                price: 80,
                origin: 40,
                name: '直接加购',
                plant: 'TB'
            },
            LIVE_ATTENTION: {
                code: 12,
                price: 100,
                origin: 50,
                name: '直播关注',
                plant: 'TB'
            },
            WEITAO_GOOD: {
                code: 13,
                price: 25,
                origin: 12,
                name: '微淘点赞',
                plant: 'TB'
            },
            LIVE_WATCH: {
                code: 14,
                price: 10,
                origin: 4,
                name: '直播观看',
                plant: 'TB'
            },
            START_TIP: {
                code: 15,
                price: 10,
                origin: 4,
                name: '开团提醒',
                plant: 'TB'
            },
            JD_TRIFFIC: {
                code: 70,
                price: 20,
                origin: 10,
                name: '京东流量',
                plant: 'JD'
            },
            JD_PRODUCT_COLLECT: {
                code: 71,
                price: 70,
                origin: 35,
                name: '京东商品收藏',
                plant: 'JD'
            },
            JD_SHOP_ATTENTION: {
                code: 72,
                price: 50,
                origin: 25,
                name: '京东店铺关注',
                plant: 'JD'
            },
            JD_ADD_CART: {
                code: 73,
                price: 70,
                origin: 35,
                name: '京东加购',
                plant: 'JD'
            },
            JD_EXPERT_ATTENTION: {
                code: 74,
                price: 60,
                origin: 25,
                name: '京东达人关注',
                plant: 'JD'
            },
            JD_APPOINTMENT_SOLD: {
                code: 75,
                price: 70,
                origin: 35,
                name: '预约抢购',
                plant: 'JD'
            },
            PDD_APP_TRAFFIC: {
                code: 90,
                price: 10,
                origin: 1,
                name: '拼多多流量APP端',
                plant: 'PDD'
            },
            PDD_PRODUCT_SERACH_COLLECT: {
                code: 91,
                price: 70,
                origin: 35,
                name: '拼多多商品搜索收藏',
                plant: 'PDD'
            },
            PDD_PRODUCT_DIRECT_COLLECT: {
                code: 92,
                price: 70,
                origin: 35,
                name: '拼多多商品直接收藏',
                plant: 'PDD'
            },
            PDD_SHOP_COLLECT: {
                code: 93,
                price: 70,
                origin: 35,
                name: '拼多多店铺收藏',
                plant: 'PDD'
            },
        };
        if (!typeKey) {
            return types;
        }
        return types[typeKey] ? types[typeKey] : types.APP_SEARCH;
    },

    // 根据快递公司的代码获取快递公司的名字
    getKbTypeByCode: function (code) {
        var kb = {
            ST: '申通',
            ZT: '中通',
            LB: '龙邦',
            GT: '国通',
            YF: '亚风速运',
            BS: '百世'
        };
        return kb[code];
    },

    // 根据平台代码获取平台名称
    getPlantByCode: function (code) {
        var plant = {
            TB: '淘宝',
            JD: '京东',
            PDD: '拼多多'
        };
        return plant[code];
    },
    /**
     * 根据key获取任务类型value
     * 
     * @param {stringany} typeKey 
     * @returns 返回value
     */
    getTaskParentype: function (typeKey) {
        var types = {
            TRAFFIC: '流量任务',
            COLLECT: '收藏任务',
            ADD_CART: '加购任务',
            TB_LIVE: '淘宝直播任务',
            JD_SHOP_ATTENTION: '京东店铺关注任务',
        };
        if (!typeKey) {
            return types.TRAFFIC;
        }
        return types[typeKey];
    },

    /**
     *  初始自定义的页签
     * 
     * @param {object} $tabContainer 页签容器
     * @param {function} callback 初始化之后的回调函数
     */
    initTabClick: function ($tabContainer, callback) {
        if ($tabContainer && $tabContainer.length) {
            $tabContainer.off('click').on('click', function (event) {
                var index = $(this).data('index') || 0;
                if ($(this).hasClass('flyer-tab-active')) {
                    return false;
                }
                $tabContainer.removeClass('flyer-tab-active');
                $(this).addClass('flyer-tab-active');
                if (callback && typeof callback === 'function') {
                    callback($(this));
                }
                return false;
            });
        } else {
            $.writeLog('core-initTanClick', '页签容器为空');
        }
        return;
    },

    /**
     *  获取系统时间戳
     * 
     * @param {function} callback 回调函数
     */
    getSysNow: function (callback) {
        $.get('http://api.lieliu.com:1024/api/sys_now?format=json', function (data) {
            callback(data);
        });
    },

    /**
     *  将一个数字，如果小于10的话，使用指定的字符串填充，默认是0
     * 
     * @param {number} number 原数据
     * @param {string|number} pad 填充的字符串
     */
    padStart: function (number, pad) {
        pad = pad || '0';
        return number > 9 ? number : pad + number;
    },

    /**
     *  将一个对象转换为查询字符串,需要按照顺序来
     * 例如 {a:1,b:2,c:3}==> a=1&b=2&c=3
     * 
     * @param {object} obj 原数据
     */
    objectToString: function (obj, result) {
        result = result || ``;
        if (typeof obj !== 'object') {
            $.writeLog('core-objectToString', '参数错误');
            return result;
        }
        var keys = Object.keys(obj);
        keys = keys.sort();
        console.log(keys);
        for (var i = 0; i < keys.length; i++) {
            result += '&' + keys[i] + '=' + obj[keys[i]];
        }
        result = result.replace(/^&/, '');
        return result;
    },

    //  将一个数字抓换为记账写法 例如 1000000  1，000，000
    numberToLocalString: function (num) {
        if (num && !isNaN(num)) {
            return Number(num + '.00').toLocaleString();
        }
        return '';
    },

    // 获取用户的信息，通过用户id
    getUserInfoById: function (callback) {
        callback = callback || function () { };
        $.get('/api/readUserById', function (userInfo) {
            callback(userInfo);
        });
    },
    /**
     * 
     * 根据参数名称获取到URL的参数值
     * @param {any} name 
     * @returns 
     */
    getQueryString: function (name, url) {
        var reg = new RegExp(name + "=([^&|#?]+)");
        var r = url.substring(url.indexOf("?") + 1).match(reg);
        if (r !== null) {
            return window.unescape(r[1])
        }
        return null;
    },

    // 将分转换成元
    fenToYuan: function (f) {
        if (!f || isNaN(f)) {
            return 0.00;
        }
        return Number(f / 100).toFixed(2);
    },

    // 将元转换成分
    yuanToFen: function (y) {
        if (!y || isNaN(y)) {
            return 0;
        }
        return Number(y * 10).toFixed(0);
    },

    // 计算会员价格
    computeTotalPrice(level, total) {
        level = level || 1;
        total = total || 0;
        if (level === 2) {
            total = total * 0.9;
        } else if (level === 3) {
            total = total * 0.8;
        }
        return total;
    },
    getLevelText(level) {
        level = level || 1;
        var ret = `（普通会员）`;
        if (level === 2) {
            ret = `（金牌会员：<span class="layui-text-pink">享受9折优惠</span>）`;
        } else if (level == 3) {
            ret = `（内部会员：<span class="layui-text-pink">享受8折优惠</span>）`
        }
        return ret;
    }
};