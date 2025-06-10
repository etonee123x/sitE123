import { Router } from 'express';

import { handlers } from './handlers';
import { toId } from '@shared/src/types';

import { ROUTE_TO_VALIDATORS, checkAuth } from '@/middleware';
import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { HANDLER_NAME } from '@/types';

const router = Router();

router.get(
  '/',
  ...ROUTE_TO_VALIDATORS[HANDLER_NAME_TO_ROUTE[HANDLER_NAME.POSTS]],
  (req, res) => void res.send(handlers.get({ page: Number(req.query?.page), perPage: Number(req.query?.perPage) })),
);

router.get('/:id', (req, res) => void res.send(handlers.getById(toId(req.params.id))));

router.post('/', checkAuth, (req, res) => void res.send(handlers.post(req.body)));

router.put('/:id', checkAuth, (req, res) => void res.send(handlers.put(toId(req.params.id), req.body)));

router.patch('/:id', checkAuth, (req, res) => void res.send(handlers.patch(toId(req.params.id), req.body)));

router.delete('/:id', checkAuth, (req, res) => void res.send(handlers.delete(toId(req.params.id))));

export { router as posts };
