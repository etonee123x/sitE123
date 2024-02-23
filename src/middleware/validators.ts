import { query } from 'express-validator';
import { HANDLER_NAME } from '@/types';

import { validationCheck } from '@/middleware/validationCheck';

const createMessage = (desc: Array<string>) => `It should be: ${desc.join(', ')}`;

export const HANDLER_NAME_TO_VALIDATORS = Object.freeze({
  [HANDLER_NAME.HAPPY_NORMING]: [
    query('dotw', createMessage(['optional', 'int', 'in [0, 6]']))
      .optional()
      .isInt({ allow_leading_zeroes: false, min: 0, max: 6 }),
    validationCheck,
  ],
  [HANDLER_NAME.GET_FOLDER_DATA]: [],
  [HANDLER_NAME.FUNNY_ANIMALS]: [],
});
