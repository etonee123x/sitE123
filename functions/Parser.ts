import Puppeteer, { Browser, Page } from 'puppeteer';
import { Buffer } from 'buffer';
import { mkdirSync, rmdirSync, writeFileSync } from 'fs';

interface Options {
  type: 'Buffer',
  data: number[]
}

export default class Parser {
  private browser?: Browser;
  private page?: Page;
  private allParsedData: any[] = [];
  private readonly bufferedOptions: Options;
  private readonly id?: number | string;

  private links: string[] | undefined;
  private method?: any;

  constructor(options: Options, id?: number | string) {
    this.id = id || Date.now();
    this.bufferedOptions = options;
  }

  private async getOptionsFromBuffer() {
    mkdirSync(`./content/parser/${this.id}`);
    writeFileSync(`./content/parser/${this.id}/index.cjs`, Buffer.from(this.bufferedOptions.data));
    const options = await import(`../content/parser/${this.id}/index.cjs`);
    rmdirSync(`./content/parser/${this.id}`, { recursive: true });
    this.links = options.default.links;
    this.method = options.default.method;
  }

  public async init() {
    this.browser = await Puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    this.page = await this.browser.newPage();
    await this.getOptionsFromBuffer();
  }

  public async parse(): Promise<any[]> {
    for (const url of this.links!) {
      console.log(`Переходим на ${url}`);
      await this.page!.goto(url, { waitUntil: 'networkidle2' });
      try {
        const pageData = await this.page!.evaluate(await this.method!);
        this.allParsedData.push(pageData);
      } catch (e) {
        console.log(`Ошибка парсинга на странице ${url}:`, (e as Error).message);
      }
    }
    await this.browser!.close();
    return this.allParsedData;
  }
}
