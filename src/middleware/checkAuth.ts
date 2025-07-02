import { isModeDev } from '@/helpers/mode';
import { createError } from '@etonee123x/shared/helpers/error';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { RequestHandler } from 'express';
import jsonWebToken from 'jsonwebtoken';

export const checkAuth: RequestHandler = (request, response, next) => {
  const jwt = request.cookies.jwt || request.query.jwt;

  console.log('coockei', request.cookies.jwt);
  console.log('request', request.query.jwt);

  if (isNil(jwt)) {
    response.clearCookie('jwt');
    throw createError({ statusCode: 401 });
  }

  console.log('ставим куку');
  response.cookie('jwt', jwt, {
    httpOnly: true,
    maxAge: 1 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: false,
  });
  console.log('поставили куку');

  if (isModeDev && jwt === 'dev-jwt') {
    request.headers.tokenPayload = JSON.stringify({ role: 'Admin' });

    return next();
  }

  try {
    const payload = jsonWebToken.verify(jwt, String(process.env.SECRET_KEY));

    request.headers.tokenPayload = JSON.stringify(payload);
  } catch (e) {
    response.clearCookie('jwt');
    throw createError({ data: e, statusCode: 401 });
  }

  next();
};
