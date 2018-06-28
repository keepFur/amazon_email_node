"use strict";
flyer.define("senstive_words", function (exports, module) {
    // 构造函数
    var Sensitive = function () {
        // 元素集合
        this.juqeryMap = {
            // 搜索输入框
            $searchInp: $('#searchInp'),
            // 搜索按钮
            $search: $('#search'),
            // 新增
            $add: $('#add'),
            // 新增，当没有匹配关键字的时候
            $nomatchAdd: $('#nomatchAdd'),
            // 删除
            $delete: $('.sensitive-delete'),
            // 编辑名称
            $edit: $('.sensitive-edit'),
            // 编辑类型
            $editType: $('#editType'),
            // 批量删除
            $deleteBatch: $('#delete'),
            // 新增类型
            $addType: $('#addType'),
            // 删除类型
            $deleteBatchType: $(''),
            // 存放敏感词的容器
            $comtainer: $('.flyer-sensitive-tips'),
            // 一键复制敏感词
            $copySensitiveWordsBtn: $('#copySensitiveWordsBtn')
        };
        // 属性配置
        this.configMap = {
            // 获取列表地址
            listUrl: '/get_sensitive_word',
            // 新增地址
            addUrl: '/add_sensitive_word',
            // 删除地址
            deleteUrl: '/delete_sensitive_word',
            // 编辑名称地址
            editUrl: '/edit_sensitive_word',
            // 编辑敏感词类型地址
            editTypeUrl: '/edit_type_sensitive_word',
            // 获取所有的敏感词类型
            getTypeUrl: '/get_sensitive_type',
            // 删除敏感词类型
            deleteBatchTypeUrl: '/delete_batch_type',
            // 新增敏感词类型
            addTypeUrl: '/add_type',
            // 修改敏感词类型名称
            editTypeNameUrl: '/edit_type_name',
            // 提示信息
            msg: {
                error: flyer.i18n.initTitle('网络错误，请刷新页面重试'),
                success: flyer.i18n.initTitle('操作成功'),
                warning: flyer.i18n.initTitle('当前操作不允许'),
                info: flyer.i18n.initTitle('操作成功'),
                errorParams: flyer.i18n.initTitle('参数类型不符合')
            },
            // 敏感词类型，暂时写死
            type: [{ key: 'A', value: 'A类' }, { key: 'B', value: 'B类' }, { key: 'C', value: 'C类' }, { key: 'D', value: 'D类' }, { key: 'E', value: 'E类' }],
            // 类型下拉框初始化实例
            listTypeCombox: null,
            addTypeCombox: null,
            editTypeCombox: null,
            // 用户id
            userId: $("#__userid").val().trim()
        };
        // 事件处理对象
        this.handles = {};
    };
    // 固定的敏感词 zurückziehen：撤回，需要按钮站点进行划分
    var sensitiveWordsMap = {
        EN: ["review", "feedback", "comment", "rating", "update", "edite", "withdraw", "star", '**', "delete", "remove", "positive"],
        IT: ["recensione", "feedback", "commento", "valutazione", "aggiornamento", "modificare", "ritirare", "stella/e", "**", "cancellare", "rimuovere", "positivo"],
        FR: ["commentaire", "évaluation", "commenter", "classement", "mettre à jour", "éditer", "se désister", "étoile", "**", "supprimer", "enlever", "positif"],
        XBY: ["revisión", "evalución", "comentario", "calificación", "actualización", "edite", "retirar", "estrella", "**", "supprimer", "quitar", "positivo"],
        DE: ["Rezension", "Bewertung", "Kommentar", "aktualisieren", "bearbeiten", "abheben", "zurückziehen", "Star", "löschen", "entfernen", "abnehmen", "beseitigen", "Negativ"]
    };
    var sensitiveWords = ["review", "feedback", "comment", "rating", "update", "edite", "withdraw", "star", "delete", "remove", "positive",
        "recensione", "commento", "valutazione", "aggiornamento", "modificare", "ritirare", "stella/e", "cancellare", "rimuovere", "positivo",
        "commentaire", "évaluation", "commenter", "classement", "mettre à jour", "éditer", "se désister", "étoile", "supprimer", "enlever", "positif",
        "revisión", "evalución", "comentario", "calificación", "actualización", "retirar", "estrella", "**", "quitar", "positivo",
        "Rezension", "Bewertung", "Kommentar", "aktualisieren", "bearbeiten", "abheben", "zurückziehen", "Star", "löschen", "entfernen", "abnehmen", "beseitigen", "Negativ"];
    // 格式化请求地址,地址加上时间戳，禁用缓存
    Sensitive.prototype.formatUrl = function (originUrl) {
        var newUrl = '', nocache = new Date().getTime();
        if (originUrl) {
            return originUrl + '?nocache=' + nocache;
        }
        return '';
    };
    // 渲染页面
    Sensitive.prototype.render = function (datas) {
        var _this = this, temp = '', total = datas.total, data = datas.data;
        // 清空之前页面的数据
        _this.juqeryMap.$comtainer.empty();
        // 为总数赋值
        setTimeout(function () {
            // _this.configMap.listTypeCombox.getSelectedText() 先用默认值
            $('#showResult').html('<span style="color:#2cc3a9;">' + flyer.i18n.initTitle("敏感词") + '</span>'
                + '<span style="font-size:12px;color:#666;"><span>' + flyer.i18n.initTitle("(当前显示类型") + '</span> [</span> '
                + '<span style="color:#2cc3a9;">' + (flyer.i18n.initTitle("默认")) + ' </span>'
                + '<span style="font-size:12px;color:#666;"> ]，' + flyer.i18n.initTitle("共") + ' [ ' + total + ' ] ' + flyer.i18n.initTitle("个") + ')</span>');
        }, 200);
        if (Array.isArray(data) && data.length) {
            $('.flyer-sensitive-no').hide();
            _this.juqeryMap.$comtainer.append('<div class="flyer-sensitive-tip" id="add" title="' + flyer.i18n.initTitle("点击添加敏感词") + '">'
                + '<p class="sensitive-word"><i class="icon-add" aria-hidden="true"></i></p>'
                + '</div>');
            $.each(data, function (index, data) {
                temp = '<div class="flyer-sensitive-tip"  data-id="' + data.id + '" data-type="' + data.type_name + '"  data-weight="' + data.weight + '">'
                    + '<p class="sensitive-word">' + data.name + '</p>'
                    + '<i class="fa fa-pencil sensitive-edit" aria-hidden="true" data-id="' + data.id + '" data-type="' + data.type_name + '" data-weight="' + data.weight + '" data-name="' + data.name + '" title="' + flyer.i18n.initTitle("点击修改名称") + '"></i>'
                    + '<i class="fa fa-times-circle sensitive-delete" aria-hidden="true" data-id="' + data.id + '" data-type="' + data.type_name + '" data-weight="' + data.weight + '" title="' + flyer.i18n.initTitle("点击删除") + '"></i>'
                    + '</div>';
                _this.juqeryMap.$comtainer.append(temp);
            });
            // 为敏感词绑定delete事件 
            _this.juqeryMap.$comtainer.find('.sensitive-delete').off('click').on('click', _this.handles.delete);
            _this.juqeryMap.$comtainer.find('.sensitive-edit').off('click').on('click', _this.handles.edit);
            _this.juqeryMap.$comtainer.find('div.flyer-sensitive-tip:not("#add")').off('click').on('click', _this.handles.toggleClick);
            $('#add').off('click', _this.handles.add).on('click', _this.handles.add);
        } else {
            //如果是搜索的状态下只显示添加按钮
            if (_this.isSearch) {
                $('.flyer-sensitive-no').hide();
                _this.juqeryMap.$comtainer.append('<div class="flyer-sensitive-tip" id="add" title="' + flyer.i18n.initTitle("点击添加敏感词") + '">'
                    + '<p class="sensitive-word"><i class="icon-add""></i></p>'
                    + '</div>');
                _this.isSearch = false;
                _this.juqeryMap.$comtainer.find('.sensitive-delete').off('click').on('click', _this.handles.delete);
                _this.juqeryMap.$comtainer.find('.sensitive-edit').off('click').on('click', _this.handles.edit);
                _this.juqeryMap.$comtainer.find('div.flyer-sensitive-tip:not("#add")').off('click').on('click', _this.handles.toggleClick);
                $('#add').off('click', _this.handles.add).on('click', _this.handles.add);
            } else {
                $('.flyer-sensitive-no').show();
                if ($('#add').length) {
                    $('#add').hide();
                }
            }
        }
    };
    // 渲染敏感词类型 
    Sensitive.prototype.renderType = function (types, $container) {
        var _this = this;
        types = [{ id: 'all', name: flyer.i18n.initTitle('全部') }].concat(types);
        if (Array.isArray(types) && types.length) {
            return flyer.combobox($container, {
                isMulti: false,
                required: true,
                allowSearch: false,
                placeholder: flyer.i18n.initTitle('请选择类型'),
                data: types,
                fieldKey: 'id',
                fieldValue: 'name',
                defaultValue: 'all',
                disabled: true,
                fnSelected: function (item, elm) {
                    var params = {
                        type_id: '', createId: _this.configMap.userId,
                        orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId']
                    }, name = _this.juqeryMap.$searchInp.val().trim();
                    if (name) {
                        params.name = _this.toArray(name);
                    }
                    if (item) {
                        params.type_id = item.fieldKey
                        _this.getList(params);
                    }
                }
            });
        }
        return null;
    };
    // 获取所有的类型
    Sensitive.prototype.getType = function (params) {
        var _this = this;
        if (params.createId) {
            $.ajax({
                url: _this.formatUrl(_this.configMap.getTypeUrl),
                data: params,
                success: function (res) {
                    if (res.success) {
                        _this.configMap.listTypeCombox = _this.renderType(res.data.map(function (item) {
                            return { id: item.id, name: item.name };
                        }), $('#type_name'));
                        if (Array.isArray(res.data) && res.data.length === 0) {
                            window.localStorage.setItem('acsAllType', JSON.stringify([{ "name": flyer.i18n.initTitle("默认"), "depa_id": 1141 }]));
                        } else {
                            window.localStorage.setItem('acsAllType', JSON.stringify(res.data));
                        }
                    }
                },
                error: function () {
                    flyer.msg(_this.configMap.msg.error);
                },
            });
        } else {
            flyer.msg(_this.configMap.msg.errorParams);
        }
    };
    // 获取一个随机的类型
    Sensitive.prototype.getRandomType = function () {
        var _this = this,
            random = Math.floor(Math.random() * _this.configMap.type.length);
        return _this.configMap.type[random];
    };
    // 获取新增的敏感词的内容
    Sensitive.prototype.getSensitives = function (showWindow) {
        var _this = this,
            type_id = window.typeCombox.getSelectedValue(),
            type_name = window.typeCombox.getSelectedText(),
            name = _this.unniqueArr(_this.toArray($('input[name=name]').val().trim())),//自动去重
            params = {
                type_name: type_name,
                type_id: type_id,
                names: name,
                createId: _this.configMap.userId,
                orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId']
            };
        return params;
    };
    // 获取编辑敏感词类型中的参数
    Sensitive.prototype.getEditTypeParams = function (params) {
        var ids = [], obj = { type_name: params.type_name };
        if (Array.isArray(params.sensitives) && params.sensitives.length) {
            $.each(params.sensitives, function (index, sensitive) {
                ids[index] = sensitive.id;
            });
            obj.ids = ids;
            return obj;
        } else {
            obj.ids = [];
            return obj;
        }
    };
    // 处理空格或逗号分割的字符串，转换成数组并且去除空值
    Sensitive.prototype.toArray = function (str) {
        var reg = /(,)+|(，)+/g, arrs = [];
        if (str === ',' || str === "，") {
            $('input[name=name]').val('').focus();
        } else if (typeof str === 'string' && str) {
            arrs = str.replace(reg, ',').split(',');
            for (var i = 0; i < arrs.length; i++) {
                if (arrs[i] === "" || typeof (arrs[i]) === "undefined") {
                    arrs.splice(i, 1);
                    i -= 1;
                }
            }
        }
        return arrs;
    };
    // 获取敏感词列表
    Sensitive.prototype.getList = function (params) {
        var _this = this;
        if (params.createId) {
            $.ajax({
                url: _this.formatUrl(_this.configMap.listUrl),
                type: 'get',
                data: params,
                beforeSend: function () {
                    flyer.loading.init($('.flyer-sensitive-tips')).add();
                },
                success: function (res) {
                    _this.render(res);
                    //刷新缓存
                    var sensitiveCode = res.data && res.data.map(function (obj, index) {
                        return obj['name'];
                    })
                    flyer.store.set("sensitive" + JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'], JSON.stringify(sensitiveCode));
                },
                error: function () {
                    flyer.msg(_this.configMap.msg.error);
                },
                complete: function () {
                    flyer.loading.init($('.flyer-sensitive-tips')).delete();
                }
            });
        }
    };
    // 获取选中的敏感词对象
    Sensitive.prototype.getSelectSensitives = function () {
        var _this = this, sensitives = [], tips = _this.juqeryMap.$comtainer.find('div.flyer-click');
        if (tips.length) {
            $.each(tips, function (index, tip) {
                var sensitive = {};
                sensitive.id = $(tip).data('id');
                sensitive.type_name = $(this).data('type');
                sensitive.weight = $(this).data('weight');
                sensitives[index] = sensitive;
            });
        }
        return sensitives;
    };
    // 弹出新增窗口
    Sensitive.prototype.showAddWindow = function (next) {
        var _this = this;
        flyer.open({
            pageUrl: _this.formatUrl('/html/add_sensitive_word.html'),
            isModal: true,
            area: [440, 220],
            title: flyer.i18n.initTitle('新增敏感词'),
            btns: [{
                text: flyer.i18n.initTitle('保存'),
                click: function () {
                    var that = this, $firstBtn = $(that.$btns[0]), params = _this.getSensitives(that), fn = function () {
                        core.unlockBtn($firstBtn, flyer.i18n.initTitle('保存'));
                    };
                    if (params && params.names.length && params.type_name) {
                        core.lockedBtn($firstBtn, true, flyer.i18n.initTitle('保存中'));
                        // 判断是否重复
                        $.ajax({
                            url: _this.formatUrl(_this.configMap.listUrl),
                            data: {
                                createId: _this.configMap.userId,
                                name: params.names,
                                orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                                isExact: true// 是否精确匹配
                            },
                            success: function (res) {
                                var str = '';
                                if (res.total) {
                                    $.each(res.data, function (index, value) {
                                        var respetIndex = params.names.indexOf(res.data[index].name);
                                        str += res.data[index].name + ',';
                                        if (respetIndex !== -1) {
                                            params.names.splice(respetIndex, 1);
                                        }
                                    });
                                }
                                if (params.names.length) {
                                    next.call(_this, params, fn, that);
                                } else if (that && that.close) {
                                    flyer.msg(flyer.i18n.initTitle("敏感词") + '[ ' + str.substring(0, str.lastIndexOf(',')) + ' ]' + flyer.i18n.initTitle("已经存在，系统已自动去重"));
                                    that.close();
                                }
                            },
                            error: function () {
                                flyer.msg(_this.configMap.msg.error);
                            },
                            complete: function () {
                                fn();
                            }
                        });
                    } else {
                        if (!params.names.length) {
                            flyer.msg(flyer.i18n.initTitle('名称不能为空'));
                            $('input[name=name]').focus();
                        } else if (!params.type_name) {
                            flyer.msg(flyer.i18n.initTitle('敏感词类型不能为空'));
                            $('input[name=type_name]').focus();
                        }
                    }
                }
            }, {
                text: flyer.i18n.initTitle('取消'),
                click: function () {
                    this.close();
                }
            }]
        });
    };
    // 弹出编辑名称窗口
    Sensitive.prototype.showEditWindow = function (next, sensitive) {
        var _this = this;
        flyer.open({
            // pageUrl: "/html/edit_name_sensitive_word.html?time=" + new Date().getTime(),
            isModal: true,
            area: [400, 160],
            title: flyer.i18n.initTitle("修改名称"),
            content: '<div class="flyer-form" id="editFormContianer" style="margin-right:12px;margin-top:20px;">'
            + '<div class="flyer-form-item">'
            + '<label class="flyer-form-label">'+flyer.i18n.initTitle("原名称")+'</label>'
            + '<div class="flyer-input-block">'
            + '<input type="text" name="old_name" autocomplete="off" class="flyer-input flyer-disabled" value="' + sensitive.oldName + '" readonly>'
            + '</div>'
            + '</div>'
            + '<div class="flyer-form-item">'
            + '<label class="flyer-form-label i18n">'+flyer.i18n.initTitle("新名称")+'</label>'
            + '<div class="flyer-input-block">'
            + '<input type="text" name="new_name" autocomplete="off" class="flyer-input"  autofocus placeholder="'+flyer.i18n.initTitle("新名称")+'">'
            + '</div>'
            + '</div>'
            + '</div>',
            btns: [{
                text: flyer.i18n.initTitle("保存"),
                click: function () {
                    var that = this, $firstBtn = $(that.$btns[0]), params = {
                        id: sensitive.id,
                        name: $('input[name=new_name]').val().trim().replace(/\s/g, '')
                    }, fn = function () {
                        core.unlockBtn($firstBtn, flyer.i18n.initTitle("保存"));
                    };
                    if (params && params.name) {
                        core.lockedBtn($firstBtn, true, flyer.i18n.initTitle('保存中'));
                        // 判断是否重复
                        $.ajax({
                            url: _this.formatUrl(_this.configMap.listUrl),
                            data: {
                                createId: _this.configMap.userId,
                                name: [params.name],
                                orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'],
                                isExact: true
                            },
                            success: function (res) {
                                if (res.total) {
                                    flyer.msg(flyer.i18n.initTitle('敏感词') + '[ ' + params.name + ' ]' + flyer.i18n.initTitle('已经存在，系统已自动去重'));
                                    that.close();
                                } else {
                                    next.call(_this, params, fn, that);
                                }
                            },
                            error: function () {
                                flyer.msg(_this.configMap.msg.error);
                            },
                            complete: function () {
                                fn();
                            }
                        });
                    } else {
                        flyer.msg(flyer.i18n.initTitle('名称不能为空'));
                        $('input[name=new_name]').focus();
                    }
                }
            }, {
                text: flyer.i18n.initTitle('取消'),
                click: function () {
                    this.close();
                }
            }]
        });
        $('input[name=old_name]').val(sensitive.oldName);
    };
    // 弹出编辑类型窗口
    Sensitive.prototype.showEditTypeWindow = function (next, sensitives) {
        var _this = this;
        flyer.open({
            pageUrl: _this.formatUrl('/html/edit_type_sensitive_word.html'),
            isModal: true,
            area: [440, 220],
            title: flyer.i18n.initTitle("修改类型"),
            btns: [{
                text: flyer.i18n.initTitle("保存"),
                click: function () {
                    var that = this, $firstBtn = $(that.$btns[0]),
                        type_name = window.editTypeCombox.getSelectedValue(),
                        params = _this.getEditTypeParams({ sensitives, type_name }), fn = function () {
                            core.unlockBtn($firstBtn, flyer.i18n.initTitle("保存"));
                        };
                    if (params && params.type_name && params.ids.length) {
                        core.lockedBtn($firstBtn, true, flyer.i18n.initTitle('保存中'));
                        next.call(_this, params, fn, that);
                    } else {
                        flyer.msg(flyer.i18n.initTitle('类型不能为空'));
                        $('input[name=new_type]').focus();
                    }
                }
            }, {
                text: flyer.i18n.initTitle('取消'),
                click: function () {
                    this.close();
                }
            }]
        });
    };
    // 显示批量删除
    Sensitive.prototype.showDeleteWindow = function (next, params) {
        var _this = this;
        flyer.closeAll();
        flyer.confirm(flyer.i18n.initTitle('确定删除吗?'), function (result) {
            
        }, {
                title: flyer.i18n.initTitle('询问框'),
                isModal: true,
                btns: [{
                    text: flyer.i18n.initTitle("确定"),
                    click: function () {
                        this.close();
                        next.call(_this, params, this);
                    }
                }, {
                    text: flyer.i18n.initTitle('取消'),
                    click: function () {
                        this.close();
                    }
                }]
        });
    };
    // 数组自动去重,数组元素支持任何类型的，包括对象，返回去重之后的数组
    Sensitive.prototype.unniqueArr = function (arr) {
        var hashTable = {},
            newArr = [],
            eleTypeofIsObject = false;
        if (Array.isArray(arr)) {
            if (arr.length) {
                for (var i = 0, l = arr.length; i < l; i++) {
                    eleTypeofIsObject = typeof arr[i] === 'object';
                    if (!hashTable[eleTypeofIsObject ? JSON.stringify(arr[i]) : arr[i]]) {
                        hashTable[eleTypeofIsObject ? JSON.stringify(arr[i]) : arr[i]] = true;
                        newArr.push(arr[i]);
                    }
                }
            }
        } else {
            flyer.msg(flyer.i18n.initTitle('参数错误'), 'error');
        }
        return newArr;
    };
    // 显示新增类型窗口
    Sensitive.prototype.showAddTypeWindow = function (next) {
        var _this = this;
        flyer.open({
            pageUrl: _this.formatUrl('/html/add_sensitive_type.html'),
            isModal: true,
            area: [360, 120],
            title: flyer.i18n.initTitle("新增敏感词类型"),
            btns: [{
                text: flyer.i18n.initTitle("保存"),
                click: function () {
                    var that = this, $firstBtn = $(that.$btns[0]), params = {
                        createId: _this.configMap.userId,
                        names: _this.toArray($('input[name=type_name]').val().trim()),
                        orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId']
                    }, fn = function () {
                        core.unlockBtn($firstBtn, flyer.i18n.initTitle("保存"));
                    };
                    if (params && params.names.length) {
                        core.lockedBtn($firstBtn, true, flyer.i18n.initTitle('保存中'));
                        // 判重
                        $.ajax({
                            url: _this.formatUrl(_this.configMap.getTypeUrl),
                            data: {
                                createId: _this.configMap.userId,
                                name: params.names,
                                orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId']
                            },
                            success: function (res) {
                                if (res.success) {
                                    // 已经存在
                                    if (res.data.length) {
                                        flyer.msg(flyer.i18n.initTitle('该类型已经存在'));
                                        $('input[name=type_name]').focus();
                                        return;
                                    } else {
                                        next.call(_this, params, fn, that);
                                    }
                                }
                            },
                            error: function () {
                                flyer.msg(_this.configMap.msg.error);
                            },
                            complete: function () {
                                if (fn) {
                                    fn();
                                }
                            }
                        });
                    } else {
                        flyer.msg(flyer.i18n.initTitle('类型名称不能为空'));
                        $('input[name=type_name]').focus();
                    }
                }
            }, {
                text: flyer.i18n.initTitle('取消'),
                click: function () {
                    this.close();
                }
            }]
        });
    };
    // 新增敏感词（支持批量）that指向的是弹出的窗口
    Sensitive.prototype.add = function (params, fn, that) {
        var _this = this;
        $.ajax({
            url: _this.formatUrl(_this.configMap.addUrl),
            type: 'post',
            data: params,
            success: function (res) {
                if (res.success) {
                    if (that && that.close) {
                        that.close();
                    }
                    flyer.msg(flyer.i18n.initTitle('操作成功'));
                    _this.getList({ createId: _this.configMap.userId, orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'] });
                } else {
                    flyer.msg(flyer.i18n.initTitle('操作失败'));
                }
            },
            error: function () {
                flyer.msg(_this.configMap.msg.error);
            },
            complete: function () {
                fn();
            }
        });
    };
    // 复制敏感词功能
    Sensitive.prototype.copySensitiveWords = function (sensitiveWords) {
        var _this = this, params = {
            createId: _this.configMap.userId,
            type_id: 1,
            type_name: '默认',
            names: sensitiveWords,
            orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId']
        };
        flyer.closeAll();
        flyer.confirm(flyer.i18n.initTitle("确定复制敏感词吗?"), function (result) {
        }, {
                btns: [{
                    text: flyer.i18n.initTitle('确定'),
                    skin: "flyer-btn-blue",
                    click: function (elm) {
                        this.close();
                        var that = this, $firstBtn = $(that.$btns[0]);
                        if (sensitiveWords.length) {
                            _this.add(params, function () {
                                core.unlockBtn($firstBtn, flyer.i18n.initTitle('保存'));
                            }, that);
                        }
                    }
                },
                {
                    text: flyer.i18n.initTitle("取消"),
                    skin: "",
                    click: function (elm) {
                        this.close();
                    }
                }
                ],
                title: flyer.i18n.initTitle("询问框"),
                isModal: true
            });
    };
    // 删除敏感词（支持批量）
    Sensitive.prototype.delete = function (ids) {
        var _this = this;
        if (ids) {
            $.ajax({
                url: _this.formatUrl(_this.configMap.deleteUrl),
                type: 'post',
                data: {
                    ids
                },
                success: function (res) {
                    if (res.success) {
                        var name = _this.toArray(_this.juqeryMap.$searchInp.val().trim()),
                            parmas = { type_name: _this.configMap.listTypeCombox.getSelectedValue(), createId: _this.configMap.userId, orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'] };
                        if (Array.isArray(name) && name.length) {
                            parmas.name = name;
                        }
                        flyer.msg(flyer.i18n.initTitle('操作成功'));
                        _this.getList(parmas);
                    } else {
                        flyer.msg(flyer.i18n.initTitle('操作失败'));
                    }
                },
                error: function () {
                    flyer.msg(_this.configMap.msg.error);
                }
            });
        }
    };
    // 编辑敏感词名称（单个操作）
    Sensitive.prototype.edit = function (sensitive, fn, that) {
        var _this = this;
        $.ajax({
            url: _this.formatUrl(_this.configMap.editUrl),
            type: 'post',
            data: sensitive,
            success: function (res) {
                if (res.success) {
                    if (that && that.close) {
                        that.close();
                    }
                    flyer.msg(flyer.i18n.initTitle('操作成功'));
                    _this.getList({ createId: _this.configMap.userId, orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'] });
                } else {
                    flyer.msg(flyer.i18n.initTitle('操作失败'));
                }
            },
            error: function () {
                flyer.msg(_this.configMap.msg.error);
            },
            complete: function () {
                fn();
            }
        });
    };
    // 编辑敏感词的类型（支持批量）
    Sensitive.prototype.editType = function (params, fn, that) {
        var _this = this;
        if (typeof params === 'object') {
            $.ajax({
                url: _this.formatUrl(_this.configMap.editTypeUrl),
                type: 'post',
                data: params,
                success: function (res) {
                    if (that && that.close) {
                        that.close();
                    }
                    if (res.success) {
                        flyer.msg(flyer.i18n.initTitle('操作成功'));
                        _this.getList({ createId: _this.configMap.userId, orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'] });
                    } else {
                        flyer.msg(flyer.i18n.initTitle('操作失败'));
                    }
                },
                error: function () {
                    flyer.msg(_this.configMap.msg.error);
                },
                complete: function () {
                    fn();
                }
            });
        } else {
            flyer.msg(_this.configMap.msg.errorParams);
        }
    };
    // 新增敏感词类型
    Sensitive.prototype.addType = function (parmas, fn, that) {
        var _this = this;
        if (typeof parmas === 'object') {
            $.ajax({
                url: _this.formatUrl(_this.configMap.addTypeUrl),
                data: parmas,
                type: 'post',
                success: function (res) {
                    if (that && that.close) {
                        that.close();
                    }
                    if (res.success) {
                        _this.getType({ createId: _this.configMap.userId, orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'] });
                    }
                    flyer.msg(flyer.i18n.initTitle('操作成功'));
                },
                error: function () {
                    flyer.msg(_this.configMap.msg.error);
                },
                complete: function () {
                    if (fn) {
                        fn()
                    }
                }
            });
        } else {
            flyer.msg(_this.configMap.msg.errorParams);
        }
    };
    // 事件绑定
    Sensitive.prototype.bindEvents = function (handles) {
        var _this = this;
        // 搜索
        _this.juqeryMap.$search.on('click', handles.search);
        // 新增（支持批量）
        // _this.juqeryMap.$add.on('click', handles.add);
        // 新增（没有敏感词的时候）
        _this.juqeryMap.$nomatchAdd.on('click', handles.add);
        // 删除（单个）
        _this.juqeryMap.$delete.on('click', handles.delete);
        // 编辑名称（单个操作）
        _this.juqeryMap.$edit.on('click', handles.edit);
        // 编辑类型（支持批量）
        _this.juqeryMap.$editType.on('click', handles.editType);
        // 删除（批量）
        _this.juqeryMap.$deleteBatch.on('click', handles.deleteBatch);
        // 新增类型
        _this.juqeryMap.$addType.on('click', handles.addType);
        // 一键复制其他组的敏感词功能
        _this.juqeryMap.$copySensitiveWordsBtn.on('click', handles.copySensitiveWordsBtn);
    };
    // 事件处理
    Sensitive.prototype.eventHandle = function () {
        var _this = this,
            _handles = Object.create({});
        // 搜索
        _handles.search = function (e) {
            var params = {
                type_id: _this.configMap.listTypeCombox.getSelectedValue(), createId: _this.configMap.userId,
                orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId']
            }, name = _this.juqeryMap.$searchInp.val().trim();
            if (name) {
                params.name = _this.toArray(name);
            }
            //判断是否是点击了搜索重新渲染的
            _this.isSearch = true;
            _this.getList(params);
            return false;
        };
        // 敏感词点击
        _handles.toggleClick = function () {
            // $(this).toggleClass('flyer-click');
            return false;
        };
        // 新增（支持批量）
        _handles.add = function (e) {
            var event = e || window.event, types = JSON.parse(window.localStorage.getItem('acsAllType'));
            if (types.length) {
                _this.showAddWindow(_this.add);
            } else {
                flyer.msg(flyer.i18n.initTitle('还未创建敏感词类型，请先创建敏感词类型'));
            }
            return false;
        };
        // 删除（单个）
        _handles.delete = function (e) {
            var event = e || window.event, ids = [$(this).data('id')];
            if (ids.length) {
                _this.showDeleteWindow(_this.delete, ids);
            }
            return false;
        };
        // 编辑名称（单个操作）
        _handles.edit = function (e) {
            var event = e || window.event, sensitive = { id: $(this).data('id'), oldName: $(this).data('name') };
            _this.showEditWindow(_this.edit, sensitive);
            return false;
        };
        // 编辑类型（支持批量）
        _handles.editType = function (e) {
            var event = e || window.event, selectedSensitives = _this.getSelectSensitives();
            if (Array.isArray(selectedSensitives) && selectedSensitives.length) {
                _this.showEditTypeWindow(_this.editType, selectedSensitives);
            } else {
                flyer.msg(flyer.i18n.initTitle('至少选择一个敏感词进行修改'));
            }
            return false;
        };
        // 删除（批量删除）
        _handles.deleteBatch = function (e) {
            var event = e || window.event, selectedSensitives = _this.getSelectSensitives().map(function (item) {
                return item.id;
            });
            if (Array.isArray(selectedSensitives) && selectedSensitives.length) {
                _this.showDeleteWindow(_this.delete, selectedSensitives);
            } else {
                flyer.msg(flyer.i18n.initTitle('至少选择一个敏感词进行删除'));
            }
            return false;
        };
        // 新增类型
        _handles.addType = function (e) {
            var event = e || window.event;
            _this.showAddTypeWindow(_this.addType);
            return false;
        };
        // 一键复制敏感词
        _handles.copySensitiveWordsBtn = function (e) {
            var event = e || window.event;
            _this.copySensitiveWords(sensitiveWords);
        };
        // 赋值
        this.handles = _handles;
        return _handles;
    };
    // 页面加载
    $(function () {
        var sensitive = new Sensitive();
        sensitive.getType({ createId: sensitive.configMap.userId, orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'] });
        sensitive.getList({ createId: sensitive.configMap.userId, orgGroupId: JSON.parse(window.unescape($("#__groups").val()))[0]['orgGroupId'] });
        sensitive.bindEvents(sensitive.eventHandle());
    });
});