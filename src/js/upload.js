"use strict";
flyer.define("Upload", function (exports, module) {

    var Upload = function () {
        return this.init();
    };

    Upload.DEFAULTS = {
        fileData: '',
        fileIndex: 0,
        deleteBtnId: '',
        fileTable: '',
    };

    Upload.prototype = {
        init: function () {
            this.options = Upload.DEFAULTS
            this.initUploadComponent();
            this.initTable();
            this.uploadFileShow('show');
        },
        //upload component 
        initUploadComponent: function () {
            this.options.single = 'done';
            var _this = this;
            flyer.upload($(".flyer-upload-file"), {
                text: flyer.i18n.initTitle("选择附件"),
                url: "/upload",
                uploadBefore:function(input) {
                    if (input.length > 0 && input[0].files[0].size <10 *1024* 1024) {
                        return true;
                    } else {
                        flyer.alert(flyer.i18n.initTitle("检测到上传的文件大于10M，请选择小于10M的文件上传"));
                        return false;
                    }
                },
                success: function (res, input) {
                    if (res && Array.isArray(res) && res.length) {
                        res = res.map(function (file) {
                            return {
                                fileSize: file.size,
                                filePath: file.path,
                                fileName: file.name,
                                fileMD5Name: file.path
                            };
                        });
                        _this.options.fileData = res;
                        _this.uploadFileInfo(res);
                    } else if (res.invalid) {
                        flyer.msg(res.msg);
                    }
                }
            });
        },
        //table component  
        initTable: function () {
            this.options.fileTable = flyer.table($("#filesTable"), {
                columns: [
                    {
                        title: flyer.i18n.initTitle("文件名"),
                        field: "Name",
                        styles: {
                            width: 300
                        }
                    },
                    {
                        title: flyer.i18n.initTitle('大小'),
                        field: "Size",
                        titleTooltip: "ID"
                    },
                    {
                        title: flyer.i18n.initTitle("操作"),
                        field: "Delete",
                        styles: {
                            width: 60,
                        } 
                    }],
                data: []
            });
            $('<tr class = "empty_container"><td colspan = "3" align="center">'+flyer.i18n.initTitle("暂时没有数据")+'</td></tr>').appendTo($('table tbody'));
        },
        //当上传完成后增加文件到table 
        uploadFileInfo: function (res) {
            $('.empty_container').remove();
            //如果已经上传再次点开附件需要展示
            this.options.fileIndex = this.options.fileTable.options.data.length;
            var _this = this,
                _files = [],
                _fileName = $('.flyer-upload-file').val(),
                exext = _fileName.substring(_fileName.lastIndexOf('\\') + 1),
                fileSize = this.options.fileData.fileSize,
                flag = false;
            // 遍历邮件，判断是否合格 
            $.each(res, function (index, file) {
                var fileObj = {},
                _hasPreview = /jpg|jpeg|png|pdf|txt|html|docx|doc|xls|xlsx|ppt|pptx/gi.test(file.fileMD5Name.split('.')[1].toLowerCase())?'<i class="fa fa-eye" style="display: inline-block;margin-left:6px;" title="'+flyer.i18n.initTitle("预览")+'" data-md5name="'+ file.fileMD5Name +'" onclick="window.previewFile(this)"></i>':'';
                fileObj.Name = '<div style="white-space: nowrap;text-overflow:ellipsis;overflow:hidden" title="' + file.fileName + '">'
                    + file.fileName + '</div>';
                fileObj.Size = core.getAttachSize(file.fileSize / 1024);
                fileObj.Delete = '<div><i class="delect-file-btn fa icon-remove" onclick="flyer.Upload.deleteFile(this)" style="cursor:pointer" id="'
                    + file.fileMD5Name
                    + '" data-index="' + index + '"></i>'+_hasPreview
                    +'</div>';
                _files[index] = fileObj;
                exports.insertedData.push(fileObj);
                _this.options.fileTable.insertData(fileObj);
            });

            exports.insertedData = exports.insertedData || [];
            _this.options.fileTable.reload();
            flyer.Upload.fileDate('add', res);
        },
        uploadFileShow: function (status, data) {
            var _this = this;
            if (exports.insertedData && exports.insertedData.length !== 0) {
                $('.empty_container').remove();
                switch (status) {
                    case 'show':
                        exports.insertedData.forEach(function (obj, index) {
                            _this.options.fileTable.insertData(obj);
                        });
                        _this.options.fileTable.reload();
                        break;
                    case 'delete':
                        exports.insertedData.splice(data, 1);
                        break;
                }
            }
        },
        //删除文件
        deleteFile: function (thisRow) {
            var _this = this;
            _this.options.deleteBtnId = $(thisRow).attr('id'),
                _this.options.fileIndex = parseInt($(thisRow).parents('tr').data('index'));
            $.ajax({
                type: "post",
                url: "/upload",
                data: 'method=delete&fileName=' + _this.options.deleteBtnId + '&time=' + window.Date.parse(new Date()),
                dataType: "text",
                success: function (data) {
                    if (data === 'success') {
                        //从表格里删除文件dom
                        $(thisRow).parents('tr').remove();
                        //当远程文件删除，删除相应fileTable.options.data里数据
                        _this.options.fileTable.options.data.splice(_this.options.fileIndex, 1);
                        flyer.Upload.uploadFileShow('delete', _this.options.fileIndex);
                        //刷新存储的附件内容
                        
                        flyer.Upload.fileDate('delete', _this.options.fileIndex);
                    }
                    //fileTable.options.data.pop()
                    $('[target="flyer_upload_iframe"]').get(0).reset();
                },
            });
        },
        fileDate: function (status, data) {
            switch (status) {
                case 'add':
                    //将数据存储起来
                    exports.fileData = exports.fileData.concat(data) || [];
                    break;
                case 'delete':
                    exports.fileData.splice(data, 1);
                    if (exports.fileData.length === 0) {
                        $('<tr class = "empty_container"><td colspan = "3">'+flyer.i18n.initTitle("暂时没有数据")+'</td></tr>').appendTo($('table tbody'));
                    }
                    break;
            }
        }
    };
    
    
    Upload.prototype.constructor = Upload;
    return new Upload();
});
