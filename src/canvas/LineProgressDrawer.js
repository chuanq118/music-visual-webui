export class LineProgressDrawer {

    constructor(canvasSelector) {
        this.canvas = document.querySelector(canvasSelector)
        this.canvasCtx = this.canvas.getContext('2d')
        this.maxWidth = parseInt(this.canvas.width)
        this.maxHeight = parseInt(this.canvas.height)
        this.setLineStyle(null)
    }

    setLineStyle(style) {
        this.canvasCtx.fillStyle = (style == null) ? '#b28d2f' : style
    }

    draw(ratio) {
        this.clear()
        this.canvasCtx.fillRect(0, 0, this.maxWidth * ratio, this.maxHeight)
    }

    clear() {
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
}
