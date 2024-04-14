import { query } from 'express-validator';
import { HANDLER_NAME } from '@/types';
import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { validationCheck } from '@/middleware/validationCheck';

const paginationValidations = [
  query('page')
    .exists().withMessage('Parameter is required')
    .isInt({ min: 0 }).withMessage('Must be a non-negative integer')
    .toInt(),
  query('perPage')
    .exists().withMessage('Parameter is required')
    .isInt({ min: 1 }).withMessage('Must be an integer greater than 0')
    .toInt(),
];

export const ROUTE_TO_VALIDATORS = Object.freeze({
  [HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]]: [
    query('dotw')
      .optional()
      .isInt({ allow_leading_zeroes: false, min: 0, max: 6 }).withMessage('Must be an integer in [0, 6]')
      .toInt(),
    validationCheck,
  ],
  [HANDLER_NAME_TO_ROUTE[HANDLER_NAME.GET_FOLDER_DATA]]: [],
  [HANDLER_NAME.FUNNY_ANIMALS]: [],
  [HANDLER_NAME_TO_ROUTE[HANDLER_NAME.POSTS].ALL]: [
    ...paginationValidations,
    validationCheck,
  ],
});
