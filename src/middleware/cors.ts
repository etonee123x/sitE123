import { Middleware } from '@/types';

export const cors: Middleware = (...[, res, next]) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
};
