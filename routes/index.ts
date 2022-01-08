import { Router, Request, Response } from 'express';

import GetFolderData from '../functions/GetFolderData.js';
import HappyNorming from '../functions/HappyNorming.js';
import FunnyAnimals from '../functions/FunnyAnimals.js';
import RMSHandler from '../functions/RMSHandler.js';
import Parser from '../functions/Parser.js';
import YaSearch from '../functions/YaSearch/index.js';
import ReqResHandler from '../engine/ReqResHandler.js';

const router = Router();

router.get('/get-folder-data/*', async (req: Request, res: Response) => {
  await new ReqResHandler(req, res, async (req: Request, res: Response) => {
    const getFolderData = new GetFolderData('public/content');
    await getFolderData.newRequest(req.params[0]);
    res.send(getFolderData.data);
  }).init();
});

router.get('/happy-norming/', async (req: Request, res: Response) => {
  await new ReqResHandler(req, res, async (req: Request, res: Response) => {
    const happyNorming = new HappyNorming(req.query.dotw as string);
    res.type('image/jpeg').send(happyNorming.getPhoto());
  }).init();
});

router.get('/funny-animals/', async (req: Request, res: Response) => {
  await new ReqResHandler(req, res, async (req: Request, res: Response) => {
    const funnyAnimals = new FunnyAnimals();
    res.type('image/jpeg').send(funnyAnimals.getPhoto());
  }).init();
});

router.post('/rms-handler/', async (req: Request, res: Response) => {
  await new ReqResHandler(req, res, async (req: Request, res: Response) => {
    res.send(
      new RMSHandler()
        .fromBuffer(req.body.data.data)
        .getRms()
        .formInfo(),
    );
  }).init();
});

router.post('/parser/', async (req: Request, res: Response) => {
  await new ReqResHandler(req, res, async (req: Request, res: Response) => {
    const parser = new Parser(req.body.options, req.body.id);
    await parser.init();
    res.json(await parser.getResults());
  }).init();
});

router.get('/search/', async (req: Request, res: Response) => {
  await new ReqResHandler(req, res, async (req: Request, res: Response) => {
    if (!req.query.q)
      res.json('nothing to search!');
    const yaSearch = new YaSearch(req.query.q as string);
    await yaSearch.search();
    res.json(yaSearch.getResults());
  }).init();
});

export default router;
