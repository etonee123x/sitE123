import { Router } from 'express';

import { handleRequests } from '../engine/index.js';
import { funnyAnimals, happyNorming, parse, tryAuth, getFolderData } from '../handlers/handlers.js';
import validators from './validators/index.js';
import { Routes } from '../../includes/types/index.js';

const router = Router();

router.get(
  Routes.GET_FOLDER_DATA,
  ...validators[Routes.GET_FOLDER_DATA],
  async (req, res) =>
    await handleRequests(req, res, async (req, res) => res.send(await getFolderData(req.params?.[0] || '/'))),
);

router.get(
  Routes.HAPPY_NORMING,
  ...validators[Routes.HAPPY_NORMING],
  async (req, res) =>
    await handleRequests(req, res, async (req, res) => res.type('image/jpeg').send(happyNorming(req.query?.dotw))),
);

router.get(
  Routes.FUNNY_ANIMALS,
  ...validators[Routes.FUNNY_ANIMALS],
  async (req, res) => await handleRequests(req, res, async (req, res) => res.type('image/jpeg').send(funnyAnimals())),
);

router.get(
  Routes.AUTH,
  ...validators[Routes.AUTH],
  async (req, res) =>
    await handleRequests(req, res, async (req, res) => {
      const token = req.query?.token;
      if (token) return tryAuth(res, { token });
      const login = req.query?.login;
      const password = req.query?.password;
      return login && password ? tryAuth(res, { login, password }) : res.sendStatus(403);
    }),
);

router.post(
  Routes.PARSER,
  ...validators[Routes.PARSER],
  async (req, res) => await handleRequests(
    req,
    res,
    async (req, res) => res.json(await parse(req.body.options, req.body.id)),
  ),
);

export default router;
