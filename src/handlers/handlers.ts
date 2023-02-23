import { readdirSync, statSync, readFileSync, mkdirSync, rmdirSync, writeFileSync, existsSync } from 'fs';
import { Response } from 'express';
import pkg from 'jsonwebtoken';
import { parseFile } from 'music-metadata';
import { join, dirname, parse as parsePath, sep } from 'path';
import { fileURLToPath } from 'url';

import { fullApiUrl } from '../app.js';
import { commonParse } from '../engine/index.js';

import {
  BaseItem,
  AudioItem,
  FolderItem,
  PictureItem,
  AUDIO_EXT,
  ITEM_TYPE,
  PICTURE_EXT,
  FolderData,
  Item,
  NavItem,
  TokenOrLoginAndPassword,
  LoginAndPassword,
  FileItem,
} from '../../includes/types/index.js';
import type { ReqAfterMidd } from '../types/index.js';

const STATIC_CONTENT_FOLDER = 'content';
const CONTENT_FOLDER = 'content';
const PROHIBITED_ELEMENTS_NAMES = ['.git'];

const contentPath = join('.', 'src', CONTENT_FOLDER);

export const getFolderData = async (urlPath: string): Promise<FolderData> => {
  const makeInnerPath = (path: string) => join(STATIC_CONTENT_FOLDER, path);
  const createFullLink = (path: string) => decodeURI(new URL(path, fullApiUrl).href);
  const pathToFileURL = (path: string) => path.replace(new RegExp(`\\${sep}`, 'g'), '/');
  const getMetaDataFields = async (path: string) => await parseFile(path).then(metadata => ({
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
  }));

  let linkedFile: Item | null = null;
  let currentDirectory: string;
  const items: Item[] = [];

  const outerPath = join(urlPath);
  const innerPath = makeInnerPath(outerPath);

  const stats = statSync(innerPath);
  if (stats.isFile()) {
    currentDirectory = dirname(outerPath);
    const { name, ext } = parsePath(urlPath);
    const fullName = name + ext;
    const outerFilePath = join(currentDirectory, fullName);
    const baseItem = new BaseItem({
      name: fullName,
      url: pathToFileURL(outerFilePath),
      src: createFullLink(join(STATIC_CONTENT_FOLDER, outerFilePath)),
      birthtime: statSync(makeInnerPath(outerFilePath)).birthtime.toISOString(),
    });
    if (Object.values(AUDIO_EXT).includes(ext as AUDIO_EXT)) {
      const metadata = await getMetaDataFields(innerPath);
      linkedFile = new AudioItem(new FileItem(baseItem), { metadata, ext: ext as AUDIO_EXT });
    }
  } else {
    currentDirectory = outerPath;
  }
  currentDirectory = currentDirectory || '/';

  const elementsNumbers: { [key: string]: number } = {};
  const elements = readdirSync(makeInnerPath(currentDirectory), { withFileTypes: true });
  for (const element of elements) {
    if (PROHIBITED_ELEMENTS_NAMES.includes(element.name)) {
      continue;
    }

    const outerFilePath = join(currentDirectory, element.name);
    const innerFilePath = makeInnerPath(outerFilePath);
    const { ext } = parsePath(innerFilePath);
    const baseItem = new BaseItem({
      name: element.name,
      url: pathToFileURL(join(currentDirectory, element.name)),
      src: createFullLink(join(STATIC_CONTENT_FOLDER, outerFilePath)),
      numberOfThisExt: -~elementsNumbers[ext ?? ITEM_TYPE.FOLDER],
      birthtime: statSync(innerFilePath).birthtime.toISOString(),
    });
    if (!element.isDirectory()) {
      const fileItem = new FileItem(baseItem);
      if (Object.values(AUDIO_EXT).includes(ext as AUDIO_EXT)) {
        const metadata = await getMetaDataFields(innerFilePath);
        items.push(new AudioItem(fileItem, { ext: ext as AUDIO_EXT, metadata }));
        continue;
      }
      if (Object.values(PICTURE_EXT).includes(ext as PICTURE_EXT)) {
        items.push(new PictureItem(fileItem, { ext: ext as PICTURE_EXT }));
        continue;
      }
    }
    items.push(new FolderItem(baseItem));
  }
  items.sort((a, b) => -Number(a.type === ITEM_TYPE.FOLDER && b.type === ITEM_TYPE.FILE));

  currentDirectory = pathToFileURL(currentDirectory);
  const lvlUp = currentDirectory === '/'
    ? null
    : dirname(currentDirectory);

  const navigation = currentDirectory
    .split('/')
    .filter(Boolean)
    .reduce<NavItem[]>(
      (acc, text, index) => (acc.push({ text, link: acc[index].link + text + '/' }), acc)
      , [{ text: 'root', link: '/' }],
    );

  return {
    linkedFile,
    items,
    lvlUp,
    navigation,
  };
};

