import {parseLyricTimeString} from "@/audio/audioUtils";

export class LyricContext{

    constructor(lyricString, separator, lyricDrawer) {
        this.separator = separator == null ? '\n' : separator
        this.lyricArray = (lyricString + '').split(this.separator)
        this.lyricList = []
        this.lyricDrawer = lyricDrawer
        if (this.lyricArray.length > 0) {
            this.parse().then(()=>{this.init()})
                .catch(err => Promise.reject(err))
        }
    }

    async parse() {
        // 同步方式执行
        for (let i = 0; i < this.lyricArray.length; i++) {
            let parsedLyric = parseLyricTimeString(this.lyricArray[i])
            if (parsedLyric !== undefined) {
                this.lyricList.push(parsedLyric)
            }
        }
    }

    init() {
        this.currentLyricIdx = 0
        this.updateLyricByIdx()
    }

    update(duration) {
        if (duration >= this.nextTiming) {
            this.currentLyricIdx += 1
            this.updateLyricByIdx()
        }
    }

    updateLyricByIdx() {
        this.currentLyric = this.lyricList[this.currentLyricIdx].text
        this.nextTiming = this.lyricList[this.currentLyricIdx + 1].timing
        this.lyricDrawer.draw(this.currentLyric)
    }

    clear() {
        this.lyricDrawer.clear()
    }
}
