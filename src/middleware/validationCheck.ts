import { validationResult } from 'express-validator';

import { createErrorClient } from '@etonee123x/shared/helpers/error';
import { RequestHandler } from 'express';

export const validationCheck: RequestHandler = (...[req, , next]) => {
  const errors = validationResult(req).array();

  return errors.length > 0 ? next(createErrorClient(errors)) : next();
};
