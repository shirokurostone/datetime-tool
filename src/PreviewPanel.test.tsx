import { parse, convertToNodeList, NodeInfo } from './PreviewPanel';

function textNodes(...texts: string[]): NodeInfo[]{
  return texts.map(t=>({type: 'text', text: t}));
}

function timestampNodes(...texts: string[]): NodeInfo[]{
  return texts.map(t=>({type: 'timestamp', text: t, }));
}

test.each([
  [textNodes('hoge'), /-/],
  [timestampNodes('1-2'), /-/],
])('not split : %p', (input, regex)=>{
    let actual = parse(input, regex)  
    expect(actual).toEqual(input);
});

test.each([
  [
    textNodes('1-2'), /-/,
    [
      ...textNodes('1'),
      ...timestampNodes('-'),
      ...textNodes('2'),
    ]
  ],
  [
    textNodes('-1'),  /-/,
    [
      ...timestampNodes('-'),
      ...textNodes('1'),
    ]
  ],
  [
    textNodes('1-'), /-/,
    [
      ...textNodes('1'),
      ...timestampNodes('-'),
    ]
  ],
  [
    textNodes('1--2'), /-/,
    [
      ...textNodes('1'),
      ...timestampNodes('-'),
      ...timestampNodes('-'),
      ...textNodes('2'),
    ]
  ],
  [
    textNodes('1-2', '3-4'), /-/,
    [
      ...textNodes('1'),
      ...timestampNodes('-'),
      ...textNodes('2'),
      ...textNodes('3'),
      ...timestampNodes('-'),
      ...textNodes('4'),
    ]
  ],
])('split : %p', (input, regex, expected)=>{
  let actual = parse(input, regex)  
  expect(actual).toEqual(expected);
});

test.each([
  ['Mon, 02 Jan 2006 22:04:05 GMT'], // rfc1123-date
  ['Mon, 02 Jan 2006 15:04:05 -0700'], // rfc2822
  ['2006-01-02T15:04:05-07:00'], // iso8601
  ['2006-01-02T15:04:05.000-07:00'],// iso8601
  ['2006-01-02T22:04:05Z'], // iso8601
  ['2006-01-02T22:04:05.000Z'], // iso8601

  ['2006-01-02'],
  ['2006-01-02 15:04:05'],
  ['2006-01-02 15:04:05.000'],

  ['1136239445'], // unixtime(s)
  ['1136239445000'], // unixtime(ms)

  ['20060102'], // YYYYMMDD
  ['20060102150405'], // YYYYMMDDHHMMSS

  ['02/Jan/2006:15:04:05 -0700'], // Common Log Format
])('convertToNodeList', (input:string)=>{
  let actual = convertToNodeList(input)
  expect(actual).toEqual([timestampNodes(input)]);
});
