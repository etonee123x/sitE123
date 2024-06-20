import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { checkAuth } from '@/middleware';
import { HANDLER_NAME } from '@/types';
import { Router } from 'express';

const router = Router();

router.get(HANDLER_NAME_TO_ROUTE[HANDLER_NAME.CHECK_AUTH], checkAuth, (req, res) => res.end(req.headers.tokenPayload));

export { router as checkAuth };
