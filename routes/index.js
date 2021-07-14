const express = require('express')
const fs = require('fs')
let router = express.Router()

function elementProcessing(element, elemsNumbers, linkedFile) {
	let name = element.name
	let type = element.isDirectory() ? 'folder' : 'file'
	let ext = element.isDirectory() ? null : element.name.match(/([^\.]+)$/g)[0]
	let url = encodeURI(element.name)
	elemsNumbers[ext] == undefined ? elemsNumbers[ext] = '0' : null
	let number = elemsNumbers[ext]++
	if (linkedFile) {
		if (name === `${linkedFile.name}.${linkedFile.ext}`) {
			linkedFile.number = number
		}
	}
	return {
		name: name,
		type: type,
		ext: ext,
		url: url,
		numberOfThisExt: number,
	}
}

async function getFolderData(relPath = '') {
	let elemsNumbers = {}
	let folderData = {}
	if (fs.statSync(`./public/content/${decodeURI(relPath)}`).isFile()) {
		console.log('FILE!!!'.red)
		relPath = relPath.split('/')
		relPath.pop()
		relPath = relPath.join('/')
	}
	folderData.currentFolder = 'root/' + relPath
	folderData.paths = {}
	folderData.paths.rel = ('/' + decodeURI(relPath) + '/').replace(/\/+/g, '/')
	folderData.paths.abs = './public/content' + folderData.paths.rel
	try {
		folderData.paths.lvlUp = folderData.paths.rel.match(/.*\/(?=.+$)/)[0]
	} catch (e) {
		folderData.paths.lvlUp = null
	}
	console.log(`${folderData.paths.rel}`.bgRed)
	console.log(`${folderData.paths.abs}`.bgBlue)
	console.log(`${folderData.paths.lvlUp}`.bgGreen)
	folderData.ls = []
	folderData.ls = fs.readdirSync(folderData.paths.abs, {withFileTypes: true}).map((element) => elementProcessing(element, elemsNumbers, folderData.linkedFile))
	return folderData
}

router.get('/*', async function (req, res, next) {
	console.log(req.params)
	await res.render('folder', await getFolderData(req.params[0]))
	//await res.send(await getFolderData(req.params[0]))
})

module.exports = router
