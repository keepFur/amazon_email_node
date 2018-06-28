"use strict";
flyer.define("frame_detail", function (exports, module) {
    //页面入口
    function init() {
        loadPage();
        core.menuHeightLightByKey(flyer.getQueryString('exportKey'));
        initTab();
    }
    /**
     * 初始化tab页面
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

    // 初始化事件
    function initEvent() {
        // 回复
        $(".btn-callback").off("click").on("click", function () {
            var params = "?id=" + flyer.getQueryString("id");
            core.loadPage("#send_email", params);
        });
        // 返回
        $('.btn-toback').off('click').on('click', function () {
            var keyword = $('#searchEamilByKeywordInp').val().trim();
            var hash = flyer.getQueryString('exportKey');
            var curIndex = flyer.getQueryString('curIndex') || 1;
            core.loadPage('#' + hash, '?keyword=' + keyword + '&curIndex=' + curIndex);
        });
        // 下载附件
        $('.flyer-frame-attachment-item').on('click', function (event) {
            if (!$(event.target).is('.icon-search')) {
                downloadAttachment(this);
            }
        });
        //分派以及转为已解决功能
        $('.btn-right button').on('click', function () {
            if (!$(this).index()) {
                //分派
                assignHandle();
            } else {
                //转为已解决
                toResoveHandle();
            }
        })
        //客服不需要分派功能
        if (core.getUserGroups().orgCode === '9101') {
            $("#flyerAssignBtn").hide();
        }

    }

    /**
     * 分派功能按钮
     * auth:yuan
     * date:2017-11-13
     */
    function assignHandle() {
        //弹出角色选择框
        flyer.open({
            pageUrl: core.url + "/html/assignGroup.html",
            isModal: true,
            area: [600, 300],
            title: flyer.i18n.initTitle("请选择要指派的人员"),
            btns: [{
                text: flyer.i18n.initTitle("确定"),
                skin: "",
                click: function () {
                    if ($(".flyer-dialog-content tbody input:checked").length === 0) {
                        flyer.msg(flyer.i18n.initTitle('请至少选择一项'));
                        return;
                    } else if ($(".flyer-dialog-content tbody input:checked").length > 1) {
                        flyer.msg(flyer.i18n.initTitle('最多选择一项'));
                    } else {
                        var _id = flyer.getQueryString('id');
                        var _this = this;
                        $.ajax({
                            url: core.url + "/turn_status_byid",
                            data: {
                                id: _id,
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
                                //跳转未处理页面
                                core.loadPage("#unfinish");
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
     */
    function toResoveHandle() {
        flyer.confirm(flyer.i18n.initTitle("确定要转为已解决吗?"), function (result, yes) {
        }, {
                btns: [{
                    text: flyer.i18n.initTitle('确定'),
                    skin: "flyer-btn-blue",
                    click: function (elm) {
                        this.close();
                        var _this = this;
                        $.ajax({
                            url: core.url + "/turn_dispose_byid",
                            data: {
                                id: flyer.getQueryString('id'),
                                status: 9, //转为已处理
                                name: '已解决',
                                time: window.Date.now()
                            },
                            success: function (result) {
                                flyer.msg(flyer.i18n.initTitle('转为已解决成功'));
                                //刷新左侧数据
                                window.bubbleData();
                                //跳转未处理页面
                                core.loadPage("#unfinish");
                                _this.close();
                            },
                            error: function (err) {
                                flyer.msg(flyer.i18n.initTitle('转为已解决出错'))
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
    // 加载主题和收件人时间等信息
    function loadEmailInfo(emailInfo) {
        if (emailInfo) {
            $(".flyer-frame h2").html(emailInfo._subject);
            $('.send-account').html(emailInfo._from);
            $('.recive-account').html(emailInfo._to);
            $('.flyer-frame-content').html(core.formatEmailContent(emailInfo.html));
            $('.send-date-time').html(flyer.formatDate("yyyy-mm-dd hh:MM:ss", new Date(emailInfo.date_time)));
            $('.expandBtn').on('click', toggleChatHistoryHandle);
        }
    }
    // 下载附件
    function downloadAttachment(obj) {
        var $this = $(obj), attachname = $this.data('attachname'), md5name = $this.data('md5name');
        window.location.assign('/download/?name=' + attachname + '&md5Name=' + md5name);
    }
    // 加载附件
    function loadAttachments(attachmentDatas) {

        var $attachContainer = $('.flyer-frame-attachment-box'),
            $attachContent = $('.flyer-frame-attachment-content'),
            typeMap = {
                "text/plain": "text",
                "text/html": "code",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "word",
                "application/pdf": "pdf",
                "image/png": "image"
            };
        // type = ['code', 'word', 'pdf', 'excel', 'file', 'image', 'powerpoint', 'text', 'picture', 'video', 'photo'];
        attachmentDatas = JSON.parse(attachmentDatas);
        $attachContent.empty();
        if (Array.isArray(attachmentDatas) && attachmentDatas.length) {
            // 设置附件总数
            $attachContainer.find('.flyer-frame-attachment-mount').text(attachmentDatas.length + flyer.i18n.initTitle('个附件'));
            $.each(attachmentDatas, function (index, attach) {
                var _hasPreview = /jpg|jpeg|png|pdf|txt|html|docx|doc|xls|xlsx|ppt|pptx/gi.test(attach.md5Name.split('.')[1].toLowerCase()) ? '<i class="icon-search" style="display: inline-block;position:absolute;right:28px;top:8px;" title="' + flyer.i18n.initTitle("预览") + '" data-md5name="' + attach.md5Name + '" onclick="window.previewFile(this)"></i>' : '';
                var size = core.getAttachSize(attach.size / 1024), fileType = typeMap[attach["content-type"]] || 'text',
                    template = '<span class="flyer-frame-attachment-item" data-attachname="' + window.encodeURIComponent(attach.name) + '" data-md5name="' + attach.md5Name + '">' +
                        '<div class="flyer-frame-attachment-item-top" >' +
                        '   <p class="flyer-frame-attachment-item-dowload-link">' + _hasPreview + '<a  data-href="/download?name=' + window.encodeURIComponent(attach.name) + '&md5Name=' + attach.md5Name + '" ><i class="fa fa-download fa-lg" aria-hidden="true"></i></a> </p>' +
                        // (/jpg|png/.test(attach.md5Name.split('.')[1])?'  <p flyer-frame-attachment-item-icon><img class = "attachment_img" src = '+ '../upload/'+ attach.md5Name +'></img></p>':/pdf/.test(attach.md5Name.split('.')[1])?'  <p flyer-frame-attachment-item-icon><embed class = "attachment_img" src = '+ '../upload/'+ attach.md5Name +'></embed></p>':'  <p flyer-frame-attachment-item-icon><i class="fa fa-file-' + fileType + '-o fa-3x" aria-hidden="true"></i></p>') +
                        '  <p flyer-frame-attachment-item-icon><i class="fa fa-file-' + fileType + '-o fa-3x" aria-hidden="true"></i></p>' +
                        '</div >' +
                        '   <div class="flyer-frame-attachment-deivier"></div>' +
                        '  <div class="flyer-frame-attachment-item-footer">' +
                        '<span class="flyer-frame-attachment-name" title="(' + size + ') ' + attach.name + '">(' + size + ') ' + attach.name + '</span>' +
                        '</div>' +
                        '</span >';
                $attachContent.append(template);
            });
        }
    };
    //数据加载 
    function loadPage() {
        var _this = this,
            exportData = flyer.exports[flyer.getQueryString("exportKey")],
            data = exportData && exportData.data;
        if (!data) {
            data = {
                id: flyer.getQueryString("id")
            }
        } else {
            data.id = data.id || data.ID;
        }
        if (flyer.getQueryString("exportKey") === 'other_email_detail') {
            data.id = flyer.getQueryString("subject_num");
        }
        if (flyer.getQueryString("exportKey") !== 'other_email_detail') {
            $.ajax({
                url: core.url + "/get_email_details?time=" + window.Date.parse(new Date()),
                method: "get",
                dataType: "json",
                data: data,
                success: function (data) {
                    if (data && data.length && data.length > 0) {
                        // 加载主题和收件人时间等信息
                        loadEmailInfo(data[0]);
                        // 加载附件
                        loadAttachments(data[0].attachment);
                        // 初始化事件
                        initEvent();
                    }
                    //请求相关订单
                    if (flyer.getQueryString('exportKey') !== 'other_email_detail') {
                        var strEmail = core.isSelfEmail(data[0]['_from']) ? data[0]['_to'] : data[0]['_from']
                        var order = data[0]['_subject'].match(/[\d]{1,}-[\d]{1,}-[\d]{1,}/ig);
                        if (order || strEmail) {
                            core.getOrderInfo(order && order[0].trim(), strEmail);
                        }
                    }
                    if (flyer.exports.emailsTable && flyer.exports.emailsTable.isSent) {
                        flyer.exports.emailsTable.isSent = false;
                    }
                },
                error: function (err) {
                    flyer.log("error", err);
                }
            });
        } else {
            $.ajax({
                url: '/other_detail_single',
                method: "get",
                data: {
                    ID: flyer.getQueryString("subject_num"),
                    time: window.Date.parse(new Date())
                },
                beforeSend: function () {
                    $('.flyer-frame-footBtn').remove()
                    flyer.loading.init($(".flyer-frame-contentBox")).add();
                },
                success: function (data) {
                    //删除回复返回按钮
                    if (data && data.length && data.length > 0) {
                        // 加载主题和收件人时间等信息
                        loadEmailInfoOther(data[0]);
                        // 加载附件
                        if (data[0].message_attachments.length > 0) {
                            loadAttachmentsOther(data[0].message_attachments);
                        }
                        // 为返回按钮绑定事件
                        initEvent();
                    }
                },
                error: function (err) {
                    flyer.log("error", err);
                },
                complete: function () {
                    flyer.loading.init($(".flyer-frame-contentBox")).delete();
                }
            });
        }

    }
    function loadEmailInfoOther(emailInfo) {
        if (emailInfo) {
            var $email_detail = $(".flyer-frame").eq(0);
            $email_detail.find("h2").html(emailInfo.subject);
            $email_detail.find('.send-account').html(emailInfo._from);
            $email_detail.find('.recive-account').html(emailInfo._to);
            $email_detail.find('.flyer-frame-content').html(emailInfo.campaigns);
            $email_detail.find('.send-date-time').html(core.parseDateFormate(emailInfo.timer));
        }
    }
    //关联邮箱加载附件
    function loadAttachmentsOther(attachmentDatas) {
        var $email_detail = $(".flyer-frame").eq(0),
            $attachContainer = $email_detail.find('.flyer-frame-attachment-box'),
            $attachContent = $email_detail.find('.flyer-frame-attachment-content'),
            typeMap = {
                "text/plain": "text",
                "text/html": "code",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "word",
                "application/pdf": "pdf",
                "image/png": "image"
            };
        attachmentDatas = JSON.parse(attachmentDatas);
        $attachContent.empty();
        if (Array.isArray(attachmentDatas) && attachmentDatas.length) {
            // 设置附件总数
            $attachContainer.find('.flyer-frame-attachment-mount').text(attachmentDatas.length + flyer.i18n.initTitle('个附件'));
            $.each(attachmentDatas, function (index, attach) {
                var size = core.getAttachSize(attach.size / 1024), fileType = typeMap[attach["content-type"]] || 'text',
                    template = '<span class="flyer-frame-attachment-item" data-attachname="' + window.encodeURIComponent(attach.filename) + '" data-md5name="' + attach.filename + '">' +
                        '<div class="flyer-frame-attachment-item-top" >' +
                        '   <p class="flyer-frame-attachment-item-dowload-link"><a  href="/download?name=' + window.encodeURIComponent(attach.filename) + '&md5Name=' + attach.filename + '" ><i class="fa fa-download fa-lg" aria-hidden="true"></i></a> </p>' +
                        // (/jpg|png/.test(attach.filename.split('.')[1])?'  <p flyer-frame-attachment-item-icon><img class = "attachment_img" src = '+ '../upload/'+ attach.md5Name +'></img></p>':/pdf/.test(attach.filename.split('.')[1])?'  <p flyer-frame-attachment-item-icon><embed class = "attachment_img" src = '+ '../upload/'+ attach.md5Name +'></embed></p>':'  <p flyer-frame-attachment-item-icon><i class="fa fa-file-' + fileType + '-o fa-3x" aria-hidden="true"></i></p>') +
                        '  <p flyer-frame-attachment-item-icon><i class="fa fa-file-' + fileType + '-o fa-3x" aria-hidden="true"></i></p>' +
                        '</div >' +
                        '   <div class="flyer-frame-attachment-deivier"></div>' +
                        '  <div class="flyer-frame-attachment-item-footer">' +
                        '<span class="flyer-frame-attachment-name" title="(' + size + ')' + attach.filename + '">(' + size + ')' + attach.filename + '</span>' +
                        '</div>' +
                        '</span >';
                $attachContent.append(template);
            });
        }

    }
    /**
     * 显示或隐藏聊天记录的点击事件处理函数
     * 
     * @returns 
     */
    function toggleChatHistoryHandle() {
        $(this).css({
            float: 'none',
            'margin-bottom': 16
        }).next('.flyer-email-recored').toggle();
        return false;
    }

    init();
});