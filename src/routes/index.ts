import { Router } from 'express';

import { handleRequests } from '../engine/index.js';
import { funnyAnimals, happyNorming, parse, tryAuth, getFolderData } from '../functions/functions.js';

// import RMSHandler from '../functions/RMSHandler.js';

const router = Router();

router.get('/get-folder-data*', async (req, res) => {
  await handleRequests(req, res, async (req, res) => {
    res.send(await getFolderData('content', req.params[0]));
  });
});

router.get('/happy-norming/', async (req, res) => {
  await handleRequests(req, res, async (req, res) => {
    res.type('image/jpeg').send(happyNorming(req.query.dotw as string));
  });
});

router.get('/funny-animals/', async (req, res) => {
  await handleRequests(req, res, async (req, res) => {
    res.type('image/jpeg').send(funnyAnimals());
  });
});

router.get('/auth/', async (req, res) => {
  await handleRequests(req, res, async (req, res) => {
    const { login, password, token } = req.query as { login?: string; password?: string; token?: string };
    tryAuth(res, { login, password, token });
  });
});

router.post('/parser/', async (req, res) => {
  await handleRequests(req, res, async (req, res) => {
    res.json(await parse(req.body.options, req.body.id));
  });
});

/* router.post('/rms-handler/', async (req, res) => {
  await handleRequests(req, res, async (req, res) => {
    res.send(new RMSHandler().fromBuffer(req.body.data.data).getRms().formInfo());
  });
}); */

export default router;
