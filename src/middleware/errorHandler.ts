import { Middleware } from '@/types';
import { logger } from '@/utils';
import { isCustomError, isCustomErrorUnknown } from '@includes/types/utils';

type MiddlewareParams = Parameters<Middleware>

export const errorHandler = (
  err: unknown,
  req: MiddlewareParams[0],
  res: MiddlewareParams[1],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: MiddlewareParams[2],
) => {
  logger.error(req.originalUrl, req.body, err);

  if (!isCustomError(err)) {
    return res.status(500).json({ error: 'Something went wrong :(' });
  }

  if (isCustomErrorUnknown(err)) {
    return res.status(500).json({ error: err.data });
  }

  return res.status(err.statusCode).json({ error: err.data });
};
