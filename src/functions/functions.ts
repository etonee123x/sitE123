import { readdirSync, statSync, readFileSync, mkdirSync, rmdirSync, writeFileSync, existsSync } from 'fs';
import { commonParse } from '../engine/index.js';
import { Response } from 'express';
import pkg, { JwtPayload } from 'jsonwebtoken';
import musMetaData from 'music-metadata';
import { apiUrl } from '../../src/www.js';

import { join } from 'path';

import type {
  Metadata,
  Item,
  LinkedFile,
  NavItem,
  PlaylistItem,
  Paths,
  FolderData,
  ItemAudio,
} from '@types';

import('dotenv/config');

const contentPath = join('.', 'src', 'content');

export const getFolderData = async (contentPath: string, urlPath: string): Promise<FolderData> => {
  let linkedFile: LinkedFile | null;
  let filesList: Item[];
  let playlist: PlaylistItem[] | null;
  let currentDirectory: string | undefined;
  let buffer;

  const getSlashedCurrentDirectory = () => {
    if (currentDirectory?.startsWith('/') && currentDirectory.endsWith('/')) return currentDirectory;
    if (currentDirectory === '/') return '/';
    if (currentDirectory?.startsWith('/')) return `${currentDirectory}/`;
    if (currentDirectory?.endsWith('/')) return `/${currentDirectory}`;
    return '/';
  };

  const getMetaDataFields = async (path: string): Promise<Metadata> => {
    const metadata = await musMetaData.parseFile(path);
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

  try {
    if (statSync(`public/${contentPath}${urlPath}`).isFile()) {
      // detects full file name in .match[0]
      //        file name without .ext in .match[1]
      //        file extension without "." in .match[2]
      const fileMatch = urlPath.match(/([^/]*)\.([^/]*)$/);
      const name = fileMatch?.[0] ?? 'unknown title';
      const ext = fileMatch?.[2] ?? 'unknown extension';
      const src = `http://${apiUrl}/${contentPath}${urlPath}`;
      buffer = { src, name, ext, url: urlPath };

      // current directory is location.pathname without `.../name.ext`
      if (fileMatch?.[0]) currentDirectory = urlPath.replace(fileMatch?.[0], '');
      linkedFile = buffer;
    } else {
      buffer = null;
      currentDirectory = urlPath || '/';
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
  linkedFile = buffer;

  currentDirectory = currentDirectory || '/';

  const elementsNumbers = {} as { [key: string]: number };
  filesList = readdirSync(`public/${contentPath}/${getSlashedCurrentDirectory()}`, { withFileTypes: true })
    .map((element) => {
      const name = element.name;
      const type = element.isDirectory() ? 'folder' : 'file';
      const ext = element.isDirectory() ? null : element.name.match(/([^.]+)$/g)?.[0] ?? 'unknown extension';
      const url = encodeURI(element.name);
      const src = `http://${apiUrl}/content${getSlashedCurrentDirectory()}${encodeURI(element.name)}`;
      const number = -~elementsNumbers[ext ?? 'folder'];
      const birthTime = statSync(`public/${contentPath}${getSlashedCurrentDirectory()}${element.name}`).birthtime;
      return {
        name,
        type,
        ext,
        url,
        src,
        numberOfThisExt: number,
        birthTime,
      };
    })
    .sort((a, b) => (a.type === 'folder' && b.type === 'file' ? -1 : 0)) as Item[];

  if (linkedFile) {
    playlist = [];
    for (let i = 0; i < filesList.length; i++) {
      if (filesList[i].ext === 'mp3') {
        playlist.push({
          name: filesList[i].name,
          ext: filesList[i].ext ?? '',
          src: `http://${apiUrl}/content${getSlashedCurrentDirectory()}${filesList[i].url}`,
          url: `${getSlashedCurrentDirectory()}` + filesList[i].url,
          thisIsLinkedFile: filesList[i].name === linkedFile?.name,
        });
      }
    }
  } else {
    playlist = null;
  }

  const paths: Paths = {
    rel: getSlashedCurrentDirectory(),
    abs: `/${contentPath}${getSlashedCurrentDirectory()}`,
    lvlUp: getSlashedCurrentDirectory().match(/.*\/(?=.+$)/)?.[0] ?? null,
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
  const navigation: NavItem[] = buffer;

  try {
    if (filesList) {
      for (let i = 0; i < filesList.length; i++) {
        if (filesList[i].ext === 'mp3') {
          (filesList[i] as ItemAudio).metadata = await getMetaDataFields(
            `public/${contentPath}${getSlashedCurrentDirectory()}${filesList[i].name}`,
          );
        }
      }
    }
  } catch (e) {
    console.error('Не получилось найти метаданные для файлов');
  }
  try {
    if (linkedFile) {
      linkedFile.metadata = await getMetaDataFields(`public/${contentPath}/${linkedFile.url}`);
    }
  } catch (e) {
    console.error('Не получилось найти метаданные для привязанного файла');
  }
  try {
    if (playlist) {
      for (const elem of playlist) {
        elem.metadata = await getMetaDataFields(`public/${contentPath}/${decodeURI(elem.url)}`);
      }
    }
  } catch (e) {
    console.error('Не получилось найти метаданные для плейлиста');
  }
  filesList = filesList.map((element) => ({
    ...element,
    url: `${element.url.startsWith('/') ? '' : '/'}${element.url}`,
  }));

  return {
    linkedFile,
    filesList,
    playlist,
    paths,
    navigation,
    currentDirectory,
  };
};

export const tryAuth = (
  res: Response,
  { login, password, token }: { login?: string; password?: string; token?: string },
) => {
  const DEFAULT_KEY = 'DEFAULT_KEY';
  const { sign, verify } = pkg;
  let verifyIsLost;

  const getLoginByToken = (token: string) => {
    let login;
    verify(token, process.env.THE_KEY ?? DEFAULT_KEY, (error, pld) => {
      if (error) return (verifyIsLost = true);
      login = (pld as JwtPayload)?.login;
    });
    return login;
  };

  if (token) {
    login = getLoginByToken(token);
    if (!verifyIsLost) return res.json(token);
    return res.sendStatus(403);
  } else {
    if (!(login && password)) return res.sendStatus(403);
    if (password === process.env[login]) return res.json(sign({ login }, process.env.THE_KEY ?? DEFAULT_KEY));
    return res.sendStatus(403);
  }
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
