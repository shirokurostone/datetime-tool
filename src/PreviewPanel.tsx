import React, { useState } from 'react';
import './PreviewPanel.css';

type TimestampNodeProps = {
　text: string,
  onClick: (text:string)=>void,
}
    
function TimestampNode(props: TimestampNodeProps){
  return (
    <a href="#" className="preview-timestamp-node link-primary" onClick={()=>props.onClick(props.text)}>{props.text}</a>
  );
}

type TextNodeProps = {
  text: string,
}
  
function TextNode(props: TextNodeProps){
  return (
    <span className="preview-text-node">{props.text}</span>
  );
}

type PreviewPanelProps = {
  onAddTimestamp: (text:string)=>void,
}

export type NodeInfo = {
  text: string,
  type: 'text' | 'timestamp',
}

export function parse(inputs: NodeInfo[], regex: RegExp|string) : NodeInfo[]{

  return inputs.flatMap(input=>{
    if (input.type !== 'text'){
      return [input];
    }
    const result : NodeInfo[] = [];
    const re = new RegExp(regex, 'g');
    let lastIndex = 0;
    let match;
    while ((match = re.exec(input.text)) !== null){
      if (match.index !== 0 && lastIndex !== match.index){
        result.push({
          text: input.text.slice(lastIndex, match.index),
          type: 'text',
        });
      }
      result.push({
        text: input.text.slice(match.index, match.index+match[0].length),
        type: 'timestamp',
      });

      lastIndex = re.lastIndex;
    }
    if (lastIndex !== input.text.length){
      result.push({
        text: input.text.slice(lastIndex),
        type: 'text',
      })
    }
    return result;
  });
}

export function convertToNodeList(text: string): NodeInfo[][]{
    const monthName = '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)';
    const dayName = '(Mon|Tue|Wed|Thu|Fri|Sat|Sun)';
    const timezone = '(\\+|-)\\d{2}:?\\d{2}'

    const yyyy_mm_dd = `(\\d{4}-\\d{2}-\\d{2})`
    const hh_mm_ss = `(\\d{2}:\\d{2}:\\d{2})`

    const regexps = [
    `${dayName}, \\d{2} ${monthName} \\d{4} \\d{2}:\\d{2}:\\d{2} GMT`,
    `${dayName}, \\d{2} ${monthName} \\d{4} \\d{2}:\\d{2}:\\d{2} ${timezone}`,

    `${yyyy_mm_dd}T${hh_mm_ss}${timezone}`,
    `${yyyy_mm_dd}T${hh_mm_ss}\\.\\d{3}${timezone}`,
    `${yyyy_mm_dd}T${hh_mm_ss}Z`,
    `${yyyy_mm_dd}T${hh_mm_ss}\\.\\d{3}Z`,

    `${yyyy_mm_dd} ${hh_mm_ss}\\.\\d{3}`,
    `${yyyy_mm_dd} ${hh_mm_ss}`,
    `${yyyy_mm_dd}`,

    /(?<!\d)\d{10}(?!\d)/,
    /(?<!\d)\d{13}(?!\d)/,
    /(?<!\d)\d{4}(0[0-9]|1[0-2])(0[1-9]|[12][0-9]|30|31)(\d{2})(\d{2})(\d{2})(?!\d)/,
    /(?<!\d)\d{4}(0[0-9]|1[0-2])(0[1-9]|[12][0-9]|30|31)(?!\d)/,

    `\\d{2}/${monthName}/\\d{4}:${hh_mm_ss} ${timezone}`,
  ];

  return text.split("\n").map(s=>{
    let nodes:NodeInfo[] = [{text: s, type: 'text'}];

    for (const regexp of regexps){
      nodes = parse(nodes, regexp);
    }

    return nodes;
  });
}

export function PreviewPanel(props: PreviewPanelProps){
  const [inputText, setInputText] = useState("");

  let id = 0;
  const result:JSX.Element[] = convertToNodeList(inputText).map(
    nodes=>{
      return nodes.map(n=>{
        switch (n.type){
          case 'text':
            return (<TextNode key={id++} text={n.text}/>);
          case 'timestamp':
            return (<TimestampNode key={id++} text={n.text} onClick={props.onAddTimestamp}/>);
        }
      });
    }
  ).flatMap(n=>n.concat((<br key={id++}/>)));

  return (
    <div className="card">
      <div className="card-body">
        <div className="row">
          <div className="col-6">
          <textarea
            className="form-control preview-textarea"
            rows={10}
            onChange={(e)=>{setInputText(e.target.value)}}
            value={inputText}
            />
          </div>
          <div className="col-6">
            <div className="preview-column">
              { result }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewPanel;