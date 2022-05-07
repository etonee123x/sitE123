import { Buffer } from 'buffer';
import { mkdirSync, rmdirSync, writeFileSync } from 'fs';
import ParserEngine from './ParserEngine/index.js';

interface Options {
  type: 'Buffer',
  data: number[]
}

export default class Parser {
  private readonly bufferedOptions: Options;
  private readonly id?: number | string;
  private results: any[] | undefined;

  private links: string[] | undefined;
  private method?: any;

  constructor(options: Options, id?: number | string) {
    this.id = id || Date.now();
    this.bufferedOptions = options;
  }

  public async init() {
    mkdirSync(`./content/parser/${this.id}`);
    writeFileSync(`./content/parser/${this.id}/index.cjs`, Buffer.from(this.bufferedOptions.data));
    const options = await import(`../content/parser/${this.id}/index.cjs`);
    rmdirSync(`./content/parser/${this.id}`, { recursive: true });
    this.links = options.default.links;
    this.method = options.default.method;
    const parserEngine = await new ParserEngine(this.links!, this.method).init();
    this.results = await parserEngine.parse();
  }

  public async getResults() {
    return this.results;
  }
}
