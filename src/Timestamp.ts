import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

export type FormatType = 'default'|'unixtime'|'YYYYMMDD'|'YYYY-MM-DD'|'HH:mm:ss'|'RFC2822'|'ISO8601';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export class Timestamp{
  time : dayjs.Dayjs;

  constructor(arg: dayjs.Dayjs){
    this.time = arg;
  }

  isValid() : boolean{
    return this.time.isValid();
  }

  isUTC() : boolean{
    return this.time.isUTC();
  }

  local() : Timestamp{
    return new Timestamp(this.time.local());
  }

  utc() : Timestamp{
    return new Timestamp(this.time.utc());
  }

  static now() : Timestamp{
    return new Timestamp(dayjs().millisecond(0));
  }

  static unixtime(unixtimeMs:number):Timestamp{
    return new Timestamp(
      dayjs(""+unixtimeMs, 'x')
    );
  }

  static parse(value : string, isUtc : boolean): Timestamp{
    let patterns = [
      {
        description: 'unixtime',
        regexp: /^\d{9,10}$/,
        format: 'X',
      },
      {
        description: 'unixtime (ms)',
        regexp: /^\d{12,13}$/,
        format: 'x',
      },
    ];

    for (const p of patterns){
      const match = p.regexp.exec(value);
      if (match){
        if (isUtc){
          return new Timestamp(dayjs.utc(value, p.format));
        }
        return new Timestamp(dayjs(value, p.format));
      }
    }

    if (isUtc){
      return new Timestamp(dayjs.utc(value));
    }

    return new Timestamp(dayjs(value));
  }

  format(type: FormatType): string{
    switch (type){
      case 'default':
        return this.time.format('YYYY-MM-DD HH:mm:ss.SSS');
      case 'unixtime':
        return ""+this.time.unix();
      case 'YYYYMMDD':
        return ""+this.time.format('YYYYMMDD');
      case 'YYYY-MM-DD':
        return ""+this.time.format('YYYY-MM-DD');
      case 'HH:mm:ss':
        return this.time.format('HH:mm:ss');
      case 'RFC2822':
        return this.time.format('ddd, DD MMM YYYY HH:mm:ss ZZ');
      case 'ISO8601':
        if (this.time.isUTC()){
          return this.time.toISOString();
        }
        return this.time.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }
  }
}

export class Duration{
  private from:Timestamp;
  private to:Timestamp;

  constructor(from: Timestamp, to:Timestamp){
    this.from = from;
    this.to = to;
  }

  toDurationString(): string{
    const valueMs = Math.abs(this.to.time.diff(this.from.time));
    const ms = valueMs%1000;
    const s = Math.trunc(valueMs/1000)%60;
    const m = Math.trunc(valueMs/1000/60)%60;
    const h = Math.trunc(valueMs/1000/60/60)%24;
    const d = Math.trunc(valueMs/1000/60/60/24);

    let result = 'P';
    if (d !== 0){
      result += d+"D";
    }
    result += "T";
    if (h !== 0){
      result += h+"H";
    }
    if (m !== 0){
      result += m+"M";
    }
    if (ms !== 0){
      result += s+"."+ms.toString().padStart(3, '0')+"S";
    } else if (s !== 0 || valueMs === 0) {
      result += s+"S";
    }
    return result;
  }  
}
