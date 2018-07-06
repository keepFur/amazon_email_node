"use strict";
var core = {
    url: "",
    loadPage: function(code, params) {
        if (params) {
            location.hash = code + params;
        } else {
            location.hash = code;
        }
    },

    /**
     * 防止用户操作多次提交方法,锁定操作按钮
     * @param {jqobj} $btn 用户点击的按钮对象
     * @param {boolean} isLoading 是否要添加正在提交的图标 默认是true
         
     */
    lockedBtn: function($btn, isLoading, btnText) {
        let _isLoading = true;
        if (!$btn.length) {
            return;
        }
        if (typeof isLoading !== 'undefined') {
            _isLoading = isLoading;
        }
        if (_isLoading) {
            $btn.html(btnText + '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>').attr('disabled', true);
        } else {
            $btn.attr('disabled', true);
        }
    },
    /**
     * 防止用户操作多次提交方法,解锁操作按钮
     * @param {jqobj} $btn 用户点击的按钮对象
     * @param {string} btnText 用户点击的按钮的文本，默认为保存
     */
    unlockBtn: function($btn, btnText) {
        if (!$btn.length) {
            return;
        }
        $btn.html(btnText || '保存').attr('disabled', false);
    },

    addLoading: function($container, options) {

    },

    deleteLoading: function() {

    },
    // 为表格中checkbox绑定点击事件
    bindCheckboxEvent: function($table) {
        if ($table) {
            try {
                var selector = 'input[type=checkbox][name=""]';
                $table.$body.find(selector).on('click', function() {
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
                flyer.msg(error);
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
    initPager: function($pageContainer, totalNum, pageSize, options) {
        var pageObj = flyer.page($pageContainer, {
            totalNum: totalNum,
            curIndex: options.pageNumber || 1,
            pageSize: pageSize,
            fnClick: function() {
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
    initPagerSizeSelect: function($pageSizeContainer, pageList, currentSize, options) {
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
                fnSelected: function(item, elm, items) {
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
    generatePageText: function(length) {
        length = length || 20;
        var perPageText = '每页按' + length + '条显示';
        return (flyer.i18n && flyer.i18n.initTitle(perPageText)) || perPageText;
    },

    /**
     * 根据总数获取一个分页的列表数组
     * @param {any} total 数据总数
     * @return {Obj} 一个数组
     */
    getPageListByTotal: function(total) {
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
    tableNoMatch: function($table, message) {
        if ($table) {
            var msg = flyer.i18n.initTitle('暂时没有数据'),
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
     * 根据当前的key值，使左侧菜单高亮
     * 
     * @param {str} key 当前页面的key值
     */
    menuHeightLightByKey: function(key) {
        if (key) {
            $('ul.flyer-layout-tree').find('a[data-href="' + key + '.html' + '"]').addClass('flyer-layout-linkActive');
        } else {
            console.log('参数不符合规范。');
        }
    },

    // 得到一个guid值
    getGUID: function() {
        return flyer.formatDate("yyyymmddhhMMss") + Math.floor(Math.random() * 10000000);
    },

    /**
     * 获取表格中选中的数据,返回选中数据的一个数组
     * 
     * @param {any} $table 数据表格
     * @returns 返回一个数组，没有则返回空数据
     */
    getTableCheckedDatas: function($table) {
        var arr = [],
            rows = [];
        if ($table) {
            var checkedDatas = $table.$body.find('input[type=checkbox][name!=flyer-active-radio]:checked');
            rows = $table.getDatas();
            $.each(checkedDatas, function(index, item) {
                var $item = $(item),
                    $index = $item.parents('tr').data('index');
                arr[index] = rows[$index];
            });
        }
        return arr;
    }
};