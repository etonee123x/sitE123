let audio = document.getElementsByTagName('audio')
for (let i = 0; i < audio.length; i++) {
	audio[i].addEventListener('ended', function () {
		audio[(i + 1) % audio.length].play()
	})
}

for (let i = 0; i < audio.length; i++) {
	audio[i].addEventListener('play', function () {
		for (let j = 0; j < audio.length; j++) {
			if (i !== j) {
				audio[j].pause()
			}
		}
	})
}
