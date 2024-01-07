import { validationResult } from 'express-validator';

import type { Middleware } from '@/types';
import { isNotEmptyArray, createErrorClient } from '@includes/types/utils';

export const validationCheck: Middleware = (...[req, , next]) => {
  const errors = validationResult(req).array();

  isNotEmptyArray(errors) ? next(createErrorClient(errors)) : next();
};
