import { Router } from 'express';
import { HANDLER_NAME } from '@/types';

import {
  funnyAnimals,
  happyNorming,
  getFolderData,
  blogHandlers,
} from '@/handlers';

import { HANDLER_NAME_TO_VALIDATORS } from '@/middleware';
import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { toId } from '@shared/src/types';

const router = Router();

router.get(
  new RegExp(`${HANDLER_NAME_TO_ROUTE[HANDLER_NAME.GET_FOLDER_DATA]}((/[^/]+)+)*`),
  ...HANDLER_NAME_TO_VALIDATORS[HANDLER_NAME.GET_FOLDER_DATA],
  async (req, res, next) => {
    await getFolderData(req.params[0] || '/')
      .then((r) => res.send(r))
      .catch(next);
  },
);

router.get(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING],
  ...HANDLER_NAME_TO_VALIDATORS[HANDLER_NAME.HAPPY_NORMING],
  (req, res) => res.type('image/jpeg').send(happyNorming(req.query?.dotw && String(req.query?.dotw))),
);

router.get(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.FUNNY_ANIMALS],
  ...HANDLER_NAME_TO_VALIDATORS[HANDLER_NAME.FUNNY_ANIMALS],
  (...[, res]) => res.type('image/jpeg').send(funnyAnimals()),
);

router.get(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.POSTS].ALL,
  (...[, res]) => res.send(blogHandlers.get()),
);

router.get(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.POSTS].BY_ID,
  (req, res) => res.send(blogHandlers.getById(toId(req.params.id))),
);

router.post(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.POSTS].ALL,
  (req, res) => res.send(blogHandlers.post(req.body)),
);

router.put(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.POSTS].BY_ID,
  (req, res) => res.send(blogHandlers.put(toId(req.params.id), req.body)),
);

router.put(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.POSTS].BY_ID,
  (req, res) => res.send(blogHandlers.patch(toId(req.params.id), req.body)),
);

router.delete(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.POSTS].BY_ID,
  (req, res) => res.send(blogHandlers.delete(toId(req.params.id))),
);

export { router };