export const tryAuth = (
  res: Response,
  tokenOrLoginAndPassword: TokenOrLoginAndPassword,
) => {
  const DEFAULT_KEY = 'DEFAULT_KEY';
  const key = process.env.THE_KEY ?? DEFAULT_KEY;
  const verifyLoginAndPassword = ({ login, password }: LoginAndPassword) => password === process.env[login];

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
  if (!existsSync(picturesPath)) return;

  const filesTitles = readdirSync(picturesPath);
  const fileTitle = filesTitles[Math.floor(Math.random() * filesTitles.length)];

  return readFileSync(join(picturesPath, fileTitle));
};

export const happyNorming = (dayOfTheWeek?: string) => {
  const HAPPY_NORMING_FOLDER = 'happy-norming';
  const picturesPath = join(contentPath, HAPPY_NORMING_FOLDER);

  const dotw = String(dayOfTheWeek ?? new Date().getDay());
  const filesTitles = readdirSync(join(picturesPath, dotw));
  const fileTitle = filesTitles[Math.floor(Math.random() * filesTitles.length)];

  return readFileSync(join(picturesPath, dotw, fileTitle));
};

export const parse = async (
  bufferedOptions: {
    type: 'Buffer';
    data: number[];
  },
  id?: number | string,
) => {
  const FOLDER_TITLE = 'parser';
  const INDEX_FILE_TITLE = 'index.js';

  const folderPath = join(contentPath, FOLDER_TITLE, String(id ?? Date.now()));
  const filePath = join(folderPath, INDEX_FILE_TITLE);

  mkdirSync(folderPath, { recursive: true });
  writeFileSync(filePath, Buffer.from(bufferedOptions.data));
  const options = await import(`../../${filePath}`);
  rmdirSync(folderPath, { recursive: true });
  return commonParse(options.default.links, options.default.method);
};

export const resolveMainRouteReq = (req: ReqAfterMidd, res: Response) => {
  enum PROJECT_NAME {
    CELLULAR_AUTOMATON = 'cellular-automaton',
    MAIN_SITE = 'main-site'
  }

  const ASSETS_EXTS = ['.css', '.js'];

  const projectsDirPath = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'projects');

  const refererPathname = new URL(
    req.headers.referer
    ?? `${req.protocol}://${req.get('host')}${req.path}`,
  ).pathname.substring(1);

  let projectPath: string;
  switch (true) {
    case refererPathname.startsWith(PROJECT_NAME.CELLULAR_AUTOMATON):
      projectPath = join(projectsDirPath, PROJECT_NAME.CELLULAR_AUTOMATON);
      break;
    default:
      projectPath = join(projectsDirPath, PROJECT_NAME.MAIN_SITE);
  }

  const fileToSendVariant = ASSETS_EXTS.some(ext => req.path.includes(ext)) ? req.path : 'index.html';

  return res.sendFile(join(projectPath, fileToSendVariant));
};
