import { readdirSync, readFileSync } from 'fs';
import { Buffer } from 'buffer';

export default class HappyNorming {
  private readonly randomPhoto: string;

  constructor() {
    const files = readdirSync('./content/funny-animals');
    const file = files[Math.floor(Math.random() * files.length)];
    this.randomPhoto = `./content/funny-animals/${file}`;
  }

  public getPhoto(): Buffer {
    return readFileSync(this.randomPhoto!);
  }
}
