import { Router } from 'express';

import { handleRequests } from '@/engine';
import {
  funnyAnimals,
  happyNorming,
  getFolderData,
} from '@/handlers';
import validators from '@/routes/validators';
import { ROUTE } from '@includes/types';

// Вот эту шляпу надо будет переделать основательно на мидлварах
// какой порядок:
// 0. Валидация
// 1. Логгирование
// 2. Исполнение, основные функции
// 3. Перехват ошибок

const router = Router();

router.get(
  `${ROUTE.GET_FOLDER_DATA}*`,
  ...validators[ROUTE.GET_FOLDER_DATA],
  async (req, res) =>
    await handleRequests(req, res, async (req, res) => res.send(await getFolderData(req.params?.[0] || '/'))),
);

router.get(
  ROUTE.HAPPY_NORMING,
  ...validators[ROUTE.HAPPY_NORMING],
  async (req, res) =>
    await handleRequests(req, res, async (req, res) => res.type('image/jpeg').send(happyNorming(req.query?.dotw))),
);

router.get(
  ROUTE.FUNNY_ANIMALS,
  ...validators[ROUTE.FUNNY_ANIMALS],
  async (req, res) => await handleRequests(req, res, async (...[, res]) => res.type('image/jpeg').send(funnyAnimals())),
);

export default router;
