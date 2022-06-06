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
const BrowserInstance = Puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
export const handleRequestsHandler = (req, res, requestHandler) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`New request to ${req.route.path}`);
    const qL = Object.keys(req.query).length;
    const bL = Object.keys(req.body).length;
    const pL = Object.keys(req.params).length;
    if (qL || bL || pL) {
        if (qL)
            console.log('Query:', req.query);
        if (bL)
            console.log('Body:', req.body);
        if (pL)
            console.log('Params:', req.params);
    }
    else
        console.log('No special params');
    try {
        yield requestHandler(req, res);
    }
    catch (e) {
        console.log(e);
        res.sendStatus(404);
    }
});
export const commonParse = (links, method) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield BrowserInstance;
    const page = yield browser.newPage();
    const allParsedData = [];
    try {
        for (const url of links) {
            yield page.goto(url, { waitUntil: 'networkidle2' });
            try {
                const pageData = yield page.evaluate(yield method);
                allParsedData.push(pageData);
            }
            catch (error) {
                allParsedData.push({
                    caption: `Error occurred during parsing ${url}`,
                    error,
                });
            }
        }
    }
    catch (e) {
        console.log(e);
    }
    finally {
        page.close();
    }
    return allParsedData;
});
var ModuleTitlesEnum;
(function (ModuleTitlesEnum) {
    ModuleTitlesEnum["GET_FOLDER_DATA"] = "GET_FOLDER_DATA";
})(ModuleTitlesEnum || (ModuleTitlesEnum = {}));
export class Guide {
    static test({ modules }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(modules);
            return new Guide();
        });
    }
}
Guide.MODULES = {
    GET_FOLDER_DATA: {
        title: 'get-folder-data',
        shortDesc: 'returns info about directory structure in content',
        longDesc: '',
        method: ['GET'],
        testUrls: ['/get-folder-data', '/get-folder-data/images'],
        resultType: 'json',
    },
};
