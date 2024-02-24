import type { Request, Response, NextFunction } from 'express';

export type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export enum HANDLER_NAME {
  GET_FOLDER_DATA = 'GET_FOLDER_DATA',
  FUNNY_ANIMALS = 'FUNNY_ANIMALS',
  HAPPY_NORMING = 'HAPPY_NORMING',
  POSTS = 'POSTS'
}
