

export async function requestForMusicArrayBuffer(url) {
    return fetch(url).then(resp => resp.arrayBuffer());
}

export async function requestForAudioBuffer(url, audioCtx) {
    return audioCtx.decodeAudioData(await requestForMusicArrayBuffer(url))
}


export async function requestForLyric(url) {
    return fetch(url).then(resp => resp.text()).catch(err => {
        console.error("获取歌词失败 -> ", url, err)
    })
}
