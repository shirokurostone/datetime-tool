import dayjs from 'dayjs';
import React from 'react';

type DurationPanelProps = {
  from: dayjs.Dayjs,
  to: dayjs.Dayjs,
}
type DurationPanelState = {}
class DurationPanel extends React.Component<DurationPanelProps, DurationPanelState>{
  constructor(props : DurationPanelProps){
    super(props)
  }

  durationString(valueMs: number): string{
    valueMs = Math.abs(valueMs);
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

  render(){
    const duration = this.props.to.diff(this.props.from);
    return(
      <div>
        { this.durationString(duration) }
      </div>
    );
  }
}

export default DurationPanel;
