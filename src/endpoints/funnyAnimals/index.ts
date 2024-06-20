import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { ROUTE_TO_VALIDATORS } from '@/middleware';
import { HANDLER_NAME } from '@/types';
import { Router } from 'express';
import { handler } from './handlers';

const router = Router();

router.get(
  HANDLER_NAME_TO_ROUTE[HANDLER_NAME.FUNNY_ANIMALS],
  ...ROUTE_TO_VALIDATORS[HANDLER_NAME.FUNNY_ANIMALS],
  (...[, res]) => res.type('image/jpeg').send(handler()),
);

export { router as funnyAnimals };
