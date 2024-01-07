import { Middleware } from '@/types';

export const send404: Middleware = (...[, res]) => {
  res.sendStatus(404);
};
