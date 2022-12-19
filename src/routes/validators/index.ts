import { query } from 'express-validator';
import { ROUTE } from '../../../includes/types/index.js';

const createMessage = (desc: string) => `It should be: ${desc}`;

export default {
  [ROUTE.HAPPY_NORMING]: [
    query('dotw', createMessage('Optional, Numeric, in [0, 6]'))
      .optional()
      .isNumeric()
      .custom(v => v > 0 && v < 7),
  ],
  [ROUTE.GET_FOLDER_DATA]: [],
  [ROUTE.FUNNY_ANIMALS]: [],
  [ROUTE.AUTH]: [
    query('token', createMessage('Optional, JWT'))
      .optional()
      .isJWT(),
  ],
  [ROUTE.PARSER]: [],
};
