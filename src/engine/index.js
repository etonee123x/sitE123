import Puppeteer from 'puppeteer';
const BrowserInstance = Puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const handleRequestError = async (e) => {
    console.log(e);
};
export const handleRequests = async (req, res, requestCb) => {
    console.log(`New request to ${req.route.path}`);
    const qL = Object.keys(req.query).length;
    const bL = Object.keys(req.body).length;
    const pL = Object.keys(req.params).length;
    if (qL || bL || pL) {
        if (qL)
            console.log('Query:', req.query);
        if (bL)
            console.log('Body:', req.body);
        if (pL)
            console.log('Params:', req.params);
    }
    else
        console.log('No special params');
    try {
        await requestCb(req, res);
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
