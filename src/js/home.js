// 获取系统时间戳
function getSysNow() {
    $.get('http://api.lieliu.com:1024/api/sys_now?format=json', function(data) {
        console.log(data.data.time);
    });
}

// getSysNow();

console.log(APIUtil.domain);