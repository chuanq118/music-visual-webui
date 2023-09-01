export function GradientsStyleInit(gradient, style) {
    if (style === 'sheet1') {
        gradient.addColorStop(0, "#d53369")
        gradient.addColorStop(0.5, "#cbad6d")
        gradient.addColorStop(1, "#d53369")
        return
    }
    // 默认渐进配色
    gradient.addColorStop(0, "#FF4500")
    gradient.addColorStop(0.5, "#FF7F24")
    gradient.addColorStop(1, "#00E800")
}
