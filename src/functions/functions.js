var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import('dotenv/config');
import { readdirSync, statSync, readFileSync, mkdirSync, rmdirSync, writeFileSync } from 'fs';
import { commonParse } from '../engine/index.js';
import pkg from 'jsonwebtoken';
import musMetaData from 'music-metadata';
import { apiUrl } from '../../src/www.js';
export const getFolderData = (contentPath, urlPath) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    let linkedFile;
    let filesList;
    let playlist;
    let paths;
    let navigation;
    let currentDirectory;
    let buffer;
    const getSlashedCurrentDirectory = () => {
        if ((currentDirectory === null || currentDirectory === void 0 ? void 0 : currentDirectory.startsWith('/')) && currentDirectory.endsWith('/'))
            return currentDirectory;
        if (currentDirectory === '/')
            return '/';
        if (currentDirectory === null || currentDirectory === void 0 ? void 0 : currentDirectory.startsWith('/'))
            return `${currentDirectory}/`;
        if (currentDirectory === null || currentDirectory === void 0 ? void 0 : currentDirectory.endsWith('/'))
            return `/${currentDirectory}`;
        return '/';
    };
    const getMetaDataFields = (path) => __awaiter(void 0, void 0, void 0, function* () {
        var _f;
        const metadata = yield musMetaData.parseFile(path);
        return {
            // native: metadata.native,
            // quality: metadata.quality,
            // common: metadata.common,
            // format: metadata.format,
            bitrate: metadata.format.bitrate ? metadata.format.bitrate / 1000 : metadata.format.bitrate,
            duration: Number(((_f = metadata.format.duration) !== null && _f !== void 0 ? _f : 0).toFixed(2)),
            album: metadata.common.album,
            artists: metadata.common.artists,
            bpm: metadata.common.bpm,
            year: metadata.common.year,
        };
    });
    try {
        if (statSync(`public/${contentPath}${urlPath}`).isFile()) {
            // detects full file name in .match[0]
            //        file name without .ext in .match[1]
            //        file extension without "." in .match[2]
            const fileMatch = urlPath.match(/([^\/]*)\.([^\/]*)$/);
            const name = (_a = fileMatch === null || fileMatch === void 0 ? void 0 : fileMatch[0]) !== null && _a !== void 0 ? _a : 'unknown title';
            const ext = (_b = fileMatch === null || fileMatch === void 0 ? void 0 : fileMatch[2]) !== null && _b !== void 0 ? _b : 'unknown extension';
            const src = `http://${apiUrl}/${contentPath}${urlPath}`;
            buffer = { src, name, ext, url: urlPath };
            // current directory is location.pathname without `.../name.ext`
            if (fileMatch === null || fileMatch === void 0 ? void 0 : fileMatch[0])
                currentDirectory = urlPath.replace(fileMatch === null || fileMatch === void 0 ? void 0 : fileMatch[0], '');
            linkedFile = buffer;
        }
        else {
            buffer = null;
            currentDirectory = urlPath || '/';
        }
    }
    catch (e) {
        console.error(e);
        throw e;
    }
    linkedFile = buffer;
    currentDirectory = currentDirectory || '/';
    const elementsNumbers = {};
    filesList = readdirSync(`public/${contentPath}/${getSlashedCurrentDirectory()}`, { withFileTypes: true })
        .map((element) => {
        var _a, _b;
        const name = element.name;
        const type = element.isDirectory() ? 'folder' : 'file';
        const ext = element.isDirectory() ? null : (_b = (_a = element.name.match(/([^.]+)$/g)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : 'unknown extension';
        const url = encodeURI(element.name);
        const src = `http://${apiUrl}/content${getSlashedCurrentDirectory()}${encodeURI(element.name)}`;
        const number = -~elementsNumbers[ext !== null && ext !== void 0 ? ext : 'folder'];
        const birthTime = statSync(`public/${contentPath}${getSlashedCurrentDirectory()}${element.name}`).birthtime;
        return {
            name,
            type,
            ext,
            url,
            src,
            numberOfThisExt: number,
            birthTime: birthTime,
        };
    })
        .sort((a, b) => (a.type === 'folder' && b.type === 'file' ? -1 : 0));
    if (linkedFile) {
        playlist = [];
        for (let i = 0; i < filesList.length; i++) {
            if (filesList[i].ext === 'mp3') {
                playlist.push({
                    name: filesList[i].name,
                    ext: (_c = filesList[i].ext) !== null && _c !== void 0 ? _c : '',
                    src: `http://${apiUrl}/content${getSlashedCurrentDirectory()}${filesList[i].url}`,
                    url: `${getSlashedCurrentDirectory()}` + filesList[i].url,
                    thisIsLinkedFile: filesList[i].name === (linkedFile === null || linkedFile === void 0 ? void 0 : linkedFile.name),
                });
            }
        }
    }
    else {
        playlist = null;
    }
    paths = {
        rel: getSlashedCurrentDirectory(),
        abs: `/${contentPath}${getSlashedCurrentDirectory()}`,
        lvlUp: (_e = (_d = getSlashedCurrentDirectory().match(/.*\/(?=.+$)/)) === null || _d === void 0 ? void 0 : _d[0]) !== null && _e !== void 0 ? _e : null,
    };
    const buffResult = paths.rel.split('/').filter((e) => e !== '');
    buffer = [];
    buffer.unshift({
        text: 'root',
        link: '/',
    });
    for (let i = 0; i < buffResult.length; i++) {
        buffer[i + 1] = {
            text: buffResult[i],
            link: buffer[i].link + buffResult[i] + '/',
        };
    }
    navigation = buffer;
    try {
        if (filesList)
            for (let i = 0; i < filesList.length; i++) {
                if (filesList[i].ext === 'mp3') {
                    filesList[i].metadata = yield getMetaDataFields(`public/${contentPath}${getSlashedCurrentDirectory()}${filesList[i].name}`);
                }
            }
    }
    catch (e) {
        console.error('Не получилось найти метаданные для файлов');
    }
    try {
        if (linkedFile) {
            linkedFile.metadata = yield getMetaDataFields(`public/${contentPath}/${linkedFile.url}`);
        }
    }
    catch (e) {
        console.error('Не получилось найти метаданные для привязанного файла');
    }
    try {
        if (playlist) {
            for (const elem of playlist) {
                elem.metadata = yield getMetaDataFields(`public/${contentPath}/${decodeURI(elem.url)}`);
            }
        }
    }
    catch (e) {
        console.error('Не получилось найти метаданные для плейлиста');
    }
    filesList = filesList.map((element) => (Object.assign(Object.assign({}, element), { url: `${element.url.startsWith('/') ? '' : '/'}${element.url}` })));
    return {
        linkedFile,
        filesList,
        playlist,
        paths,
        navigation,
        currentDirectory,
    };
});
export const tryAuth = (res, { login, password, token }) => {
    var _a;
    const DEFAULT_KEY = 'DEFAULT_KEY';
    const { sign, verify } = pkg;
    let verifyIsLost;
    const getLoginByToken = (token) => {
        var _a;
        let login;
        verify(token, (_a = process.env.THE_KEY) !== null && _a !== void 0 ? _a : DEFAULT_KEY, (error, pld) => {
            var _a;
            if (error)
                return (verifyIsLost = true);
            login = (_a = pld) === null || _a === void 0 ? void 0 : _a.login;
        });
        return login;
    };
    if (token) {
        login = getLoginByToken(token);
        if (!verifyIsLost)
            return res.json(token);
        return res.sendStatus(403);
    }
    else {
        if (!(login && password))
            return res.sendStatus(403);
        if (password === process.env[login])
            return res.json(sign({ login }, (_a = process.env.THE_KEY) !== null && _a !== void 0 ? _a : DEFAULT_KEY));
        return res.sendStatus(403);
    }
};
export const funnyAnimals = () => {
    const PATH_TO_PICTURES = './content/funny-animals';
    const files = readdirSync(PATH_TO_PICTURES);
    return readFileSync(`${PATH_TO_PICTURES}/${files[Math.floor(Math.random() * files.length)]}`);
};
export const happyNorming = (dayOfTheWeek) => {
    const DOTW_TITLES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const PATH_TO_PICTURES = './content/happy-norming';
    const dotw = (dayOfTheWeek !== null && dayOfTheWeek !== void 0 ? dayOfTheWeek : DOTW_TITLES[new Date().getDay()]).toLowerCase();
    const files = readdirSync(`${PATH_TO_PICTURES}/${dotw}`);
    const file = files[Math.floor(Math.random() * files.length)];
    return readFileSync(`${PATH_TO_PICTURES}/${dotw}/${file}`);
};
export const parse = (bufferedOptions, id) => __awaiter(void 0, void 0, void 0, function* () {
    const PATH_TO_GENERAL_FOLDER = './content/parser';
    const pathToFolder = `${PATH_TO_GENERAL_FOLDER}/${id !== null && id !== void 0 ? id : Date.now()}`;
    mkdirSync(pathToFolder);
    writeFileSync(`${pathToFolder}/index.cjs`, Buffer.from(bufferedOptions.data));
    const options = yield import(`${pathToFolder}/index.cjs`);
    rmdirSync(`${pathToFolder}`, { recursive: true });
    return commonParse(options.default.links, options.default.method);
});
