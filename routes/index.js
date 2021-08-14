const express = require('express')
const fs = require('fs')
let createError = require('http-errors')
let router = express.Router()

//gives info about element in directory
function elementProcessing(element, elemsNumbers) {
    let name = element.name
    let type = element.isDirectory() ? 'folder' : 'file'
    let ext = element.isDirectory() ? null : element.name.match(/([^\.]+)$/g)[0]
    let url = encodeURI(element.name)
    typeof elemsNumbers[ext] === undefined ? elemsNumbers[ext] = '0' : null
    let number = elemsNumbers[ext]++
    return {
        name: name,
        type: type,
        ext: ext,
        url: url,
        numberOfThisExt: number,
    }
}

//gets data about directory depends on path
async function getFolderData(relPath = '') {
    //keeps numbers of elements with any extension
    let elemsNumbers = {}
    let folderData = {}
    if (fs.statSync(`./public/content/${decodeURI(relPath)}`).isFile()) {
        console.log('FILE!!!'.red)
        //detects full file name in .match[0]
        //        file name without .ext in .match[1]
        //        file extension without "." in .match[2]
        let fileMatch = relPath.match(/([^\/]*)\.([^\/]*)$/)
        console.log(fileMatch)
        folderData.linkedFile = {}
        folderData.linkedFile.name = fileMatch[1]
        folderData.linkedFile.ext = fileMatch[2]
        folderData.linkedFile.url = relPath
        //relative path should be without the file
        relPath = relPath.replace(fileMatch[0], '')
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
    // console.log(`Relative: ${folderData.paths.rel}`.bgRed)
    // console.log(`Absolute: ${folderData.paths.abs}`.bgBlue)
    // console.log(`Level Up: ${folderData.paths.lvlUp}`.bgGreen)
    folderData.ls = []
    //creating list of elements
    folderData.ls = fs.readdirSync(folderData.paths.abs, {withFileTypes: true}).map(element => elementProcessing(element, elemsNumbers))
    folderData.navigation = parseNavigation(folderData.paths.rel)
    return folderData
}

//adds items for navigation bar
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

//res.render is for site mode
//res.send is for API mode
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
