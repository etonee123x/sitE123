import { Router } from 'express';

// import RMSHandler from '../functions/RMSHandler.js';

import { handleRequestsHandler, Guide } from '../engine/index.js';
import { funnyAnimals, happyNorming, parse, tryAuth, getFolderData } from '../functions/functions.js';

import { __dirname } from '../app.js';

const router = Router();

router.get('/get-folder-data/*', async (req, res) => {
  await handleRequestsHandler(req, res, async (req, res) => {
    res.send(await getFolderData('public/content', req.params[0]));
  });
});

router.get('/happy-norming/', async (req, res) => {
  await handleRequestsHandler(req, res, async (req, res) => {
    res.type('image/jpeg').send(happyNorming(req.query.dotw as string));
  });
});

router.get('/funny-animals/', async (req, res) => {
  await handleRequestsHandler(req, res, async (req, res) => {
    res.type('image/jpeg').send(funnyAnimals());
  });
});

router.post('/parser/', async (req, res) => {
  await handleRequestsHandler(req, res, async (req, res) => {
    res.json(await parse(req.body.options, req.body.id));
  });
});

/* router.post('/rms-handler/', async (req, res) => {
  await handleRequestsHandler(req, res, async (req, res) => {
    res.send(new RMSHandler().fromBuffer(req.body.data.data).getRms().formInfo());
  });
}); */

router.get('/auth/', async (req, res) => {
  await handleRequestsHandler(req, res, async (req, res) => {
    const { login, password, token } = req.query as { login?: string; password?: string; token?: string };
    tryAuth(res, { login, password, token });
  });
});

router.get('/guide/', async (req, res) => {
  const guideData = await Guide.test({ modules: [Guide.MODULES.GET_FOLDER_DATA] });
  console.log(guideData);
  res.render('guide.pug', guideData);
});

export default router;
