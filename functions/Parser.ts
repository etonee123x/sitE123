import Puppeteer, { Browser, Page } from 'puppeteer';
import { Buffer } from 'buffer';
import { mkdirSync, rmdirSync, writeFileSync } from 'fs';

interface Links {
  type: 'csv' | 'txt' | 'json'
  data: {
    type: 'Buffer',
    data: number[]
  }
}

interface Method {
  type: 'Buffer',
  data: number[]
}

export default class Parser {
  private browser?: Browser;
  private page?: Page;
  private allParsedData: any[] = [];
  private readonly id: number;
  private readonly bufferLinks: Links;
  private readonly bufferMethod: Method;

  private links: string[]| undefined;
  private method?: any;

  constructor(id: number, links: Links, method: Method) {
    this.bufferLinks = links;
    this.bufferMethod = method;
    this.id = id;
  }

  private static parseLinksBufferToArray(links: Links) {
    const parseCSV = (buffer: number[]) => {
      return Buffer
        .from(buffer)
        .toString()
        .trim()
        .split('\n')
        .filter((item: string, idx: number) => idx > 0)
        .map((item: string) => item.trim());
    };
    const parseTXT = (buffer: number[]) => {
      return Buffer
        .from(buffer)
        .toString()
        .trim()
        .split('\n')
        .map((item: string) => item.trim());
    };
    const parseJSON = (buffer: number[]) => {
      return JSON.parse(Buffer.from(buffer).toString());
    };
    switch (links.type) {
      case 'csv':
        return parseCSV(links.data.data);
      case 'txt':
        return parseTXT(links.data.data);
      case 'json':
        return parseJSON(links.data.data);
    }
  }

  private static async parseMethodBufferToMethod(method: Method, id: number): Promise<Function> {
    mkdirSync(`./content/parser/${id}`);
    writeFileSync(`./content/parser/${id}/index.cjs`, Buffer.from(method.data));
    const answer = await import(`../content/parser/${id}/index.cjs`);
    rmdirSync(`./content/parser/${id}`, { recursive: true });
    return answer.default;
  }

  public async init(): Promise<this> {
    this.browser = await Puppeteer.launch({ headless: true });
    this.page = await this.browser.newPage();
    this.links = Parser.parseLinksBufferToArray(this.bufferLinks);
    this.method = await Parser.parseMethodBufferToMethod(this.bufferMethod, this.id)!;
    return this;
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
