import QRcode from "../../utils/qrcode";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        colorPicker: {
            show: false,
            colorData: {
                //基础色相，即左侧色盘右上顶点的颜色，由右侧的色相条控制
                hueData: {
                    colorStopRed: 255,
                    colorStopGreen: 0,
                    colorStopBlue: 0,
                },
                //选择点的信息（左侧色盘上的小圆点，即你选择的颜色）
                pickerData: {
                    x: 0, //选择点x轴偏移量
                    y: 480, //选择点y轴偏移量
                    red: 0,
                    green: 0,
                    blue: 0,
                    hex: '#000000'
                },
                //色相控制条的位置
                barY: 0,
            },
            rpxRatio: wx.getWindowInfo().screenWidth / 750 //此值为你的屏幕CSS像素宽度/750，单位rpx实际像素
        },
        form: {
            codeImage: '',
            content: "",
            contentErr: "",
            style: 1,
            color: "#000000",
            logo: ''
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    createCode() {
        if (!this.data.form.content.length) {
            this.setData({
                "form.contentErr": "请输入编码内容"
            });
            return
        }
        const query = wx.createSelectorQuery();
        query.select("#code").fields({
            node: true,
            size: true
        }).exec(res => {
            console.log(res)
            QRcode({
                canvas: res[0].node,
                width: res[0].width,
                text: this.data.form.content,
                foreground: this.data.form.color,
                image: {
                    imageResource: this.data.form.logo
                },
                padding: 0,
                style: this.data.form.style
            }).then(() => {
                const width = res[0].width
                const height = res[0].height
                const dpr = wx.getWindowInfo().pixelRatio
                wx.canvasToTempFilePath({
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                    destWidth: width * dpr,
                    destHeight: height * dpr,
                    canvas: res[0].node,
                    success: (res) => {
                        console.log(res)
                        this.setData({
                            "form.codeImage": res.tempFilePath
                        });
                    },
                    fail: err => {
                        console.log(err)
                    },
                    complete: () => {
                        wx.hideLoading()
                    }
                })
            })
        })
    },
    saveCode() { 
        wx.saveImageToPhotosAlbum({
            filePath: this.data.form.codeImage,
            success: () => {
                wx.showToast({
                    title: '保存成功',
                    icon: "success"
                })
            }
        })
    },

    radioStyleChange(e){
        this.setData({
            "form.style": e.detail
        })
    },
    chooseImage() {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            maxDuration: 30,
            camera: 'back',
            success: res => {
                if (res.tempFiles[0].size > 1024 * 1024 * 2) {
                    wx.showToast({
                        title: '图片大于2M',
                        icon: "none"
                    })
                    return
                }
                this.setData({
                    "form.logo": res.tempFiles[0].tempFilePath
                });
            }
        })
    },
    clearImage(){
        this.setData({
            "form.logo": ""
        });
    },
    formContentChange(e){
        if (e.detail.length) {
            this.setData({
                "form.content": e.detail,
                "form.contentErr": "",
            });
        }
    },
    onChangeColor(e) {
        this.setData({
            "colorPicker.colorData": e.detail.colorData,
            "form.color": e.detail.colorData.pickerData.hex,
            "colorPicker.show": false
        })
    },
    showColorPicker() {
        this.setData({
            "colorPicker.show": true
        });
        const child = this.selectComponent('#color-picker')
        setTimeout(() => { child.init() }, 100)
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