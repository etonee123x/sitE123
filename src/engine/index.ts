import type { Response } from 'express';
import { validationResult } from 'express-validator';

import { isNotEmptyArray, logger } from '@/utils';
import type { ReqAfterMidd } from '@/types';

const handleRequestError = async (e: unknown) => {
  logger.error(e);
};

export const handleRequests = async (
  req: ReqAfterMidd,
  res: Response,
  cb: (req: ReqAfterMidd, res: Response) => unknown,
) => {
  logger(`New request to ${req.route.path}`);
  const errors = validationResult(req).array();

  if (isNotEmptyArray(errors)) {
    return res.status(400).send(errors);
  }

  // Вынести логгирование в мидлвару логгирования
  const hasQuery = isNotEmptyArray(Object.keys(req.query ?? {}));
  const hasBody = isNotEmptyArray(Object.keys(req.body));
  const hasParams = isNotEmptyArray(Object.keys(req.params ?? {}));
  if (hasQuery || hasBody || hasParams) {
    if (hasQuery) {
      logger('Query:', req.query);
    }
    if (hasBody) {
      logger('Body:', req.body);
    }
    if (hasParams) {
      logger('Params:', req.params);
    }
  } else {
    logger('No special params');
  }

  try {
    await cb(req, res);
  } catch (e) {
    await handleRequestError(e);
    res.sendStatus(404);
  }
};
