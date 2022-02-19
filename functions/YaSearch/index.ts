import ParserEngine from '../ParserEngine';

export default class YaSearch {
  private readonly query: string;
  private static YA_QUERY = (query: string) =>
    `https://yandex.ru/search/?text=${query.replace(/\s+/g, '+')}`;

  // TODO: rewrite on TS
  // @ts-ignore
  private static PARSE_METHOD = import('./parseMethod.cjs');

  private results: any[] | undefined;

  constructor(query: string) {
    this.query = query;
  }

  public async search() {
    const parserEngine = new ParserEngine(
      Array(YaSearch.YA_QUERY(this.query)),
      (await YaSearch.PARSE_METHOD).default,
    );
    await parserEngine.init();
    this.results = await parserEngine.parse();
  }

  public getResults(): any[] {
    return this.results!;
  }
}
