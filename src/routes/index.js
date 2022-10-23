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
import { handleRequests } from '../engine/index.js';
import { funnyAnimals, happyNorming, parse, tryAuth, getFolderData } from '../functions/functions.js';
// import RMSHandler from '../functions/RMSHandler.js';
const router = Router();
router.get('/get-folder-data*', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield handleRequests(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.send(yield getFolderData('content', req.params[0]));
    }));
}));
router.get('/happy-norming/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield handleRequests(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.type('image/jpeg').send(happyNorming(req.query.dotw));
    }));
}));
router.get('/funny-animals/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield handleRequests(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.type('image/jpeg').send(funnyAnimals());
    }));
}));
router.get('/auth/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield handleRequests(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { login, password, token } = req.query;
        tryAuth(res, { login, password, token });
    }));
}));
router.post('/parser/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield handleRequests(req, res, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield parse(req.body.options, req.body.id));
    }));
}));
/* router.post('/rms-handler/', async (req, res) => {
  await handleRequests(req, res, async (req, res) => {
    res.send(new RMSHandler().fromBuffer(req.body.data.data).getRms().formInfo());
  });
}); */
export default router;
