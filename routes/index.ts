import { Router } from 'express';

import GetFolderData from '../functions/GetFolderData.js';
import HappyNorming from '../functions/HappyNorming.js';
import FunnyAnimals from '../functions/FunnyAnimals.js';
import RMSHandler from '../functions/RMSHandler.js';
import Parser from '../functions/Parser.js';
import YaSearch from '../functions/YaSearch/index.js';
import ReqResHandler from '../engine/ReqResHandler.js';
import Auth from '../functions/Auth.js';

const router = Router();

router.get('/get-folder-data/*', async (req, res) => {
  await new ReqResHandler(req, res, async (req, res) => {
    const getFolderData = new GetFolderData('public/content');
    await getFolderData.newRequest(req.params[0]);
    res.send(getFolderData.data);
  }).init();
});

router.get('/happy-norming/', async (req, res) => {
  await new ReqResHandler(req, res, async (req, res) => {
    const happyNorming = new HappyNorming(req.query.dotw as string);
    res.type('image/jpeg').send(happyNorming.getPhoto());
  }).init();
});

router.get('/funny-animals/', async (req, res) => {
  await new ReqResHandler(req, res, async (req, res) => {
    const funnyAnimals = new FunnyAnimals();
    res.type('image/jpeg').send(funnyAnimals.getPhoto());
  }).init();
});

router.post('/rms-handler/', async (req, res) => {
  await new ReqResHandler(req, res, async (req, res) => {
    res.send(
      new RMSHandler().fromBuffer(req.body.data.data).getRms().formInfo(),
    );
  }).init();
});

router.post('/parser/', async (req, res) => {
  await new ReqResHandler(req, res, async (req, res) => {
    const parser = new Parser(req.body.options, req.body.id);
    await parser.init();
    res.json(await parser.getResults());
  }).init();
});

router.get('/search/', async (req, res) => {
  await new ReqResHandler(req, res, async (req, res) => {
    if (!req.query.q) res.json('nothing to search!');
    const yaSearch = new YaSearch(req.query.q as string);
    await yaSearch.search();
    res.json(yaSearch.getResults());
  }).init();
});

router.get('/auth/', async (req, res) => {
  await new ReqResHandler(req, res, async (req, res) => {
    const login = req.query.login as string;
    const password = req.query.password as string;
    const token = req.query.token as string;
    const auth = new Auth({ login, password, token });
    auth.tryAuth(res);
  }).init();
});

export default router;
