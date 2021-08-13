const express = require('express')
const fs = require('fs')
let createError = require('http-errors')
let router = express.Router()

function elementProcessing(element, elemsNumbers) {
    let name = element.name
    let type = element.isDirectory() ? 'folder' : 'file'
    let ext = element.isDirectory() ? null : element.name.match(/([^\.]+)$/g)[0]
    let url = encodeURI(element.name)
    elemsNumbers[ext] == undefined ? elemsNumbers[ext] = '0' : null
    let number = elemsNumbers[ext]++
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
        let fileMatch = relPath.match(/([^\/]*)\.([^\/]*)$/)
        console.log(fileMatch)
        folderData.linkedFile = {}
        folderData.linkedFile.name = fileMatch[1]
        folderData.linkedFile.ext = fileMatch[2]
        folderData.linkedFile.url = relPath
        relPath = relPath.replace(fileMatch[0],'')
    } else {
        folderData.linkedFile = 'none'
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
    folderData.ls = fs.readdirSync(folderData.paths.abs, {withFileTypes: true}).map(element => elementProcessing(element, elemsNumbers))
    folderData.navigation = parseNavigation(folderData.paths.rel)
    return folderData
}

function parseNavigation(path) {
    let result = path.split('/')
    result.pop()
    result.shift()
    result.unshift({
        text: 'root',
        link: '/',
    })
    for (let i = 1; i < result.length; i++) {
        result[i] = {
            text: result[i],
            link: result[i - 1].link + result[i] + '/',
        }
    }
    return result
}

router.get('/*', async function (req, res, next) {
    console.log(req.params)
    try {
        //await res.render('folder', await getFolderData(req.params[0]))
        await res.send(await getFolderData(req.params[0]))
    } catch (e) {
        await res.send('error')
    }
})

module.exports = router
