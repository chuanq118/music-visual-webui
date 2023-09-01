import {requestForAudioBuffer, requestForLyric} from "@/api/audio";
import {SymmetryMusicBar} from "@/canvas/SymmetryMusicBar";
import {parseSeconds} from "@/audio/audioUtils";
import {LyricContext} from "@/audio/LyricContext";
import {SimpleLyricDrawer} from "@/canvas/SimpleLyricDrawer";
import ByteDataTypes from "@/audio/ByteDataTypes";
import {ProgressContext} from "@/audio/ProgressContext";
import {LineProgressDrawer} from "@/canvas/LineProgressDrawer";


const defaultOptions = {
    container: '',
    lyricContainer: ''
}

// 音频播放默认状态
const defaultState = {
    isPlaying: false,
    startTime: 0,
    playedDuration: 0,
    currentDuration: 0,
    currentTimeText: '00:00',
    totalDuration: 0,
    totalDurationText: '00:00'
}

// 可由用户设置的状态
const defaultCfgOps = {
    // 声音大小
    volume: 1,
    // 是否显示歌词
    showLyric: true,
    // 是否可视化
    isVisual: true,
    // 解析的音频数据类型
    byteDataType: ByteDataTypes.Frequency,
    // 音频可视化组件
    audioDrawer: undefined,
    // 歌词可视化组件
    lyricDrawer: undefined,
    // 背景设置

}

export class AudioVisualContext{

    static defaultBarFillStyle = {
        topColor: '#f63a2a',
        midColor: '#fc9e5e',
        endColor: '#25f525'
    }

    constructor(options) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        //
        this.gainNode = this.audioCtx.createGain()
        // 利用 assign 自定义属性值会覆盖默认属性值
        this.options = Object.assign({}, defaultOptions, options)

