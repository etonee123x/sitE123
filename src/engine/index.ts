import { Request, Response } from 'express';
import Puppeteer from 'puppeteer';

const BrowserInstance = Puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

export const handleRequests = async (
  req: Request,
  res: Response,
  requestHandler: (req: Request, res: Response) => unknown,
) => {
  console.log(`New request to ${req.route.path}`);
  const qL = Object.keys(req.query).length;
  const bL = Object.keys(req.body).length;
  const pL = Object.keys(req.params).length;
  if (qL || bL || pL) {
    if (qL) console.log('Query:', req.query);
    if (bL) console.log('Body:', req.body);
    if (pL) console.log('Params:', req.params);
  } else console.log('No special params');

  try {
    await requestHandler(req, res);
  } catch (e) {
    console.log(e);
    res.sendStatus(404);
  }
};

export const commonParse = async (links: string[], method: any) => {
  const browser = await BrowserInstance;
  const page = await browser.newPage();

  const allParsedData = [];

  try {
    for (const url of links) {
      await page.goto(url, { waitUntil: 'networkidle2' });
      try {
        const pageData = await page.evaluate(await method);
        allParsedData.push(pageData);
      } catch (error) {
        allParsedData.push({
          caption: `Error occurred during parsing ${url}`,
          error,
        });
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    page.close();
  }
  return allParsedData;
};
