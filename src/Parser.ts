
export type NodeInfo = {
  text: string,
  type: 'text' | 'timestamp',
}

export function parse(inputs: NodeInfo[], regex: RegExp | string): NodeInfo[] {

  return inputs.flatMap(input => {
    if (input.type !== 'text') {
      return [input];
    }
    const result: NodeInfo[] = [];
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
      result.push({
        text: input.text.slice(match.index, match.index + match[0].length),
        type: 'timestamp',
      });

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

export function convertToNodeList(text: string): NodeInfo[][] {
  const monthName = '(?<monthName>Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)';
  const dayName = '(?<dayName>Mon|Tue|Wed|Thu|Fri|Sat|Sun)';
  const timezone = '(\\+|-)\\d{2}:?\\d{2}'

  const year = `(?<year>\\d{4})`
  const month = `(?<month>0[0-9]|1[0-2])`
  const day = `(?<day>[0-2][0-9]|30|31)`

  const yyyy_mm_dd = `(${year}[-/_]${month}[-/_]${day})`

  const hh = `(?<hh>[01]\\d|2[0-3])`;
  const mm = `(?<mm>[0-5]\\d)`;
  const ss = `(?<ss>[0-5]\\d|60)`;
  const ms = `(?<ms>\\d{3})`;

  const hh_mm_ss = `(${hh}:${mm}:${ss})`

  const regexps = [
    `${dayName}, ${day} ${monthName} ${year} ${hh_mm_ss} GMT`,
    `${dayName}, ${day} ${monthName} ${year} ${hh_mm_ss} ${timezone}`,
    `${dayName}, ${day} ${monthName} ${year} ${hh_mm_ss}`,

    `${yyyy_mm_dd}[ T]${hh_mm_ss}\\.${ms}${timezone}`,
    `${yyyy_mm_dd}[ T]${hh_mm_ss}${timezone}`,
    `${yyyy_mm_dd}[ T]${hh_mm_ss}\\.${ms}Z`,
    `${yyyy_mm_dd}[ T]${hh_mm_ss}\\.${ms}`,
    `${yyyy_mm_dd}[ T]${hh_mm_ss}Z`,
    `${yyyy_mm_dd}[ T]${hh_mm_ss}`,
    `${yyyy_mm_dd}`,

    `(?<!\\d)\\d{10}(?!\\d)`,
    `(?<!\\d)\\d{13}(?!\\d)`,
    `(?<!\\d)${year}${month}${day}${hh}${mm}${ss}(?!\\d)`,
    `(?<!\\d)${year}${month}${day}(?!\\d)`,

    `\\d{2}/${monthName}/\\d{4}:${hh_mm_ss} ${timezone}`,
  ];

  return text.split("\n").map(s => {
    let nodes: NodeInfo[] = [{ text: s, type: 'text' }];

    for (const regexp of regexps) {
      nodes = parse(nodes, regexp);
    }

    return nodes;
  });
}