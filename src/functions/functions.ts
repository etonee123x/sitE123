import { readdirSync, statSync, readFileSync, mkdirSync, rmdirSync, writeFileSync, existsSync } from 'fs';
import { commonParse } from '../engine/index.js';
import { Response } from 'express';
import pkg from 'jsonwebtoken';
import { parseFile } from 'music-metadata';
import { apiUrl } from '../../src/www.js';

import { join, dirname, parse as parsePath, sep } from 'path';

import {
  BaseItem,
  AudioItem,
  FolderItem,
  PictureItem,
  PlaylistItem,
  AudioExts,
  ItemTypes,
  PictureExts,
  Paths,
  FolderData,
  Metadata,
  Item,
  NavItem,
  TokenOrLoginAndPassword,
  LoginAndPassword,
  FileItem,
  LinkedFileItem,
} from '../../includes/types/index.js';

const contentPath = join('.', 'src', 'content');

export const getFolderData = async (_contentPath: string, urlPath: string): Promise<FolderData> => {
  const thePath = join('public', _contentPath, urlPath);
  let linkedFile: LinkedFileItem | null = null;
  let playlist: PlaylistItem[] | null = null;
  let currentDirectory: string | undefined;
  const items: Item[] = [];

  const createFullLink = (path: string) => new URL(path, `http://${apiUrl}`).href;

  const pathToFileURL = (path: string) => path.replaceAll(sep, '/');

  const getMetaDataFields = async (path: string): Promise<Metadata> => {
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

  const stats = statSync(thePath);
  if (stats.isFile()) {
    const { name, ext } = parsePath(urlPath);
    linkedFile = new LinkedFileItem(
      new FileItem({
        name,
        src: createFullLink(`${_contentPath}/${urlPath}`),
        url: urlPath,
        birthtime: stats.birthtime,
      }),
      { ext },
    );
    if (Object.values(AudioExts).includes(ext as AudioExts)) {
      linkedFile.metadata = await getMetaDataFields(thePath);
    }
    playlist = [];
    currentDirectory = dirname(thePath);
  } else {
    currentDirectory = thePath;
  }
  currentDirectory = currentDirectory || '/';

  const elementsNumbers = {} as { [key: string]: number };
  const elements = readdirSync(currentDirectory, { withFileTypes: true });
  for (const element of elements) {
    const filePath = join(currentDirectory, element.name);
    const { ext } = parsePath(filePath);
    const itemBase = new BaseItem({
      name: element.name,
      url: encodeURI(element.name),
      src: createFullLink(filePath),
      numberOfThisExt: -~elementsNumbers[ext ?? ItemTypes.FOLDER],
      birthtime: statSync(filePath).birthtime,
    });
    if (!element.isDirectory()) {
      const fileItem = new FileItem(itemBase);
      if (Object.values(AudioExts).includes(ext as AudioExts)) {
        const metadata = await getMetaDataFields(filePath);
        items.push(new AudioItem(fileItem, { ext: ext as AudioExts, metadata }));
        continue;
      }
      if (Object.values(PictureExts).includes(ext as PictureExts)) {
        items.push(new PictureItem(fileItem, { ext: ext as PictureExts }));
        continue;
      }
    }
    items.push(new FolderItem(itemBase));
  }
  items.sort((a, b) => (a.type === ItemTypes.FOLDER && b.type === ItemTypes.FILE ? -1 : 0));

  if (linkedFile) {
    (items.filter(item => item instanceof AudioItem) as AudioItem[])
      .forEach(file => playlist?.push(new PlaylistItem(file, { thisIsLinkedFile: file.name === linkedFile?.name })));
  }

  const paths: Paths = {
    abs: pathToFileURL(currentDirectory),
    rel: urlPath,
    lvlUp: dirname(urlPath),
  };

  const navigation = [{ text: 'root', link: '/' }] as NavItem[];
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
  const DOTW_TITLES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const picturesPath = join(contentPath, HAPPY_NORMING_FOLDER);

  const dotw = (dayOfTheWeek ?? DOTW_TITLES[new Date().getDay()]).toLowerCase();
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
  const INDEX_FILE_TITLE = 'index.cjs';

  const folderPath = join(contentPath, FOLDER_TITLE, String(id ?? Date.now()));
  const filePath = join(folderPath, INDEX_FILE_TITLE);

  mkdirSync(folderPath, { recursive: true });
  writeFileSync(filePath, Buffer.from(bufferedOptions.data));
  const options = await import(filePath);
  rmdirSync(folderPath, { recursive: true });
  return commonParse(options.default.links, options.default.method);
};
