var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Puppeteer from 'puppeteer';
import { Buffer } from 'buffer';
import { mkdirSync, rmdirSync, writeFileSync } from 'fs';
export default class Parser {
    constructor(options, id) {
        this.allParsedData = [];
        this.id = id || Date.now();
        this.bufferedOptions = options;
    }
    getOptionsFromBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            mkdirSync(`./content/parser/${this.id}`);
            writeFileSync(`./content/parser/${this.id}/index.cjs`, Buffer.from(this.bufferedOptions.data));
            const options = yield import(`../content/parser/${this.id}/index.cjs`);
            rmdirSync(`./content/parser/${this.id}`, { recursive: true });
            this.links = options.default.links;
            this.method = options.default.method;
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = yield Puppeteer.launch({ headless: true });
            this.page = yield this.browser.newPage();
            yield this.getOptionsFromBuffer();
        });
    }
    parse() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const url of this.links) {
                console.log(`Переходим на ${url}`);
                yield this.page.goto(url, { waitUntil: 'networkidle2' });
                try {
                    const pageData = yield this.page.evaluate(yield this.method);
                    this.allParsedData.push(pageData);
                }
                catch (e) {
                    console.log(`Ошибка парсинга на странице ${url}:`, e.message);
                }
            }
            yield this.browser.close();
            return this.allParsedData;
        });
    }
}
