import { isModeDev } from '@/helpers/mode';
import { createError } from '@etonee123x/shared/helpers/error';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export const checkAuth: RequestHandler = (req, res, next) => {
  const authToken = String(req.headers.authorization);

  if (isModeDev && authToken === 'dev-jwt') {
    req.headers.tokenPayload = JSON.stringify({ role: 'Admin' });

    return next();
  }

  try {
    const payload = jwt.verify(authToken, String(process.env.SECRET_KEY));

    req.headers.tokenPayload = JSON.stringify(payload);
  } catch (e) {
    throw createError({ data: e, statusCode: 401 });
  }

  next();
};
