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
            canvas: null,
            canvasImage: '',
            image: '',
            content: "",
            contentErr: "",
            color: "#000000",
            opacity: 1,
            angle: 0,
            size: 10,
            space: 20,
        },
        image: {
            width: 0,
            height: 0
        },
        timer: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },
    onReady() {
        const query = wx.createSelectorQuery();
        query.select("#code").fields({
            node: true,
            size: true
        }).exec(res => {
            this.setData({
                "form.canvas": res[0].node
            })
        })
    },
    drawImage() {
        if (!this.data.form.content.length) {
            return
        }
        clearTimeout(this.data.timer);
        var timer = setTimeout(() => {
            var canvas = this.data.form.canvas;
            canvas.width = this.data.image.width;
            canvas.height = this.data.image.height;

            var ctx = canvas.getContext('2d');
            const img = canvas.createImage();
            img.src = this.data.form.canvasImage;
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                var color = this.data.colorPicker.colorData.pickerData;
                ctx.fillStyle = `rgba(${color.red}, ${color.green}, ${color.blue}, ${this.data.form.opacity})`;
                ctx.font = `${this.data.form.size}px Arial`;

                const colSpace = 2; // 显示文字的区域的宽度与文字宽度的比例
                ctx.rotate(this.data.form.angle * Math.PI / 180);
                const textWidth = ctx.measureText(this.data.form.content).width // 获取文字宽度
                const textUnitWidth = textWidth * colSpace; // 一个文字单元的宽度（文字宽度+左右空白）
                ctx.textAlign = "center"; // 文本的对齐方式
                ctx.textBaseline = "middle"; // 文本的基线属性

                // ctx.translate(100, 100); // 给画面一个基础偏移量，也可以省略该值

                var xNum = Math.ceil(canvas.width / textUnitWidth) //不旋转时横向可以展示的最多文字单元数
                var yNum = Math.ceil(canvas.height / this.data.form.space)//（不旋转时）纵向可以展示的最多文字单元数

                // 当文字旋转时，有一部分文字会被转走，需要扩展写字的范围，使用正弦函数确定扩展的最大范围
                var xStart = 0, yStart = 0, sin = Math.sin(Math.abs(this.data.form.angle) * Math.PI / 180);
                if (this.data.form.angle > 0) {
                    // 顺时针旋转时，右侧和上侧可能会有空余
                    xNum += Math.ceil(sin * canvas.height / textUnitWidth);
                    yStart = Math.ceil(sin * canvas.width / this.data.form.space) + -1;
                } else {
                    // 逆时针旋转时，左侧和下侧可能会有空余
                    xStart = Math.ceil(sin * canvas.height / textUnitWidth) * -1;
                    yNum += Math.ceil(sin * canvas.width / this.data.form.space);
                }
                console.log(xNum, yNum)
                for (let x = xStart; x < xNum; x++) {
                    for (let y = yStart; y < yNum; y++) {
                        const offsetY = y % 2 == 0 ? 0 : textUnitWidth / 2; // 隔行横向偏移一半的距离
                        const startX = textUnitWidth * x + offsetY; // 文字的X轴起始点
                        const startY = this.data.form.space * y; // 文字的Y轴起始点
                        ctx.fillText(this.data.form.content, startX, startY);
                    }
                }






                wx.canvasToTempFilePath({
                    x: 0,
                    y: 0,
                    width: canvas.width,
                    height: canvas.height,
                    destWidth: this.data.image.width,
                    destHeight: this.data.image.height,
                    canvas: canvas,
                    success: (res) => {
                        this.setData({
                            "form.image": res.tempFilePath
                        });
                    },
                    fail: err => {
                        console.log(err)
                    }
                })
            }
        }, 200);
        this.setData({
            timer: timer
        })
    },
    saveImage() {
        wx.saveImageToPhotosAlbum({
            filePath: this.data.form.image,
            success: () => {
                wx.showToast({
                    title: '保存成功',
                    icon: "success"
                })
            }
        })
    },

    opacityChange(e) {
        this.setData({
            "form.opacity": e.detail
        });
        this.drawImage();
    },
    angleChange(e) {
        this.setData({
            "form.angle": e.detail
        });
        this.drawImage();
    },
    sizeChange(e) {
        this.setData({
            "form.size": e.detail
        });
        this.drawImage();
    },
    spaceChange(e) {
        this.setData({
            "form.space": e.detail
        });
        this.drawImage();
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
                wx.getImageInfo({
                    src: res.tempFiles[0].tempFilePath, // 选择的图片路径
                    success: info => {
                        this.setData({
                            "form.image": res.tempFiles[0].tempFilePath,
                            "form.canvasImage": res.tempFiles[0].tempFilePath,
                            image: {
                                width: info.width,
                                height: info.height
                            }
                        });
                        this.drawImage();
                    }
                })
            }
        })
    },

    formContentChange(e) {
        if (e.detail.length) {
            this.setData({
                "form.content": e.detail,
                "form.contentErr": "",
            });
        }
        this.drawImage();
    },
    onChangeColor(e) {
        this.setData({
            "colorPicker.colorData": e.detail.colorData,
            "form.color": e.detail.colorData.pickerData.hex,
            "colorPicker.show": false
        })
        this.drawImage();
    },
    showColorPicker() {
        this.setData({
            "colorPicker.show": true
        });
        const child = this.selectComponent('#color-picker')
        setTimeout(() => { child.init() }, 100)
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