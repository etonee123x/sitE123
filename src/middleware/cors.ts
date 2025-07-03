import { isModeDev } from '@/helpers/mode';
import { RequestHandler } from 'express';

const allowedOrigins =
  (isModeDev ? process.env.ALLOWED_ORIGINS_DEV : process.env.ALLOWED_ORIGINS_PROD)
    ?.split(',')
    .map((origin) => origin.trim()) ?? [];

export const cors: RequestHandler = (...[, res, next]) => {
  res.header('Access-Control-Allow-Origin', allowedOrigins);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  next();
};
