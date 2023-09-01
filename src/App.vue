<template>

  <div id="page-bg">
    <img id="page-bg-img" src="" class="hide" alt="">
    <video id="page-bg-video" src="" class="hide" loop autoplay muted></video>
  </div>

  <!-- 定义可视化的绘制容器 -->
  <canvas id="visual-container"></canvas>
  <!-- 定义歌词的绘制容器 -->
  <canvas id="lyric-container"></canvas>
  <!-- 定义进度条的绘制容器 -->
  <canvas id="progress-container"></canvas>

  <!--<div class="dev-title">-->
  <!--  <p>Visual Tests</p>-->
  <!--  <p style="font-size: 18px;padding-left: 40px">-->
  <!--    <span style="color: #546ff3">{{visualType}}</span> - -->
  <!--    <span style="color: #eeb90f">{{dataType}}</span> - -->
  <!--    <span style="color: #24af85">{{currentTime}}/{{totalTime}}</span>-->
  <!--  </p>-->
  <!--</div>-->

  <div class="operation">
    <button @click="play">play</button>
    <button @click="stop">stop</button>
    <button @click="test">test</button>
    <button @click="changeVisual">change visual</button>
    <button @click="changeAudioDrawer">change audio drawer</button>
    <button @click="changeShowLyric">change show lyric</button>
    <button @click="changeByteDataType">change byte data type</button>
  </div>


</template>

<script setup>

import {AudioVisualContext} from "@/audio/AudioVisualContext";
import {onMounted, reactive} from "vue";
import {LyricContext} from "@/audio/LyricContext";
import {requestForLyric} from "@/api/audio";
import ByteDataTypes from "@/audio/ByteDataTypes";
import {MusicBar} from "@/canvas/MusicBar";
import {SymmetryMusicBar} from "@/canvas/SymmetryMusicBar";
import {configureCanvasContainer} from "@/canvas/canvasUtils";



// const visualType = ref('SymmetryMusicBar')
// const dataType = ref('频域数据')
//
// const currentTime = ref('00:00')
// const totalTime = ref('00:00')

const avc = new AudioVisualContext({container: '#visual-container', lyricContainer: '#lyric-container'})

let audioDrawer = 0

// 音频的统一配置项
const audio = reactive({
  url: '/example/lnh.mp3',
  lyric: '/example/lnh.txt',
  volume: 0.4,
  // bg: '/bg/default.jpg',
  videoBg: '/example/background.mp4'
})


function play() {
  avc.play()
  // totalTime.value = avc.state.totalDurationText
}

function stop() {
  avc.stop()
}

function changeVisual() {
  if (!avc.changeVisual()) {
    avc.clearVisual()
  }
}

function changeShowLyric() {
  if (!avc.changeShowLyric()) {
    avc.clearLyric()
  }
}

function changeAudioDrawer() {
  if (audioDrawer === 0) {
    audioDrawer = 1
    avc.configureAudioDrawer(new MusicBar(32, avc.bufferLength, avc.canvas, avc.canvasCtx));
  } else {
    audioDrawer = 0
    avc.configureAudioDrawer(new SymmetryMusicBar(32, avc.bufferLength, avc.canvas, avc.canvasCtx));
  }
}

function changeByteDataType() {
  avc.setByteDataType(avc.getByteDataType() === ByteDataTypes.TimeDomain ? ByteDataTypes.Frequency : ByteDataTypes.TimeDomain)
}

async function test() {
  new LyricContext(await requestForLyric('/lyric/SoFarAway'), '\n')
}

onMounted(async ()=>{
  let app = document.querySelector('#app')
  app.style.height = window.innerHeight + 'px'

  // load bg
  let pageBg = document.querySelector('#page-bg')
  let pageBgImg = document.querySelector('#page-bg-img')
  let pageBgVideo = document.querySelector('#page-bg-video')
  pageBg.style.width = window.innerWidth + 'px'
  pageBg.style.height = window.innerHeight + 'px'

  // 设置背景
  if ('bg' in audio) {
    pageBgImg.src = audio.bg
    pageBgImg.classList.remove('hide')
  }
  if ('videoBg' in audio) {
    pageBgVideo.src = audio.videoBg
    pageBgVideo.classList.remove('hide')
  }


  // 设置 visual container
  await configureCanvasContainer('#visual-container', 80, 50, window.innerWidth - 100, window.innerHeight - 200)
  // 设置 lyric container
  await configureCanvasContainer('#lyric-container', window.innerHeight / 2 + 240,
      0, window.innerWidth - 40, 200)
  // 设置 process container
  await configureCanvasContainer('#progress-container', window.innerHeight - 30, 0, window.innerWidth, 30)

  // 根据配置项初始化页面
  await avc.load({
    audio: ('url' in audio) ? audio.url : '',
    lyric: ('lyric' in audio) ? audio.lyric : ''
  })

  avc.setVolume(audio.volume)

})


</script>

<style lang="css">

body, html {
  background-color: #131313;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

canvas {
  padding: 0;
  margin: 0;
}

#visual-container{
  position: fixed;

  z-index: 1;
}

#lyric-container{
  position: fixed;

  z-index: 8;
}

#progress-container {
  position: fixed;
  z-index: 99;
}

.operation{
  position: fixed;
  right: 10px;
  top: 10px;
  font-size: 16px;

  z-index: 99;
}

.dev-title{
  position: fixed;
  top: 10px;
  left: 10px;
  font-size: 22px;
  font-weight: bold;
  color: white;
}

#app {
  width: 100%;
  margin: 0;
  padding: 0;
  user-select: none;
  background: transparent;
  z-index: 9;
}

#page-bg{
  position: fixed;
  left: 0;
  top: 0;
  margin: 0;
  padding: 0;
  z-index: 0;

  display: flex;
  justify-content: center;
  align-items: center;
}

#page-bg-img{

  z-index: 0;

  object-fit: cover;
  width: 100%;
  height: 100%;
  position: center;

  //opacity: 0.9;
  filter: blur(1px) brightness(0.4);

  -webkit-user-drag: none;
}

#page-bg-video{
  object-fit: cover;
  width: 100%;
  height: 100%;
  position: center;

  filter: brightness(0.5) blur(3px);
  z-index: 0;
}

.hide{
  display: none;
}
</style>
