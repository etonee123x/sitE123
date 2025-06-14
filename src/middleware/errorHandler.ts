import { logger } from '@/helpers/logger';
import { isCustomError, isCustomErrorUnknown } from '@etonee123x/shared/helpers/error';
import { ErrorRequestHandler } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, next) => {
  logger.error(request.originalUrl, request.body, error);

  if (!isCustomError(error)) {
    response.status(500).json({ error: 'Something went wrong :(' });

    return;
  }

  if (isCustomErrorUnknown(error)) {
    response.status(500).json({ error: error.data });

    return;
  }

  response.status(error.statusCode).json({ error: error.data });
};
