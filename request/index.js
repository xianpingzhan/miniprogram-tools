export default class Http {
    constructor(obj) {
        this.baseURL = obj.baseURL;
        this.timeout = 20 * 1000;
    }

    formatParams(url, data = "") {
        if (typeof data !== 'object') {
            if (data.length) {
                return url + "?" + data
            }
            return url
        }
        const arr = [];
        const params = (value, pName, type) => {
            for (const key in value) {
                if (typeof value[key] === 'undefined' || value[key] === "" || Object.prototype.toString.call(value[key]) === "[object Null]") {
                    continue
                }
                if (Array.isArray(value[key])) {
                    params(value[key], pName + key, "array")
                    continue
                }
                if (Object.prototype.toString.call(value[key]) === '[object Object]') {
                    params(value[key], pName + key + '.')
                    continue
                }
                arr.push(encodeURIComponent(type === "array" ? pName : (pName + key)) + "=" + encodeURIComponent(value[key]))
            }
        }
        params(data, "");
        if (url.indexOf("?") > -1) {
            return url + (arr.length ? "&" + arr.join("&") : "");
        }
        return url + (arr.length ? "?" + arr.join("&") : "");
    }

    _http(url, options) {
        const token = wx.getStorageSync('token');
        const header = {};
        if (token) {
            header["Authorization"] = "Bearer " + token;
            const overtime = Number(wx.getStorageSync('token_overtime')) || 0;
            const now = Date.now();
            if (overtime - (10 * 60 * 1000) < now && overtime > now && url != Auth.refreshLogin) {
                // this.refreshToken();
            }
        }

        if (options.method === "POST") {
            switch (options.config.type) {
                case "form":
                    header["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
                    break;
                default:
                    header["Content-Type"] = "application/json; charset=UTF-8";
                    options.data = JSON.stringify(options.data);
            }
        }

        if (options.method === "GET") {
            url = this.formatParams(url, options.data);
            options.data = {};
        }

        return new Promise((resolve, reject) => {
            let failNumber = options.config.failNumber || 0;
            const request = () => {
                wx.request({
                    url: `${this.baseURL}${url}`,
                    method: options.method,
                    timeout: this.timeout,
                    data: options.data,
                    header: header,
                    success(request) {
                        if (!(request.statusCode >= 200 && request.statusCode < 300 || request.statusCode === 304)) {
                            if (options.config.showMessage || typeof options.config.showMessage === "undefined") {
                                wx.showToast({
                                    title: "系统错误",
                                    icon: "none"
                                });
                            }
                            reject(request)
                            return
                        }

                        if (request.data.code == 200) {
                            resolve(request.data)
                        } else {
                            if (failNumber-- > 0) {
                                setTimeout(() => {
                                    request()
                                }, 1000);
                            } else {
                                if (options.config.showMessage || typeof options.config.showMessage === "undefined") {
                                    wx.showToast({
                                        title: request.data.msg,
                                        icon: "none"
                                    });
                                }
                                reject(request)
                            }
                        }
                    },
                    fail(error) {
                        if (failNumber-- > 0) {
                            setTimeout(() => {
                                request()
                            }, 1000);
                        } else {
                            if (options.config.showMessage || typeof options.config.showMessage === "undefined") {
                                wx.showToast({
                                    title: "系统错误",
                                    icon: "none"
                                });
                            }
                            reject(error)
                        }
                    }
                })
            }

            request();
        })
    }

    _guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * http 发起get请求
     * @param {string} url http请求地址
     * @param {object} params http请求参数
     * @param {object} config http请求配置 {
     *  failNumber: 失败重新请求次数，默认失败不重新请求
     *  showMessage: 是否弹窗显示接口失败信息 默认为true
     * }
     */
    get(url, params, config = {}) {
        return this._http(url, {
            method: 'GET',
            data: params,
            config: config
        })
    }

    /**
     * http 发起post请求
     * @param {string} url http请求地址
     * @param {object} params http请求参数
     * @param {object} config http请求配置 {
     *  type: 请求数据格式，"json"|"form", 默认json
     *  failNumber: 失败重新请求次数，默认失败不重新请求
     *  showMessage: 是否弹窗显示接口失败信息 默认为true
     * }
     */
    post(url, params, config = {}) {
        return this._http(url, {
            method: 'POST',
            data: params,
            config: config
        })
    }
}