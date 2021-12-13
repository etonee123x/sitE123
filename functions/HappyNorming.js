import { readdirSync, readFileSync } from 'fs';
export default class HappyNorming {
    constructor(dayOfTheWeek) {
        this.dayOfTheWeek = dayOfTheWeek.toLowerCase();
        const files = readdirSync(`./content/happy-norming/${this.dayOfTheWeek}`);
        const file = files[Math.floor(Math.random() * files.length)];
        this.randomPhoto = `./content/happy-norming/${this.dayOfTheWeek}/${file}`;
    }
    getPhoto() {
        return readFileSync(this.randomPhoto);
    }
}
