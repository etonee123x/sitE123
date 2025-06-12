import { access } from 'fs/promises';
import { readdirSync, statSync } from 'fs';
import { parseFile } from 'music-metadata';
import { join, dirname, parse as parsePath, sep } from 'path';

import { formFullApiUrl } from '@/helpers/fullApiUrl';

import { Item, NavigationItem, FolderData, ITEM_TYPE } from '@etonee123x/shared/dist/types/folderData';
import {
  isExtAudio,
  isExtImage,
  isExtVideo,
  ItemAudio,
  ItemBase,
  ItemFile,
  ItemFolder,
  ItemImage,
  ItemVideo,
} from '@etonee123x/shared/dist/helpers/folderData';
import { isNil } from '@etonee123x/shared/dist/utils/isNil';
import { createError } from '@etonee123x/shared/dist/helpers/error';

const STATIC_CONTENT_FOLDER = 'content';
const PROHIBITED_ELEMENTS_NAMES = ['.git'];

export const handler = async (urlPath: string): Promise<FolderData> => {
  const makeInnerPath = (path: string) => join(STATIC_CONTENT_FOLDER, path);
  const pathToFileURL = (path: string) => path.replace(new RegExp(`\\${sep}`, 'g'), '/');
  const getMetaDataFields = async (path: string) =>
    await parseFile(path).then(({ common: { album, artists = [], bpm, year }, format: { bitrate, duration } }) => ({
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
      src: formFullApiUrl(join(STATIC_CONTENT_FOLDER, outerFilePath)),
      birthtime: statSync(makeInnerPath(outerFilePath)).birthtime.toISOString(),
    });

    if (isExtAudio(ext)) {
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

      let numberOfThisExt = elementsNumbers[ext ?? ITEM_TYPE.FOLDER];

      if (isNil(numberOfThisExt)) {
        elementsNumbers[ext ?? ITEM_TYPE.FOLDER] = 1;
        numberOfThisExt = 1;
      }

      const baseItem = new ItemBase({
        name: element.name,
        url: pathToFileURL(join(currentDirectory, element.name)),
        src: formFullApiUrl(join(STATIC_CONTENT_FOLDER, outerFilePath)),
        numberOfThisExt,
        birthtime: statSync(innerFilePath).birthtime.toISOString(),
      });

      if (element.isDirectory()) {
        return [...acc, new ItemFolder(baseItem)];
      }

      if (isExtAudio(ext)) {
        return [...acc, new ItemAudio(new ItemFile(baseItem, ext), await getMetaDataFields(innerFilePath))];
      }

      if (isExtImage(ext)) {
        return [...acc, new ItemImage(new ItemFile(baseItem, ext))];
      }

      if (isExtVideo(ext)) {
        return [...acc, new ItemVideo(new ItemFile(baseItem, ext))];
      }

      return [...acc, new ItemFile(baseItem, ext)];
    }, Promise.resolve([]))
    .then((_items) => _items.sort((a, b) => -Number(a.type === ITEM_TYPE.FOLDER && b.type === ITEM_TYPE.FILE)));

  currentDirectory = pathToFileURL(currentDirectory);
  const lvlUp = currentDirectory === '/' ? null : dirname(currentDirectory);

  const navigationItems = currentDirectory
    .split('/')
    .filter(Boolean)
    .reduce<Array<NavigationItem>>(
      (acc, text, index) => (acc.push({ text, link: acc[index]?.link + text + '/' }), acc),
      [{ text: 'root', link: '/' }],
    );

  return {
    linkedFile,
    items,
    lvlUp,
    navigationItems,
  };
};
