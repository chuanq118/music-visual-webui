

export class SymmetryMusicBar{

    static center = {
        x: 0,
        y: 0
    }

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

        SymmetryMusicBar.center.x = this.canvas.width / 2
        SymmetryMusicBar.center.y = this.canvas.height / 2
    }

    init(barFillStyle) {
        let width = this.canvas.width / (this.barNumber * 2)
        const space = 4
        let barWidth = width - space

        // 计算每个 bar 分配的频率数据长度
        this.barBufferLength = Math.floor(this.bufferLength / this.barNumber)

        const colorDiff = 0.6

        let upBarFillStyle = this.canvasCtx.createLinearGradient(0, 0, 0, this.canvas.height / 2);
        upBarFillStyle.addColorStop(0, barFillStyle.topColor)
        upBarFillStyle.addColorStop(colorDiff, barFillStyle.midColor)
        upBarFillStyle.addColorStop(1, barFillStyle.endColor)

        let downBarFillStyle = this.canvasCtx.createLinearGradient(0, this.canvas.height / 2, 0, this.canvas.height);
        downBarFillStyle.addColorStop(0, barFillStyle.endColor)
        downBarFillStyle.addColorStop(1- colorDiff, barFillStyle.midColor)
        downBarFillStyle.addColorStop(1, barFillStyle.topColor)

        for (let i = 0; i < this.barNumber; i++) {
            this.barArray.push(new SymmetryBarRectangle(barWidth,
                SymmetryMusicBar.center.x + space * 0.5 + i * width, this.canvas.height,
                4, upBarFillStyle, downBarFillStyle, barFillStyle.topColor))
        }
    }

    /**
     * 音频上下文中自动调用此方法绘制
     * @param dataArray 音频数据
     */
    draw(dataArray) {
        // 先清空
        this.clear()
        // 计算每个 bar 对应频率数组的相关数据
        for (let i = 0; i < this.barNumber; i++) {
            let bar = this.barArray[i]
            let startIdx = i * this.barBufferLength
            let endIdx = (i + 1) * this.barBufferLength
            let sum = 0
            for (let j = startIdx; j < endIdx; j++) {
                sum += dataArray[j]
            }
            let ratio = (sum / this.barBufferLength) / 256
            bar.calculateTopBlock(ratio);
            bar.render(this.canvasCtx)
        }
    }

    clear() {
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
}


class SymmetryBarRectangle{

    constructor(w, x0, canvasHeight, topBlockHeight, upBarFillStyle, downBarFillStyle, topBlockFillStyle) {
        this.w = w
        // 求出对称四个点的 X 轴坐标
        this.x0 = x0
        this.x1 = SymmetryMusicBar.center.x * 2 - this.x0 - this.w
        this.x2 = this.x1
        this.x3 = this.x0

        this.offsetHeight = canvasHeight / 2

        this.topBlockHeight = topBlockHeight
        this.blockGap = this.topBlockHeight * 0.5

        // 计算 top block 的四个 y 坐标
        this.topBlockY0 = this.offsetHeight - this.topBlockHeight
        this.topBlockY1 = this.topBlockY0
        this.topBlockY2 = 2 * SymmetryMusicBar.center.y - this.topBlockHeight
        this.topBlockY3 = this.topBlockY2

        this.upBarFillStyle = upBarFillStyle
        this.downBarFillStyle = downBarFillStyle
        this.topBlockFillStyle = topBlockFillStyle
    }


    calculateTopBlock(audioRatio) {
        // 计算顶部方块的位置
        this.waveHeight = this.offsetHeight * audioRatio;
        let totalHeight = this.waveHeight + this.topBlockHeight

        // 计算音频条 Y 轴长度
        this.waveY0 = this.offsetHeight - this.waveHeight
        this.waveY1 = this.waveY0
        this.waveY2 = 2 * SymmetryMusicBar.center.y - this.waveY0 - this.waveHeight
        this.waveY3 = this.waveY2

        let preTopBlockY0 = this.topBlockY0
        this.topBlockY0 = totalHeight >= this.offsetHeight ? 0 : this.offsetHeight - totalHeight

        // 此处判断是否发生了音频长度下降
        if (preTopBlockY0 < this.topBlockY0) {
            // 如果音频长度下降,那么通过顶部方块的高度逐渐减少产生下降动画
            this.topBlockY0 = preTopBlockY0 + this.blockGap
        }

        // 根据最终的 y0 坐标确定其余 3 点的坐标
        this.topBlockY1 = this.topBlockY0
        this.topBlockY2 = 2 * SymmetryMusicBar.center.y - this.topBlockY0 - this.topBlockHeight
        this.topBlockY3 = this.topBlockY2
    }

    render(canvasCtx) {
        canvasCtx.fillStyle = this.upBarFillStyle
        canvasCtx.fillRect(this.x0, this.waveY0, this.w, this.waveHeight)
        canvasCtx.fillRect(this.x1, this.waveY1, this.w, this.waveHeight)
        canvasCtx.fillStyle = this.downBarFillStyle
        canvasCtx.fillRect(this.x2, this.waveY2, this.w, this.waveHeight)
        canvasCtx.fillRect(this.x3, this.waveY3, this.w, this.waveHeight)

        // 清空一些间隔
        for (let y = this.waveY0; y < this.offsetHeight; y += this.topBlockHeight) {
            let y_ = SymmetryMusicBar.center.y * 2 - y - this.blockGap
            canvasCtx.clearRect(this.x0, y, this.w, this.blockGap)
            canvasCtx.clearRect(this.x1, y, this.w, this.blockGap)
            canvasCtx.clearRect(this.x2, y_, this.w, this.blockGap)
            canvasCtx.clearRect(this.x3, y_, this.w, this.blockGap)
        }
        // 渲染顶部方块
        canvasCtx.fillStyle = this.topBlockFillStyle
        canvasCtx.fillRect(this.x0, this.topBlockY0, this.w, this.topBlockHeight)
        canvasCtx.fillRect(this.x1, this.topBlockY1, this.w, this.topBlockHeight)
        canvasCtx.fillRect(this.x2, this.topBlockY2, this.w, this.topBlockHeight)
        canvasCtx.fillRect(this.x3, this.topBlockY3, this.w, this.topBlockHeight)
    }

}
