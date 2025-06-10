import { RequestHandler } from 'express';

export const send404: RequestHandler = (...[, res]) => {
  res.sendStatus(404);
};
