import { Router } from 'express';

import { handlers } from './handlers';
import { toId } from '@etonee123x/shared/helpers/id';

import { ROUTE_TO_VALIDATORS, checkAuth } from '@/middleware';
import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { HANDLER_NAME } from '@/types';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { addSinceTimestamps } from '@/helpers/addSinceTimestamps';

export const router = Router();

router.get('/', ...ROUTE_TO_VALIDATORS[HANDLER_NAME_TO_ROUTE[HANDLER_NAME.POSTS]], (req, res) => {
  const { rows, _meta } = handlers.get({ page: Number(req.query?.page), perPage: Number(req.query?.perPage) });

  res.send({
    _meta,
    rows: rows.map((row) => ({
      ...row,
      _meta: addSinceTimestamps(row._meta),
    })),
  });
});

router.get('/:id', (req, res) => {
  const post = handlers.getById(toId(req.params.id));

  res.send({
    ...post,
    _meta: addSinceTimestamps(post._meta),
  });
});

router.post('/', checkAuth, (req, res) => {
  const post = handlers.post(req.body);

  res.send({
    ...post,
    _meta: addSinceTimestamps(post._meta),
  });
});

router.put('/:id', checkAuth, (req, res) => {
  const post = handlers.put(toId(req.params.id ?? throwError()), req.body);

  res.send({
    ...post,
    _meta: addSinceTimestamps(post._meta),
  });
});

router.patch('/:id', checkAuth, (req, res) => {
  const post = handlers.patch(toId(req.params.id ?? throwError()), req.body);

  res.send({
    ...post,
    _meta: addSinceTimestamps(post._meta),
  });
});

router.delete('/:id', checkAuth, (req, res) => {
  const post = handlers.delete(toId(req.params.id ?? throwError()));

  res.send({
    ...post,
    _meta: addSinceTimestamps(post._meta),
  });
});
