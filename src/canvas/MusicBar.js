
export class MusicBar{

    constructor(barNumber, bufferLength, canvas, canvasCtx) {
        // bar 的数量
        this.barNumber = barNumber
        // 初始化 bar 的存储数组
        this.barArray = []
        // 频率数据数组的长度
        this.bufferLength = bufferLength
        // 画图
        this.canvas = canvas
        this.canvasCtx = canvasCtx
    }

    init(barFillStyle) {
        // bar's width and space
        let width = this.canvas.width / this.barNumber
        const space = 5
        let barWidth = width - space

        // 计算每个 bar 分配的频率数据长度
        this.barBufferLength = Math.floor(this.bufferLength / this.barNumber)

        // 径向渐变
        let barFillStyleGradient = this.canvasCtx.createLinearGradient(0, 0, 0, this.canvas.height);
        barFillStyleGradient.addColorStop(0, barFillStyle.topColor)
        barFillStyleGradient.addColorStop(0.6, barFillStyle.midColor)
        barFillStyleGradient.addColorStop(1, barFillStyle.endColor)

        for (let i = 0; i < this.barNumber; i++) {
            this.barArray.push(new BarRectangle(barWidth, i * width, this.canvas.height,
                6, barFillStyleGradient, barFillStyleGradient.topColor))
        }

    }

    draw(dataArray) {
        // 先清空
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        // 计算每个 bar 对应频率数组的相关数据
        for (let i = 0; i < this.barNumber; i++) {
            let bar = this.barArray[i]
            bar.startIdx = i * this.barBufferLength
            bar.endIdx = (i + 1) * this.barBufferLength
            let sum = 0
            for (let j = bar.startIdx; j < bar.endIdx; j++) {
                sum += dataArray[j]
            }
            let ratio = (sum / this.barBufferLength) / 256
            bar.calculateTopBlock(ratio)
            bar.render(this.canvasCtx)
        }
    }
}


class BarRectangle{

    constructor(w, offsetX, offsetHeight, topBlockHeight, barFillStyleGradient, topBlockFillStyle) {
        this.w = w
        this.offsetX = offsetX
        this.offsetHeight = offsetHeight
        this.topBlockHeight = topBlockHeight
        this.blockGap = this.topBlockHeight * 0.5
        this.topBlockY = this.offsetHeight - this.topBlockHeight
        this.barFillStyleGradient = barFillStyleGradient
        this.topBlockFillStyle = topBlockFillStyle
    }

    calculateTopBlock(audioRatio) {
        // 计算顶部方块的位置
        this.waveHeight = this.offsetHeight * audioRatio;
        let totalHeight = this.waveHeight + this.topBlockHeight
        this.waveY = this.offsetHeight - this.waveHeight
        let preTopBlockY = this.topBlockY
        this.topBlockY = totalHeight >= this.offsetHeight ? 0 : this.offsetHeight - totalHeight
        // 此处判断是否发生了音频长度下降
        if (preTopBlockY < this.topBlockY) {
            // 如果音频长度下降,那么通过顶部方块的高度逐渐减少产生下降动画
            this.topBlockY = preTopBlockY + this.blockGap
        }

    }

    render(canvasCtx) {
        canvasCtx.fillStyle = this.barFillStyleGradient
        canvasCtx.fillRect(this.offsetX, this.waveY, this.w, this.waveHeight)
        const blockHeight = this.blockGap
        // 清空一些间隔
        for (let y = this.waveY; y < this.offsetHeight; y += this.topBlockHeight) {
            canvasCtx.clearRect(this.offsetX, y, this.w, blockHeight)
        }
        canvasCtx.fillStyle = this.topBlockFillStyle
        canvasCtx.fillRect(this.offsetX, this.topBlockY, this.w, this.topBlockHeight)
    }
}
