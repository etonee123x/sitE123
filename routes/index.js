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
import AlinaHandler from '../functions/AlinaHandler.js';
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
        console.log('New request to /funny-animals/:');
        try {
            const funnyAnimals = new FunnyAnimals();
            res.type('image/jpeg').send(funnyAnimals.getPhoto());
        }
        catch (e) {
            res.status(500).send(`error: ${e.message}`);
        }
    });
});
router.get('/alina-handler/', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('New request to /alina-handler/:');
        try {
            const alinaHandler = new AlinaHandler();
            res.type('image/jpeg').send(alinaHandler.getPhoto());
        }
        catch (e) {
            res.status(500).send(`error: ${e.message}`);
        }
    });
});
export default router;
