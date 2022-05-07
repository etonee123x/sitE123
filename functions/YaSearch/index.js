var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ParserEngine from '../ParserEngine/index.js';
export default class YaSearch {
    constructor(query) {
        this.query = query;
    }
    search() {
        return __awaiter(this, void 0, void 0, function* () {
            const parserEngine = new ParserEngine(Array(YaSearch.YA_QUERY(this.query)), (yield YaSearch.PARSE_METHOD).default);
            yield parserEngine.init();
            this.results = yield parserEngine.parse();
        });
    }
    getResults() {
        return this.results;
    }
}
YaSearch.YA_QUERY = (query) => `https://yandex.ru/search/?text=${query.replace(/\s+/g, '+')}`;
// TODO: rewrite on TS
// @ts-ignore
YaSearch.PARSE_METHOD = import('./parseMethod.cjs');
;
