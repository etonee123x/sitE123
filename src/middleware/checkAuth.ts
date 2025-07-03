import { isModeDev } from '@/helpers/mode';
import { isString } from '@etonee123x/shared/utils/isString';
import { createError } from '@etonee123x/shared/helpers/error';
import { isRealObject } from '@etonee123x/shared/utils/isRealObject';
import { RequestHandler } from 'express';
import jsonWebToken from 'jsonwebtoken';

const JWT_COOKIE_KEY = 'jwt';
const DEV_JWT_VALUE = 'dev-jwt';

const shouldBypassAsDev = (jwt: string) => isModeDev && jwt === DEV_JWT_VALUE;

export const checkAuth: RequestHandler = (request, response, next) => {
  const jwt = request.cookies[JWT_COOKIE_KEY] || request.query.jwt;

  if (!isString(jwt)) {
    response.clearCookie(JWT_COOKIE_KEY);
    throw createError({ statusCode: 401 });
  }

  if (shouldBypassAsDev(jwt)) {
    response.cookie(JWT_COOKIE_KEY, jwt, {
      maxAge: 1 * 60 * 60 * 1000,
    });

    return next();
  }

  try {
    const payload = jsonWebToken.verify(jwt, String(process.env.SECRET_KEY));

    response.cookie(JWT_COOKIE_KEY, jwt, {
      expires: isRealObject(payload) && payload.exp ? new Date(payload.exp * 1000) : undefined,
    });
  } catch (e) {
    response.clearCookie(JWT_COOKIE_KEY);
    throw createError({ data: e, statusCode: 401 });
  }

  next();
};
