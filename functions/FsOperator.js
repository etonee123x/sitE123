const fs = require('fs')
const moment = require('moment')

class FileSystemOperator {
    constructor(contentPath) {
        this.contentPath = this.tryToPreventError(contentPath.replace(/\/{2,}|\/$|^\//g, ''))
    }

    // adds '../' before path if needed (needed on server)
    tryToPreventError(path) {
        try {
            fs.statSync(path)
        } catch (e) {
            try {
                path = '../' + path
            } catch (e) {
                `Adding '../' haven't helped :(`
            }
        }
        return path
    }

    // parses url and gets new data
    newRequest(url) {
        this.url = decodeURI(url).replace(/\/{2,}|\/$|^\//g, '')
        this.data = {}
        this.elementsNumbers = {}
        this.getData()
    }

    // gets data
    getData() {
        this.getLinkedFile()
        this.getFolderList()
        this.getAllPaths()
        this.getNavigation()
        console.log(JSON.stringify(this.data, null, 4))
    }

    // gets linked file
    getLinkedFile() {
        try {
            if (fs.statSync(`${this.contentPath}/${this.url}`).isFile()) {
                this.data.linkedFile = {}

                //detects full file name in .match[0]
                //        file name without .ext in .match[1]
                //        file extension without "." in .match[2]
                let fileMatch = this.url.match(/([^\/]*)\.([^\/]*)$/)
                this.data.linkedFile.name = fileMatch[1]
                this.data.linkedFile.ext = fileMatch[2]

                // will contain url from location.pathname
                this.data.linkedFile.url = `/${this.url}`

                // will contain url from location.pathname with contentPath before (link to real file)
                this.data.linkedFile.fullUrl = `/${this.contentPath}/${this.url}`

                //current directory is location.pathname without `.../name.ext`
                this.data.currentDirectory = this.url.replace(fileMatch[0], '')
            } else {
                this.data.linkedFile = 'none'
                this.data.currentDirectory = this.url
            }
        } catch (e) {
            this.data.linkedFile = "Linked file not found!"
        }
    }

    //gets info about files and dirs in current dir
    getFolderList() {
        this.data.filesList = fs.readdirSync(
            `${this.contentPath}/${this.data.currentDirectory}`,
            {withFileTypes: true}
        ).map(element => {
            let name = element.name
            let type = element.isDirectory() ? 'folder' : 'file'
            let ext = element.isDirectory() ? null : element.name.match(/([^.]+)$/g)[0]

            // cyphers file name to url (space => '%20' and etc)
            let url = encodeURI(element.name)

            // counts the ordinal number of file with this extension
            typeof this.elementsNumbers[ext] === 'undefined' ? this.elementsNumbers[ext] = 0 : null
            let number = this.elementsNumbers[ext]++

            let birthTime = fs.statSync(`${this.contentPath}/${this.data.currentDirectory}/${element.name}`).birthtime
            let modTime = fs.statSync(`${this.contentPath}/${this.data.currentDirectory}/${element.name}`).mtime
            let accessTime = fs.statSync(`${this.contentPath}/${this.data.currentDirectory}/${element.name}`).atime
            let changedTime = fs.statSync(`${this.contentPath}/${this.data.currentDirectory}/${element.name}`).ctime
            return {
                name,
                type,
                ext,
                url,
                numberOfThisExt: number,
                birthTime,
                modTime,
                changedTime,
                accessTime,
            }
        })
    }

    // gets relative, absolute and level up paths
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

    // gets navigation
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