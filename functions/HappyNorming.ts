import { readdirSync, readFileSync } from 'fs';
import { Buffer } from 'buffer';

export default class HappyNorming {
  private readonly dayOfTheWeek: string;
  private readonly randomPhoto: string;

  constructor(dayOfTheWeek: string) {
    this.dayOfTheWeek = dayOfTheWeek.toLowerCase();
    const files = readdirSync(`./content/happy-norming/${this.dayOfTheWeek}`);
    const file = files[Math.floor(Math.random() * files.length)];
    this.randomPhoto = `./content/happy-norming/${this.dayOfTheWeek}/${file}`;
  }

  public getPhoto(): Buffer {
    return readFileSync(this.randomPhoto!);
  }
}
