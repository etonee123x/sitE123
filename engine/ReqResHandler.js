var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class ReqResHandler {
    constructor(req, res, handler) {
        this.request = req;
        this.response = res;
        this.handler = handler;
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
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.handler(this.request, this.response);
            }
            catch (e) {
                this.response.sendStatus(404);
            }
        });
    }
}
