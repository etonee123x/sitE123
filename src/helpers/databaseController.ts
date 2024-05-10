import { existsSync, mkdirSync, readFileSync, writeFileSync, createWriteStream } from 'fs';
import { dirname, join, extname } from 'path';

import {
  toId,
  type Id,
  createErrorClient,
  areIdsEqual,
  type Post,
  type ForPost,
  type ForPut,
  type ForPatch,
  type PaginationMeta,
  type WithMeta,
  type WithIsEnd,
} from '@shared/src/types';
import { jsonParse, arrayToSpliced } from '@shared/src/utils';
import busboy from 'busboy';
import { randomUUID } from 'crypto';
import { createFullLink } from '@/utils';

interface TableNameToType {
  'posts': Post
}

export class DatabaseController {
  protected static pathDataBase = join(process.cwd(), 'database');
}

export class TableController<TTableTiltle extends keyof TableNameToType, T extends TableNameToType[TTableTiltle]>
  extends DatabaseController {
  private rows: Array<T> = [];
  private absolutePath: string;

  constructor (tableTitle: TTableTiltle) {
    super();
    this.absolutePath = join(DatabaseController.pathDataBase, `${tableTitle}.json`);

    if (!existsSync(this.absolutePath)) {
      mkdirSync(dirname(this.absolutePath), { recursive: true });
      writeFileSync(this.absolutePath, JSON.stringify([]));
    }

    this.rows = jsonParse<Array<T>>(readFileSync(this.absolutePath, { encoding: 'utf-8' }));
  }

  get ({ perPage = 10, page = 0 }: Partial<PaginationMeta> = { perPage: 10, page: 0 }):
    WithMeta<WithIsEnd> & { data: Array<T> } {
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

  getById (id: Id): T {
    return this.rows[this.getIndexById(id)];
  }

  post (row: ForPost<T>): T {
    const _row = {
      ...row,
      id: TableController.getId(),
      createdAt: TableController.getCreatedAt(),
      updatedAt: TableController.getUpdatedAt(),
    } as T;
    this.rows = [_row, ...this.rows];
    this.save();

    return _row;
  }

  put (id: Id, row: ForPut<T>): T {
    const index = this.getIndexById(id);
    const _row = { ...row, updatedAt: TableController.getUpdatedAt() } as T;

    this.rows = arrayToSpliced(this.rows, index, 1, _row);
    this.save();

    return _row;
  }

  patch (id: Id, row: ForPatch<T>): T {
    const index = this.getIndexById(id);

    const _row = { ...this.rows[index], ...row, updatedAt: TableController.getUpdatedAt() } as T;

    this.rows = arrayToSpliced(this.rows, index, 1, _row);
    this.save();

    return _row;
  }

  delete (id: Id): T {
    const index = this.getIndexById(id);

    const row = this.rows[index];

    this.rows = arrayToSpliced(this.rows, index, 1);
    this.save();

    return row;
  }

  private save (): void {
    writeFileSync(this.absolutePath, JSON.stringify(this.rows));
  }

  private getIndexById (id: Id): number {
    const index = this.rows.findIndex(({ id: _id }) => areIdsEqual(id, _id));
    if (index === -1) {
      throw createErrorClient('Row not found');
    }

    return index;
  }

  private static getUpdatedAt (): number {
    return Date.now();
  }

  private static getCreatedAt (): number {
    return Date.now();
  }

  private static getId (): Id {
    return toId(Date.now());
  }
}

export class UploadController extends DatabaseController {
  static uploadFile (...[, stream, { filename }]: Parameters<busboy.BusboyEvents['file']>): string {
    const PATH_UPLOADS = 'uploads';
    const pathUploads = join(DatabaseController.pathDataBase, PATH_UPLOADS);

    if (!existsSync(pathUploads)) {
      mkdirSync(pathUploads, { recursive: true });
    }

    const fileName = [randomUUID(), extname(filename)].join('');

    stream.pipe(createWriteStream(join(pathUploads, fileName)));

    return createFullLink([PATH_UPLOADS, fileName].join('/'));
  }
}
