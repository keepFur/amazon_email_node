"use strict";
flyer.define("frame", function (exports, module) {
    // 页面中使用到的一些常量
    var baseDatas = {
        // 根据主题单号从数据库获取所有关于此主题的会话数据url
        getAllSessionBySubjectNumUrl: core.url + '/get_subject',
        // 根据邮件ID获取邮件的URL
        getEmailDetailByIdUrl: core.url + '/get_email_details',
        // 当前页面的key值
        exportKey: flyer.getQueryString('exportKey'),
        // 当前页码
        curIndex: flyer.getQueryString('curIndex') || 1,
        // 当前显示的页数
        limit: flyer.getQueryString('limit') || 20,
        // 主题编号
        subjectNum: flyer.getQueryString('subject_num'),
        // 某个主题下面所有的会话
        allSessions: [],
        // 记录遍历了多少次邮件详情
        getEmailCount: 0,
        // 收件人
        _from: '',
        // 发件人
        _to: '',
        // 主题内容
        subjectText: '',
        // 富文本编辑器实例对象
        editor: null,
        // 邮件详情容器中需要减去的高度值
        differenceHeightOfContainer: 145,
        // 邮件详情容器中会话容器需要减去的高度值
        differenceHeightOfSeesion: 270,
        // 当网络请求出错误的时候，提示用户的消息
        errorMsg: flyer.i18n.initTitle('网络错误，请刷新页面重试'),
        paramErrMsg: flyer.i18n.initTitle('参数错误，请刷新页面重试'),
        folder: 'folder_detail',
        currentTab: flyer.getQueryString('currentTab'),
        type_id: flyer.getQueryString('type_id')
    };
    flyer.exports.Upload = {
        insertedData: [],
        fileData: []
    };

    /**
     * 模块入口函数
     * 
     */
    function init() {

        // 初始化富文本编辑器
        initEditor();
        // DOM元素事件初始化
        initEvent();
        // 设置左侧菜单高亮显示
        setMenuHeightLightByKey();
        // 加载数据
        getAllSessionBySubjectNum();
        // 动态调整容器的高度
        dynamicAdjustContainerHeight();
        // 根据不同的角色显示不同的页面元素
        initPageByRole();
        // 初始化选项卡
        initTab();
    }

    /**
    * 初始化富文本编辑器 
    * 
    */
    function initEditor() {
        baseDatas.editor = flyer.edit($(".flyer-textarea"), {
            isResize: true,
            resizeCallback: function (type) {
                dynamicAdjustContainerHeight();
                var sumHeight = $('#email_detail_two').height(), sendHeight = $('.detail_two_send').height();
                $('#detail_two_contact').height(sumHeight - sendHeight - 40);
            },
        });
    }

    /**
     *根据不同的角色显示不同的页面元素 
     * 
     */
    function initPageByRole() {
        //客服不显示分派按钮
        if (core.getUserGroups().orgCode === '9101') {
            $('#flyerAssignBtn').hide();
        }
        // 已解决的邮件需要隐藏分派和已解决按钮
        if (flyer.getQueryString('exportKey') === 'resolved') {
            $('#flyerAssignBtn').hide();
            $('#flyerToResoveBtn').hide();
        }
    }

    /**
     * 初始化选项卡
     * 
     */
    function initTab() {
        flyer.tab($('#flyerEmailDetailTab'), {
            tabs: [{
                title: flyer.i18n.initTitle('相关订单'),
                url: './html/order_info.html',
                cache: true
            }, {
                title: flyer.i18n.initTitle('客诉统计'),
                url: './html/customer_complaint_history.html',
                cache: true
            }],
            click: function (curTab) {
                if ($(curTab).data('index') === 1) {
                    $('.flyer-tab-content .flyer-tab-item:first-child').hide();
                } else {
                    $('.flyer-tab-content .flyer-tab-item:first-child').show();
                }
            }
        });
    }

    /**
     * DOM元素事件初始化
     * 
     */
    function initEvent() {
        // 发送
        $('#flyerSendBtn').on('click', sendHandle);
        // 返回
        $('#flyerBackBtn').on('click', backHandle);
        // 分派
        $('#flyerAssignBtn').on('click', assignHandle);
        // 转为已解决
        $('#flyerToResoveBtn').on('click', toResoveHandle);
        // 窗口大小变化事件
        $(window).on('resize', windowOnresizeHandle);
        //引用模板
        $(".template").on("click", useTemplateHandle);
        // 上传附件
        $(".pagerclip").on("click ", uploadAttachmentHandle);
        // 显示或隐藏聊天记录
        $('.detail_two_item').find('.expandBtn').on('click', toggleChatHistoryHandle);
    }

    /**
     * 附件预览点击事件处理函数
     * 
     * @param {any} events 
     */
    function previewAttachHandle(events) {
        var _this = this;
        flyer.open({
            pageUrl: '',
            isModal: true,
            area: [800, 400],
            title: flyer.i18n.initTitle('附件预览'),
            content: previewTpl($(_this).data('md5name')),
            btns: [
                {
                    click: function () {
                        this.close();
                    },
                    text: flyer.i18n.initTitle('关闭')
                }
            ]
        });
    }

    /**
     * 发送按钮点击事件处理函数 
     * 如果当前收件人是 admin@aukey.com并且是support邮箱的话，需要弹出一个框让用户自定义收件人信息
     */
    function sendHandle(events) {
        var content = baseDatas.editor.getFullContent(),
            trimContent = content.replace(/&nbsp;|\s+&nbsp;/gi, ''),//去除空格后的内容
            data = {
                from: baseDatas._from,
                to: baseDatas._to,
                subject: encodeURIComponent(baseDatas.subjectText),
                body: encodeURIComponent(content || ''),
                text: encodeURIComponent(baseDatas.editor.getFullText())
            };
        if (trimContent) {
            if (isNeedUserInputToEmail(baseDatas._to)) {
                flyer.open({
                    isModal: true,
                    content: generateUserInputToEmailTemplate(baseDatas._to),
                    area: [400, 120],
                    title: flyer.i18n.initTitle("收件人"),
                    btns: [
                        {
                            click: function (elm) {
                                data.to = $('input[name=to]').val().trim() || data.to;
                                sendEmail(data, $(elm), this);
                            },
                            text: flyer.i18n.initTitle('确定')
                        },
                        {
                            click: function () {
                                this.close();
                            },
                            text: flyer.i18n.initTitle('关闭')
                        }
                    ]
                });
            } else {
                sendEmail(data, $('#flyerSendBtn'));
            }
        } else {
            flyer.msg(flyer.i18n.initTitle('邮件内容不能为空。'));
        }
        return false;
    }

    /**
     * 判断收件人信息是否需要用户自定义输入
     * 需要的话 返回true，不需要的话  返回 false
     * @param {any} to 收件人地址
     */
    function isNeedUserInputToEmail(to) {
        var supportGroups = ['Support-EU', 'Support-US', 'Support-CA', 'Support邮箱'],
            groupName = core.getUserGroups().groupName;
        return supportGroups.indexOf(groupName) !== -1;
        // return true;
    }

    /**
     * 生成用户输入收件人的模板
     * 
     * @param {any} to 收件人地址
     */
    function generateUserInputToEmailTemplate(to) {
        return `<div class="flyer-form-item add-folder" style="padding-top:28px;">
                    <label class="flyer-form-label i18n" data-i18nkey="收件人">收件人</label>
                    <div class="flyer-input-block">
                        <input type="text" name="to" value='${to}'  autocomplete="off" class="flyer-input folder_name" 
                            autofocus>
                    </div>
                </div>`;
    }

    /**
     *返回按钮的点击事件处理函数 
     * 
     */
    function backHandle(events) {
        if (/type_id/gi.exec(window.location.hash)) {
            core.loadPage('#' + baseDatas.folder, '?curIndex=' + baseDatas.curIndex + '&limit=' + baseDatas.limit + '&currentTab=' + baseDatas.currentTab + '&type_id=' + baseDatas.type_id);
        } else {
            core.loadPage('#' + baseDatas.exportKey, '?curIndex=' + baseDatas.curIndex + '&limit=' + baseDatas.limit);
        }
    }

    /**
     * 分派按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function assignHandle(events) {
        //弹出角色选择框
        flyer.open({
            pageUrl: core.url + "/html/assignGroup.html",
            isModal: true,
            area: [600, 300],
            title: flyer.i18n.initTitle("请选择要指派的人员"),
            btns: [{
                text: flyer.i18n.initTitle('确定'),
                skin: "",
                click: function () {
                    if ($(".flyer-dialog-content tbody input:checked").length === 0) {
                        flyer.msg(flyer.i18n.initTitle('请至少选择一项'));
                        return;
                    } else if ($(".flyer-dialog-content tbody input:checked").length > 1) {
                        flyer.msg(flyer.i18n.initTitle('最多选择一项'));
                    } else {
                        var _this = this;
                        $.ajax({
                            url: core.url + "/turn_status",
                            data: {
                                data: JSON.stringify([baseDatas.subjectNum]),
                                status: 5,
                                assignName: window.encodeURIComponent(window.flyer.exports.assignGroup.group[$(".flyer-dialog-content tbody input:checked").parents('tr').index()].name),
                                assignId: flyer.exports.assignGroup.group[$(".flyer-dialog-content tbody input:checked").parents('tr').index()].user_id,
                                name: '已分派',
                                time: window.Date.now()
                            },
                            success: function (result) {
                                flyer.msg(flyer.i18n.initTitle('分派成功'));
                                _this.close();
                                //刷新左侧数据
                                window.bubbleData();
                                if (/type_id/gi.exec(window.location.hash)) {
                                    core.loadPage('#' + baseDatas.folder, '?curIndex=' + baseDatas.curIndex + '&limit=' + baseDatas.limit + '&currentTab=' + baseDatas.currentTab + '&type_id=' + baseDatas.type_id);
                                } else {
                                    core.loadPage('#' + baseDatas.exportKey, '?curIndex=' + baseDatas.curIndex + '&limit=' + baseDatas.limit);
                                }
                            },
                            error: function (err) {
                                flyer.msg(flyer.i18n.initTitle('分派失败502'));
                            }
                        })
                    }
                }
            }]
        });
    }

    /**
     * 转为已解决按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function toResoveHandle(events) {
        flyer.confirm(flyer.i18n.initTitle("确定要转为已解决吗?"), function (result, yes) {
        }, {
                btns: [{
                    text: flyer.i18n.initTitle('确定'),
                    skin: "flyer-btn-blue",
                    click: function (elm) {
                        this.close();
                        var _this = this;
                        $.ajax({
                            url: core.url + "/turn_disposed_status",
                            data: {
                                data: [baseDatas.subjectNum],
                                status: 9, //转为已处理
                                name: '已解决',
                                time: window.Date.now()
                            },
                            success: function (result) {
                                flyer.msg(flyer.i18n.initTitle('转为已解决成功'));
                                //刷新左侧数据
                                window.bubbleData();
                                _this.close();
                                if (/type_id/gi.exec(window.location.hash)) {
                                    core.loadPage('#' + baseDatas.folder, '?curIndex=' + baseDatas.curIndex + '&limit=' + baseDatas.limit + '&currentTab=' + baseDatas.currentTab + '&type_id=' + baseDatas.type_id);
                                } else {
                                    core.loadPage('#' + baseDatas.exportKey, '?curIndex=' + baseDatas.curIndex + '&limit=' + baseDatas.limit);
                                }
                            },
                            error: function (err) {
                                flyer.msg(baseDatas.errorMsg)
                            }
                        });
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
    }

    /**
     * 浏览器窗口尺寸变化事件处理函数
     * 
     * @param {any} events 
     */
    function windowOnresizeHandle(events) {
        // 动态调整邮件详情的容器高度
        dynamicAdjustContainerHeight();
    }

    /**
     * 上传附件按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function uploadAttachmentHandle(events) {
        flyer.open({
            content: `<input type="file" multiple="multiple" class="flyer-upload-file" />
                      <div id='filesTable'>
                      </div>
                      <script src="../js/upload.js"></script>`,
            isModal: true,
            area: [600, 300],
            title: flyer.i18n.initTitle("选择附件"),
            btns: [
                {
                    text: flyer.i18n.initTitle('确定'),
                    skin: "",
                    click: function () {
                        uploadBubble();
                        //展示已添加的附件
                        showAttachment();
                        this.close();
                    }
                }, {
                    text: flyer.i18n.initTitle('关闭'),
                    click: function () {
                        this.close();
                    }
                }
            ]
        });
    }

    /**
     * 引用模板按钮点击事件处理函数
     * 
     * @param {any} events 
     */
    function useTemplateHandle(events) {
        flyer.open({
            pageUrl: core.url + "/html/template_choice.html",
            isModal: true,
            area: [600, 400],
            title: flyer.i18n.initTitle("模板"),
            btns: [
                {
                    text: flyer.i18n.initTitle('确定'),
                    skin: "",
                    click: function () {
                        //填充数据
                        if ($(".template-container .active").length === 0) {
                            flyer.msg(flyer.i18n.initTitle("请至少选择一项"));
                            return;
                        } else {
                            var data = flyer.exports.template_choice.templateChioce[
                                $(".template-container .active").parent().index()
                            ];
                            baseDatas.editor.setContent(core.conpileHtml(decodeURIComponent(data.content), ($('.myself').length && {
                                self: $('.myself:first').find('.detail_two_accessory div:first').find('p:first').children().get(0).previousSibling.textContent,
                                name: $('.myself:first').find('.detail_two_accessory div:first').find('p:first').children().get(0).nextSibling.textContent
                            }) || {
                                    self: $('.detail_two_item:first').find('.detail_two_accessory div:first').find('p:first').children().get(0).nextSibling.textContent,
                                    name: $('.detail_two_item:first').find('.detail_two_accessory div:first').find('p:first').children().get(0).previousSibling.textContent
                                }));
                            //给附件赋值
                            loadFile(data);
                            //展示附件
                            showAttachment();
                            //关闭弹窗
                            this.close();
                        }
                    }
                }, {
                    text: flyer.i18n.initTitle('关闭'),
                    click: function () {
                        this.close();
                    }
                }
            ]
        });
    }

    /**
     * 显示或隐藏聊天记录的点击事件处理函数
     * 
     * @param {any} events 
     */
    function toggleChatHistoryHandle(events) {
        $(this).css({
            float: 'none',
            'margin-bottom': 16
        }).next('.flyer-email-recored').toggle();
        return false;
    }

    /**
     * 加载订单信息，通过发件人邮箱
     * 
     * @param {any} email 邮箱信息 
     */
    function loadOrderInfoByEmail(email) {
        var strEmail = core.isSelfEmail(email._from) ? email._to : email._from,
            order = email.subject.match(/[\d]{1,}-[\d]{1,}-[\d]{1,}/ig);
        if (order || strEmail) {
            core.getOrderInfo(order && order[0].trim(), strEmail);
        }
    }

    /**
     * 根据主题单号从数据库获取所有关于此主题的会话数据
     * 
     * @param {any} subjectNum 主题单号，必须参数 
     */
    function getAllSessionBySubjectNum(subjectNum) {
        $.ajax({
            url: baseDatas.getAllSessionBySubjectNumUrl,
            data: {
                subject_num: subjectNum || baseDatas.subjectNum,
                nocache: window.Date.now()
            },
            success: function (result) {
                if (result && result.length) {
                    // 设置主题(此方法调用了两次，防止报错的时候不掉用这个方法，从而导致标题赋值不上)
                    setValueForSubject(result[0].subject);
                    // 加载订单
                    loadOrderInfoByEmail(result[0]);
                    // 通过索引先生成空的html结构,遍历所有的会话
                    generatePlaceholderByIndex(result);
                    if (core.isSelfEmail(result[0]._from)) {
                        baseDatas._from = result[0]._from;
                        baseDatas._to = result[0]._to;
                    } else {
                        baseDatas._to = result[0]._from;
                        baseDatas._from = result[0]._to;
                    }
                    // 系统记录下某一个主题下的所有会话
                    baseDatas.allSessions = result;
                    exports.emailInfo = result[0];
                }
            },
            error: function (err) {
                flyer.msg(baseDatas.errorMsg);
            }
        });
    }


    /**
     * 获取邮件详情，根据邮件的id 
     * 
     * @param {any} id 邮件id
     */
    function getEmailDetailById(id, session) {
        var $container = $('#email_detail_two');
        if (session) {
            $.ajax({
                url: baseDatas.getEmailDetailByIdUrl,
                data: {
                    nocache: window.Date.now(),
                    id: session.ID || session.id,
                    storage_url: session.storage_url,
                    storage_key: session.storage_key,
                    type_id: session.type_id
                },
                timeout: 1000 * 60 * 2,
                beforeSend: function () {
                    flyer.loading.init($container).add();
                },
                success: function (result) {
                    renderEmailDetailFrame(session.ID || session.id, result[0]);
                    baseDatas.getEmailCount++;
                    // 最后一封邮件的时候 将聊天记录的容器滚动到最底部
                    if (baseDatas.getEmailCount === baseDatas.allSessions.length) {
                        setContainerScrollBottom();
                        // 设置主题
                        setValueForSubject(session.subject);
                    }
                },
                error: function (err) {
                    flyer.msg(baseDatas.errorMsg);
                },
                complete: function () {
                    flyer.loading.init($container).delete();
                }
            });
        } else {
            flyer.msg(baseDatas.paramErrMsg);
        }
    }

    /**
     * 遍历所有某个主题下面的邮件
     * 
     * @param {any} sessions 某个主题下面所有的邮件 
     */
    function iterateAllSession(sessions) {
        if (Array.isArray(sessions)) {
            $.each(sessions, function (index, session) {
                // 通过每一个会话中的邮件ID获取邮件的详情，并进行渲染
                getEmailDetailById(session.ID || session.id, session);
            });
        } else {
            flyer.msg(baseDatas.paramErrMsg);
        }
    }

    /**
     * 设置邮件主题的值
     * 
     * @param {any} subject 
     */
    function setValueForSubject(subject) {
        var $subject = $('.email_detal_subject');
        $subject.html(':' + subject);
        baseDatas.subjectText = subject;
    }

    /**
     * 设置左侧菜单栏高亮显示
     * 
     */
    function setMenuHeightLightByKey(exportKey) {
        exportKey = exportKey || baseDatas.exportKey;
        core.menuHeightLightByKey(exportKey);
    }

    /**
     * 根据一个主题下面的所有会话，渲染出所有的邮件详情
     * 
     * @param {any} data 一个会话
     */
    function renderEmailDetailFrame(id, data) {
        if (data) {
            // 客服回复的邮件
            if (core.isSelfEmail(data._from)) {
                generateServicerTemplate(id, data);
            } else {
                // 买家发过来的邮件
                generateCustomerTemplate(id, data);
            }
            // 预览附件
            $(".flyer-frame-Box .icon-search").off('click').on('click', previewAttachHandle);
        } else {
            console.log('进行邮件详情渲染的时候：邮件详情为空');
        }
    }

    /**
     * 根据单个邮件数据生成一个顾客的邮件详情模板
     * 
     * @param {Object} data  邮件详情信息 
     * @returns 返回生成的邮件详情模板字符串
     */
    function generateCustomerTemplate(id, data) {
        var emailBody = data.html || data.text,
            attachment = JSON.parse(data.attachment),
            attachmentTemplate = attachment.length ? generateAttachmentTemplate(attachment, 'left') : '',
            emailInfoTemplate = generateEmailInfoTemplate(data),
            template = '<div class="detail_two_left" >'
                + '<i class="fa fa-user-o active" title="' + data._from + '"></i>'
                + '</div>'
                + '<div class="detail_two_right">'
                + '<div class="detail_two_text">'
                + core.formatEmailContent(emailBody)
                + '</div>'
                + '<div class="detail_two_accessory">'
                + emailInfoTemplate
                + attachmentTemplate
                + '</div>'
                + '</div>'
            ;
        $('.detail_two_item[data-index=' + id + ']').append(template);
        // 显示或隐藏聊天记录
        $('#detail_two_contact .detail_two_item[data-index=' + id + ']').find('.expandBtn').on('click', toggleChatHistoryHandle);
        return $('.detail_two_item[data-index=' + id + ']');
    }

    /**
     * 根据单个邮件数据生成一个客服人员的邮件详情模板
     *
     * @param {any} data
     * @returns 返回生成的邮件详情模板字符串
     */
    function generateServicerTemplate(id, data) {
        var emailBody = data.html || data.text,
            attachment = JSON.parse(data.attachment),
            attachmentTemplate = attachment.length ? generateAttachmentTemplate(attachment, 'left') : '',
            emailInfoTemplate = generateEmailInfoTemplate(data, 'left'),
            template = '<div class="detail_two_left">'
                + '<i class="fa fa-user-o active" title="' + data._from + '"></i>'
                + '</div>'
                + '<div class="detail_two_right">'
                + '<div class="detail_two_text">'
                + core.formatEmailContent(emailBody)
                + '</div>'
                + '<div class="detail_two_accessory">'
                + emailInfoTemplate
                + attachmentTemplate
                + '</div>'
                + '</div>';
        $('#detail_two_contact .detail_two_item[data-index=' + id + ']').append(template).addClass('myself');
        // 显示或隐藏聊天记录
        $('#detail_two_contact .detail_two_item[data-index=' + id + ']').find('.expandBtn').on('click', toggleChatHistoryHandle);
        return $('#detail_two_contact .detail_two_item[data-index=' + id + ']');
    }

    /**
     * 根据附件信息生成一个附件的html模板
     *
     * @param {any} attachment  附件对象信息
     * @returns 返回生成的附件html模板
     */
    function generateAttachmentTemplate(attachment, align) {
        var attachmentSize = 0,
            templates = '',
            ablePreviewType = ['png', 'jpg', 'jpeg', 'pdf', 'html', 'txt', 'docx', 'pptx', 'xlsx', 'ppt', 'doc', 'xls'];
        align = align || 'right';
        $.each(attachment, function (index, item) {
            attachmentSize = core.getAttachSize(item.size / 1024);
            item.name = item.name || '';
            var downloadUrl = "/download?name=" + window.encodeURIComponent(item.name) + '&md5Name=' + item.md5Name,
                type = item.name.replace(/.*.\./ig, ''),
                display = 'block';
            if (ablePreviewType.indexOf(type.toLowerCase()) === -1) {
                display = 'none';
            }
            templates += '<div>'
                + '<p style="float:' + align + '" title="' + item.name + '">(' + attachmentSize + ')' + item.name + '</p>'
                + '<i class="icon-search" style="display: ' + display + ';float:right;' + '" title="' + flyer.i18n.initTitle("附件预览") + '" data-md5name="' + item.md5Name + '"></i>'
                + '<a href="' + downloadUrl + '" style="float:right;"><i class="fa fa-download" title="' + flyer.i18n.initTitle("附件下载") + '" data-md5name="' + item.md5Name + '"></i></a>'
                + '</div>';
        });
        return templates;
    }

    /**
     * 根由邮件详情，生成一个邮件信息的模板字符串
     * 
     * @param {any} email 邮件详情信息
     * @returns 返回生成的模板字符串
     */
    function generateEmailInfoTemplate(email, align) {
        var template = '',
            sendTime = getEmailDateById(email),
            emailNameFrom = email._from,
            emailNameTo = email._to;
        align = align || 'right';
        template += '<div>'
            + '<p>' + emailNameFrom + '<i class="fa fa-long-arrow-right" style="float:none;font-size:12px;margin:0 4px;" aria-hidden="true"></i>' + emailNameTo + '</p>'
            + '<p style="float:right;">' + sendTime + '</p>'
            + '</div>';
        return template;
    }

    /**
     * 通过索引生成占位符结构,针对客服人员的，解决ajax异步请求不同步造成数据顺序为问题
     * 
     * @param {any} index 
     */
    function generatePlaceholderByIndex(sessions) {
        $.each(sessions, function (index, session) {
            var $template = '<div class="detail_two_item" data-index="' + (session.ID || session.id) + '"></div>';
            $('#detail_two_contact').append($template);
        });
        iterateAllSession(sessions);
    }

    /**
     * 根据会话的数量，动态调整邮件详情容器和其中的会话容器的高度
     * 
     * @param {any} differenceHeightOfContainer 邮件详情容器的差值
     * @param {any} differenceHeightOfSeesion 邮件详情中的会话容器的差值
     */
    function dynamicAdjustContainerHeight(differenceHeightOfContainer, differenceHeightOfSeesion) {
        differenceHeightOfContainer = differenceHeightOfContainer || baseDatas.differenceHeightOfContainer;
        differenceHeightOfSeesion = differenceHeightOfSeesion || baseDatas.differenceHeightOfSeesion;
        var detailContainerHeight = document.documentElement.clientHeight - differenceHeightOfContainer,
            sessionContainerHeight = detailContainerHeight - differenceHeightOfSeesion;
        $('#email_detail_two').height(detailContainerHeight);
        $('#detail_two_contact').height(sessionContainerHeight - 10);
    }

    /**
     *将聊天记录的容器滚动到最底部位置 
     * 
     */
    function setContainerScrollBottom() {
        var containerEle = document.getElementById('detail_two_contact'),
            scrollHeight = containerEle.scrollHeight;
        containerEle.scrollTop = scrollHeight;
    }

    /**
     * 创建元素
     * 
     * @param {any} src 
     * @param {any} backupsrc 
     * @param {any} type 
     * @returns 
     */
    function generateEmbedElement(src, backupsrc, type) {
        var e = document.createElement(type);
        e.setAttribute('src', src);
        e.setAttribute('id', 'preveImg');
        e.setAttribute('alt', flyer.i18n.initTitle("资源不存在"));
        e.className = 'flyer-preview';
        e.onerror = function () {
            e.onerror = null;
            $('#preveImg').attr('src', backupsrc);
        }
        return $(e).wrapAll('<div>').parent().html()
    }

    /**
     * 生成附件预览模板，根据数据源
     * 
     * @param {any} src 数据源
     * @returns 返回预览模板字符串
     */
    function previewTpl(src) {
        var localPreviewSrc = '/upload/' + src,
            localPreviewSrcBackup = '/AmazonCustomer_fatchemail/src/upload/' + src,
            localPreviewEmbedHtml = generateEmbedElement(localPreviewSrc, localPreviewSrcBackup, 'embed'),
            localPreviewImgHtml = generateEmbedElement(localPreviewSrc, localPreviewSrcBackup, 'img'),
            netPreviewSrc = 'https://docs.google.com/gview?url=http://' + location.host + '/upload/' + src + '&embedded=true',
            netPreviewSrcBackup = 'https://docs.google.com/gview?url=http://' + location.host + '/AmazonCustomer_fatchemail/src/upload/' + src + '&embedded=true',
            netPreviewEmbedHtml = generateEmbedElement(netPreviewSrc, netPreviewSrcBackup, 'embed');
        switch (src.split('.')[1].toLowerCase()) {
            case 'pdf':
                return localPreviewEmbedHtml
                break
            case 'png':
                return localPreviewImgHtml
                break
            case 'jpg':
                return localPreviewImgHtml
                break
            case 'jpeg':
                return localPreviewImgHtml
                break
            case 'txt':
                return localPreviewEmbedHtml
                break
            case 'html':
                return localPreviewEmbedHtml
                break
            case 'doc':
                return netPreviewEmbedHtml
                break
            case 'docx':
                return netPreviewEmbedHtml
                break
            case 'xls':
                return netPreviewEmbedHtml
                break
            case 'xlsx':
                return netPreviewEmbedHtml
                break
            case 'ppt':
                return netPreviewEmbedHtml
                break
            case 'pptx':
                return netPreviewEmbedHtml
                break
        }
    }



    /**
     *通过邮件的id取到 邮件的用户发送时间
     * 
     * @param {any} email 邮件详情
     * @returns 时间
     */
    function getEmailDateById(email) {
        var date = '', id = email.ID || email.id;
        date = baseDatas.allSessions.find(function (item, index) {
            return item.ID === id;
        }) || {};
        date = date.timer || email.timer;
        return flyer.formatDate('yyyy-mm-dd hh:MM', date);
    }

    /**
     *展示上传的附件 
     * 
     */
    function showAttachment() {
        //重置结构
        $('.attachments').remove();
        //添加附件展示
        if (flyer.exports.Upload && flyer.exports.Upload.fileData && flyer.exports.Upload.fileData.length !== 0) {
            flyer.exports.Upload.fileData.forEach(function (obj, index) {
                var fileName = obj.fileName;
                var byte = core.getAttachSize((obj.fileSize / 1024));
                //生成附件结构
                var _hasPreview = /jpg|jpeg|png|pdf|txt|html|docx|doc|xls|xlsx|ppt|pptx/gi.test(obj.fileMD5Name.split('.')[1].toLowerCase()) ? '<i class="fa fa-eye" style="display: inline-block;position:absolute;right:22px;top:10px;" title="' + flyer.i18n.initTitle("预览") + '" data-md5name="' + obj.fileMD5Name + '" onclick="window.previewFile(this)"></i>' : '';
                var attachment = $('<div class = "attachments" title="(' + byte + ')' + fileName + '">(' + byte + ') ' + fileName + '<i class = "delect-file-btn fa icon-remove"></i>' + _hasPreview + '</div>');
                $(".flyer-edit").append(attachment);
                attachment.find('i:not(".fa-eye")').on("click", function () {
                    var index = $(this).parent().index() - 2;
                    $(this).parent().remove();
                    flyer.exports.Upload.fileData.splice(index, 1);
                    flyer.exports.Upload.insertedData.splice(index, 1);
                    uploadBubble();
                });
            });
        } else {
            $('.attachments').remove();
        }
    }

    /**
     * 设置上传附件的气泡
     * 
     */
    function uploadBubble() {
        if (flyer.exports.Upload && flyer.exports.Upload.fileData) {
            var fileLength = flyer.exports.Upload.fileData.length
            if (fileLength !== 0) {
                $('#addFile span.fileNum').html(fileLength).css('display', 'inline-block');
            } else {
                $('#addFile span.fileNum').hide();
            }
        }
    }

    /**
     * 加载上传的附件
     * 
     * @param {any} data 
     */
    function loadFile(data) {
        if (data.attachment !== 'null') {
            if (flyer.exports.Upload && flyer.exports.Upload.fileData) {
                flyer.exports.Upload.fileData = JSON.parse(data.attachment).concat(flyer.exports.Upload.fileData)
            }
            flyer.exports.Upload.insertedData = [];
            JSON.parse(data.attachment).forEach(function (obj, index) {
                var fileObj = {
                    Name: '<div style="white-space: nowrap;text-overflow:ellipsis;overflow:hidden" title="' + obj.fileName + '">'
                        + obj.fileName + '</div>',
                    Size: core.getAttachSize(obj.fileSize / 1024),
                    Delete: "<div class='delect-file-btn fa fa-times' onclick='flyer.Upload.deleteFile(this)' style='cursor:pointer' id='" + obj.fileMD5Name + "' data-index='" + index + "'></div>"
                };
                flyer.exports.Upload.insertedData.push(fileObj);
            });
        }
        //更新附件气泡
        uploadBubble();
    }

    /**
     * 发送邮件
     * 
     * @param {Object} data 
     */
    function sendEmail(data, $btn, open) {
        var $sendEmailBtn = $btn;
        var domain = core.findInfoByEmail(data.from) || {};
        var id = core.getGUID();
        core.createMaillog({
            mailID: id,
            userID: $("#__userid").val(),
            userName: $("#__username").val(),
            content: '开始发送'
        });
        core.lockedBtn($sendEmailBtn, true, flyer.i18n.initTitle('发送中'));
        flyer.sensitive.filterSensitive(baseDatas.editor.getContent(), function (sensitivesOfBody) {
            if (sensitivesOfBody.length === 0) {
                try {
                    $.ajax({
                        url: core.url + "/sendEmail/",
                        type: "post",
                        timeout: 100000,
                        data: {
                            id: id,
                            from: data.from,
                            to: data.to,
                            subject: data.subject || '',
                            body: data.body || '',
                            text: data.text || '',
                            fileData: flyer.exports.Upload.fileData,
                            user_name: window.encodeURIComponent($("#__username").val()),
                            user_id: $("#__userid").val(),
                            orgCode: core.getUserGroups().orgCode,
                            domain: domain.domain || '',
                            time: window.Date.now()
                        },
                        success: function (result) {
                            if (result.statuCode === 200) {
                                core.createMaillog({
                                    mailID: id,
                                    userID: $("#__userid").val(),
                                    userName: $("#__username").val(),
                                    content: '发送完成且成功'
                                });
                                flyer.msg(flyer.i18n.initTitle("已经成功为你投递至") + "[" + data.to + "]" + flyer.i18n.initTitle("邮箱"));
                                turnFinished();
                                if (/type_id/gi.exec(window.location.hash)) {
                                    core.loadPage('#' + baseDatas.folder, '?curIndex=' + baseDatas.curIndex + '&limit=' + baseDatas.limit + '&currentTab=' + baseDatas.currentTab + '&type_id=' + baseDatas.type_id);
                                } else {
                                    core.loadPage('#' + baseDatas.exportKey, '?curIndex=' + baseDatas.curIndex + '&limit=' + baseDatas.limit);
                                }
                            } else {
                                core.createMaillog({
                                    mailID: id,
                                    userID: $("#__userid").val(),
                                    userName: $("#__username").val(),
                                    content: '发送完成但失败'
                                });
                                flyer.msg(flyer.i18n.initTitle('邮件发送失败') + ':' + flyer.i18n.initTitle(result.message));
                            }
                        },
                        error: function (err) {
                            flyer.msg(baseDatas.errorMsg);
                            core.createMaillog({
                                mailID: id,
                                userID: $("#__userid").val(),
                                userName: $("#__username").val(),
                                content: '发送出现错误'
                            });
                        },
                        complete: function () {
                            // 解锁按钮
                            core.unlockBtn($sendEmailBtn, flyer.i18n.initTitle('发送邮件'));
                            if (open && typeof open.close === 'function') { open.close(); }
                        }
                    });
                } catch (error) {
                    // 解锁按钮
                    core.unlockBtn($sendEmailBtn, flyer.i18n.initTitle('发送邮件'));
                    if (open && typeof open.close === 'function') { open.close(); }
                    flyer.msg(flyer.i18n.initTitle('域名不存在'));
                }
            } else {
                flyer.msg(flyer.i18n.initTitle("邮件内容含有以下敏感词汇") + ' [ \' ' + sensitivesOfBody.join(',') + ' \'],' + flyer.i18n.initTitle("请删除后再发送"));
                core.unlockBtn($sendEmailBtn, flyer.i18n.initTitle('发送邮件'));
                if (open && typeof open.close === 'function') { open.close(); }
                return;
            }
        });
    }

    /**
     * 将邮件状态为改为已回复
     * 
     */
    function turnFinished() {
        $.ajax({
            url: core.url + "/turn_disposed_status",
            data: {
                data: [baseDatas.subjectNum],
                status: 7, //转为已处理
                name: '已回复',
                time: window.Date.now()
            },
            success: function (result) {
                //刷新左侧数量
                window.bubbleData();
            },
            error: function (err) {
                flyer.msg(baseDatas.errorMsg);
            }
        });
    }

    // 模块入口
    init();
});