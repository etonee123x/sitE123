import { checkAuth } from '@/middleware';
import { Router } from 'express';

const router = Router();

router.post('/', checkAuth, (request, response) => {
  response.end(request.headers.tokenPayload);
});

router.delete('/', checkAuth, (...[, response]) => {
  response.clearCookie('jwt').sendStatus(200);
});

export { router as routerAuth };
