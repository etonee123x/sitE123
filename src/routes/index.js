import { Router } from 'express';
import { handleRequests } from '../engine/index.js';
import { funnyAnimals, happyNorming, parse, tryAuth, getFolderData } from '../functions/functions.js';
const router = Router();
router.get('/get-folder-data*', async (req, res) => {
    await handleRequests(req, res, async (req, res) => {
        res.send(await getFolderData('content', req.params[0]));
    });
});
router.get('/happy-norming/', async (req, res) => {
    await handleRequests(req, res, async (req, res) => {
        res.type('image/jpeg').send(happyNorming(String(req.query.dotw)));
    });
});
router.get('/funny-animals/', async (req, res) => {
    await handleRequests(req, res, async (req, res) => {
        res.type('image/jpeg').send(funnyAnimals());
    });
});
router.get('/auth/', async (req, res) => {
    await handleRequests(req, res, async (req, res) => {
        const token = req.query.token?.toString();
        if (token)
            return tryAuth(res, { token });
        const login = req.query.login?.toString();
        const password = req.query.password?.toString();
        return (login && password)
            ? tryAuth(res, { login, password })
            : res.sendStatus(403);
    });
});
router.post('/parser/', async (req, res) => {
    await handleRequests(req, res, async (req, res) => {
        res.json(await parse(req.body.options, req.body.id));
    });
});
export default router;
