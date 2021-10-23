import React from 'react';

type TimestampNodeProps = {
    text: string,
  }
    
function TimestampNode(props: TimestampNodeProps){
  return (
    <span className="preview-timestamp-node bg-primary text-white">{props.text}</span>
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
  text: string,
}

type NodeInfo = {
  text: string,
  type: 'text' | 'timestamp',
}

function parse(inputs: NodeInfo[], regex: RegExp) : NodeInfo[]{

  return inputs.flatMap(input=>{
    if (input.type !== 'text'){
      return [input];
    }
    const result : NodeInfo[] = [];
    const re = new RegExp(regex, 'g');
    let lastIndex = 0;
    let match;
    while ((match = re.exec(input.text)) !== null){
      if (match.index !== 0){
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

function PreviewPanel(props: PreviewPanelProps){
  const regexps = [/\d{4}-\d{2}-\d{2}/, /\d{4}/];

  const nodes = props.text.split("\n").flatMap(s=>{
    let nodes:NodeInfo[] = [{text: s, type: 'text'}];

    for (const regexp of regexps){
      nodes = parse(nodes, regexp);
    }

    console.log(nodes);

    let result = nodes.map(n=>{
      switch (n.type){
        case 'text':
          return (
            <TextNode text={n.text}/>
          );
        case 'timestamp':
          return (
            <TimestampNode text={n.text}/>
          );
      }
    });

    result.push((<br/>));
    return result;
  });

  return (
    <div>
      { nodes }
    </div>
  );
}

export default PreviewPanel;