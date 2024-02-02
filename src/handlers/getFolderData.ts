import { access } from 'fs/promises';
import { readdirSync, statSync } from 'fs';
import { parseFile } from 'music-metadata';
import { join, dirname, parse as parsePath, sep } from 'path';

import {
  ItemBase,
  ItemAudio,
  ItemFolder,
  ItemPicture,
  ITEM_TYPE,
  ItemFile,
  type FolderData,
  type Item,
  type NavItem,
} from '@includes/types';

import { createError, extIsAudio, extIsPicture, isTruthy } from '@includes/types/utils';
import { getFullApiUrl } from '@/utils';

const STATIC_CONTENT_FOLDER = 'content';
const PROHIBITED_ELEMENTS_NAMES = ['.git'];

export const getFolderData = async (urlPath: string): Promise<FolderData> => {
  const fullApiUrl = getFullApiUrl();

  const makeInnerPath = (path: string) => join(STATIC_CONTENT_FOLDER, path);
  const createFullLink = (path: string) => decodeURI(new URL(path, fullApiUrl).href);
  const pathToFileURL = (path: string) => path.replace(new RegExp(`\\${sep}`, 'g'), '/');
  const getMetaDataFields = async (path: string) => await parseFile(path)
    .then(({ common: { album, artists = [], bpm, year }, format: { bitrate, duration } }) => ({
      bitrate: bitrate && bitrate / 1000,
      duration: Number((duration ?? 0).toFixed(2)),
      album,
      artists,
      bpm,
      year,
    }));

  let linkedFile: ItemFile | null = null;
  let currentDirectory: string;

  const outerPath = join(urlPath);
  const innerPath = makeInnerPath(outerPath);

  await access(innerPath).catch(() => {
    throw createError({ data: 'Not Found', statusCode: 404 });
  });

  const stats = statSync(innerPath);
  if (stats.isFile()) {
    currentDirectory = dirname(outerPath);
    const { name, ext } = parsePath(urlPath);
    const fullName = [name, ext].join('');
    const outerFilePath = join(currentDirectory, fullName);
    const baseItem = new ItemBase({
      name: fullName,
      url: pathToFileURL(outerFilePath),
      src: createFullLink(join(STATIC_CONTENT_FOLDER, outerFilePath)),
      birthtime: statSync(makeInnerPath(outerFilePath)).birthtime.toISOString(),
    });

    if (extIsAudio(ext)) {
      linkedFile = new ItemAudio(new ItemFile(baseItem, ext), await getMetaDataFields(innerPath));
    }
  } else {
    currentDirectory = outerPath;
  }
  currentDirectory = currentDirectory || '/';

  const elementsNumbers: Record<string, number> = {};
  const items = await readdirSync(makeInnerPath(currentDirectory), { withFileTypes: true })
    .reduce<Promise<Array<Item>>>(async (promiseAcc, element) => {
      if (PROHIBITED_ELEMENTS_NAMES.includes(element.name)) {
        return promiseAcc;
      }

      const acc = await promiseAcc;

      const outerFilePath = join(currentDirectory, element.name);
      const innerFilePath = makeInnerPath(outerFilePath);
      const { ext } = parsePath(innerFilePath);
      const baseItem = new ItemBase({
        name: element.name,
        url: pathToFileURL(join(currentDirectory, element.name)),
        src: createFullLink(join(STATIC_CONTENT_FOLDER, outerFilePath)),
        numberOfThisExt: -~elementsNumbers[ext ?? ITEM_TYPE.FOLDER],
        birthtime: statSync(innerFilePath).birthtime.toISOString(),
      });

      if (element.isDirectory()) {
        return [...acc, new ItemFolder(baseItem)];
      }

      if (extIsAudio(ext)) {
        return [
          ...acc,
          new ItemAudio(new ItemFile(baseItem, ext), await getMetaDataFields(innerFilePath)),
        ];
      }

      if (extIsPicture(ext)) {
        return [
          ...acc,
          new ItemPicture(new ItemFile(baseItem, ext)),
        ];
      }

      return [...acc, new ItemFile(baseItem, ext)];
    }, Promise.resolve([]))
    .then(_items => _items.sort((a, b) => -Number(a.type === ITEM_TYPE.FOLDER && b.type === ITEM_TYPE.FILE)));

  currentDirectory = pathToFileURL(currentDirectory);
  const lvlUp = currentDirectory === '/'
    ? null
    : dirname(currentDirectory);

  const navigation = currentDirectory
    .split('/')
    .filter(isTruthy)
    .reduce<NavItem[]>(
      (acc, text, index) => (acc.push({ text, link: acc[index].link + text + '/' }), acc),
      [{ text: 'root', link: '/' }],
    );

  return {
    linkedFile,
    items,
    lvlUp,
    navigation,
  };
};
