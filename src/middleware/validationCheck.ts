import { validationResult } from 'express-validator';

import { createErrorClient } from '@shared/src/types';
import { isNotEmptyArray } from '@shared/src/utils/isNotEmptyArray';
import { RequestHandler } from 'express';

export const validationCheck: RequestHandler = (...[req, , next]) => {
  const errors = validationResult(req).array();

  return isNotEmptyArray(errors) ? next(createErrorClient(errors)) : next();
};
