"use strict";
var core = {
    url: "",
    loadPage: function (code, params) {
        if (params) {
            location.hash = code + params;
        } else {
            location.hash = code;
        }
    },
    formatReadonlyText: function (data) {
        //var text = "<div class='flyer-write-title'><ul><li>From:"+data._from+"</li><li>Date:"+flyer.formatDate("yyyy-mm-dd hh:MM:ss",data.date_time)+"</li><li>To:"+data._to+"</li></ul></div>";
        var text = "<div class='flyer-write-title'>Date:" + flyer.formatDate("yyyy-mm-dd hh:MM:ss", data.date_time) + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;From:&nbsp;<&nbsp;" + data._from + "&nbsp;>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;To:&nbsp;<&nbsp;" + data._to + "&nbsp;></div>";
        text += "<div class='flyer-write-html'>" + data.html + "</div>";
        return text;
    },

    //获取邮件名称
    getEmailName: function (value) {
        if (value) {
            return value.substr(0, value.indexOf("@"));
        } else {
            return "";
        }

    },
    getBubbleCount: function () {
        $.ajax({
            url: '/folder_status_data_list',
            method: 'get',
            data: {
                orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                user_id: window.Number($("#__userid").val()),
                orgCode: core.getUserGroups().orgCode,
                time: window.Date.parse(new Date()),
                username: $("#__email").val(),
                type_id: flyer.getQueryString('type_id')
            },
            success: function (data) {
                var statusArr;
                if (core.getUserGroups().orgCode === '9101') {
                    //客服
                    statusArr = ['undisposed', 'disposed', 'resolved'];
                    $('.flyer-tab-ul li').eq(2).add($('.flyer-tab-ul li').eq(3)).addClass('hide-tab');
                } else {
                    statusArr = ['undisposed', 'disposed', 'unassigned', 'assigned', 'resolved'];
                }
                $('.flyer-tab-ul li:not(".hide-tab")').each(function (index, obj) {
                    $(this).find('.tab-bubble').text(data[statusArr[index]])
                })
            },
            error: function (err) {

            }
        })
    },
    //表格中处理人title
    titleShow: function (data) {
        var titleName = window.decodeURIComponent(data.assigned_name) || "-";
        if (titleName === '-') {
            return '<span>' + titleName + '</span>'
        } else {
            return '<span title="' + titleName + '">' + titleName + '</span>'
        }
    },
    // 判断邮件发送是否超时,如果发送状态投递中的话,sendDate:邮件发送时间，maxTime：超时时间，默认是四个小时
    isEmailSendTimeOut: function (sendDate, maxTime, row) {
        var sendTime = 0, currentTime = new Date().getTime();
        maxTime = (maxTime || 4) * 60 * 60 * 1000;
        try {
            sendTime = new Date(sendDate).getTime();
        } catch (error) {
            sendTime = new Date().getTime();
            return false;
        }
        return currentTime - sendTime > maxTime;
    },
    // 获取邮件的状态
    getEmailSendStatus: function (emailStatus, row) {
        var emailStatusMap = {
            stored: flyer.i18n.initTitle("未投递"),
            sending: flyer.i18n.initTitle("投递中"),
            delivered: flyer.i18n.initTitle("已投递"),
            spam: flyer.i18n.initTitle("垃圾邮件"),
            hard: flyer.i18n.initTitle("投递失败"),
            timeout: flyer.i18n.initTitle("投递超时")
        }, sendingStatus = 'sending';
        emailStatus = emailStatus || 'stored';
        // 如果邮件状态是投递中并且超时的话，状态设置为投递超时
        if (emailStatus === sendingStatus && this.isEmailSendTimeOut(row.max_time)) {
            emailStatus = 'timeout';
        }
        // return '&nbsp;<i class="icon-' + emailStatus + ' rightIcon" title="' + emailStatusMap[emailStatus] + '" aria-hidden="true"></i>';
        return '&nbsp;<i class="icon-assigned rightIcon" title="' + emailStatusMap[emailStatus] + '" aria-hidden="true"></i>';
    },
    // 格式化邮箱名显示
    formatEmail: function (data) {
        var arryHtmls = [];
        arryHtmls.push('<span class="mailAddress">');
        arryHtmls.push('<span class="hoverCur" title="' + data._from + '">' + core.getEmailPersonName(data.message_headers_from || data._from) + '</span>');
        arryHtmls.push('<span class="exchange"><i class="fa fa-exchange" aria-hidden="true"></i></span>');
        arryHtmls.push('<span class="hoverCur" title="' + data._to + '">' + core.getEmailPersonName(data.message_headers_to || data._to) + '</span>');
        arryHtmls.push('</span>');
        // 邮件分派状态
        if (data.status_id === 6) {
            arryHtmls.push('&nbsp;<i class="icon-unassigned rightIcon" title="' + flyer.i18n.initTitle("未分派") + '" aria-hidden="true"></i>');
        } else if (data.status_id === 5) {
            arryHtmls.push('&nbsp;<i class="icon-assigned rightIcon" title="' + flyer.i18n.initTitle("已分派") + '" aria-hidden="true"></i>');
        }
        // 是否含附件
        if (data.has_attachments === 1) {
            arryHtmls.push('&nbsp;<i class="icon-accessory rightIcon" title="' + flyer.i18n.initTitle("含附件") + '" aria-hidden="true"></i>');
        }
        // 邮件投递状态
        // arryHtmls.push(this.getEmailSendStatus(data.deliver, data));
        // 会话数量
        if (data.count > 1) {
            arryHtmls.push('&nbsp;<span class="emailNum">(' + data.count + ')</span>');
        }
        return arryHtmls.join("");
    },
    formatSubject: function (row) {
        var returnSub;
        if (row.store_id) {
            returnSub = '<i class="icon-customer-complaint-black complaint" title="' + flyer.i18n.initTitle("含客诉") + '" aria-hidden="true"></i><span title="' + row.subject + '">' + (row.subject || '-') + '</span>'
        } else {
            returnSub = '<i class="icon-customer-complaint complaint-no" title="' + flyer.i18n.initTitle("不含客诉") + '" aria-hidden="true"></i><span title="' + row.subject + '">' + (row.subject || '-') + '</span>'
        }
        return returnSub;
    },
    getEmailPersonName: function (str) {
        str = str.replace(/["\s]*/ig, "");
        let reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/ig,
            value = str.replace(reg, "").replace("<>", "");
        return value.length > 0 ? (value.replace(/-[\w]+/ig, "")) : this.getEmailName(str);
    },

    // 格式化往来邮件中的日期显示格式
    // 当天（显示时和分）、天不同月份相同（显示份和日）、年份不同（显示年月日，时分秒）
    parseDateFormate: function (stringDate) {
        if (!stringDate) {
            return '';
        }
        let currentDate = flyer.getDate(), emailDate = flyer.getDate(stringDate);
        // 判断年,不是今年的话，显示年、月、日，时、分
        if (emailDate.year !== currentDate.year) {
            return flyer.formatDate(flyer.i18n.initTitle('yyyy年mm月dd日'), stringDate);
        } else if (emailDate.month === currentDate.month) {
            // 判断月,月份相同，但是日期不相同,不显示年
            if (emailDate.day !== currentDate.day) {
                return flyer.formatDate(flyer.i18n.initTitle('mm月dd日'), stringDate);
            } else {
                return flyer.formatDate(flyer.i18n.initTitle('hh:MM'), stringDate);
            }
        } else {
            return flyer.formatDate(flyer.i18n.initTitle('mm月dd日'), stringDate);
        }
    },
    parseDateOrder: function (stringDate) {
        if (!stringDate) {
            return '';
        }
        return flyer.formatDate('yyyy年mm月dd日', stringDate);
    },
    //获取用户权限信息
    getUserGroups: function () {
        var data = window.unescape($("#__groups").val());
        data = JSON.parse(data);
        return data.length > 0 ? data[0] : {};
    },
    /**
     * 防止用户操作多次提交方法,锁定操作按钮
     * @param {jqobj} $btn 用户点击的按钮对象
     * @param {boolean} isLoading 是否要添加正在提交的图标 默认是true
         
     */
    lockedBtn: function ($btn, isLoading, btnText) {
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
    unlockBtn: function ($btn, btnText) {
        if (!$btn.length) {
            return;
        }
        $btn.html(btnText || '保存').attr('disabled', false);
    },

    //获得所有的邮件账号
    getEmailList: function () {
        var emailList = flyer.store.get("EmailList");
        if (!emailList) {
            $.ajax({
                url: "/email_list?depa_id=" + core.getUserGroups().orgGroupId + "&time=" + window.Date.parse(new Date()),
                method: "get",
                success: function (data) {
                    $("#__AccountList").val(JSON.stringify(data));
                    flyer.store.set("EmailList", JSON.stringify(data));
                }
            });
        }
    },
    //自定义邮件标签转换
    conpileHtml: function (content, info) {
        var _contentNameReg = /{name}/gi,
            _contentSelfReg = /{self}/gi
        if (/frame/gi.exec(window.location.hash)) {
            return content.replace(_contentNameReg, info.name.split('@')[0]).replace(_contentSelfReg, info.self.split('@')[0]);
        } else {
            return content.replace(_contentNameReg, core.getEmailPersonName($("input[name='to']").val())).replace(_contentSelfReg, core.getEmailPersonName($('input[name="from"]').val()));
        }

    },
    //判断发送人是不是自已的账号
    isSelfEmail: function (from) {
        var emailList = flyer.store.get("EmailList");
        if (emailList.length > 0) {
            emailList = JSON.parse(emailList);
            if (flyer.isArray(emailList)) {
                var result = emailList.find(function (item) {
                    return item.mail_address === from;
                });

                return typeof result === "undefined" ? false : true;
            }
        }
        return false;
    },

    /**
    * 获取附件的大小
    * @param {size} 附件原始大小
    * @return size 附件格式化后的大小
   */
    getAttachSize: function (size) {
        var unit = 'KB';
        if (isNaN(size) || size < 0) {
            return 0 + unit;
        }
        if (size < 1024) {
            if (parseFloat(size).toFixed(0) === '0') {
                return '1' + unit;
            }
            return parseFloat(size).toFixed(0) + unit;
        } else {
            unit = 'M';
            return (parseFloat(size) / 1024).toFixed(1) + unit;
        }
    },
    /**
   * 根据邮箱的值，获取相应的订单
   * @param {size} 附件原始大小
   * @return size 附件格式化后的大小
  */
    getOrderInfo: function (order, emailAddress) {
        getOrder();
        function getOrder() {
            $.ajax({
                url: "/fba_order_list",
                method: "get",
                data: {
                    order: order,
                    time: window.Date.parse(new Date()),
                    email: emailAddress
                },
                beforeSend: function () {
                    $('#nomatch').html("");
                    flyer.loading.init($("#nomatch")).add();
                },
                success: function (result) {
                    $(".sendEmail-orders-text:not(:first)").remove();
                    var sites = {
                        USD: '$',
                        CAD: 'C$',
                        GBP: '£',
                        JPY: '¥',
                        EUR: '€',
                        MXN: 'MXN'
                    };
                    if (result.length !== 0) {
                        //初始化结构
                        result.forEach(function (ele, index) {
                            var newOrder = $(".sendEmail-orders-text:first").clone(),
                                shipping_address_stateOrRegion = ele.shipping_address_stateOrRegion === "N/A" ? '' : ele.shipping_address_stateOrRegion,
                                shipping_address_city = ele.shipping_address_city,
                                shipping_address_line1 = ele.shipping_address_line1 !== "N/A" ? ele.shipping_address_line1 : '',
                                shipping_address_line2 = ele.shipping_address_line2 !== "N/A" ? ele.shipping_address_line2 : '',
                                shipping_address_line3 = ele.shipping_address_line3 !== "N/A" ? ele.shipping_address_line3 : '',
                                shipping_address_all = shipping_address_stateOrRegion + shipping_address_city + shipping_address_line1 + shipping_address_line2 + shipping_address_line3,
                                asin = ele.asin || '',
                                seller_sku = ele.seller_sku || '';
                            newOrder.find(".sendEmail-orders-title").html(ele.buyer_name);//购买者
                            newOrder.find(".sendEmail-orders-num span").html(ele.amazon_order_id);//订单号
                            newOrder.find(".sendEmail-quantity-ordered span").html(ele.quantity_ordered);//订单数量
                            newOrder.find(".sendEmail-orders-shop span").html(ele.account_code);//店铺
                            newOrder.find(".sendEmail-orders-site span").html(ele.sales_channel);//站点
                            newOrder.find(".sendEmail-orders-despatch span").html(ele.fulfillment_channel);//发货方式
                            newOrder.find(".sendEmail-orders-postage span").html(ele.postage || '包邮');//邮费
                            newOrder.find(".sendEmail-orders-discount span").html(ele.discount_total || '无');//折扣
                            newOrder.find(".sendEmail-orders-buyerEmail span").html(ele.buyer_email);//买家账户
                            newOrder.find(".sendEmail-orders-country span").html(ele.shipping_address_countryCode);//国家
                            newOrder.find(".sendEmail-orders-address span").html(shipping_address_all);//地址
                            newOrder.find(".sendEmail-orders-buyTime span").html(core.parseDateOrder(ele.purchase_date));//购买时间
                            newOrder.find(".sendEmail-orders-amazonTime span").html(core.parseDateOrder(ele.last_update_date));//亚马逊更新时间
                            newOrder.find(".sendEmail-orders-systemTime span").html(core.parseDateOrder(ele.update_date));//系统更新时间
                            newOrder.find(".sendEmail-orders-status span").html(ele.order_total_currency_code);//订单状态
                            newOrder.find(".sendEmail-orders-price span").html((sites[ele.order_total_currency_code] || ele.order_total_currency_code) + ' ' + ele.order_total_amount);//总金额
                            newOrder.find(".sendEmail-orders-status span").html(ele.order_status);//订单状态
                            newOrder.find(".sendEmail-orders-asin span").html(asin);//ASIN
                            newOrder.find(".sendEmail-orders-sku span").html(seller_sku);//SKU
                            newOrder.appendTo($(".sendEmail-orders-single")).css('display', 'block');
                            $('#nomatch').hide();
                            //添加点击事件
                            newOrder.find(".sendEmail-orders-target").off('click').on('click', function () {
                                var url = 'https://www.' + ele.sales_channel + '/dp/' + asin;
                                window.open(url, '_blank');
                            }).css('cursor', 'pointer')
                        });
                    } else {
                        $('#nomatch').show().html(flyer.i18n.initTitle("未查询到相关的订单"));
                    }
                },
                complete: function () {
                    flyer.loading.init($("#nomatch")).delete();
                },
                error: function (err) {
                    // throw new Error(err);
                },

            });
        }
    },

    //从缓存 key EmailList 中查找domian
    findInfoByEmail: function (email) {
        var list = JSON.parse(flyer.store.get("EmailList"));
        return list.find(function (item) {
            return item.mail_address.toLowerCase() === email.toLowerCase();
        });
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
            }//分页回调函数
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
        var pageSizeSelectObj = null, that = this;
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
     * 显示高级搜索弹出框
     * 
     */
    showAdvancedSearchWindow: function (callback) {
        flyer.open({
            pageUrl: core.url + '/html/advanced_search.html',
            isModal: true,
            area: [460, 300],
            title: ((flyer.i18n && flyer.i18n.initTitle("高级搜索")) || "高级搜索"),
            cancel: function () {
                $('#flyer-date-public-butModal-endTime').hide();
                $('#flyer-date-public-butModal-startTime').hide();
            },
            btns: [{
                text: (flyer.i18n && flyer.i18n.initTitle('搜索')) || '搜索',
                click: function (elm) {
                    if (typeof callback === 'function') {
                        callback(1);
                        this.close();
                    }
                }
            }, {
                text: (flyer.i18n && flyer.i18n.initTitle('关闭')) || '关闭',
                click: function (elm) {
                    this.close();
                    flyer.exports.advanced_search.clearConditions();
                    $('#flyer-date-public-butModal-endTime').hide();
                    $('#flyer-date-public-butModal-startTime').hide();
                }
            }]
        });
    },

    /**
     * 根据当前的key值，使左侧菜单高亮
     * 
     * @param {str} key 当前页面的key值
     */
    menuHeightLightByKey: function (key) {
        if (key) {
            $('ul.flyer-layout-tree').find('a[data-href="' + key + '.html' + '"]').addClass('flyer-layout-linkActive');
        } else {
            console.log('参数不符合规范。');
        }
    },

    /**
    * 创建一条日志
    * 
    * @param {Object} data 创建的数据对象
    */
    createMaillog: function (data) {
        if (data && data.mailID && data.userName && data.userID && data.content) {
            // 暂时先屏蔽掉日志
            // $.ajax({
            //     url: this.url + '/create_mail_log',
            //     type: 'POST',
            //     data: data,
            //     success: function (result) {
            //     },
            //     error: function (error) {

            //     }
            // });
        }
    },
    // 得到一个guid值
    getGUID: function () {
        return flyer.formatDate("yyyymmddhhMMss") + Math.floor(Math.random() * 10000000);
    },

    /**
      * 获取表格中选中的数据,返回选中数据的一个数组
      * 
      * @param {any} $table 数据表格
      * @returns 返回一个数组，没有则返回空数据
      */
    getTableCheckedDatas: function ($table) {
        var arr = [], rows = [];
        if ($table) {
            var checkedDatas = $table.$body.find('input[type=checkbox][name!=flyer-active-radio]:checked');
            rows = $table.getDatas();
            $.each(checkedDatas, function (index, item) {
                var $item = $(item), $index = $item.parents('tr').data('index');
                arr[index] = rows[$index];
            });
        }
        return arr;
    },
    /**
     * 格式化邮件的内容，当邮件中的内容含有<>符号的时候 自动替换掉
     * 
     * @param {any} content 邮件内容
     * @returns 返回格式化之后的内容
     */
    formatEmailContent: function (content) {
        return content.replace(/<\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+>/g, function (char) { return char.replace(/</, '&lt;').replace(/>/, '&gt;') })
    }
};