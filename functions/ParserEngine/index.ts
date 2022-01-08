import Puppeteer, { Browser, Page } from 'puppeteer';

export default class ParserEngine {
  private browser?: Browser;
  private page?: Page;
  private allParsedData: any[] = [];

  private readonly links: string[] | undefined;
  private readonly method?: any;

  constructor(links: string[], method: any) {
    this.links = [...links];
    this.method = method;
  }

  public async init(): Promise<this> {
    this.browser = await Puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    this.page = await this.browser.newPage();
    return this;
  }

  public async parse(): Promise<any[]> {
    try {
      for (const url of this.links!) {
        await this.page!.goto(url, { waitUntil: 'networkidle2' });
        try {
          const pageData = await this.page!.evaluate(await this.method!);
          this.allParsedData.push(pageData);
        } catch (e) {
          this.allParsedData.push(
            {
              caption: `Error occurred on parsing ${url}`,
              error: {
                name: (e as Error).name,
                message: (e as Error).message,
                stack: (e as Error).stack,
              },
            },
          );
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      await this.browser!.close();
    }
    return this.allParsedData;
  }
}
