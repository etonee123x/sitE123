import { Router } from 'express';
import { HANDLER_NAME } from '@includes/types';

import {
  funnyAnimals,
  happyNorming,
  getFolderData,
} from '@/handlers';

import { HANDLER_NAME_TO_VALIDATORS } from '@/middleware';
import { HANDLER_NAME_TO_ROUTE } from '@/constants';

const router = Router();

router.get(
  `${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.GET_FOLDER_DATA]}/:path?`,
  ...HANDLER_NAME_TO_VALIDATORS[HANDLER_NAME.GET_FOLDER_DATA],
  async (req, res, next) => {
    await getFolderData(req.params.path || '/')
      .then((r) => res.send(r))
      .catch(next);
  },
).get(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING],
  ...HANDLER_NAME_TO_VALIDATORS[HANDLER_NAME.HAPPY_NORMING],
  (req, res) => res.type('image/jpeg').send(happyNorming(req.query?.dotw && String(req.query?.dotw))),
).get(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.FUNNY_ANIMALS],
  ...HANDLER_NAME_TO_VALIDATORS[HANDLER_NAME.FUNNY_ANIMALS],
  (...[, res]) => res.type('image/jpeg').send(funnyAnimals()),
);

export { router };
