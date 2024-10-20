import { validationResult } from 'express-validator';

import type { Middleware } from '@/types';
import { createErrorClient } from '@shared/src/types';
import { isNotEmptyArray } from '@shared/src/utils/isNotEmptyArray';

export const validationCheck: Middleware = (...[req, , next]) => {
  const errors = validationResult(req).array();

  isNotEmptyArray(errors) ? next(createErrorClient(errors)) : next();
};
