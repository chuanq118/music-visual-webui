
export class SimpleLyricDrawer{

    constructor(canvas, canvasCtx) {
        this.canvas = canvas
        this.canvasCtx = canvasCtx
        this.init()
    }

    init() {
        let textGradient = this.canvasCtx.createLinearGradient(0, 0, this.canvas.width, 0);
        textGradient.addColorStop(0, "magenta");
        textGradient.addColorStop(0.2, "yellow");
        textGradient.addColorStop(0.4, "pink");
        textGradient.addColorStop(0.6, "green");
        textGradient.addColorStop(0.8, "blue");
        textGradient.addColorStop(1, "red");


        this.canvasCtx.fillStyle = '#ceda24'
        this.canvasCtx.font = 'bolder 50px font01'
        this.canvasCtx.textAlign = 'center'
        this.canvasCtx.textBaseline = 'middle'
    }

    /**
     * 歌词上下文会在播放指定时间中调用此绘制方法
     * @param text 当前音频时间下的对应的歌词文本
     */
    draw(text) {
        this.clear()
        this.canvasCtx.beginPath()
        this.canvasCtx.fillText(text, this.canvas.width / 2, this.canvas.height / 2)
        this.canvasCtx.closePath()
    }

    clear() {
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
}
