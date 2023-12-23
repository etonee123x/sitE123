import { query } from 'express-validator';
import { ROUTE } from '../../../includes/types/index.ts';

const createMessage = (desc: string[]) => `It should be: ${desc.join(', ')}`;

export default {
  [ROUTE.HAPPY_NORMING]: [
    query('dotw', createMessage(['optional', 'int', 'in [0, 6]']))
      .optional()
      .isInt({ allow_leading_zeroes: false, min: 0, max: 6 }),
  ],
  [ROUTE.GET_FOLDER_DATA]: [],
  [ROUTE.FUNNY_ANIMALS]: [],
};
