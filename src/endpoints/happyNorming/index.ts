import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { ROUTE_TO_VALIDATORS } from '@/middleware';
import { HANDLER_NAME } from '@/types';
import { Router } from 'express';
import { handler } from './handlers';

const router = Router();

router.get(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING],
  ...ROUTE_TO_VALIDATORS[HANDLER_NAME_TO_ROUTE[HANDLER_NAME.HAPPY_NORMING]],
  (req, res) => res.type('image/jpeg').send(handler(req.query?.dotw && String(req.query?.dotw))),
);

export { router as happyNorming };
