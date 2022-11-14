import { readdirSync, statSync, readFileSync, mkdirSync, rmdirSync, writeFileSync, existsSync } from 'fs';
import { commonParse } from '../engine/index.js';
import pkg from 'jsonwebtoken';
import { parseFile } from 'music-metadata';
import { apiUrl } from '../../src/www.js';
import { join, dirname, parse as parsePath, sep } from 'path';
import { BaseItem, AudioItem, FolderItem, PictureItem, PlaylistItem, AudioExts, ItemTypes, PictureExts, FileItem, LinkedFileItem, } from '../../includes/types/index.js';
const CONTENT_FOLDER = 'content';
const contentPath = join('.', 'src', CONTENT_FOLDER);
export const getFolderData = async (urlPath, _contentPath = CONTENT_FOLDER) => {
    const makeInnerPath = (path) => join('public', CONTENT_FOLDER, path);
    const createFullLink = (path) => new URL(path, `http://${apiUrl}`).href;
    const pathToFileURL = (path) => path.replace(new RegExp(`\\${sep}`, 'g'), '/');
    const outerPath = join(urlPath);
    const innerPath = makeInnerPath(outerPath);
    let linkedFile = null;
    let playlist = null;
    let currentDirectory;
    const items = [];
    const getMetaDataFields = async (path) => {
        const metadata = await parseFile(path);
        return {
            // native: metadata.native,
            // quality: metadata.quality,
            // common: metadata.common,
            // format: metadata.format,
            bitrate: metadata.format.bitrate ? metadata.format.bitrate / 1000 : metadata.format.bitrate,
            duration: Number((metadata.format.duration ?? 0).toFixed(2)),
            album: metadata.common.album,
            artists: metadata.common.artists,
            bpm: metadata.common.bpm,
            year: metadata.common.year,
        };
    };
    const stats = statSync(innerPath);
    if (stats.isFile()) {
        const { name, ext } = parsePath(urlPath);
        linkedFile = new LinkedFileItem(new FileItem({
            name,
            src: createFullLink(`${_contentPath}/${urlPath}`),
            url: urlPath,
            birthtime: stats.birthtime,
        }), { ext });
        if (Object.values(AudioExts).includes(ext)) {
            linkedFile.metadata = await getMetaDataFields(innerPath);
        }
        playlist = [];
        currentDirectory = dirname(outerPath);
    }
    else {
        currentDirectory = outerPath;
    }
    currentDirectory = currentDirectory || '/';
    const elementsNumbers = {};
    const elements = readdirSync(makeInnerPath(currentDirectory), { withFileTypes: true });
    for (const element of elements) {
        const outerFilePath = join(currentDirectory, element.name);
        const innerFilePath = makeInnerPath(outerFilePath);
        const { ext } = parsePath(innerFilePath);
        const itemBase = new BaseItem({
            name: element.name,
            url: encodeURI(element.name),
            src: createFullLink(join(CONTENT_FOLDER, outerFilePath)),
            numberOfThisExt: -~elementsNumbers[ext ?? ItemTypes.FOLDER],
            birthtime: statSync(innerFilePath).birthtime,
        });
        if (!element.isDirectory()) {
            const fileItem = new FileItem(itemBase);
            if (Object.values(AudioExts).includes(ext)) {
                const metadata = await getMetaDataFields(innerFilePath);
                items.push(new AudioItem(fileItem, { ext: ext, metadata }));
                continue;
            }
            if (Object.values(PictureExts).includes(ext)) {
                items.push(new PictureItem(fileItem, { ext: ext }));
                continue;
            }
        }
        items.push(new FolderItem(itemBase));
    }
    items.sort((a, b) => (a.type === ItemTypes.FOLDER && b.type === ItemTypes.FILE ? -1 : 0));
    if (linkedFile) {
        items.filter(item => item instanceof AudioItem)
            .forEach(file => playlist?.push(new PlaylistItem(file, { thisIsLinkedFile: file.name === linkedFile?.name })));
    }
    const paths = {
        abs: pathToFileURL(currentDirectory),
        rel: urlPath,
        lvlUp: dirname(urlPath),
    };
    const navigation = [{ text: 'root', link: '/' }];
    paths.rel.split('/').filter(e => e).forEach((path, i) => {
        navigation.push({
            text: path,
            link: navigation[i].link + path + '/',
        });
    });
    return {
        linkedFile,
        items,
        playlist,
        paths,
        navigation,
        currentDirectory: pathToFileURL(currentDirectory),
    };
};
export const tryAuth = (res, tokenOrLoginAndPassword) => {
    const DEFAULT_KEY = 'DEFAULT_KEY';
    const key = process.env.THE_KEY ?? DEFAULT_KEY;
    const verifyLoginAndPassword = ({ login, password }) => password === process.env[login];
    if ('token' in tokenOrLoginAndPassword) {
        let verificationWasFailed = false;
        const { token } = tokenOrLoginAndPassword;
        pkg.verify(token, key, (error) => {
            verificationWasFailed = !!error;
        });
        return verificationWasFailed ? res.sendStatus(403) : res.json(token);
    }
    const { login, password } = tokenOrLoginAndPassword;
    return verifyLoginAndPassword({ login, password })
        ? res.json(pkg.sign({ login }, key))
        : res.sendStatus(403);
};
export const funnyAnimals = () => {
    const FUNNY_ANIMALS_FOLDER = 'funny-animals';
    const picturesPath = join(contentPath, FUNNY_ANIMALS_FOLDER);
    if (!existsSync(picturesPath))
        return;
    const filesTitles = readdirSync(picturesPath);
    const fileTitle = filesTitles[Math.floor(Math.random() * filesTitles.length)];
    return readFileSync(join(picturesPath, fileTitle));
};
export const happyNorming = (dayOfTheWeek) => {
    const HAPPY_NORMING_FOLDER = 'happy-norming';
    const picturesPath = join(contentPath, HAPPY_NORMING_FOLDER);
    const dotw = String(dayOfTheWeek ?? new Date().getDay());
    const filesTitles = readdirSync(join(picturesPath, dotw));
    const fileTitle = filesTitles[Math.floor(Math.random() * filesTitles.length)];
    return readFileSync(join(picturesPath, dotw, fileTitle));
};
export const parse = async (bufferedOptions, id) => {
    const FOLDER_TITLE = 'parser';
    const INDEX_FILE_TITLE = 'index.cjs';
    const folderPath = join(contentPath, FOLDER_TITLE, String(id ?? Date.now()));
    const filePath = join(folderPath, INDEX_FILE_TITLE);
    mkdirSync(folderPath, { recursive: true });
    writeFileSync(filePath, Buffer.from(bufferedOptions.data));
    const options = await import(filePath);
    rmdirSync(folderPath, { recursive: true });
    return commonParse(options.default.links, options.default.method);
};
