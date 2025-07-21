import { Router } from 'express';

import { handlers } from './handlers';
import { toId } from '@etonee123x/shared/helpers/id';

import { ROUTE_TO_VALIDATORS, checkAuth } from '@/middleware';
import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { HANDLER_NAME } from '@/types';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { addSinceToDatabaseRow } from '@/helpers/addSinceToDatabaseRow';

export const router = Router();

router.get('/', ...ROUTE_TO_VALIDATORS[HANDLER_NAME_TO_ROUTE[HANDLER_NAME.POSTS]], (req, res) => {
  const { rows, _meta } = handlers.get({ page: Number(req.query?.page), perPage: Number(req.query?.perPage) });

  res.send({
    _meta,
    rows: rows.map(addSinceToDatabaseRow),
  });
});

router.get('/:id', (req, res) => void res.send(addSinceToDatabaseRow(handlers.getById(toId(req.params.id)))));

router.post('/', checkAuth, (req, res) => void res.send(addSinceToDatabaseRow(handlers.post(req.body))));

router.put(
  '/:id',
  checkAuth,
  (req, res) => void res.send(addSinceToDatabaseRow(handlers.put(toId(req.params.id ?? throwError()), req.body))),
);

router.patch(
  '/:id',
  checkAuth,
  (req, res) => void res.send(addSinceToDatabaseRow(handlers.patch(toId(req.params.id ?? throwError()), req.body))),
);

router.delete(
  '/:id',
  checkAuth,
  (req, res) => void res.send(addSinceToDatabaseRow(handlers.delete(toId(req.params.id ?? throwError())))),
);
