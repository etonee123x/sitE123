import { Router } from 'express';

import {
  postsHandlers,
} from '@/handlers';
import { toId } from '@shared/src/types';

import { ROUTE_TO_VALIDATORS, checkAuth } from '@/middleware';
import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { HANDLER_NAME } from '@/types';

const routerPosts = Router();

routerPosts.get(
  '/',
  ...ROUTE_TO_VALIDATORS[HANDLER_NAME_TO_ROUTE[HANDLER_NAME.POSTS]],
  (req, res) =>
    res.send(postsHandlers.get({ page: Number(req.query?.page), perPage: Number(req.query?.perPage) })),
);

routerPosts.get(
  '/:id',
  (req, res) => res.send(postsHandlers.getById(toId(req.params.id))),
);

routerPosts.post(
  '/',
  checkAuth,
  (req, res) => res.send(postsHandlers.post(req.body)),
);

routerPosts.put(
  '/:id',
  checkAuth,
  (req, res) => res.send(postsHandlers.put(toId(req.params.id), req.body)),
);

routerPosts.patch(
  '/:id',
  checkAuth,
  (req, res) => res.send(postsHandlers.patch(toId(req.params.id), req.body)),
);

routerPosts.delete(
  '/:id',
  checkAuth,
  (req, res) => res.send(postsHandlers.delete(toId(req.params.id))),
);

export { routerPosts };
