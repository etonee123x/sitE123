const fs = require('fs')
const musMetaData = require('music-metadata')

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
                fs.statSync(path)
            } catch (e) {
                `Adding '../' haven't helped :(`
            }
        }
        return path
    }

    // parses url and gets new data
    async newRequest(url) {
        this.url = decodeURI(url).replace(/\/{2,}|\/$|^\//g, '')
        this.data = {}
        await this.getData()
    }

    // gets data
    async getData() {
        this.getLinkedFile()
        this.getFolderList()
        this.getAllPaths()
        this.getNavigation()

        await this.getMetas()
        if (this.fileIsLinked) {
            this.getPlaylist()
        } else {
            this.data.playlist = null
        }
        this.sortItems()
        console.log(JSON.stringify(this.data, null, 4))
        // console.log(this.data)
    }

    getPlaylist() {
        console.log('getting a playlist!')
        const playlist = []
        this.data.filesList.forEach(e => {
            if (e.ext === 'mp3') {
                playlist.push({
                    name: e.name,
                    ext: e.ext,
                    url: '/' + this.data.currentDirectory + e.url,
                    thisIsLinkedFile: (e.name === this.data.linkedFile.name)
                })
            }
        })
        this.data.playlist = playlist
        //console.log(this.data.playlist)
    }

    async getMetas() {
        for (let i = 0; i < this.data.filesList.length; i++) {
            if (this.data.filesList[i].ext === 'mp3') {
                const metaData = await musMetaData
                    .parseFile(`${this.contentPath}/${this.data.currentDirectory}/${this.data.filesList[i].name}`)
                this.data.filesList[i].metaData = {
                    bitrate: metaData.format.bitrate || null,
                    duration: metaData.format.duration.toFixed(2) || null,
                    album: metaData.common.album || null,
                    artists: metaData.common.artists || null,
                    bpm: metaData.common.bpm || null,
                    year: metaData.common.year || null,
                }
            }
        }
        if (!(this.data.linkedFile === 'none' || this.data.linkedFile === 'Linked file not found!')) {
            const metaData = await musMetaData
                .parseFile(`${this.contentPath}/${this.data.linkedFile.url}`)
            this.data.linkedFile.metaData = {
                bitrate: metaData.format.bitrate || null,
                duration: metaData.format.duration.toFixed(2) || null,
                album: metaData.common.album || null,
                artists: metaData.common.artists || null,
                bpm: metaData.common.bpm || null,
                year: metaData.common.year || null,
            }
        }
    }

    sortItems() {
        this.data.filesList = this.data.filesList.sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') {
                return -1
            }
            return 0
        })
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
                this.data.linkedFile.name = fileMatch[0]
                this.data.linkedFile.ext = fileMatch[2]

                // will contain url from location.pathname
                this.data.linkedFile.url = `/${this.url}`

                this.fileIsLinked = true

                //current directory is location.pathname without `.../name.ext`
                this.data.currentDirectory = this.url.replace(fileMatch[0], '')
            } else {
                this.data.linkedFile = 'none'
                this.fileIsLinked = false
                this.data.currentDirectory = this.url || '/'
            }
        } catch (e) {
            this.data.linkedFile = 'Linked file not found!'
        }
    }

    //gets info about files and dirs in current dir
    getFolderList() {
        this.elementsNumbers = {}
        this.data.filesList = fs.readdirSync(
            `${this.contentPath}/${this.data.currentDirectory}`,
            {withFileTypes: true}
        ).map(element => {
            const name = element.name
            const type = element.isDirectory() ? 'folder' : 'file'
            const ext = element.isDirectory() ? null : element.name.match(/([^.]+)$/g)[0]

            // cyphers file name to url (space => '%20' and etc)
            const url = encodeURI(element.name)

            // counts the ordinal number of file with this extension
            typeof this.elementsNumbers[ext] === 'undefined' ? this.elementsNumbers[ext] = 0 : null
            const number = this.elementsNumbers[ext]++

            const birthTime = fs.statSync(`${this.contentPath}/${this.data.currentDirectory}/${element.name}`).birthtime

            // let modTime = fs.statSync(`${this.contentPath}/${this.data.currentDirectory}/${element.name}`).mtime
            // let accessTime = fs.statSync(`${this.contentPath}/${this.data.currentDirectory}/${element.name}`).atime
            // let changedTime = fs.statSync(`${this.contentPath}/${this.data.currentDirectory}/${element.name}`).ctime
            return {
                name,
                type,
                ext,
                url,
                numberOfThisExt: number,
                birthTime,

                // modTime,
                // changedTime,
                // accessTime,
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