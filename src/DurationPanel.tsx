import React from 'react';
import { Timestamp, Duration } from './Timestamp'

type DurationPanelProps = {
  from: Timestamp,
  to: Timestamp,
}
type DurationPanelState = {}
class DurationPanel extends React.Component<DurationPanelProps, DurationPanelState>{
  constructor(props : DurationPanelProps){
    super(props)
  }

  render(){
    const duration = new Duration(this.props.from, this.props.to);
    return(
      <div className="card">
        <div className="card-body">
          { duration.toDurationString() }
        </div>
      </div>
    );
  }
}

export default DurationPanel;
