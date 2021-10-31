import { Timestamp } from './Timestamp'

export type TextToken = {
  text: string,
  type: 'text',
}

export type TimestampToken = {
  text: string,
  type: 'timestamp',
  timestamp: Timestamp,
}

export type LfToken = {
  text: "\n",
  type: 'lf',
}

export type Token = TextToken | TimestampToken | LfToken;

export function isTimestampToken(token: Token): token is TimestampToken {
  return token.text !== undefined && token.type === 'timestamp' && token.timestamp !== undefined;
}

export type DefaultTimezone = 'local' | 'utc';
export function isDefaultTimezone(timezone:string): timezone is DefaultTimezone{
  return timezone === 'local' || timezone === 'utc';
}

export class Parser {

  private readonly defaultTimezone;
  private readonly clock;

  constructor(defaultTimezone:DefaultTimezone, clock: () => Date) {
    this.defaultTimezone = defaultTimezone;
    this.clock = clock;
  }

  parseLine(inputs: Token[], regex: RegExp | string): Token[] {
    return inputs.flatMap(input => {
      if (input.type !== 'text') {
        return [input];
      }
      const result: Token[] = [];
      const re = new RegExp(regex, 'g');
      let lastIndex = 0;
      let match;
      while ((match = re.exec(input.text)) !== null) {
        if (match.index !== 0 && lastIndex !== match.index) {
          result.push({
            text: input.text.slice(lastIndex, match.index),
            type: 'text',
          });
        }
        result.push(
          this.generateTimestampToken(
            input.text.slice(match.index, match.index + match[0].length),
            match.groups
          )
        );

        lastIndex = re.lastIndex;
      }
      if (lastIndex !== input.text.length) {
        result.push({
          text: input.text.slice(lastIndex),
          type: 'text',
        })
      }
      return result;
    });
  }

  generateTimestampToken(text: string, groups: { [key: string]: string } | undefined): TimestampToken {


    if (groups === undefined) {
      return {
        text: text,
        type: 'timestamp',
        timestamp: Timestamp.now(),
      }
    }

    let timestamp: Timestamp = this.generateTimestamp(groups);

    return {
      text: text,
      type: 'timestamp',
      timestamp: timestamp,
    }
  }

  generateTimestamp(groups: { [key: string]: string }): Timestamp {

    let obj: { [key: string]: number } = {};
    ['year', 'month', 'date', 'hh', 'mm', 'ss', 'ms', 'unixtime', 'unixtimeMs', 'offset_hh', 'offset_mm'].filter(
      v => groups[v]
    ).forEach(v => { obj[v] = parseInt(groups[v], 10) });

    if (groups.monthName !== undefined) {
      const i = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(groups.monthName.toLowerCase());
      if (i !== -1) {
        obj.month = i + 1;
      }
    }

    const now = this.clock();

    if (obj.unixtime !== undefined) {
      return Timestamp.unixtime(obj.unixtime * 1000);
    } else if (obj.unixtimeMs !== undefined) {
      return Timestamp.unixtime(obj.unixtimeMs);
    } else {
      let iso8601 =
        (obj.year ?? now.getFullYear()).toString().padStart(4, '0')
        + '-'
        + (obj.month ?? now.getMonth() + 1).toString().padStart(2, '0')
        + '-'
        + (obj.date ?? now.getDate()).toString().padStart(2, '0')
        + 'T'
        + (obj.hh ?? 0).toString().padStart(2, '0')
        + ':'
        + (obj.mm ?? 0).toString().padStart(2, '0')
        + ':'
        + (obj.ss ?? 0).toString().padStart(2, '0')
        + '.'
        + (obj.ms ?? 0).toString().padStart(3, '0');

      let offset_sign: '+' | '-' = '+';
      let offset_hh: number;
      let offset_mm: number;

      if (groups.offset === undefined) {
        switch (this.defaultTimezone){
          case 'local':
            offset_sign = now.getTimezoneOffset() > 0 ? '-' : '+';
            offset_hh = Math.floor(Math.abs(now.getTimezoneOffset() / 60));
            offset_mm = Math.abs(now.getTimezoneOffset() % 60);
            break;
          case 'utc':
            offset_sign = '+';
            offset_hh = 0;
            offset_mm = 0;
            break;
        }
      } else if (groups.offset === 'Z' || groups.offset === 'GMT') {
        offset_sign = '+';
        offset_hh = 0;
        offset_mm = 0;
      } else {
        offset_sign = (groups.offset_sign === '-' ? '-' : '+');
        offset_hh = obj.offset_hh ?? 0;
        offset_mm = obj.offset_mm ?? 0;
      }

      iso8601 += offset_sign
        + offset_hh.toString().padStart(2, '0')
        + ':'
        + offset_mm.toString().padStart(2, '0');

      return Timestamp.parse(iso8601, false);
    }
  }

  parse(text: string): Token[] {
    const monthName = '(?<monthName>Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)';
    const dayName = '(?<dayName>Mon|Tue|Wed|Thu|Fri|Sat|Sun)';
    const timezone = '(?<offset>(?<offset_sign>\\+|-)(?<offset_hh>\\d{2}):?(?<offset_mm>\\d{2})|Z|GMT)'

    const year = `(?<year>\\d{4})`
    const month = `(?<month>0[0-9]|1[0-2])`
    const day = `(?<date>[0-2][0-9]|30|31)`

    const yyyy_mm_dd = `(${year}[-/_]${month}[-/_]${day})`

    const hh = `(?<hh>[01]\\d|2[0-3])`;
    const mm = `(?<mm>[0-5]\\d)`;
    const ss = `(?<ss>[0-5]\\d|60)`;
    const ms = `(?<ms>\\d{3})`;

    const hh_mm_ss = `(${hh}:${mm}:${ss})`

    const regexps = [
      `${dayName}, ${day} ${monthName} ${year} ${hh_mm_ss} ${timezone}`,
      `${dayName}, ${day} ${monthName} ${year} ${hh_mm_ss}`,

      `${yyyy_mm_dd}[ T]${hh_mm_ss}\\.${ms}${timezone}`,
      `${yyyy_mm_dd}[ T]${hh_mm_ss}${timezone}`,
      `${yyyy_mm_dd}[ T]${hh_mm_ss}\\.${ms}`,
      `${yyyy_mm_dd}[ T]${hh_mm_ss}`,
      `${yyyy_mm_dd}`,

      `(?<!\\d)(?<unixtime>\\d{10})(?!\\d)`,
      `(?<!\\d)(?<unixtimeMs>\\d{13})(?!\\d)`,
      `(?<!\\d)${year}${month}${day}${hh}${mm}${ss}(?!\\d)`,
      `(?<!\\d)${year}${month}${day}(?!\\d)`,

      `${day}/${monthName}/${year}:${hh_mm_ss} ${timezone}`,
    ];

    return text.split("\n").map(s => {
      let nodes: Token[] = [{ text: s, type: 'text' }];

      for (const regexp of regexps) {
        nodes = this.parseLine(nodes, regexp);
      }

      return nodes;
    }).reduce((prev, cur) => prev.concat([{ text: "\n", type: 'lf' }], ...cur));
  }
}
