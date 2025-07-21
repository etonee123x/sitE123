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
import { type Id } from '@etonee123x/shared/helpers/id';
import { type Post } from '@etonee123x/shared/types/blog';
import { throwError } from '@etonee123x/shared/utils/throwError';
import {
  type ForPost,
  type ForPut,
  type ForPatch,
  type PaginationMeta,
  type WithMeta,
  type WithIsEnd,
  type WithDatabaseMeta,
} from '@etonee123x/shared/types/database';
import { createError } from '@etonee123x/shared/helpers/error';
import { jsonParse } from '@etonee123x/shared/utils/jsonParse';
import { format } from 'date-fns';
import slugify from 'slugify';
import busboy from 'busboy';
import { formFullApiUrl } from '@/helpers/fullApiUrl';
import { isRealObject } from '@etonee123x/shared';
import { ro } from 'date-fns/locale';
import { isNumber } from '@etonee123x/shared';

interface TableNameToType {
  posts: Post;
}

export class DatabaseController {
  static readonly pathDataBase = join(process.cwd(), 'database');
}

class TableReaderWriter<
  TTableTiltle extends keyof TableNameToType,
  const TEntity extends TableNameToType[TTableTiltle] = TableNameToType[TTableTiltle],
  TEntityRead = TEntity,
  TEntityWrite = TEntity,
> {
  protected readonly absolutePath: string;
  constructor(tableTitle: TTableTiltle) {
    this.absolutePath = join(DatabaseController.pathDataBase, `${tableTitle}.json`);

    if (!existsSync(this.absolutePath)) {
      mkdirSync(dirname(this.absolutePath), { recursive: true });
      writeFileSync(this.absolutePath, JSON.stringify([]));
    }
  }

  read(): Array<TEntityRead> {
    return jsonParse.unsafe<Array<TEntityRead>>(readFileSync(this.absolutePath, { encoding: 'utf-8' }));
  }

  write(rows: Array<TEntityWrite>): void {
    writeFileSync(this.absolutePath, JSON.stringify(rows));
  }
}

export class TableRestController<
  const TTableTiltle extends keyof TableNameToType,
  const TEntity extends TableNameToType[TTableTiltle],
  const TRow extends TEntity & WithDatabaseMeta = TEntity & WithDatabaseMeta,
> extends DatabaseController {
  private readonly tableReaderWriter: TableReaderWriter<TTableTiltle, TEntity, TRow>;

  constructor(tableTitle: TTableTiltle) {
    super();

    this.tableReaderWriter = new TableReaderWriter<TTableTiltle, TEntity, TRow>(tableTitle);
  }

  get(paginationMeta: Partial<PaginationMeta> = {}): WithMeta<WithIsEnd> & { rows: Array<TRow> } {
    const { perPage = 10, page = 0 } = paginationMeta;

    const rows = this.tableReaderWriter.read();

    const lastRowIndex = rows.length - 1;

    const indexInitial = page * perPage;
    const indexLast = indexInitial + perPage;

    const isEnd = indexLast >= lastRowIndex;

    return {
      _meta: {
        isEnd,
      },
      rows: rows.slice(indexInitial, indexLast),
    };
  }

  getById(id: Id): TRow {
    return this.tableReaderWriter.read()[this.getIndexById(id)] ?? throwError('Не найдено.');
  }

  post(entity: ForPost<TEntity>): TRow {
    const createdAt = TableRestController.getCreatedAt();

    const row = {
      ...entity,
      _meta: {
        id: TableRestController.generateId(),
        createdAt,
        updatedAt: createdAt,
      },
    } as TRow;

    this.tableReaderWriter.write([row, ...this.tableReaderWriter.read()]);

    return row;
  }

  put(id: Id, row: ForPut<TEntity>): TRow {
    const index = this.getIndexById(id);
    const _row = {
      ...row,
      _meta: {
        ...row._meta,
        updatedAt: TableRestController.getUpdatedAt(),
      },
    } as TRow;

    this.tableReaderWriter.write(this.tableReaderWriter.read().toSpliced(index, 1, _row));

    return _row;
  }

  patch(id: Id, row: ForPatch<TEntity>): TRow {
    const index = this.getIndexById(id);

    const rows = this.tableReaderWriter.read();

    const rowOld = rows[index] ?? throwError('Не найдено.');

    const _row = {
      ...rowOld,
      ...row,
      _meta: {
        ...rowOld._meta,
        updatedAt: TableRestController.getUpdatedAt(),
      },
    } as TRow;

    this.tableReaderWriter.write(rows.toSpliced(index, 1, _row));

    return _row;
  }

  delete(id: Id): TRow {
    const index = this.getIndexById(id);

    const rows = this.tableReaderWriter.read();

    const row = rows[index];

    this.tableReaderWriter.write(rows.toSpliced(index, 1));

    return row ?? throwError('Не найдено.');
  }

  private getIndexById(id: Id): number {
    const rows = this.tableReaderWriter.read();

    const index = rows.findIndex(({ _meta }) => areIdsEqual(id, _meta.id));

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

  private static generateId(): Id {
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

export class TableTransformController extends DatabaseController {
  transformPostsToNewMetaFormat(): void {
    const tableReaderWriter = new TableReaderWriter<'posts', Post, Post, Post & WithDatabaseMeta>('posts');

    tableReaderWriter.write(
      tableReaderWriter.read().map((row) => {
        if (
          !(
            isRealObject(row) &&
            'id' in row &&
            'updatedAt' in row &&
            isNumber(row.updatedAt) &&
            'createdAt' in row &&
            isNumber(row.createdAt)
          )
        ) {
          this.throwError();
        }

        return {
          ...row,
          _meta: {
            id: toId(String(row.id)),
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          },
        };
      }),
    );
  }

  private throwError(): never {
    throw createError({
      data: 'An error occurred while transforming the database table.',
      statusCode: 500,
    });
  }
}
