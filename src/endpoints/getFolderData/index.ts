import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { ROUTE_TO_VALIDATORS } from '@/middleware';
import { HANDLER_NAME } from '@/types';
import { Router } from 'express';
import { handler } from './handlers';

const router = Router();

router.get(
  new RegExp('((/[^/]+)+)*'),
  ...ROUTE_TO_VALIDATORS[HANDLER_NAME_TO_ROUTE[HANDLER_NAME.GET_FOLDER_DATA]],
  async (req, res, next) => {
    await handler(req.params[0] || '/')
      .then((r) => res.send(r))
      .catch(next);
  },
);

export { router };
