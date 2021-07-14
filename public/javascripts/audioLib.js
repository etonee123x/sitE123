const defaultVolume = 0.8
let currentVolume = defaultVolume

let audio = document.getElementsByTagName('audio')

for (let i = 0; i < audio.length; i++) {
	audio[i].volume = defaultVolume
	audio[i].addEventListener('ended', function () {
		audio[(i + 1) % audio.length].play()
	})
	audio[i].addEventListener('play', function () {
		for (let j = 0; j < audio.length; j++) {
			if (i !== j) {
				audio[j].pause()
				audio[j].currentTime = 0
			}
		}
	})
	audio[i].addEventListener('volumechange', function () {
		for (let j = 0; j < audio.length; j++) {
			if (this.muted)
				audio[j].muted = true
			else if (!this.muted)
				audio[j].muted = false
			audio[j].volume = this.volume
		}
	})
	audio[i].addEventListener('', function () {
		for (let j = 0; j < audio.length; j++) {
			audio[j].volume = audio[i].volume
		}
	})
}
