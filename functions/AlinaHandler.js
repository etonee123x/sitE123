import { readdirSync, readFileSync } from 'fs';
export default class AlinaHandler {
    constructor() {
        const files = readdirSync('./content/alina-handler');
        const file = files[Math.floor(Math.random() * files.length)];
        this.randomPhoto = `./content/alina-handler/${file}`;
    }
    getPhoto() {
        return readFileSync(this.randomPhoto);
    }
}
