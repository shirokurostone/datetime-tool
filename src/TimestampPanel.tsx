import React from 'react';
import { ReactComponent as ClipboardIcon } from 'bootstrap-icons/icons/clipboard.svg';
import { Timestamp, FormatType } from './Timestamp'

type TimestampPanelRowProps = {
  label: string,
  time: Timestamp,
  type: FormatType,
}

class TimestampPanelRow extends React.Component<TimestampPanelRowProps,{}>{
  constructor(props: TimestampPanelRowProps){
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event : React.MouseEvent<HTMLButtonElement>){
    let text = this.props.time.format(this.props.type);
    navigator.clipboard.writeText(text).then(()=>{}).catch((r)=>{console.log(r)});
  }

  render(){
    return (
      <div className="row">
        <label className="col-3 col-form-label">{this.props.label}</label>
        <div className="col-9">
          <div className="input-group">
            <input className="form-control" type="text" value={this.props.time.format(this.props.type)} readOnly />
            <button className="btn btn-outline-secondary" onClick={this.handleClick}><ClipboardIcon/></button>
          </div>
        </div>
       </div>
    );
  }
}

type TimestampInputRowProps = {
  onChange: (value:Timestamp)=>void,
}
type TimestampInputRowState = {
  timezone: string,
  timestamp: string,
  time: Timestamp | null,
}

class TimestampInputRow extends React.Component<TimestampInputRowProps,TimestampInputRowState>{
  constructor(props: TimestampInputRowProps){
    super(props);

    const defaultTime = Timestamp.now();
    this.state = {
      timezone: "local",
      timestamp: defaultTime.format('default'),
      time: defaultTime,
    }
    this.handleChangeTimezone = this.handleChangeTimezone.bind(this);
    this.handleChangeTimestamp = this.handleChangeTimestamp.bind(this);
  }

  handleChangeTimezone(event: React.ChangeEvent<HTMLSelectElement>){
    const timezone = event.target.value;
    const time = this.parse(timezone, this.state.timestamp);
    this.setState({
      timezone: timezone,
      time: time,
    });
    if (time !== null){
      this.props.onChange(time);
    }
  }

  handleChangeTimestamp(event: React.ChangeEvent<HTMLInputElement>){
    const timestamp = event.target.value;
    const time = this.parse(this.state.timezone, timestamp);
    this.setState({
      timestamp: timestamp,
      time: time,
    });
    if (time !== null){
      this.props.onChange(time);
    }
  }

  parse(timezone: string, timestamp: string) : Timestamp | null{
    const time = Timestamp.parse(timestamp, timezone === "utc");
    if (!time.isValid()) {
      return null;
    }
    return time;
  }

  render(){
    return (
      <div className="row">
        <div className="col-3">
          <div className="input-group">
            <label className="input-group-text">タイムゾーン</label>
            <select className="form-select" value={this.state.timezone} onChange={this.handleChangeTimezone}>
              <option value="local">local</option>
              <option value="utc">UTC</option>
            </select>
          </div>
        </div>
        <div className="col-9">
        <div className="input-group">
          <label className="input-group-text">時刻文字列</label>
          <input
            className={["form-control", "col-8", this.state.time !== null ? "is-valid" : "is-invalid"].join(" ")}
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
type TimestampPanelColumnState = {}

class TimestampPanelColumn extends React.Component<TimestampPanelColumnProps,TimestampPanelColumnState>{
  constructor(props: TimestampPanelColumnProps){
    super(props);
  }

  render(){
    return (
      <div className="timestamp col-6">
        <div className="row">
          <label className="col-sm-3"><h3>{this.props.label}</h3></label>
        </div>
        <TimestampPanelRow time={this.props.time} label="default" type='default' />
        <TimestampPanelRow time={this.props.time} label="unixtime" type='unixtime' />
        <TimestampPanelRow time={this.props.time} label="YYYYMMDD" type='YYYYMMDD' />
        <TimestampPanelRow time={this.props.time} label="YYYY-MM-DD" type='YYYY-MM-DD' />
        <TimestampPanelRow time={this.props.time} label="HH:mm:ss" type='HH:mm:ss' />
        <TimestampPanelRow time={this.props.time} label="RFC2822" type='RFC2822' />        
        <TimestampPanelRow time={this.props.time} label="ISO8601" type='ISO8601' />        
      </div>
    );
  }
}


type TimestampPanelProps = {
  onChange: (id:number, value:Timestamp)=>void,
  onRemove: (id:number)=>void,
  time: Timestamp,
  id: number,
}
type TimestampPanelState = {
  localtime: Timestamp,
  utctime: Timestamp,
}

class TimestampPanel extends React.Component<TimestampPanelProps,TimestampPanelState>{
  constructor(props: TimestampPanelProps){
    super(props);
    this.state = {
      localtime: this.props.time.local(),
      utctime: this.props.time.utc(),
    }

    this.handleChangeTime = this.handleChangeTime.bind(this);
  }

  handleChangeTime(value: Timestamp){
    this.updateTime(value);
    this.props.onChange(this.props.id, value);
  }

  updateTime(value: Timestamp){
    this.setState({
      localtime: value.local(),
      utctime: value.utc()
    });
  }

  render(){
    return (
      <div className="card">
        <div className="card-header text-end">
          <button type="button" className="btn-close btn-sm" onClick={(e)=>this.props.onRemove(this.props.id)}></button>
        </div>
        <div className="card-body">
          <TimestampInputRow onChange={this.handleChangeTime}/>
          <div className="row">
            <TimestampPanelColumn time={this.state.localtime} label="local"/>
            <TimestampPanelColumn time={this.state.utctime}   label="UTC"/>
          </div>
        </div>
      </div>
    );
  }
}

export default TimestampPanel;
