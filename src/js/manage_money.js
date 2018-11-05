// 充值套餐管理模块
layui.use(['table', 'element', 'layer', 'util', 'form'], function () {
    var table = layui.table;
    var element = layui.element;
    var layer = layui.layer;
    var util = layui.util;
    var form = layui.form;
    var baseDatas = {
        // 错误消息
        netErrMsg: '系统已退出登录，请登录系统重试',
        operatorErrMsg: {
            single: '请选择一条数据操作',
            batch: '请至少选择一条数据操作'
        }
    };
    var openContent = `<form class="layui-form layui-form-pane" name="packageCreateForm">
                            <div class="layui-form-item">
                                <label class="layui-form-label">名称</label>
                                <div class="layui-input-block">
                                    <input type="text" name="packageName" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <label class="layui-form-label">购买金额(分)</label>
                                <div class="layui-input-block">
                                    <input type="text" name="packagePurchaseMoney" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <label class="layui-form-label">赠送金额(分)</label>
                                <div class="layui-input-block">
                                    <input type="text" name="packagePresentMoney" class="layui-input">
                                </div>
                            </div>
                            <div class="layui-form-item">
                                <label class="layui-form-label">支付方式</label>
                                <div class="layui-input-block">
                                    <input type="text" name="packagePayMethod" placeholder="0 是微信和支付宝，1 是微信，2 是支付宝，默认是0" class="layui-input">
                                </div>
                            </div>
                        </form>`;

    /**
     *页面入口函数 
     * 
     */
    (function init() {
        form.render('select');
        // 获取表格数据
        renderTable();
        // 初始化事件
        initEvent();
    })();

    /**
     * 初始化DOM元素事件
     * 
     */
    function initEvent() {
        // 查询
        $('#searchBtn').on('click', searchHandle);
        // 重置
        $('#resetBtn').on('click', function () {
            $('#logsSearchForm')[0].reset();
            return false;
        });
        // 创建充值套餐
        $('#createPackageBtn').on('click', createPackageHandle);
        // 修改充值套餐信息
        $('#updatePackageBtn').on('click', updatePackageHandle);
        // 禁用充值套餐
        $('#disabledPackageBtn').on('click', {
            type: 0
        }, togglePackageHandle);
        // 启用充值套餐
        $('#enabledPackagneBtn').on('click', {
            type: 1
        }, togglePackageHandle);
    }

    /**
    * 查询的点击事件处理函数
    * 
    * @param {any} events 
    */
    function searchHandle(events) {
        var queryParams = getQueryParams();
        reloadTable({
            where: queryParams,
            page: {
                curr: 1,
                limit: 10
            }
        });
        return false;
    }

    /**
     * 创建充值套餐的点击事件处理函数
     * 
     * @param {any} events 
     */
    function createPackageHandle(events) {
        layer.open({
            content: openContent,
            area: ['400px'],
            title: '新增支付套餐',
            btn: ['保存', '取消'],
            yes: function (index, layero) {
                var that = this;
                var packgaeInfo = core.getFormValues($('form[name=packageCreateForm]'));
                packgaeInfo.packagePayMethod = packgaeInfo.packagePayMethod || 0;
                var validPackgaeInfoResult = validPackageInfo(packgaeInfo);
                if (validPackgaeInfoResult.isPass) {
                    $.ajax({
                        url: '/api/createPackage',
                        type: 'POST',
                        data: packgaeInfo,
                        success: function (data, textStatus, jqXHR) {
                            layer.msg(data.success ? ('操作成功') : ('操作失败'));
                            layer.close(index);
                            reloadTable();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            layer.msg(baseDatas.errorMsg);
                        },
                    });
                } else {
                    layer.msg(validPackgaeInfoResult.msg);
                }
            }
        });
        return false;
    }

    /**
     * 充值套餐信息修改的点击事件处理函数
     * @param {any} events 
     */
    function updatePackageHandle(events) {
        var selectDatas = table.checkStatus('packageTable').data;
        if (selectDatas.length === 1) {
            var packageName = selectDatas[0].packageName;
            var description = selectDatas[0].description;
            layer.open({
                content: openContent,
                area: ['400px'],
                title: '充值套餐信息修改',
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    var that = this;
                    var packageInfo = core.getFormValues($('form[name=packageCreateForm]'));
                    var validPackageInfoResult = validPackageInfo(packageInfo);
                    packageInfo.id = selectDatas[0].id;
                    if (validPackageInfoResult.isPass) {
                        $.ajax({
                            url: '/api/updatePackage',
                            type: 'POST',
                            data: packageInfo,
                            success: function (data, textStatus, jqXHR) {
                                layer.msg(data.success ? ('操作成功') : ('操作失败' + data.message));
                                layer.close(index);
                                reloadTable();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                layer.msg(baseDatas.errorMsg);
                            }
                        });
                    } else {
                        layer.msg(validPackageInfoResult.msg);
                    }
                },
                success: function () {
                    setPackageInfo(selectDatas[0]);
                }
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 切换充值套餐状态按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function togglePackageHandle(events) {
        var selectDatas = table.checkStatus('packageTable').data;
        var type = events.data.type;
        var tipMsg = type === 0 ? '确定禁用吗？' : '确定启用吗？';
        if (selectDatas.length === 1) {
            layer.confirm(tipMsg, {
                title: '询问框',
                btn: ['确定', '取消']
            }, function (index, layero) {
                $.ajax({
                    url: '/api/togglePackage',
                    type: 'POST',
                    data: {
                        id: selectDatas[0].id,
                        status: type
                    },
                    success: function (data, textStatus, jqXHR) {
                        layer.msg(data.success ? '操作成功' : ('操作失败' + data.message));
                        reloadTable();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        layer.msg(baseDatas.netErrMsg);
                    }
                });
            });
        } else {
            layer.msg(baseDatas.operatorErrMsg.single);
        }
        return false;
    }

    /**
     * 渲染表格
     * 
     */
    function renderTable() {
        table.render({
            elem: '#packageTable',
            url: '/api/readPackagePage',
            page: true,
            cols: [[
                {
                    checkbox: true,
                },
                {
                    field: '',
                    title: '序号',
                    width: 60,
                    templet: function (d) {
                        return d.LAY_INDEX;
                    }
                },
                {
                    title: '名称',
                    field: 'packageName'
                },
                {
                    title: '金额（购买金额/赠送金额）',
                    field: "packageMoney",
                    templet: function (d) {
                        return `${d.packagePurchaseMoney / 100}/${d.packagePresentMoney / 100}`;
                    }
                },
                {
                    title: '创建时间',
                    field: "createdDate",
                    templet: function (d) {
                        return util.toDateString(d.createdDate, 'yyyy-MM-dd HH:mm');
                    }
                }, {
                    title: '修改时间',
                    field: "",
                    styles: {
                        width: 130
                    },
                    templet: function (d) {
                        return d.updateDate ? util.toDateString(d.updateDate, 'yyyy-MM-dd HH:mm') : '-';
                    }
                }, {
                    title: '状态',
                    field: 'status',
                    styles: {
                        width: 56
                    },
                    templet: function (d) {
                        return d.status === 1 ? '启用' : '停用';
                    }
                }
            ]],
            limits: [10, 20, 50, 100],
            page: {
                theme: '#1E9FFF',
                layout: ['prev', 'page', 'next', 'skip', 'count', 'limit']
            },
            request: {
                pageName: 'offset'
            },
            response: {
                statusCode: true
            },
            parseData: function (res) {
                return {
                    code: res.success,
                    msg: res.msg,
                    count: res.data.total,
                    data: res.data.rows
                }
            },
            done: function (res) {
            }
        });
    }

    /**
     * 重载表格
     * 
     */
    function reloadTable(options) {
        table.reload('packageTable', options);
    }

    /**
    *获取表格的查询参数
    *
    * @returns 返回所有参数的对象
    */
    function getQueryParams() {
        var $form = $('#logsSearchForm');
        var formDatas = $form.serializeArray();
        var ret = {};
        $.each(formDatas, function (index, item) {
            ret[item.name] = item.value;
        });
        return ret;
    }

    /**
     * 校验充值套餐信息
     * 
     * @param {Object} packageInfo 充值套餐信息对象
     */
    function validPackageInfo(packageInfo) {
        if (!packageInfo) {
            return {
                isPass: false,
                msg: '参数错误'
            }
        }

        if (!packageInfo.packageName) {
            return {
                isPass: false,
                msg: '充值套餐名称不能为空'
            }
        }

        if (!packageInfo.packagePurchaseMoney) {
            return {
                isPass: false,
                msg: '充值套餐购买金额不能为空'
            }
        }
        if (!packageInfo.packagePresentMoney) {
            return {
                isPass: false,
                msg: '充值套餐赠送金额不能为空'
            }
        }
        return {
            isPass: true,
            msg: ''
        };
    }

    /**
     * 为表单复制
     * 
     * @param {any} packageInfo 
     * @param {any} $form 
     */
    function setPackageInfo(packageInfo, $form) {
        $form = $form || $('form[name=packageCreateForm]');
        for (var key in packageInfo) {
            if (packageInfo.hasOwnProperty(key)) {
                var element = packageInfo[key];
                $form.find('input[name=' + key + ']').val(element);
            }
        }
    }
});