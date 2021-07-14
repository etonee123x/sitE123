const defaultVolume = 0.8
let currentVolume = defaultVolume

let audio = document.getElementsByTagName('audio')
//for all audio
for (let i = 0; i < audio.length; i++) {
	//set default volume
	audio[i].volume = defaultVolume

	//after playing resets current time and plays next
	audio[i].addEventListener('ended', function () {
		audio[i].currentTime = 0
		audio[(i + 1) % audio.length].play()
	})

	//when 1 plays others paused
	audio[i].addEventListener('play', function () {
		for (let j = 0; j < audio.length; j++)
			if (i !== j)
				audio[j].pause()
	})

	//links volumes of all players together
	audio[i].addEventListener('volumechange', function () {
		for (let j = 0; j < audio.length; j++) {
			if (this.muted)
				audio[j].muted = true
			else if (!this.muted)
				audio[j].muted = false
			audio[j].volume = this.volume
		}
	})
}

document.addEventListener('DOMContentLoaded', playSelectedTrack(document.location.pathname))

function playSelectedTrack(href) {
	for (let track of audio) {
		if (track.getElementsByTagName('source')[0].src.replace(`${document.location.origin}/content`, '') === href) {
			track.play()
		}
	}
}
