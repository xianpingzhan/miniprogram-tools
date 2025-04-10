import Qrcode from "../../utils/qrcode";
import {
    dnktURL
} from "../../env";
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        show: Boolean,
        info: Object
    },

    /**
     * 组件的初始数据
     */
    data: {
        width: 0,
        height: 0,
        loading: true
    },

    observers: {
        'show': function (bool) {
            if (bool) {
                this.createQrCode();
            }
        }
    },

    ready() {
        // 页面被展示
        wx.getImageInfo({
            src: "https://storage.iquizoo.com/static/miniprogram/consumer-manage/promotion-code-back.png",
            success: res => {
                const windowInfo = wx.getWindowInfo();
                const scale = windowInfo.windowWidth / 750;
                const rpxTo = n => n * scale;
                this.setData({
                    width: windowInfo.windowWidth - rpxTo(64),
                    height: (windowInfo.windowWidth - rpxTo(64)) / res.width * res.height
                });
            }
        })
    },

    /**
     * 组件的方法列表
     */
    methods: {
        close() {
            this.setData({
                show: false
            });
            this.clearQrCode();
        },
        /**
         * 生成推广码
         */
        createQrCode() {
            this.setData({
                loading: true
            })
            const imgList = [
                "https://storage.iquizoo.com/static/miniprogram/consumer-manage/promotion-code-back.png",
                "https://storage.iquizoo.com/static/miniprogram/consumer-manage/qrcode-back1.png",
                "https://storage.iquizoo.com/static/miniprogram/consumer-manage/qrcode-back2.png",
                // "https://cdn.iquizoo.com/static/img/report/kcjs/code.jpg",
            ];

            const info = this.data.info;
            const user = wx.getStorageSync('user') || {};
            const orgInfo = wx.getStorageSync('org_info') || {};
            const windowInfo = wx.getWindowInfo();
            this.createSelectorQuery().in(this).select('.qr-code').fields({
                    node: true,
                    size: true
                })
                .exec(res => {
                    const path = `${dnktURL}/#/transferPage?adminId=${user.id}&organizationId=${orgInfo.id}&courseConfigId=${info.projectCourseConfigId}`;
                    console.log(path);
                    const canvas = res[0].node;
                    // 渲染上下文
                    const ctx = canvas.getContext('2d')

                    // Canvas 画布的实际绘制宽高
                    const width = res[0].width
                    const height = res[0].height
                    const dpr = windowInfo.pixelRatio
                    canvas.width = width * dpr
                    canvas.height = height * dpr
                    ctx.scale(dpr, dpr)
                    Qrcode({
                        width: width,
                        canvas: canvas,
                        ctx: ctx,
                        text: path
                    })
                    wx.canvasToTempFilePath({
                        x: 0,
                        y: 0,
                        width: canvas.width,
                        height: canvas.height,
                        destWidth: canvas.width,
                        destHeight: canvas.height,
                        canvas: canvas,
                        success: res => {
                            imgList.push(res.tempFilePath);
                            console.log(res.tempFilePath)
                            console.log(imgList)
                            Promise.all(imgList.map(m => {
                                return new Promise((resolve, reject) => {
                                    const img = canvas.createImage();
                                    img.src = m;
                                    img.onload = () => {
                                        setTimeout(() => {
                                            resolve(img)
                                        }, 300)
                                    }
                                })
                            })).then(([backImg, back1, back2, codeImg]) => {
                                setTimeout(() => {
                                    this.setData({
                                        loading: false
                                    })
                                }, 500);

                                ctx.clearRect(0, 0, canvas.width, canvas.height);

                                const scale = width / backImg.width;
                                const rpxTo = n => n * scale;

                                ctx.drawImage(backImg, 0, 0, width, height);

                                ctx.fillStyle = "#ffffff"
                                ctx.font = rpxTo(48) + "px caokuti";
                                ctx.fillText("脑智学习力测评课程", rpxTo(32), rpxTo(136 + 48));

                                ctx.fillStyle = "#001C52"
                                ctx.font = "bold " + rpxTo(36) + "px PingFang";
                                var metrics = ctx.measureText(info.courseName);
                                // ctx.drawImage(back1, (width - metrics.width - 10) / 2, rpxTo(383), metrics.width + 10, rpxTo(22));
                                // ctx.fillText(info.courseName, (width - metrics.width) / 2, rpxTo(352 + 36));
                                var top = drawMultilineText(ctx, info.courseName, rpxTo(32), rpxTo(352 + 36), rpxTo(36), width - rpxTo(64))
                                console.log(top)
                                ctx.fillStyle = "#354E86"
                                ctx.font = "normal normal 400 " + rpxTo(28) + "px PingFang";
                                var metrics = ctx.measureText("推广人：" + user.realName);
                                ctx.drawImage(back2, (width - metrics.width - 10) / 2, top + rpxTo(42), metrics.width + 10, rpxTo(22));
                                ctx.fillText("推广人：" + user.realName, (width - metrics.width) / 2, top + rpxTo(54));

                                const codeWidth = rpxTo(248);
                                // ctx.drawImage(codeImg, (width - codeWidth) / 2, rpxTo(514), codeImg.width, codeWidth, 0, 0, codeWidth, codeWidth);
                                ctx.drawImage(codeImg, 0, 0, codeImg.width, codeImg.width, (width - codeWidth) / 2, rpxTo(500), codeWidth, codeWidth);


                                ctx.beginPath();
                                ctx.strokeStyle = "#DFEFFF";
                                ctx.lineWidth = 1;
                                var rectWidth = rpxTo(296);
                                var rect = {
                                    x: (width - rectWidth) / 2,
                                    y: top + rpxTo(88),
                                    r: 1,
                                    w: rectWidth,
                                    h: rectWidth
                                }
                                ctx.moveTo(rect.x + rect.r, rect.y);
                                ctx.arcTo(rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h, rect.r);
                                ctx.arcTo(rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h, rect.r);
                                ctx.arcTo(rect.x, rect.y + rect.h, rect.x, rect.y, rect.r);
                                ctx.arcTo(rect.x, rect.y, rect.x + rect.w, rect.y, rect.r);
                                ctx.stroke();
                                ctx.closePath();

                                ctx.fillStyle = "#999999"
                                ctx.font = "normal normal 400 " + rpxTo(22) + "px PingFang";
                                var metrics = ctx.measureText("微信扫码领取");
                                ctx.fillText("微信扫码领取", (width - metrics.width) / 2, top + rpxTo(396 + 22));
                            })
                        }
                    })
                })

            function drawMultilineText(context, text, x, y, textHeight, maxWidth) {
                const words = text.split('');
                var line = '';
                for (var n = 0; n < words.length; n++) {
                    var line = line + words[n];
                    var metrics = context.measureText(line);
                    if (metrics.width >= maxWidth) {
                        context.fillText(line, (maxWidth - metrics.width) / 2 + x, y);
                        line = '';
                        y += textHeight + 4;
                    }
                }
                if (line) {
                    var metrics = context.measureText(line);
                    context.fillText(line, (maxWidth - metrics.width) / 2 + x, y);
                }
                return y
            }
        },

        clearQrCode() {
            this.createSelectorQuery().in(this).select('.qr-code').fields({
                    node: true,
                    size: true
                })
                .exec(res => {
                    const canvas = res[0].node
                    // 渲染上下文
                    const ctx = canvas.getContext('2d')

                    // Canvas 画布的实际绘制宽高
                    const width = res[0].width
                    const height = res[0].height

                    // 初始化画布大小
                    const dpr = wx.getWindowInfo().pixelRatio
                    canvas.width = width * dpr
                    canvas.height = height * dpr
                    ctx.scale(dpr, dpr)

                    ctx.clearRect(0, 0, canvas.width, canvas.height)

                    this.setData({
                        loading: false
                    })
                })
        },

        /**
         * 保存推广二维码图片
         */
        saveImage() {
            this.createSelectorQuery().in(this).select('.qr-code').fields({
                    node: true,
                    size: true
                })
                .exec(res => {
                    // Canvas 画布的实际绘制宽高
                    const width = res[0].width
                    const height = res[0].height
                    const dpr = wx.getWindowInfo().pixelRatio

                    wx.showLoading({
                        title: "保存中...",
                        mask: true
                    })
                    wx.canvasToTempFilePath({
                        x: 0,
                        y: 0,
                        width: width,
                        height: height,
                        destWidth: width * dpr,
                        destHeight: height * dpr,
                        canvas: res[0].node,
                        success: function (res) {
                            console.log(res)
                            //画板路径保存成功后，调用方法吧图片保存到用户相册
                            wx.saveImageToPhotosAlbum({
                                filePath: res.tempFilePath,
                                success: () => {
                                    wx.showToast({
                                        title: '保存成功',
                                        icon: "success"
                                    })
                                }
                            })
                        },
                        fail: err => {
                            console.log(err)
                        },
                        complete: () => {
                            wx.hideLoading()
                        }
                    })
                })
        },
    }
})