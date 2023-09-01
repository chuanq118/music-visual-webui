

export async function configureCanvasContainer(selector, top, left, width, height) {
    try {
        let canvas = document.querySelector(selector)
        canvas.height = height
        canvas.width = width
        canvas.style.top = top + 'px'
        canvas.style.left = left + 'px'
        return Promise.resolve(canvas)
    }catch (e) {
        return Promise.reject(e)
    }
}
