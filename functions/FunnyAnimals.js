import { readdirSync, readFileSync } from 'fs';
export default class HappyNorming {
    constructor() {
        const files = readdirSync('./content/funny-animals');
        const file = files[Math.floor(Math.random() * files.length)];
        this.randomPhoto = `./content/funny-animals/${file}`;
    }
    getPhoto() {
        return readFileSync(this.randomPhoto);
    }
}
