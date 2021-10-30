import React, { useState } from 'react';
import {Parser} from './Parser';
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
  const parser = new Parser(()=>new Date());
  const result:JSX.Element[] =parser.parse(inputText).map(
    token=>{
        switch (token.type){
          case 'text':
            return (<TextNode key={id++} text={token.text}/>);
          case 'timestamp':
            return (<TimestampNode key={id++} text={token.text} onClick={props.onAddTimestamp}/>);
          case 'lf':
            return (<br key={id++}/>);
        }
      }
  );

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