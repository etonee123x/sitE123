import { Middleware } from '@/types';

export const cors: Middleware = (...[, res, next]) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
};
