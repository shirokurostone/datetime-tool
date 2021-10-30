import React, { useState } from 'react';
import {NodeInfo, parse, convertToNodeList} from './Parser';
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