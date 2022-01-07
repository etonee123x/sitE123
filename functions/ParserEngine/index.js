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
export default class ParserEngine {
    constructor(links, method) {
        this.allParsedData = [];
        this.links = [...links];
        this.method = method;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = yield Puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            this.page = yield this.browser.newPage();
        });
    }
    parse() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (const url of this.links) {
                    yield this.page.goto(url, { waitUntil: 'networkidle2' });
                    try {
                        const pageData = yield this.page.evaluate(yield this.method);
                        this.allParsedData.push(pageData);
                    }
                    catch (e) {
                        this.allParsedData.push({
                            caption: `Error occurred on parsing ${url}`,
                            error: {
                                name: e.name,
                                message: e.message,
                                stack: e.stack,
                            },
                        });
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
            finally {
                yield this.browser.close();
            }
            return this.allParsedData;
        });
    }
}