        this.state = defaultState
        this.cfgOps = defaultCfgOps
    }

    async initVisualizer() {
        if (this.canvas && this.canvasCtx) {
            // 如果已经存在 canvas, 则不执行
            return
        }
        this.canvas = document.querySelector(this.options.container);
        if (this.canvas == null) {
            return Promise.reject(`${this.options.container} is null!`)
        }
        this.canvasCtx = this.canvas.getContext('2d')
        this.analyser = this.audioCtx.createAnalyser()
        this.analyser.fftSize = 2048
        // 8 bit 整型数组. 0 ~ 256. 共有 1024 个频率
        this.bufferLength = this.analyser.frequencyBinCount
        this.dataArray = new Uint8Array(this.bufferLength)

        // 初始化音频可视化相关
        this.configureAudioDrawer()

        // 初始化进度条相关操作
        this.configureProgressBar()
    }

    configureAudioDrawer(drawer, barFillStyle) {
        this.drawer = drawer == null ? new SymmetryMusicBar(32, this.bufferLength, this.canvas, this.canvasCtx) : drawer
        this.drawer.init(barFillStyle == null ? AudioVisualContext.defaultBarFillStyle : barFillStyle)
    }

    configureProgressBar() {
        // 进度条显示
        let lineProgressDrawer = new LineProgressDrawer('#progress-container')
        let lineStyle = lineProgressDrawer.canvasCtx.createLinearGradient(0, 0, lineProgressDrawer.maxWidth, lineProgressDrawer.maxHeight);
        lineStyle.addColorStop(0, '#ffffff')
        lineStyle.addColorStop(0.1, '#dc4a4a')
        lineStyle.addColorStop(0.2, '#ea8648')
        lineStyle.addColorStop(0.3, '#d7b924')
        lineStyle.addColorStop(0.4, '#cdef34')
        lineStyle.addColorStop(0.5, '#59e532')
        lineStyle.addColorStop(0.6, '#35e138')
        lineStyle.addColorStop(0.7, '#2ee77e')
        lineStyle.addColorStop(0.8, '#33dcaf')
        lineStyle.addColorStop(0.9, '#2b9ce3')
        lineStyle.addColorStop(1, '#d022dc')
        lineProgressDrawer.setLineStyle(lineStyle)
        this.progressCtx = new ProgressContext(this.state.totalDuration, lineProgressDrawer)
    }

    setVolume(level) {
        this.cfgOps.volume = level
    }

    setByteDataType(type) {
        this.cfgOps.byteDataType = type
    }

    getByteDataType() {
        return this.cfgOps.byteDataType
    }

    setShowLyric(bool) {
        this.cfgOps.showLyric = !!bool;
    }

    changeVisual() {
        this.cfgOps.isVisual = !this.cfgOps.isVisual
        return this.cfgOps.isVisual
    }

    changeShowLyric() {
        this.cfgOps.showLyric = !this.cfgOps.showLyric
        return this.cfgOps.showLyric
    }

    setVisual(bool) {
        this.cfgOps.isVisual = !!bool;
    }

    async load(resource) {
        if (!('audio' in resource)) {
            return Promise.reject('需要指定 audio 资源地址.')
        }
        await this.loadResource(resource.audio);
        if ('lyric' in resource) {
            await this.loadLyric(resource.lyric)
        }
    }

    async loadLyric(url) {
        let lyricCanvas = document.querySelector(this.options.lyricContainer)
        let lyricCanvasCtx = lyricCanvas.getContext('2d')
        try {
            this.lyricCtx = new LyricContext(await requestForLyric(url), '\n',
                new SimpleLyricDrawer(lyricCanvas, lyricCanvasCtx))
        }catch (e) {
            console.error('lyric load error')
        }
    }

    async loadResource(url) {
        this.audioBuffer = this.audioBuffer == null ? await requestForAudioBuffer(url, this.audioCtx) : this.audioBuffer
        this.state.totalDuration = this.audioBuffer.duration
        this.state.totalDurationText = parseSeconds(this.state.totalDuration)
        return this.audioBuffer
    }

    async play() {

        if (!this.canvas && this.cfgOps.isVisual) {
            // 需要先完成可视化的初始化
            await this.initVisualizer()
        }

        if (this.audioBuffer && !this.state.isPlaying) {
            // 重新加载 buffer source
            this.audioBufferSource = this.audioCtx.createBufferSource();
            this.audioBufferSource.buffer = this.audioBuffer;

            this.state.isPlaying = true;
            this.audioBufferSource.connect(this.analyser);
            this.audioBufferSource.connect(this.gainNode);

            this.gainNode.connect(this.audioCtx.destination);

            // 设置音量
            this.gainNode.gain.setValueAtTime(this.cfgOps.volume, this.state.currentDuration);
            // 开始播放
            this.audioBufferSource.start(0, this.state.currentDuration);
            // 记录播放开始时间
            this.state.startTime = this.audioCtx.currentTime;
            this.refresh();
        }
    }

    stop() {
        if (this.audioBufferSource && this.state.isPlaying) {
            this.state.isPlaying = false
            this.audioBufferSource.stop()
            this.audioBufferSource = null

            // 停止时记录已播放时长
            this.state.playedDuration = this.state.currentDuration
            this.canvasCtx.clearRect(0, 0, this.canvas.clientWidth,  this.canvas.height)
        }
    }

    clear() {
        if (this.state.isPlaying) {
            this.stop()
        }
        this.state = defaultState
        this.audioBuffer = null
        this.audioBufferSource = null
    }


    refresh() {

        requestAnimationFrame(this.refresh.bind(this))

        if (this.state.isPlaying) {
            // 播放结束自动停止
            if (this.state.currentDuration > this.state.totalDuration) {
                this.stop()
                return
            }

            // 计算播放时长
            this.state.currentDuration = this.state.playedDuration + this.audioCtx.currentTime - this.state.startTime


            // 是否可视化
            if (this.cfgOps.isVisual) {
                // 根据指定的音频数据类型 获取音频数据
                if (this.cfgOps.byteDataType === ByteDataTypes.Frequency) {
                    this.analyser.getByteFrequencyData(this.dataArray)
                }else {
                    this.analyser.getByteTimeDomainData(this.dataArray)
                }
                // 可视化绘制
                this.drawer.draw(this.dataArray)
                if (this.progressCtx) {
                    this.progressCtx.refresh(this.state.currentDuration)
                }
            }


            // 更新歌词信息
            if (this.lyricCtx && this.cfgOps.showLyric) {
                this.lyricCtx.update(this.state.currentDuration)
            }
            // 当前文本时间
            this.state.currentTimeText = parseSeconds(this.state.currentDuration)
        }


    }

    /**
     * 清空当前帧的绘制内容
     */
    clearVisual() {
        this.drawer.clear()
        this.progressCtx.clear()
    }

    /**
     * 清空当前帧的歌词
     */
    clearLyric() {
        this.lyricCtx.clear()
    }

}

