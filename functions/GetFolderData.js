var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs';
import musMetaData from 'music-metadata';
export default class GetFolderData {
    constructor(contentPath) {
        this.contentPath = GetFolderData
            .tryToPreventError(contentPath.replace(/\/{2,}|\/$|^\//g, ''));
    }
    // parses url and gets new data
    newRequest(url) {
        return __awaiter(this, void 0, void 0, function* () {
            this.url = decodeURI(url).replace(/\/{2,}|\/$|^\//g, '');
            this.data = {};
            yield this.getData();
        });
    }
    static tryToPreventError(path) {
        try {
            fs.statSync(path);
            console.log('Default path is OK!');
        }
        catch (e) {
            try {
                path = '../' + path;
                fs.statSync(path);
                console.log('"../" path is OK!');
            }
            catch (e) {
                console.log('Adding \'../\' haven\'t helped :(');
            }
        }
        return path;
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.getLinkedFile();
            this.getFolderList();
            this.getAllPaths();
            this.getNavigation();
            if (this.fileIsLinked) {
                this.getPlaylist();
            }
            else {
                this.data.playlist = null;
            }
            yield this.getMetas();
            this.sortItems();
        });
    }
    getLinkedFile() {
        try {
            if (fs.statSync(`${this.contentPath}/${this.url}`).isFile()) {
                this.data.linkedFile = {};
                // detects full file name in .match[0]
                //        file name without .ext in .match[1]
                //        file extension without "." in .match[2]
                // eslint-disable-next-line no-useless-escape
                const fileMatch = this.url.match(/([^\/]*)\.([^\/]*)$/);
                this.data.linkedFile.name = fileMatch[0];
                this.data.linkedFile.ext = fileMatch[2];
                // will contain url from location.pathname
                this.data.linkedFile.url = `/${this.url}`;
                this.fileIsLinked = true;
                // current directory is location.pathname without `.../name.ext`
                this.data.currentDirectory = this.url.replace(fileMatch[0], '');
            }
            else {
                this.data.linkedFile = 'none';
                this.fileIsLinked = false;
                this.data.currentDirectory = this.url || '/';
            }
        }
        catch (e) {
            this.data.linkedFile = 'Linked file not found!';
        }
    }
    getFolderList() {
        this.elementsNumbers = {};
        this.data.filesList = fs.readdirSync(`${this.contentPath}/${this.data.currentDirectory}`, { withFileTypes: true }).map(element => {
            const name = element.name;
            const type = element.isDirectory() ? 'folder' : 'file';
            const ext = element.isDirectory() ? null : element.name.match(/([^.]+)$/g)[0];
            // cyphers file name to url (space => '%20' and etc)
            const url = encodeURI(element.name);
            // counts the ordinal number of file with this extension
            if (typeof this.elementsNumbers[ext] === 'undefined') {
                this.elementsNumbers[ext] = 0;
            }
            const number = this.elementsNumbers[ext]++;
            const birthTime = fs.statSync(`${this.contentPath}/${this.data.currentDirectory}/${element.name}`).birthtime;
            return {
                name,
                type,
                ext,
                url,
                numberOfThisExt: number,
                birthTime: birthTime,
            };
        });
    }
    getAllPaths() {
        this.data.paths = {};
        this.data.paths.rel = `/${this.data.currentDirectory}/`.replace(/\/{2,}/, '/');
        this.data.paths.abs = `/${this.contentPath}/${this.data.currentDirectory}/`.replace(/\/{2,}/, '/');
        try {
            this.data.paths.lvlUp = this.data.paths.rel.match(/.*\/(?=.+$)/)[0];
        }
        catch (e) {
            this.data.paths.lvlUp = null;
        }
    }
    getNavigation() {
        let buffResult = this.data.paths.rel.split('/');
        buffResult = buffResult.filter(e => e !== '');
        const result = [];
        result.unshift({
            text: 'root',
            link: '/'
        });
        for (let i = 1; i < result.length; i++) {
            result[i] = {
                text: buffResult[i],
                link: result[i - 1].link + buffResult[i] + '/'
            };
        }
        this.data.navigation = result;
    }
    getPlaylist() {
        const playlist = [];
        this.data.filesList.forEach(e => {
            if (e.ext === 'mp3' && typeof this.data.linkedFile !== 'string') {
                playlist.push({
                    name: e.name,
                    ext: e.ext,
                    url: '/' + this.data.currentDirectory + e.url,
                    thisIsLinkedFile: (e.name === this.data.linkedFile.name)
                });
            }
        });
        this.data.playlist = playlist;
    }
    static getMetaDataFields(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const metadata = yield musMetaData
                .parseFile(path);
            return Promise.resolve({
                bitrate: metadata.format.bitrate || null,
                duration: metadata.format.duration.toFixed(2) || null,
                album: metadata.common.album || null,
                artists: metadata.common.artists || null,
                bpm: metadata.common.bpm || null,
                year: metadata.common.year || null
            });
        });
    }
    sortItems() {
        this.data.filesList = this.data.filesList.sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') {
                return -1;
            }
            return 0;
        });
    }
    getMetas() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (let i = 0; i < this.data.filesList.length; i++) {
                    if (this.data.filesList[i].ext === 'mp3') {
                        this.data.filesList[i].metadata =
                            yield GetFolderData
                                .getMetaDataFields(`${this.contentPath}/${this.data.currentDirectory}/${this.data.filesList[i].name}`);
                    }
                }
            }
            catch (e) {
                console.log('Не получилось найти метаданные для файлов');
            }
            try {
                if (this.data.linkedFile !== 'none' &&
                    this.data.linkedFile !== 'Linked file not found!' &&
                    typeof this.data.linkedFile !== 'string') {
                    this.data.linkedFile.metadata =
                        yield GetFolderData
                            .getMetaDataFields(`${this.contentPath}/${this.data.linkedFile.url}`);
                }
            }
            catch (e) {
                console.log('Не получилось найти метаданные для привязанного файла');
            }
            try {
                if (this.data.playlist) {
                    for (const elem of this.data.playlist) {
                        elem.metadata =
                            yield GetFolderData
                                .getMetaDataFields(`${this.contentPath}/${decodeURI(elem.url)}`);
                    }
                }
            }
            catch (e) {
                console.log('Не получилось найти метаданные для плейлиста');
            }
        });
    }
}
;
