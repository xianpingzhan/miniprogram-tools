import { get, FormatDate } from "../../utils/tool";
import Api from "../../request/api";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        date: {
            time: FormatDate(new Date(), "YYYY-MM-DD"),
            details: {}
        },
        time: {
            hour: {
                rotate: true,
                value: ""
            },
            minutes: {
                rotate: true,
                value: ""
            },
            seconds: {
                rotate: true,
                value: ""
            },
        },

        list: [
            {
                name: '生成二维码',
                path: '/pages/qrCode/index'
            },
            {
                name: '图片水印',
                path: '/pages/watermark/index'
            },
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getDate();
        this.initTime();
    },

    getDate() {
        get(Api.getDay + '?id=88888888&key=88888888').then(res => {
            this.setData({
                "date.details": res
            })
        })
    },

    initTime() {
        setInterval(() => {
            var date = new Date();
            this.setData({
                time: {
                    hour: {
                        rotate: date.getSeconds() == 0 && date.getMinutes() == 0,
                        value: date.getHours() == 0 ? date.getHours() - 1 : date.getHours()
                    },
                    minutes: {
                        rotate: date.getSeconds() == 0,
                        value: date.getSeconds() == 0 ? date.getMinutes() - 1 : date.getMinutes()
                    },
                    seconds: {
                        rotate: !!date.getSeconds(),
                        value: date.getSeconds() == 0 ? date.getSeconds() : date.getSeconds() - 1
                    },
                }
            });
            setTimeout(() => {
                this.setData({
                    time: {
                        hour: {
                            rotate: false,
                            value: date.getHours()
                        },
                        minutes: {
                            rotate: false,
                            value: date.getMinutes()
                        },
                        seconds: {
                            rotate: false,
                            value: date.getSeconds()
                        },
                    }
                });
            }, 500);
        }, 1000)
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})