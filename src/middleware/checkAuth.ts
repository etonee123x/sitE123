import { createError } from '@shared/src/types';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export const checkAuth: RequestHandler = (req, res, next) => {
  try {
    const payload = jwt.verify(String(req.headers.authorization), String(process.env.SECRET_KEY));

    req.headers.tokenPayload = JSON.stringify(payload);
  } catch (e) {
    throw createError({ data: e, statusCode: 401 });
  }

  next();
};
