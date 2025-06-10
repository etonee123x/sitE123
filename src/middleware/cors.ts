import { RequestHandler } from 'express';

export const cors: RequestHandler = (...[, res, next]) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
};
