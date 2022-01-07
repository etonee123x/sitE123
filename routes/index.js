var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import GetFolderData from '../functions/GetFolderData.js';
import HappyNorming from '../functions/HappyNorming.js';
import FunnyAnimals from '../functions/FunnyAnimals.js';
import RMSHandler from '../functions/RMSHandler.js';
import Parser from '../functions/Parser.js';
import Index from '../functions/YaSearch/index.js';
// import { readFileSync } from 'fs';
// import axios from 'axios';
const router = Router();
router.get('/get-folder-data/*', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`New request to /get-folder-data/: ${req.params[0] || '/'}`);
        try {
            const getFolderData = new GetFolderData('public/content');
            yield getFolderData.newRequest(req.params[0]);
            res.send(getFolderData.data);
        }
        catch (e) {
            res.status(500).send(`error: ${e.message}`);
        }
    });
});
router.get('/happy-norming/', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('New request to /happy-norming/:', req.query);
        try {
            const happyNorming = new HappyNorming(req.query.dotw);
            res.type('image/jpeg').send(happyNorming.getPhoto());
        }
        catch (e) {
            res.status(500).send(`error: ${e.message}`);
        }
    });
});
router.get('/funny-animals/', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('New request to /funny-animals/');
        try {
            const funnyAnimals = new FunnyAnimals();
            res.type('image/jpeg').send(funnyAnimals.getPhoto());
        }
        catch (e) {
            res.status(500).send(`error: ${e.message}`);
        }
    });
});
router.post('/rms-handler/', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('new request to /rms-handler/');
        try {
            res.send(new RMSHandler()
                .fromBuffer(req.body.data.data)
                .getRms()
                .formInfo());
        }
        catch (e) {
            console.log('failed:', e);
            res.send(e);
        }
    });
});
router.post('/parser/', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('new request to /parser/:', req.body);
        try {
            const parser = new Parser(req.body.options, req.body.id);
            yield parser.init();
            res.json(yield parser.parse());
        }
        catch (e) {
            console.log('failed:', e);
            res.send(e);
        }
    });
});
router.get('/search/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('New request to /search/:', req.query);
    if (!req.query.q) {
        res.json('nothing to search!');
    }
    const yaSearch = new Index(req.query.q);
    yield yaSearch.search();
    res.json(yaSearch.getResults());
}));
/* router.get('/test/', async(req: Request, res: Response) => {
  const options = readFileSync('./content/options.js');
  const id = 'test';
  res.json(
    await axios.post('http://localhost:3001/parser/', {
      options, id,
    }, { maxBodyLength: Infinity })
      .then(r => r.data),
  );
}); */
export default router;
