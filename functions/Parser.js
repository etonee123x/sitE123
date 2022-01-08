var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Buffer } from 'buffer';
import { mkdirSync, rmdirSync, writeFileSync } from 'fs';
import ParserEngine from './ParserEngine/index.js';
export default class Parser {
    constructor(options, id) {
        this.id = id || Date.now();
        this.bufferedOptions = options;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            mkdirSync(`./content/parser/${this.id}`);
            writeFileSync(`./content/parser/${this.id}/index.cjs`, Buffer.from(this.bufferedOptions.data));
            const options = yield import(`../content/parser/${this.id}/index.cjs`);
            rmdirSync(`./content/parser/${this.id}`, { recursive: true });
            this.links = options.default.links;
            this.method = options.default.method;
            const parserEngine = yield new ParserEngine(this.links, this.method).init();
            this.results = yield parserEngine.parse();
        });
    }
    getResults() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.results;
        });
    }
}
