import { query } from 'express-validator';
import { Routes } from '../../../includes/types/index.js';
const createMessage = (desc) => `It should be: ${desc}`;
export default {
    [Routes.HAPPY_NORMING]: [
        query('dotw', createMessage('Optional, Numeric, in [0, 6]'))
            .optional()
            .isNumeric()
            .custom(v => v > 0 && v < 7),
    ],
    [Routes.GET_FOLDER_DATA]: [],
    [Routes.FUNNY_ANIMALS]: [],
    [Routes.AUTH]: [
        query('token', createMessage('Optional, JWT'))
            .optional()
            .isJWT(),
    ],
    [Routes.PARSER]: [],
};
