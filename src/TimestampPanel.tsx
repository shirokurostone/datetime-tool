import React, { useState } from 'react';
import { ReactComponent as ClipboardIcon } from 'bootstrap-icons/icons/clipboard.svg';
import { ReactComponent as CheckLgIcon } from 'bootstrap-icons/icons/check-lg.svg';

import { Timestamp, FormatType } from './Timestamp'
import { Parser, DefaultTimezone, isDefaultTimezone, isTimestampToken } from './Parser';
import './TimestampPanel.css';

type TimestampPanelRowProps = {
  label: string,
  time: Timestamp,
  type: FormatType,
}

function TimestampPanelRow(props: TimestampPanelRowProps) {

  const [checked, updateChecked] = useState(false);
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    let text = props.time.format(props.type);
    navigator.clipboard.writeText(text).then(() => { }).catch((r) => { console.log(r) });
    updateChecked(true);
    setTimeout(() => {
      updateChecked(false);
    }, 3000);
  }

  return (
    <div className="row px-3">
      <label className="col-3 col-form-label border-bottom">{props.label}</label>
      <div className="col-8 border-bottom">
        <input className="form-control-plaintext timestamp-panel-row-input" type="text" value={props.time.format(props.type)} readOnly />
      </div>
      <div className="col-1 border-bottom">
        {checked
          ? (<button className="btn btn-secondary" onClick={handleClick}><CheckLgIcon /></button>)
          : (<button className="btn btn-outline-secondary" onClick={handleClick}><ClipboardIcon /></button>)
        }
      </div>
    </div>
  );
}

type TimestampInputRowProps = {
  onChange: (value: Timestamp) => void,
  defaultTimestampText: string,
}
type TimestampInputRowState = {
  timezone: DefaultTimezone,
  timestamp: string,
  time: Timestamp | null,
}

class TimestampInputRow extends React.Component<TimestampInputRowProps, TimestampInputRowState>{
  constructor(props: TimestampInputRowProps) {
    super(props);

    const defaultTime = Timestamp.now();
    this.state = {
      timezone: "local",
      timestamp: this.props.defaultTimestampText,
      time: defaultTime,
    }
    this.handleChangeTimezone = this.handleChangeTimezone.bind(this);
    this.handleChangeTimestamp = this.handleChangeTimestamp.bind(this);
  }

  handleChangeTimezone(event: React.ChangeEvent<HTMLSelectElement>) {
    let timezone = isDefaultTimezone(event.target.value) ? event.target.value : 'local';
    const time = this.parse(timezone, this.state.timestamp);
    this.setState({
      timezone: timezone,
      time: time,
    });
    if (time !== null) {
      this.props.onChange(time);
    }
  }

  handleChangeTimestamp(event: React.ChangeEvent<HTMLInputElement>) {
    const timestamp = event.target.value;
    const time = this.parse(this.state.timezone, timestamp);
    this.setState({
      timestamp: timestamp,
      time: time,
    });
    if (time !== null) {
      this.props.onChange(time);
    }
  }

  parse(timezone: DefaultTimezone, timestamp: string): Timestamp | null {
    const parser = new Parser(timezone, () => new Date());
    const tokens = parser.parse(timestamp);
    if (tokens.length !== 1) {
      return null;
    }
    if (!isTimestampToken(tokens[0])) {
      return null;
    }
    return tokens[0].timestamp;
  }

  render() {
    return (
      <div className="row flex-grow-1">
        <div className="col-md-5">
          <div className="input-group">
            <label className="input-group-text">default timezone</label>
            <select className="form-select" value={this.state.timezone} onChange={this.handleChangeTimezone}>
              <option value="local">local</option>
              <option value="utc">UTC</option>
            </select>
          </div>
        </div>
        <div className="col-md-7">
          <div className="input-group">
            <label className="input-group-text">timestamp</label>
            <input
              className={["form-control", "col-8", "timestamp-input-row-input", this.state.time !== null ? "is-valid" : "is-invalid"].join(" ")}
              type="text" value={this.state.timestamp} onChange={this.handleChangeTimestamp} />
          </div>
        </div>
      </div>
    );
  }
}

type TimestampPanelColumnProps = {
  time: Timestamp,
  label: string,
}

function TimestampPanelColumn(props: TimestampPanelColumnProps) {
  return (
    <div className="timestamp col-md-6 my-3">
      <div className="row px-3">
        <div className="col-12 px-3 border-bottom text-center"><h6>{props.label}</h6></div>
      </div>
      <TimestampPanelRow time={props.time} label="default" type='default' />
      <TimestampPanelRow time={props.time} label="unixtime" type='unixtime' />
      <TimestampPanelRow time={props.time} label="YYYYMMDD" type='YYYYMMDD' />
      <TimestampPanelRow time={props.time} label="YYYY-MM-DD" type='YYYY-MM-DD' />
      <TimestampPanelRow time={props.time} label="HH:mm:ss" type='HH:mm:ss' />
      <TimestampPanelRow time={props.time} label="RFC2822" type='RFC2822' />
      <TimestampPanelRow time={props.time} label="ISO8601" type='ISO8601' />
    </div>
  );
}

type TimestampPanelProps = {
  onChange: (id: number, value: Timestamp) => void,
  onRemove: (id: number) => void,
  time: Timestamp,
  defaultTimestampText: string,
  id: number,
}
type TimestampPanelState = {
  localtime: Timestamp,
  utctime: Timestamp,
}

class TimestampPanel extends React.Component<TimestampPanelProps, TimestampPanelState>{
  constructor(props: TimestampPanelProps) {
    super(props);
    this.state = {
      localtime: this.props.time.local(),
      utctime: this.props.time.utc(),
    }

    this.handleChangeTime = this.handleChangeTime.bind(this);
  }

  handleChangeTime(value: Timestamp) {
    this.updateTime(value);
    this.props.onChange(this.props.id, value);
  }

  updateTime(value: Timestamp) {
    this.setState({
      localtime: value.local(),
      utctime: value.utc()
    });
  }

  render() {
    return (
      <div className="shadow-sm rounded bg-body border my-3">
        <div className="p-3 d-flex flex-row justify-content-between align-items-center">
          <TimestampInputRow onChange={this.handleChangeTime} defaultTimestampText={this.props.defaultTimestampText} />
          <div className="text-end px-2">
            <button type="button" className="btn-close btn-sm" onClick={(e) => this.props.onRemove(this.props.id)}></button>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <TimestampPanelColumn time={this.state.localtime} label="local" />
            <TimestampPanelColumn time={this.state.utctime} label="UTC" />
          </div>
        </div>
      </div>
    );
  }
}

export default TimestampPanel;
