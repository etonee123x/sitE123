import { Router } from 'express';
import { HANDLER_NAME } from '@/types';
import { routerPosts } from '@/router/posts';
import { routerUpload } from '@/router/upload';

import {
  funnyAnimals,
  happyNorming,
  getFolderData,
} from '@/handlers';

import { ROUTE_TO_VALIDATORS } from '@/middleware';
import { HANDLER_NAME_TO_ROUTE } from '@/constants';

const router = Router();

router.get(
  new RegExp(`${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.GET_FOLDER_DATA]}((/[^/]+)+)*`),
  ...ROUTE_TO_VALIDATORS[HANDLER_NAME_TO_ROUTE[HANDLER_NAME.GET_FOLDER_DATA]],
  async (req, res, next) => {
    await getFolderData(req.params[0] || '/')
      .then((r) => res.send(r))
      .catch(next);
  },
);

router.get(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING],
  ...ROUTE_TO_VALIDATORS[HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]],
  (req, res) => res.type('image/jpeg').send(happyNorming(req.query?.dotw && String(req.query?.dotw))),
);

router.get(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.FUNNY_ANIMALS],
  ...ROUTE_TO_VALIDATORS[HANDLER_NAME.FUNNY_ANIMALS],
  (...[, res]) => res.type('image/jpeg').send(funnyAnimals()),
);

router.use(HANDLER_NAME_TO_ROUTE[HANDLER_NAME.POSTS], routerPosts);
router.use(HANDLER_NAME_TO_ROUTE[HANDLER_NAME.UPLOAD], routerUpload);

export { router };
