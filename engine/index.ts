import { Request, Response } from 'express';
import Puppeteer from 'puppeteer';

const BrowserInstance = Puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

export const handleRequestsHandler = async (
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

enum ModuleTitlesEnum {
  GET_FOLDER_DATA = 'GET_FOLDER_DATA',
}

interface Module {
  title: string;
  shortDesc: string;
  longDesc: string;
  method: Array<'GET' | 'PUT'>;
  testUrls: string[];
  resultType: 'json' | 'buffer';
}

type Modules = Record<ModuleTitlesEnum, Module>;

interface Result {
  moduleTitle: string;
  outputType: 'json' | 'buffer';
  results: {
    url: string;
    response: string;
  }[];
}

export class Guide {
  public static MODULES: Modules = {
    GET_FOLDER_DATA: {
      title: 'get-folder-data',
      shortDesc: 'returns info about directory structure in content',
      longDesc: '',
      method: ['GET'],
      testUrls: ['/get-folder-data', '/get-folder-data/images'],
      resultType: 'json',
    },
  };

  public static async test({ modules }: { modules: Module[] }) {
    console.log(modules);
    return new Guide();
  }
}
