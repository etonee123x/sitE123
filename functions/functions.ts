import('dotenv/config');
import { readdirSync, statSync, readFileSync, mkdirSync, rmdirSync, writeFileSync } from 'fs';
import { commonParse } from '../engine/index.js';
import { Response } from 'express';
import pkg, { JwtPayload } from 'jsonwebtoken';
import musMetaData from 'music-metadata';

interface Metadata {
  bitrate?: number;
  duration: string;
  album?: string;
  artists?: string[];
  bpm?: number;
  year?: number;
}

interface Item {
  name: string;
  type: string;
  ext: string | null;
  url: string;
  numberOfThisExt: number;
  birthTime: Date;
  metadata?: Metadata;
}

interface LinkedFile {
  name: string;
  ext: string;
  url: string;
  metadata?: Metadata;
}

interface NavItem {
  text: string;
  link: string;
}

interface PlaylistItem {
  name: string;
  ext: string;
  url: string;
  thisIsLinkedFile: boolean;
  metadata?: Metadata;
}

interface Paths {
  rel: string;
  abs: string;
  lvlUp: string | null;
}

interface FolderData {
  linkedFile: LinkedFile | string;
  currentDirectory: string;
  filesList: Item[];
  playlist: PlaylistItem[] | null;
  paths: Paths;
  navigation: NavItem[];
}

export const getFolderData = async (contentPath: string, urlPath: string): Promise<FolderData> => {
  let linkedFile: LinkedFile | string;
  let filesList: Item[];
  let playlist: PlaylistItem[] | null;
  let paths: Paths;
  let navigation: NavItem[];
  let currentDirectory: string | undefined;
  let buffer;

  const getMetaDataFields = async (path: string): Promise<Metadata> => {
    const metadata = await musMetaData.parseFile(path);
    return Promise.resolve({
      // native: metadata.native,
      // quality: metadata.quality,
      // common: metadata.common,
      // format: metadata.format,
      bitrate: metadata.format.bitrate,
      duration: Number(metadata.format.duration ?? 0).toFixed(2),
      album: metadata.common.album,
      artists: metadata.common.artists,
      bpm: metadata.common.bpm,
      year: metadata.common.year,
    });
  };

  try {
    if (statSync(`${contentPath}/${urlPath}`).isFile()) {
      // detects full file name in .match[0]
      //        file name without .ext in .match[1]
      //        file extension without "." in .match[2]
      // eslint-disable-next-line no-useless-escape
      const fileMatch = urlPath.match(/([^\/]*)\.([^\/]*)$/);
      const name = fileMatch?.[0] ?? 'unknown title';
      const ext = fileMatch?.[2] ?? 'unknown extension';
      const url = `/${urlPath}`;
      buffer = { name, ext, url };

      // current directory is location.pathname without `.../name.ext`
      if (fileMatch?.[0]) currentDirectory = url.replace(fileMatch?.[0], '');
      linkedFile = buffer;
    } else {
      buffer = 'none';
      currentDirectory = urlPath || '/';
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
  linkedFile = buffer;

  currentDirectory = currentDirectory ?? '/';

  const elementsNumbers = {} as { [key: string]: number };
  filesList = readdirSync(`${contentPath}/${currentDirectory}`, { withFileTypes: true })
    .map((element) => {
      const name = element.name;
      const type = element.isDirectory() ? 'folder' : 'file';
      const ext = element.isDirectory() ? null : element.name.match(/([^.]+)$/g)?.[0] ?? 'unknown extension';
      const url = encodeURI(element.name);
      const number = -~elementsNumbers[ext ?? 'folder'];
      const birthTime = statSync(`${contentPath}/${currentDirectory}/${element.name}`).birthtime;
      return {
        name,
        type,
        ext,
        url,
        numberOfThisExt: number,
        birthTime: birthTime,
      };
    })
    .sort((a, b) => (a.type === 'folder' && b.type === 'file' ? -1 : 0));

  if (typeof linkedFile === 'object') {
    playlist = [];
    for (let i = 0; i < filesList.length; i++) {
      if (filesList[i].ext === 'mp3') {
        playlist.push({
          name: filesList[i].name,
          ext: filesList[i].ext ?? '',
          url: '/' + currentDirectory + filesList[i].url,
          thisIsLinkedFile: filesList[i].name === linkedFile.name,
        });
      }
    }
  } else {
    playlist = null;
  }

  paths = {
    rel: `/${currentDirectory}/`.replace(/\/{2,}/, '/'),
    abs: `/${contentPath}/${currentDirectory}/`.replace(/\/{2,}/, '/'),
    lvlUp: `/${currentDirectory}/`.replace(/\/{2,}/, '/').match(/.*\/(?=.+$)/)?.[0] ?? null,
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
          filesList[i].metadata = await getMetaDataFields(`${contentPath}/${currentDirectory}/${filesList[i].name}`);
        }
      }
  } catch (e) {
    console.log('Не получилось найти метаданные для файлов');
  }
  try {
    if (typeof linkedFile === 'object') {
      linkedFile.metadata = await getMetaDataFields(`${contentPath}/${linkedFile.url}`);
    }
  } catch (e) {
    console.log('Не получилось найти метаданные для привязанного файла');
  }
  try {
    if (playlist) {
      for (const elem of playlist) {
        elem.metadata = await getMetaDataFields(`${contentPath}/${decodeURI(elem.url)}`);
      }
    }
  } catch (e) {
    console.log('Не получилось найти метаданные для плейлиста');
  }

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
  const PATH_TO_PICTURES = './content/funny-animals';
  const files = readdirSync(PATH_TO_PICTURES);

  return readFileSync(`${PATH_TO_PICTURES}/${files[Math.floor(Math.random() * files.length)]}`);
};

export const happyNorming = (dayOfTheWeek?: string) => {
  const DOTW_TITLES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const PATH_TO_PICTURES = './content/happy-norming';

  const dotw = (dayOfTheWeek ?? DOTW_TITLES[new Date().getDay()]).toLowerCase();
  const files = readdirSync(`${PATH_TO_PICTURES}/${dotw}`);
  const file = files[Math.floor(Math.random() * files.length)];

  return readFileSync(`${PATH_TO_PICTURES}/${dotw}/${file}`);
};

export const parse = async (
  bufferedOptions: {
    type: 'Buffer';
    data: number[];
  },
  id?: number | string,
) => {
  const PATH_TO_GENERAL_FOLDER = './content/parser';

  const pathToFolder = `${PATH_TO_GENERAL_FOLDER}/${id ?? Date.now()}`;

  mkdirSync(pathToFolder);
  writeFileSync(`${pathToFolder}/index.cjs`, Buffer.from(bufferedOptions.data));
  const options = await import(`${pathToFolder}/index.cjs`);
  rmdirSync(`${pathToFolder}`, { recursive: true });
  return commonParse(options.default.links, options.default.method);
};
