import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  createWriteStream,
  readdirSync,
  rmSync,
  statSync,
} from 'fs';
import { dirname, join, parse } from 'path';
import { filesize } from 'filesize';
import { randomUUID } from 'crypto';

import { toId, areIdsEqual } from '@etonee123x/shared/helpers/id';
import { type Id } from '@etonee123x/shared/types/id';
import { type Post } from '@etonee123x/shared/types/blog';
import { throwError } from '@etonee123x/shared/utils/throwError';
import {
  type ForPost,
  type ForPut,
  type ForPatch,
  type PaginationMeta,
  type WithMeta,
  type WithIsEnd,
} from '@etonee123x/shared/types/database';
import { createError } from '@etonee123x/shared/helpers/error';
import { jsonParse } from '@etonee123x/shared/utils/jsonParse';
import { format } from 'date-fns';
import slugify from 'slugify';
import busboy from 'busboy';
import { formFullApiUrl } from '@/helpers/fullApiUrl';

interface TableNameToType {
  posts: Post;
}

export class DatabaseController {
  static pathDataBase = join(process.cwd(), 'database');
}

export class TableController<
  TTableTiltle extends keyof TableNameToType,
  T extends TableNameToType[TTableTiltle],
> extends DatabaseController {
  private rows: Array<T> = [];
  private absolutePath: string;

  constructor(tableTitle: TTableTiltle) {
    super();
    this.absolutePath = join(DatabaseController.pathDataBase, `${tableTitle}.json`);

    if (!existsSync(this.absolutePath)) {
      mkdirSync(dirname(this.absolutePath), { recursive: true });
      writeFileSync(this.absolutePath, JSON.stringify([]));
    }

    this.rows = jsonParse.unsafe<Array<T>>(readFileSync(this.absolutePath, { encoding: 'utf-8' }));
  }

  get(
    { perPage = 10, page = 0 }: Partial<PaginationMeta> = { perPage: 10, page: 0 },
  ): WithMeta<WithIsEnd> & { data: Array<T> } {
    const lastRowIndex = this.rows.length - 1;

    const indexInitial = page * perPage;
    const indexLast = indexInitial + perPage;

    const isEnd = indexLast >= lastRowIndex;

    return {
      meta: {
        isEnd,
      },
      data: this.rows.slice(indexInitial, indexLast),
    };
  }

  getById(id: Id): T {
    return this.rows[this.getIndexById(id)] ?? throwError('Не найдено.');
  }

  post(row: ForPost<T>): T {
    const createdAt = TableController.getCreatedAt();

    const _row = {
      ...row,
      id: TableController.getId(),
      createdAt,
      updatedAt: createdAt,
    } as T;

    this.rows = [_row, ...this.rows];

    this.save();

    return _row;
  }

  put(id: Id, row: ForPut<T>): T {
    const index = this.getIndexById(id);
    const _row = { ...row, updatedAt: TableController.getUpdatedAt() } as T;

    this.rows = this.rows.toSpliced(index, 1, _row);
    this.save();

    return _row;
  }

  patch(id: Id, row: ForPatch<T>): T {
    const index = this.getIndexById(id);

    const _row = { ...this.rows[index], ...row, updatedAt: TableController.getUpdatedAt() } as T;

    this.rows = this.rows.toSpliced(index, 1, _row);
    this.save();

    return _row;
  }

  delete(id: Id): T {
    const index = this.getIndexById(id);

    const row = this.rows[index];

    this.rows = this.rows.toSpliced(index, 1);
    this.save();

    return row ?? throwError('Не найдено.');
  }

  private save(): void {
    writeFileSync(this.absolutePath, JSON.stringify(this.rows));
  }

  private getIndexById(id: Id): number {
    const index = this.rows.findIndex(({ id: _id }) => areIdsEqual(id, _id));

    if (index === -1) {
      throw createError({
        data: 'Row not found',
        statusCode: 404,
      });
    }

    return index;
  }

  private static getUpdatedAt(): number {
    return Date.now();
  }

  private static getCreatedAt(): number {
    return Date.now();
  }

  private static getId(): Id {
    return toId(Date.now());
  }
}

export class UploadController extends DatabaseController {
  static PATH_UPLOADS = 'uploads';
  static IS_ADDING_DATE_TIME_ENABLED = false;

  static pathUploadsFull = join(DatabaseController.pathDataBase, UploadController.PATH_UPLOADS);

  static uploadFile(...[, stream, { filename }]: Parameters<busboy.BusboyEvents['file']>): string {
    if (!existsSync(UploadController.pathUploadsFull)) {
      mkdirSync(UploadController.pathUploadsFull, { recursive: true });
    }

    const addDateTime = (fileName: string) => [fileName, format(new Date(), 'yyyy-MM-dd_HH-mm-ss')].join('_');
    const addHash = (fileName: string) => [fileName, randomUUID().split('-', 1)[0]].join('_');

    const { name, ext } = parse(Buffer.from(filename, 'latin1').toString('utf8'));

    let fileName = slugify(name, { lower: true, strict: true, locale: 'ru' });

    if (UploadController.IS_ADDING_DATE_TIME_ENABLED) {
      fileName = addDateTime(fileName);
    }

    fileName = addHash(fileName);

    fileName = [fileName, ext].join('');

    stream.pipe(createWriteStream(join(UploadController.pathUploadsFull, fileName)));

    return formFullApiUrl([UploadController.PATH_UPLOADS, fileName].join('/'));
  }

  static clearUnusedUploads() {
    const deepExists = (obj: object, query: string): boolean =>
      Object.values(obj ?? {}).some((v) => (typeof v === 'object' ? deepExists(v, query) : v.includes?.(query)));

    const uploadsNames = readdirSync(UploadController.pathUploadsFull);

    const tables = readdirSync(DatabaseController.pathDataBase, { withFileTypes: true })
      .filter((databaseItem) => databaseItem.isFile())
      .map((table) => JSON.parse(String(readFileSync(join(table.path, table.name)))));

    let clearedSpace = 0;

    uploadsNames.forEach((uploadName) => {
      if (deepExists(tables, uploadName)) {
        return;
      }

      const path = join(UploadController.pathUploadsFull, uploadName);

      clearedSpace += statSync(path).size;

      rmSync(path);
    });

    if (clearedSpace > 0) {
      console.info('Cleared space:', filesize(clearedSpace));
    } else {
      console.info('Nothing to clear!');
    }
  }
}
