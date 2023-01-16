import { query } from 'express-validator';
import { ROUTE } from '../../../includes/types/index.js';
const createMessage = (desc) => `It should be: ${desc.join(', ')}`;
export default {
    [ROUTE.HAPPY_NORMING]: [
        query('dotw', createMessage(['optional', 'numeric', 'int', 'in [0, 6]']))
            .optional()
            .isInt({ allow_leading_zeroes: false, gt: -1, lt: 7 }),
    ],
    [ROUTE.GET_FOLDER_DATA]: [],
    [ROUTE.FUNNY_ANIMALS]: [],
    [ROUTE.AUTH]: [
        query('token', createMessage(['Optional', 'JWT']))
            .optional()
            .isJWT(),
    ],
    [ROUTE.PARSER]: [],
};
