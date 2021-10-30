import { Token, TextToken, TimestampToken, LfToken, Parser } from './Parser';
import { Timestamp } from './Timestamp';

function textToken(...texts: string[]): TextToken[] {
  return texts.map(t => ({ type: 'text', text: t }));
}

function timestampToken(...texts: string[]): TimestampToken[] {
  return texts.map(t => ({ type: 'timestamp', text: t, timestamp: Timestamp.parse(t, false) }));
}

function isTimestampToken(token: Token): token is TimestampToken {
  return token.text !== undefined && token.type === 'timestamp' && token.timestamp !== undefined;
}

function lfToken(): LfToken[] {
  return [{ text: "\n", type: 'lf', }]
}

const yyyy_mm_dd = '2021-01-01';
const yyyymmdd = '20210101';
test.each([
  [
    `a${yyyy_mm_dd}b`,
    [
      textToken('a'),
      timestampToken(yyyy_mm_dd),
      textToken('b'),
    ].flat(),
  ],
  [
    `a${yyyy_mm_dd}`,
    [
      textToken('a'),
      timestampToken(yyyy_mm_dd),
    ].flat(),
  ],
  [
    `${yyyy_mm_dd}a`,
    [
      timestampToken(yyyy_mm_dd),
      textToken('a'),
    ].flat(),
  ],
  [
    `a${yyyy_mm_dd}${yyyy_mm_dd}b`,
    [
      textToken('a'),
      timestampToken(yyyy_mm_dd, yyyy_mm_dd),
      textToken('b'),
    ].flat(),
  ],
  [
    `a${yyyy_mm_dd}bc${yyyymmdd}d`,
    [
      textToken('a'),
      timestampToken(yyyy_mm_dd),
      textToken('bc'),
      timestampToken(yyyymmdd),
      textToken('d'),
    ].flat(),
  ],
  [
    `a${yyyy_mm_dd}b` + "\n" + `c${yyyymmdd}d`,
    [
      textToken('a'),
      timestampToken(yyyy_mm_dd),
      textToken('b'),
      lfToken(),
      textToken('c'),
      timestampToken(yyyymmdd),
      textToken('d'),
    ].flat(),
  ],
])('split : %p', (input, expected) => {
  const parser = new Parser(() => new Date('2006-01-02T15:04:05.008-07:00'));
  let actual = parser.parse(input);
  expect(actual.length).toEqual(expected.length);
  for (let i = 0; i < actual.length; i++) {
    let a = actual[i];
    let e = expected[i];
    if (isTimestampToken(a)) {
      if (isTimestampToken(e)) {
        expect(a.timestamp.format('ISO8601')).toEqual(e.timestamp.format('ISO8601'));
      } else {
        expect(true).toBe(false);
      }
    } else {
      expect(a).toEqual(e);
    }
  }

  expect(actual).toEqual(expected);
});

test.each([
  ['Mon, 02 Jan 2006 22:04:05 GMT', '2006-01-03T07:04:05.000+09:00'], // rfc1123-date
  ['Mon, 02 Jan 2006 15:04:05 -0700', '2006-01-03T07:04:05.000+09:00'], // rfc2822
  ['2006-01-02T15:04:05-07:00', '2006-01-03T07:04:05.000+09:00'], // iso8601
  ['2006-01-02T15:04:05.000-07:00', '2006-01-03T07:04:05.000+09:00'],// iso8601
  ['2006-01-02T22:04:05Z', '2006-01-03T07:04:05.000+09:00'], // iso8601
  ['2006-01-02T22:04:05.000Z', '2006-01-03T07:04:05.000+09:00'], // iso8601

  ['2006-01-02', '2006-01-02T00:00:00.000+09:00'],
  ['2006-01-02 15:04:05', '2006-01-02T15:04:05.000+09:00'],
  ['2006-01-02 15:04:05.123', '2006-01-02T15:04:05.123+09:00'],

  ['1136239445', '2006-01-03T07:04:05.000+09:00'], // unixtime(s)
  ['1136239445123', '2006-01-03T07:04:05.123+09:00'], // unixtime(ms)

  ['20060102', '2006-01-02T00:00:00.000+09:00'], // YYYYMMDD
  ['20060102150405', '2006-01-02T15:04:05.000+09:00'], // YYYYMMDDHHMMSS

  ['02/Jan/2006:15:04:05 -0700', '2006-01-03T07:04:05.000+09:00'], // Common Log Format
])('parse : %p', (input, expected) => {
  const parser = new Parser(() => new Date('2006-01-02T15:04:05.008-07:00'));
  let actual = parser.parse(input)

  expect(actual.length).toEqual(1);
  if (isTimestampToken(actual[0])) {
    expect(actual[0].text).toEqual(input);
    expect(actual[0].timestamp.format('ISO8601')).toEqual(expected);
  } else {
    expect(true).toBe(false);
  }
});

test.each([
  [
    {},
    '2006-01-03T00:00:00.000+09:00',
  ],
  [
    { unixtime: '1609426800' },
    '2021-01-01T00:00:00.000+09:00',
  ],
  [
    { unixtimeMs: '1609426800123' },
    '2021-01-01T00:00:00.123+09:00',
  ],
  [
    { year: '2021', month: '1', date: '2' },
    '2021-01-02T00:00:00.000+09:00',
  ],
  [
    { year: '2021', month: '1', date: '2', hh: '3', mm: '4', ss: '5', ms: '6' },
    '2021-01-02T03:04:05.006+09:00',
  ],
  [
    { year: '2021', monthName: 'Jan', date: '2', hh: '3', mm: '4', ss: '5' },
    '2021-01-02T03:04:05.000+09:00',
  ],
  [
    { year: '2021', month: '1', date: '2', hh: '3', mm: '4', ss: '5', ms: '6', offset: '-01:30', offset_sign: '-', offset_hh: '1', offset_mm: '30' },
    '2021-01-02T13:34:05.006+09:00',
  ],
])('generateTimestamp : %p', (groups, expected) => {
  const parser = new Parser(() => new Date('2006-01-02T15:04:05.008-07:00'));
  let actual = parser.generateTimestamp(groups);
  expect(actual.format('ISO8601')).toEqual(expected);
});

