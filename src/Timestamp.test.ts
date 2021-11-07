import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { Duration, Timestamp, FormatType } from './Timestamp';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

function isFormatType(formatType: string): formatType is FormatType {
  return [
    'default',
    'unixtime',
    'YYYYMMDD',
    'YYYY-MM-DD',
    'HH:mm:ss',
    'HHmmss',
    'RFC2822',
    'ISO8601',
    'HTTP-date'
  ].includes(formatType);
}

test.each([
  ['2006-01-03T07:04:05.000+09:00', 'default', '2006-01-03 07:04:05'],
  ['2006-01-03T07:04:05.123+09:00', 'default', '2006-01-03 07:04:05.123'],
  ['2006-01-03T07:04:05.123+09:00', 'unixtime', '1136239445'],
  ['2006-01-03T07:04:05.123+09:00', 'YYYYMMDD', '20060103'],
  ['2006-01-03T07:04:05.123+09:00', 'YYYY-MM-DD', '2006-01-03'],
  ['2006-01-03T07:04:05.123+09:00', 'HH:mm:ss', '07:04:05'],
  ['2006-01-03T07:04:05.123+09:00', 'HHmmss', '070405'],
  ['2006-01-03T07:04:05.123+09:00', 'RFC2822', 'Tue, 03 Jan 2006 07:04:05 +0900'],
  ['2006-01-03T07:04:05.123+09:00', 'ISO8601', '2006-01-03T07:04:05.123+09:00'],
  ['2006-01-03T07:04:05.123+09:00', 'HTTP-date', 'Mon, 02 Jan 2006 22:04:05 GMT'],
])('format : %#', (str: string, formatType: string, expected: string) => {
  if (isFormatType(formatType)) {
    expect(Timestamp.parse(str, false).format(formatType)).toEqual(expected);
  } else {
    expect(false).toBe(true);
  }

});

test.each([
  ['1136239445', false, dayjs('2006-01-03T07:04:05.000+09:00')],
  ['1136239445123', false, dayjs('2006-01-03T07:04:05.123+09:00')],
  ['2006-01-03T07:04:05.123+09:00', false, dayjs('2006-01-03T07:04:05.123+09:00')],
  ['2006-01-03T07:04:05.123', false, dayjs('2006-01-03T07:04:05.123+09:00')],
])('parse : %#', (str, utc, dayjs) => {
  expect(Timestamp.parse(str, utc).time.format()).toEqual(dayjs.format());
})

test.each([
  ['2006-01-01T12:00:00.000+09:00', '2006-01-01T12:00:00.000+09:00', 'PT0S'],

  ['2006-01-01T12:00:00.000+09:00', '2006-01-01T12:00:00.001+09:00', 'PT0.001S'],
  ['2006-01-01T12:00:00.000+09:00', '2006-01-01T12:00:01.000+09:00', 'PT1S'],
  ['2006-01-01T12:00:00.000+09:00', '2006-01-01T12:01:00.000+09:00', 'PT1M'],
  ['2006-01-01T12:00:00.000+09:00', '2006-01-01T13:00:00.000+09:00', 'PT1H'],
  ['2006-01-01T12:00:00.000+09:00', '2006-01-02T12:00:00.000+09:00', 'P1DT'],

  ['2006-01-01T12:00:00.000+09:00', '2007-01-01T11:59:59.999+09:00', 'P364DT23H59M59.999S'],

])('DurationString : %#', (from, to, expected) => {
  const duration1 = new Duration(
    Timestamp.parse(from, false),
    Timestamp.parse(to, false)
  );
  expect(duration1.toDurationString()).toEqual(expected);

  const duration2 = new Duration(
    Timestamp.parse(to, false),
    Timestamp.parse(from, false)
  );
  expect(duration2.toDurationString()).toEqual(expected);
})