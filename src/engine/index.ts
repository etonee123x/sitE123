/* eslint-disable @typescript-eslint/no-explicit-any */
import Puppeteer from 'puppeteer';
import type { Request, Response } from 'express';
import { ErrorLike } from '../../includes/types/index.js';
import { validationResult } from 'express-validator';
import { dtConsole } from '../utils/index.js';

const BrowserInstance = Puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const handleRequestError = async (e: ErrorLike) => {
  dtConsole.error(e);
};

type ReqAfterMidd = Request<
Record<string, any> | undefined,
any,
any,
Record<string, any> | undefined,
Record<string, any>
>

export const handleRequests = async (
  req: ReqAfterMidd,
  res: Response,
  cb: (req: ReqAfterMidd, res: Response) => unknown,
) => {
  dtConsole.log(`New request to ${req.route.path}`);
  const errors = validationResult(req).array();
  if (errors.length) return res.status(400).send(errors);
  const hasQuery = Boolean(Object.keys(req.query ?? {}).length);
  const hasBody = Boolean(Object.keys(req.body).length);
  const hasParams = Boolean(Object.keys(req.params ?? {}).length);
  if (hasQuery || hasBody || hasParams) {
    if (hasQuery) dtConsole.log('Query:', req.query);
    if (hasBody) dtConsole.log('Body:', req.body);
    if (hasParams) dtConsole.log('Params:', req.params);
  } else {
    dtConsole.log('No special params');
  }

  try {
    await cb(req, res);
  } catch (e) {
    await handleRequestError(e as ErrorLike);
    res.sendStatus(404);
  }
};

export const commonParse = async (links: string[], method: () => Promise<object[]>) => {
  const browser = await BrowserInstance;
  const page = await browser.newPage();

  const allParsedData = [];

  try {
    for (const url of links) {
      await page.goto(url, { waitUntil: 'networkidle2' });
      try {
        const pageData = await page.evaluate(method);
        allParsedData.push(pageData);
      } catch (error) {
        allParsedData.push({
          caption: `Error occurred during parsing ${url}`,
          error,
        });
      }
    }
  } catch (e) {
    dtConsole.error(e);
  } finally {
    page.close();
  }
  return allParsedData;
};
