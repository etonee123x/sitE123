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
import YaSearch from '../functions/YaSearch/index.js';
import ReqResHandler from '../engine/ReqResHandler.js';
const router = Router();
router.get('/get-folder-data/*', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield new ReqResHandler(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const getFolderData = new GetFolderData('public/content');
        yield getFolderData.newRequest(req.params[0]);
        res.send(getFolderData.data);
    })).init();
}));
router.get('/happy-norming/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield new ReqResHandler(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const happyNorming = new HappyNorming(req.query.dotw);
        res.type('image/jpeg').send(happyNorming.getPhoto());
    })).init();
}));
router.get('/funny-animals/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield new ReqResHandler(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const funnyAnimals = new FunnyAnimals();
        res.type('image/jpeg').send(funnyAnimals.getPhoto());
    })).init();
}));
router.post('/rms-handler/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield new ReqResHandler(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.send(new RMSHandler()
            .fromBuffer(req.body.data.data)
            .getRms()
            .formInfo());
    })).init();
}));
router.post('/parser/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield new ReqResHandler(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const parser = new Parser(req.body.options, req.body.id);
        yield parser.init();
        res.json(yield parser.getResults());
    })).init();
}));
router.get('/search/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield new ReqResHandler(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.query.q)
            res.json('nothing to search!');
        const yaSearch = new YaSearch(req.query.q);
        yield yaSearch.search();
        res.json(yaSearch.getResults());
    })).init();
}));
export default router;
