"use strict";
flyer.define("frame_insert", function (exports, module) {
    //页面入口
    function init() {
        loadPage();
    }
    //回复功能
    function initEvent() {
        $(".btn-callback").off("click").on("click", function () {
            var params = "?id=" + $(this).parents('.email_detail').prev().data('id') + "&subject_num=" + flyer.getQueryString("subject_num");
            core.loadPage("#send_email", params);
        });
        $(".btn-callback").next().off('click').on("click", function () {
            var hash = flyer.getQueryString('exportKey');
            var curIndex = flyer.getQueryString('curIndex') || 1;
            var account = flyer.getQueryString('email');
            if (account) {
                core.loadPage('#' + hash, '?curIndex=' + curIndex + '&email=' + account);
            } else {
                core.loadPage('#' + hash, '?curIndex=' + curIndex);
            }
        });
        $(".flyer-frame-contentBox").off("click").on("click", ".expandBtn", function () {
            $(this).next().find(".gmail_extra").toggle();
        })
        // 附件下载
        $('.flyer-frame-attachment-item').on('click', function (event) {
            downloadAttachment(this);
        });
        //是否显示分派
        if (core.getUserGroups().orgCode === '9101') {
            //客服不显示分派
            $('.assign').hide();
        }
        if (flyer.getQueryString('exportKey') === 'resolved') {
            $('.assign,.resolve').hide();
        }
        //分派
        $('.assign').off('click').on("click", function () {
            turnAssigned();
        })
        //转为已解决
        $('.resolve').off('click').on('click', function () {
            turnResolved();
        })
    }
    function turnResolved() {
        flyer.confirm(flyer.i18n.initTitle("确定要转为已解决吗?"), function (result, yes) {
        }, {
            btns: [{
                text: flyer.i18n.initTitle('确定'),
                skin: "flyer-btn-blue",
                click: function (elm) {
                    this.close();
                    $.ajax({
                        url: "/turn_disposed_status",
                        method: "get",
                        data: {
                            data: [flyer.getQueryString('subject_num')],
                            status: 9, //转为已处理
                            name: '已解决',
                            time: window.Date.parse(new Date())
                        },
                        success: function (result) {
                            flyer.msg(flyer.i18n.initTitle('转为已解决成功'));
                            //刷新左侧数据
                            window.bubbleData();
                            //跳转未处理页面
                            setTimeout(function () {
                                var params = "?exportKey=frame_insert";
                                core.loadPage("#unfinish", params);
                            }, 1000)
                        },
                        error: function (err) {
                            flyer.msg(flyer.i18n.initTitle('转为已解决失败502'));
                        }
                    })
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
            })
    }
    function turnAssigned() {
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
                        //更新数据
                        var _this = this;
                        $.ajax({
                            url: "/turn_status",
                            method: "get",
                            data: {
                                data: JSON.stringify([flyer.getQueryString('subject_num')]),
                                status: 5,
                                assignName: window.encodeURIComponent(window.flyer.exports.assignGroup.group[$(".flyer-dialog-content tbody input:checked").parents('tr').index()].name),
                                assignId: flyer.exports.assignGroup.group[$(".flyer-dialog-content tbody input:checked").parents('tr').index()].user_id,
                                name: '已分派', //分派
                                time: window.Date.parse(new Date())
                            },
                            success: function (result) {
                                flyer.msg(flyer.i18n.initTitle('分派成功'));
                                _this.close();
                                //刷新左侧数据
                                window.bubbleData();
                                //跳转未处理页面
                                setTimeout(function () {
                                    var params = "?exportKey=frame_insert";
                                    core.loadPage("#unfinish", params);
                                }, 1000)
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
    // 加载主题和收件人时间等信息
    function loadEmailInfo(emailInfo) {
        if (emailInfo) {
            var index = flyer.exports.frame.data.index,
                $email_detail = $(".email_detail").eq(index);
            $email_detail.find("h2").html(emailInfo._subject + '<i class="fa fa-angle-up fa-lg" style="float:right;cursor:pointer;"></i>');
            $email_detail.find('.send-account').html(emailInfo._from);
            $email_detail.find('.recive-account').html(emailInfo._to);
            $email_detail.find('.flyer-frame-content').html(emailInfo.html);
            $email_detail.find('.send-date-time').html(flyer.formatDate("yyyy-mm-dd hh:MM:ss", new Date($email_detail.prev().find('.date').data('time'))));
        }
    }
    function loadEmailInfoOther(emailInfo) {
        if (emailInfo) {
            var $email_detail = $(".email_detail").eq(0);
            $email_detail.find("h2").html(emailInfo.subject + '<i class="fa fa-angle-up fa-lg" style="float:right;cursor:pointer;"></i>');
            $email_detail.find('.send-account').html(emailInfo._from);
            $email_detail.find('.recive-account').html(emailInfo._to);
            $email_detail.find('.flyer-frame-content').html(emailInfo.campaigns);
            $email_detail.find('.send-date-time').html(core.parseDateFormate(emailInfo.timer));
        }
    }
    // 下载附件
    function downloadAttachment(obj) {
        var $this = $(obj), attachname = $this.data('attachname'), md5name = $this.data('md5name');
        window.location.assign('/download/?name=' + attachname + '&md5Name=' + md5name);
    }
    // 加载附件
    function loadAttachments(attachmentDatas) {
        var index = flyer.exports.frame.data.index,
            $email_detail = $(".email_detail").eq(index),
            $attachContainer = $email_detail.find('.flyer-frame-attachment-box'),
            $attachContent = $email_detail.find('.flyer-frame-attachment-content'),
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
                var size = core.getAttachSize(attach.size / 1024), fileType = typeMap[attach["content-type"]] || 'text',
                    template = '<span class="flyer-frame-attachment-item" data-attachname="' + window.encodeURIComponent(attach.name) + '" data-md5name="' + attach.md5Name + '">' +
                        '<div class="flyer-frame-attachment-item-top" >' +
                        '   <p class="flyer-frame-attachment-item-dowload-link"><a  data-href="/download?name=' + window.encodeURIComponent(attach.name) + '&md5Name=' + attach.md5Name + '" ><i class="fa fa-download fa-lg" aria-hidden="true"></i></a> </p>' +
                        // (/jpg|png/.test(attach.md5Name.split('.')[1])?'  <p flyer-frame-attachment-item-icon><img class = "attachment_img" src = '+ '../upload/'+ attach.md5Name +'></img></p>':/pdf/.test(attach.md5Name.split('.')[1])?'  <p flyer-frame-attachment-item-icon><embed class = "attachment_img" src = '+ '../upload/'+ attach.md5Name +'></embed></p>':'  <p flyer-frame-attachment-item-icon><i class="fa fa-file-' + fileType + '-o fa-3x" aria-hidden="true"></i></p>') +
                        '  <p flyer-frame-attachment-item-icon><i class="fa fa-file-' + fileType + '-o fa-3x" aria-hidden="true"></i></p>' + 
                        '</div >' +
                        '   <div class="flyer-frame-attachment-deivier"></div>' +
                        '  <div class="flyer-frame-attachment-item-footer">' +
                        '<span class="flyer-frame-attachment-name" title="(' + size + ')' + attach.name + '">(' + size + ') ' + attach.name + '</span>' +
                        '</div>' +
                        '</span >';
                $attachContent.append(template);
            });
        }
    }
    //关联邮箱加载附件
    function loadAttachmentsOther(attachmentDatas) {
        var index = flyer.exports.frame.data.index,
            $email_detail = $(".email_detail").eq(0),
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
    //数据加载 
    function loadPage() {
        var index = flyer.exports.frame.data.index;
        var _this = this,
            exportData = flyer.exports["frame"],
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
                beforeSend: function () {
                    flyer.loading.init($(".flyer-frame-contentBox").eq(index)).add();
                },
                success: function (data) {
                    if (data && data.length && data.length > 0) {
                        // 加载主题和收件人时间等信息
                        loadEmailInfo(data[0]);
                        // 加载附件
                        loadAttachments(data[0].attachment);
                        initEvent();
                    }
                    // core.getOrderInfo(data[0]._to);
                    if (flyer.exports.emailsTable && flyer.exports.emailsTable.isSent) {
                        flyer.exports.emailsTable.isSent = false;
                    }
                },
                error: function (err) {
                    flyer.log("error", err);
                },
                complete: function () {
                    flyer.loading.init($(".flyer-frame-contentBox").eq(index)).delete();
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
                    flyer.loading.init($(".flyer-frame-contentBox").eq(index)).add();
                },
                success: function (data) {
                    //删除回复返回按钮
                    $('.flyer-frame-footBtn').find('.assign').hide();
                    $('.flyer-frame-footBtn').find('.resolve').hide();
                    $('.flyer-frame-footBtn').find('.btn-callback').hide();
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
                    flyer.loading.init($(".flyer-frame-contentBox").eq(index)).delete();
                }
            });
        }
    }
    init();
});