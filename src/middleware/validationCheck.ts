import { validationResult } from 'express-validator';

import { createErrorClient } from '@etonee123x/shared/helpers/error';
import { isNotEmptyArray } from '@etonee123x/shared/utils/isNotEmptyArray';
import { RequestHandler } from 'express';

export const validationCheck: RequestHandler = (...[req, , next]) => {
  const errors = validationResult(req).array();

  return isNotEmptyArray(errors) ? next(createErrorClient(errors)) : next();
};
