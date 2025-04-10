import Http from "../request/index";
const http = new Http({
    baseURL: "https://cn.apihz.cn"
});

// 获取的数值单位是px
const windowInfo = wx.getWindowInfo();
const menu = wx.getMenuButtonBoundingClientRect();
// 状态栏高度
let statusBarHeight = windowInfo.statusBarHeight;
// 导航栏高度
let navBarHeight = menu.height + (menu.top - statusBarHeight) * 2;
// 内容区高度
let safeHeight = windowInfo.safeArea.height;
// 底部导航栏高度
let bottomSafeHeight = windowInfo.screenHeight - windowInfo.safeArea.height - statusBarHeight;
const windowHeight = {
    statusBarHeight,
    navBarHeight,
    safeHeight,
    bottomSafeHeight,
}



module.exports = {
    get: http.get.bind(http),
    post: http.post.bind(http),
    windowHeight,
    Toast: function (message) {
        wx.showToast({
            title: message,
            icon: "none"
        });
    },
    FormatDate: function (date = "", format = "") {
        const DateTime = new Date(typeof date === "string" ? date.replace(/-/g, '/') : date)
        let year = DateTime.getFullYear()
        let month = DateTime.getMonth() + 1 < 10 ? '0' + (DateTime.getMonth() + 1) : DateTime.getMonth() + 1
        let day = DateTime.getDate() < 10 ? '0' + DateTime.getDate() : DateTime.getDate()
        let hour = DateTime.getHours() < 10 ? '0' + DateTime.getHours() : DateTime.getHours()
        let minute = DateTime.getMinutes() < 10 ? '0' + DateTime.getMinutes() : DateTime.getMinutes()
        let second = DateTime.getSeconds() < 10 ? '0' + DateTime.getSeconds() : DateTime.getSeconds()

        if (format === 'YYYYMMDDhhmmss') {
            return '' + year + month + day + hour + minute + second
        }

        return format.replace(/\b[A-Za-z]+\b/g, function (word) {
            switch (word) {
                case 'YYYY':
                    return year
                case 'MM':
                    return month
                case 'DD':
                    return day
                case 'hh':
                    return hour
                case 'mm':
                    return minute
                case 'ss':
                    return second
                default:
                    return ''
            }
        })
    },
    ZeroFill: function (n) {
        return n < 10 && n >= 0 ? "0" + n : n;
    }
}