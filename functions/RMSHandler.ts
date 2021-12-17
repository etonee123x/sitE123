import { readFileSync } from 'fs';
import { Buffer } from 'buffer';

interface IWAVHeaders {
  channelsNumber: number
  sampleRate: number
  byteRate: number
  blockAlign: number
  bitsPerSample: number
  dataSize: number
}

export default class RmsHandler {
  public theBuffer?: Buffer;
  private blocksNumber?: number;
  private headers: IWAVHeaders = {} as IWAVHeaders;
  private channels?: { left: number[], right: number[] };
  private blocksPerNSeconds?: number;
  private blocksPerMMilliSeconds?: number;
  private theLoudestSegment?: { start: number, end: number };
  private pointsNumber?: number;
  private segmentRmsDbValues: number[] | undefined;

  private static readonly N_SECONDS_TO_CHECK = 10;
  private static readonly M_MILLISECONDS_TO_CHECK = 300;
  private static readonly K_BLOCKS = Math.pow(2, 6);

  public fromFile(pathToFile: string): RmsHandler {
    this.theBuffer = readFileSync(pathToFile);
    return this;
  }

  public fromBuffer(buffer: Buffer): RmsHandler {
    this.theBuffer = buffer;
    return this;
  }

  private readHeaders() {
    const riff = this.theBuffer!.slice(0, 4);
    if (riff.toString() !== 'RIFF') {
      throw new Error('this is not wav file');
    }
    this.headers.channelsNumber = this.theBuffer!.readUInt16LE(22);
    if (this.headers.channelsNumber !== 2) {
      throw new Error('this wav file doesn\'t have 2 channels');
    }
    this.headers.sampleRate = this.theBuffer!.readUInt32LE(24);
    this.headers.byteRate = this.theBuffer!.readUInt32LE(28);
    this.headers.blockAlign = this.theBuffer!.readUInt16LE(32);
    this.headers.bitsPerSample = this.theBuffer!.readUInt16LE(34);
    this.headers.dataSize = this.theBuffer!.readUInt32LE(40);
    this.theBuffer = this.theBuffer!.slice(44, this.theBuffer!.length);
  }

  private findBlockLengths() {
    const blocksPerSecondInASingleChannel = this.headers.byteRate / (this.headers.blockAlign * RmsHandler.K_BLOCKS);
    this.blocksPerNSeconds = Math.floor(blocksPerSecondInASingleChannel * RmsHandler.N_SECONDS_TO_CHECK);
    this.blocksPerMMilliSeconds = Math.floor(blocksPerSecondInASingleChannel * RmsHandler.M_MILLISECONDS_TO_CHECK / 1000);
  }

  private parseWavToChannels() {
    this.channels = { left: [], right: [] };
    if (this.headers.bitsPerSample === 16) {
      for (let i = 1; i < this.blocksNumber!; i += RmsHandler.K_BLOCKS) {
        const blockData = this.theBuffer!.slice(i * this.headers.blockAlign, (i + 1) * this.headers.blockAlign);
        this.channels.left.push(blockData.readInt16LE(0));
        this.channels.right.push(blockData.readInt16LE(2));
      }
    } else if (this.headers.bitsPerSample === 32) {
      for (let i = 1; i < this.blocksNumber!; i += RmsHandler.K_BLOCKS) {
        const blockData = this.theBuffer!.slice(i * this.headers.blockAlign, (i + 1) * this.headers.blockAlign);
        this.channels.left.push(blockData.readInt32LE(0));
        this.channels.right.push(blockData.readInt32LE(4));
      }
    }
    this.pointsNumber = this.channels.left.length;
  };

  private findTheLoudestSegment() {
    const theLoudest = {
      index: 0,
      loudness: 0,
    };
    for (let i = 0; i <= this.channels!.left.length - this.blocksPerNSeconds!; i++) {
      let l = 0;
      for (let j = 0; j < this.blocksPerNSeconds!; j++) {
        const channelsSum = (this.channels!.left[i + j] + this.channels!.right[i + j]) / 2;
        l += Math.pow(channelsSum, 2) / this.blocksPerNSeconds!;
      }
      l = Math.sqrt(l);
      if (l > theLoudest.loudness) {
        theLoudest.loudness = l;
        theLoudest.index = i;
      }
    }
    this.theLoudestSegment = {
      start: theLoudest.index,
      end: theLoudest.index + this.blocksPerNSeconds!,
    };
    return theLoudest;
  }

