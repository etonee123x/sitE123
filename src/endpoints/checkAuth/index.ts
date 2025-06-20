import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { checkAuth } from '@/middleware';
import { HANDLER_NAME } from '@/types';
import { Router } from 'express';

const router = Router();

router.get(
  '/',
  checkAuth,
  (req, res) => void res.end(req.headers.tokenPayload),
);

export { router };
