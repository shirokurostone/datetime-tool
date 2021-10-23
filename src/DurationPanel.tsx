import React from 'react';
import { Timestamp, Duration } from './Timestamp'

type DurationPanelProps = {
  from: Timestamp,
  to: Timestamp,
}

function DurationPanel(props : DurationPanelProps){
  const duration = new Duration(props.from, props.to);
  return(
    <div className="card">
      <div className="card-body">
        { duration.toDurationString() }
      </div>
    </div>
  );
}

export default DurationPanel;
