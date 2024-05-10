import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

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
  WithMeta,
  WithIsEnd,
} from '@shared/src/types';
import { jsonParse, arrayToSpliced } from '@shared/src/utils';

interface TableNameToType {
  'posts': Post
}

export class TableController<TTableTiltle extends keyof TableNameToType, T extends TableNameToType[TTableTiltle]> {
  private rows: Array<T> = [];
  private absolutePath: string;

  constructor (tableTitle: TTableTiltle) {
    this.absolutePath = join(process.cwd(), 'db', `${tableTitle}.json`);

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
