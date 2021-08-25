const fs = require('fs')
require('colors')

class FileSystemOperator {
    constructor(contentPath) {
        this.contentPath = contentPath.replace(/\/{2,}|\/$|^\//g, '')
    }

    NewRequest(url) {
        this.url = decodeURI(url).replace(/\/{2,}|\/$|^\//g, '')
        console.log('URL: ', this.url)
        //this.elementsNumbers = {}
        //this.data = {}
        //this.getData()
    }

    getData() {
        this.getLinkedFile()
        this.getFolderList()
        this.getAllPaths()
        this.getNavigation()
        //console.log(JSON.stringify(this.data, null, 4))
    }

    getLinkedFile() {
        try {
            if (fs.statSync(`${this.contentPath}/${this.url}`).isFile()) {
                this.data.linkedFile = {}
                let fileMatch = this.url.match(/([^\/]*)\.([^\/]*)$/)
                //detects full file name in .match[0]
                //        file name without .ext in .match[1]
                //        file extension without "." in .match[2]
                this.data.linkedFile.name = fileMatch[1]
                this.data.linkedFile.ext = fileMatch[2]
                this.data.linkedFile.url = `/${this.url}`
                this.data.linkedFile.fullUrl = `/${this.contentPath}/${this.url}`
                this.data.currentDirectory = this.url.replace(fileMatch[0], '')
            } else {
                this.data.linkedFile = 'none'
                this.data.currentDirectory = this.url
            }
        } catch (e) {
            this.data.linkedFile = "Linked file not found!"
        }
    }

    getFolderList() {
        this.data.filesList = fs.readdirSync(`${this.contentPath}/${this.data.currentDirectory}`, {withFileTypes: true}).map(element => {
            let name = element.name
            let type = element.isDirectory() ? 'folder' : 'file'
            let ext = element.isDirectory() ? null : element.name.match(/([^.]+)$/g)[0]
            let url = encodeURI(element.name)
            typeof this.elementsNumbers[ext] === 'undefined' ? this.elementsNumbers[ext] = 0 : null
            let number = this.elementsNumbers[ext]++
            return {
                name: name,
                type: type,
                ext: ext,
                url: url,
                numberOfThisExt: number,
            }
        })
    }

    getAllPaths() {
        this.data.paths = {}
        this.data.paths.rel = `/${this.data.currentDirectory}/`.replace(/\/{2,}/, '/')
        this.data.paths.abs = `/${this.contentPath}/${this.data.currentDirectory}/`.replace(/\/{2,}/, '/')
        try {
            this.data.paths.lvlUp = this.data.paths.rel.match(/.*\/(?=.+$)/)[0]
        } catch (e) {
            this.data.paths.lvlUp = null
        }
    }

    getNavigation() {
        let result = this.data.paths.rel.split('/')
        result = result.filter(e => e !== '')
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
        this.data.navigation = result
    }
}

module.exports = FileSystemOperator