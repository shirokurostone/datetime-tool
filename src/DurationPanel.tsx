import React from 'react';
import { Timestamp, Duration } from './Timestamp'
import { ReactComponent as StopwatchIcon } from 'bootstrap-icons/icons/stopwatch.svg';
import './DurationPanel.css'

type DurationPanelProps = {
  from: Timestamp,
  to: Timestamp,
}

function DurationPanel(props: DurationPanelProps) {
  const duration = new Duration(props.from, props.to);
  return (
    <div className="shadow-sm rounded bg-body border my-3">
      <div className="row p-3 d-flex flex-row align-items-center">
        <div className="col-1"><StopwatchIcon /></div>
        <div className="col-2 d-flex flex-row">
          <input className="form-control-plaintext" type="text" value={duration.toDurationString()} readOnly />
        </div>
      </div>
    </div>
  );
}

export default DurationPanel;
