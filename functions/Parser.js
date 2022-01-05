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
    constructor(id, links, method) {
        this.allParsedData = [];
        this.bufferLinks = links;
        this.bufferMethod = method;
        this.id = id;
    }
    static parseLinksBufferToArray(links) {
        const parseCSV = (buffer) => {
            return Buffer
                .from(buffer)
                .toString()
                .trim()
                .split('\n')
                .filter((item, idx) => idx > 0)
                .map((item) => item.trim());
        };
        const parseTXT = (buffer) => {
            return Buffer
                .from(buffer)
                .toString()
                .trim()
                .split('\n')
                .map((item) => item.trim());
        };
        const parseJSON = (buffer) => {
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
    static parseMethodBufferToMethod(method, id) {
        return __awaiter(this, void 0, void 0, function* () {
            mkdirSync(`./content/parser/${id}`);
            writeFileSync(`./content/parser/${id}/index.cjs`, Buffer.from(method.data));
            const answer = yield import(`../content/parser/${id}/index.cjs`);
            rmdirSync(`./content/parser/${id}`, { recursive: true });
            return answer.default;
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = yield Puppeteer.launch({ headless: true });
            this.page = yield this.browser.newPage();
            this.links = Parser.parseLinksBufferToArray(this.bufferLinks);
            this.method = yield Parser.parseMethodBufferToMethod(this.bufferMethod, this.id);
            return this;
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
