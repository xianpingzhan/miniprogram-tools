App({
    globalData: {
      
    },

    onLaunch() {
        this.autoUpdate();
        // this.routeListren();
    },

    routeListren() {
        const whiteList = ["pages/index/index", "pages/loginWx/index", "pages/login/index", "pages/selectOrganization/index"]
        wx.onAppRoute(res => {
            console.log(res)
            if (!whiteList.includes(res.path)) {
                const token = wx.getStorageSync('token');
                const orgInfo = wx.getStorageSync('org_info') || "";
                const overtime = Number(wx.getStorageSync('token_overtime')) || 0;
                const now = Date.now();

                if (!(token && token.length && orgInfo) || overtime < now) {
                    clearLoginStorage();
                    Toast('登录已过期，请重新登录');
                    setTimeout(() => {
                        wx.reLaunch({
                            url: '/pages/loginWx/index'
                        });
                    }, 500);
                    return;
                }
                if (overtime - (10 * 60 * 1000) < now && overtime > now) {
                    refreshToken();
                }
            }
        })
    },

    /** 检测小程序版本更新 */
    autoUpdate: function () {
        let self = this
        // 获取小程序更新机制兼容
        if (wx.canIUse('getUpdateManager')) {
            const updateManager = wx.getUpdateManager()
            //1. 检查小程序是否有新版本发布
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    //2. 小程序有新版本，则静默下载新版本，做好更新准备
                    updateManager.onUpdateReady(function () {
                        wx.showModal({
                            title: '更新提示',
                            content: '新版本已经准备好，是否重启应用？',
                            success: function (res) {
                                if (res.confirm) {
                                    //3. 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    updateManager.applyUpdate()
                                } else if (res.cancel) {
                                    //如果需要强制更新，则给出二次弹窗，如果不需要，则这里的代码都可以删掉了
                                    wx.showModal({
                                        title: '温馨提示~',
                                        content: '本次版本更新涉及到新的功能添加，旧版本无法正常访问的哦~',
                                        success: function (res) {
                                            self.autoUpdate()
                                            return;
                                            //第二次提示后，强制更新                      
                                            if (res.confirm) {
                                                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                                updateManager.applyUpdate()
                                            } else if (res.cancel) {
                                                //重新回到版本更新提示
                                                self.autoUpdate()
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    })
                    updateManager.onUpdateFailed(function () {
                        // 新的版本下载失败
                        wx.showModal({
                            title: '已经有新版本了哟~',
                            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
                            showCancel: false
                        })
                    })
                }
            })
        } else {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
        }
    }
})