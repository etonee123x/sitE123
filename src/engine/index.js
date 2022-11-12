/* eslint-disable @typescript-eslint/no-explicit-any */
import Puppeteer from 'puppeteer';
import { validationResult } from 'express-validator';
const BrowserInstance = Puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const handleRequestError = async (e) => {
    console.log(e);
};
export const handleRequests = async (req, res, cb) => {
    console.log(`New request to ${req.route.path}`);
    const errors = validationResult(req).array();
    if (errors.length)
        return res.status(400).send(errors);
    const hasQuery = Boolean(Object.keys(req.query ?? {}).length);
    const hasBody = Boolean(Object.keys(req.body).length);
    const hasParams = Boolean(Object.keys(req.params ?? {}).length);
    if (hasQuery || hasBody || hasParams) {
        if (hasQuery)
            console.log('Query:', req.query);
        if (hasBody)
            console.log('Body:', req.body);
        if (hasParams)
            console.log('Params:', req.params);
    }
    else
        console.log('No special params');
    try {
        await cb(req, res);
    }
    catch (e) {
        await handleRequestError(e);
        res.sendStatus(404);
    }
};
export const commonParse = async (links, method) => {
    const browser = await BrowserInstance;
    const page = await browser.newPage();
    const allParsedData = [];
    try {
        for (const url of links) {
            await page.goto(url, { waitUntil: 'networkidle2' });
            try {
                const pageData = await page.evaluate(method);
                allParsedData.push(pageData);
            }
            catch (error) {
                allParsedData.push({
                    caption: `Error occurred during parsing ${url}`,
                    error,
                });
            }
        }
    }
    catch (e) {
        console.log(e);
    }
    finally {
        page.close();
    }
    return allParsedData;
};
