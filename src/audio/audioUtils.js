
export function parseSeconds(remainingSeconds) {
    return `${add0(Math.max(Math.floor(remainingSeconds / 60), 0))}:${add0(Math.max(Math.ceil(remainingSeconds % 60), 0))}`
}

function add0 (n) {
    return n > 9 ? n : `0${n}`
}


export function parseLyricTimeString(timeString) {
    timeString = timeString.trim()
    if (timeString.startsWith('[')) {
        let spIdx = timeString.indexOf(']')
        if (spIdx > -1) {
            return {
                timing: parseTimeString(timeString.slice(1, spIdx)),
                text: timeString.slice(spIdx + 1)
            }
        }
    }
    return undefined
}

export function parseTimeString(ts) {
    let tmpArr = ts.split(':')
    if (tmpArr.length === 2) {
        let dotIdx = tmpArr[1].indexOf('.')
        return dotIdx === -1 ? parseInt(tmpArr[0]) * 60 + parseInt(tmpArr[1]) :
            parseInt(tmpArr[0]) * 60 + parseFloat(tmpArr[1])
    } else {
        console.error("暂时不解析包含小时的时间字符串")
        return -1
    }
}