  private getRmsInTheLoudestSegment() {
    this.segmentRmsDbValues = [];
    for (let i = this.theLoudestSegment!.start!; i < this.theLoudestSegment!.end! - this.blocksPerMMilliSeconds!; i++) {
      let segmentRms = 0;
      for (let j = 0; j < this.blocksPerMMilliSeconds!; j++) {
        const lc = this.channels!.left[i + j];
        const rc = this.channels!.right[i + j];
        const semiSum = (lc + rc) / 2;
        const semiSumPow2 = semiSum * semiSum;
        const semiSumPow2DivN = semiSumPow2 / this.blocksPerMMilliSeconds!;
        segmentRms += semiSumPow2DivN;
      }
      segmentRms = Math.sqrt(segmentRms) * Math.sqrt(2);
      const dB = 20 * Math.log10(segmentRms / Math.pow(2, this.headers.bitsPerSample - 1));
      this.segmentRmsDbValues.push(Number(dB.toFixed(2)));
    }
  }

  public getRms() {
    this.readHeaders();
    this.blocksNumber = this.headers.dataSize / this.headers.blockAlign;
    this.parseWavToChannels();
    this.findBlockLengths();
    this.findTheLoudestSegment();
    this.getRmsInTheLoudestSegment();
    return this;
  }

  public formInfo(): string {
    const duration = Math.floor(this.headers.dataSize / this.headers.byteRate);
    const audioDuration = { minutes: Math.floor(duration / 60), seconds: duration % 60 };
    const theLoudestSegment = {
      start: {
        minutes: RmsHandler.toMinutes(this.theLoudestSegment!.start / this.pointsNumber! * duration),
        seconds: RmsHandler.toSeconds(this.theLoudestSegment!.start / this.pointsNumber! * duration),
      },
      end: {
        minutes: RmsHandler.toMinutes(this.theLoudestSegment!.end / this.pointsNumber! * duration),
        seconds: RmsHandler.toSeconds(this.theLoudestSegment!.end / this.pointsNumber! * duration),
      },
    };
    const intervals = RmsHandler.getIntervals(this.segmentRmsDbValues!) as { min: number, max: number };
    return `Duration: ${audioDuration.minutes}:${audioDuration.seconds}\n` +
      `The loudest segment: ${theLoudestSegment.start.minutes}:${theLoudestSegment.start.seconds}-${theLoudestSegment.end.minutes}:${theLoudestSegment.end.seconds}\n` +
      `RMS: ${Math.min(...this.segmentRmsDbValues!)} .. ${Math.max(...this.segmentRmsDbValues!)}\n` +
      `Intervals: ${intervals.min.toFixed(2)} .. ${intervals.max.toFixed(2)}`;
  }

  private static toMinutes(time: number): string {
    return Math.floor(time / 60).toString();
  }

  private static toSeconds(time: number): string {
    const result = Math.floor(time) % 60;
    return result > 10 ? `${result}` : `0${result}`;
  }

  private static getIntervals(arr: number[]) {
    const SIGMAS = 1;

    let avgValue = 0;
    for (let i = 0; i < arr.length; i++) {
      avgValue += arr[i] / arr.length;
    }
    let d = 0;
    for (let i = 0; i < arr.length; i++) {
      d += (((arr[i] - avgValue) * (arr[i] - avgValue)) / arr.length);
    }
    const sigma = Math.sqrt(d);
    return {
      min: avgValue - (SIGMAS * sigma),
      max: avgValue + (SIGMAS * sigma),
    };
  }
}
(async() => {
  const rmsHandler = new RmsHandler();
  console.log(rmsHandler
    .fromFile('../content/t.wav')
    .getRms()
    .formInfo());
  console.log();
  console.log(rmsHandler);
})().catch(e => console.error('Error:', (e as Error).message));
