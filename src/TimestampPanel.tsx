import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { ReactComponent as ClipboardIcon } from 'bootstrap-icons/icons/clipboard.svg';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

type FormatType = 'default'|'unixtime'|'YYYYMMDD'|'YYYY-MM-DD'|'HH:mm:ss'|'RFC2822'|'ISO8601';

function parse(value : string, isUtc : boolean): dayjs.Dayjs{
  let patterns = [
    {
      description: 'unixtime',
      regexp: /^\d{9,10}$/,
      format: 'X',
    },
    {
      description: 'unixtime (ms)',
      regexp: /^\d{12,13}$/,
      format: 'x',
    },
  ];

  for (const p of patterns){
    const match = p.regexp.exec(value);
    if (match){
      if (isUtc){
        return dayjs.utc(value, p.format);
      }
      return dayjs(value, p.format);
    }
  }

  if (isUtc){
    return dayjs.utc(value);
  }
  return dayjs(value);
}

function format(time: dayjs.Dayjs, type: FormatType): string{
  switch (type){
    case 'default':
      return time.format('YYYY-MM-DD HH:mm:ss.SSS');
    case 'unixtime':
      return ""+time.unix();
    case 'YYYYMMDD':
      return ""+time.format('YYYYMMDD');
    case 'YYYY-MM-DD':
      return ""+time.format('YYYY-MM-DD');
    case 'HH:mm:ss':
      return time.format('HH:mm:ss');
    case 'RFC2822':
      return time.format('ddd, DD MMM YYYY HH:mm:ss ZZ');
    case 'ISO8601':
      if (time.isUTC()){
        return time.toISOString();
      }
      return time.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  }
}

type TimestampPanelRowProps = {
  label: string,
  time: dayjs.Dayjs,
  type: FormatType,
}

class TimestampPanelRow extends React.Component<TimestampPanelRowProps,{}>{
  constructor(props: TimestampPanelRowProps){
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event : React.MouseEvent<HTMLButtonElement>){
    let text = format(this.props.time, this.props.type);
    navigator.clipboard.writeText(text).then(()=>{}).catch((r)=>{console.log(r)});
  }

  render(){
    return (
      <div className="row">
        <label className="col-3 col-form-label">{this.props.label}</label>
        <div className="col-9">
          <div className="input-group">
            <input className="form-control" type="text" value={format(this.props.time, this.props.type)} readOnly />
            <button className="btn btn-outline-secondary" onClick={this.handleClick}><ClipboardIcon/></button>
          </div>
        </div>
       </div>
    );
  }
}

type TimestampInputRowProps = {
  onChange: (value:dayjs.Dayjs)=>void,
}
type TimestampInputRowState = {
  timezone: string,
  timestamp: string,
  time: dayjs.Dayjs | null,
}

class TimestampInputRow extends React.Component<TimestampInputRowProps,TimestampInputRowState>{
  constructor(props: TimestampInputRowProps){
    super(props);

    const defaultTime = dayjs();
    this.state = {
      timezone: "local",
      timestamp: defaultTime.format(),
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

  parse(timezone: string, timestamp: string) : dayjs.Dayjs | null{
    const time = parse(timestamp, timezone === "utc");
    if (time.format() === "Invalid Date") {
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
  time: dayjs.Dayjs,
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
}
type TimestampPanelState = {
  localtime: dayjs.Dayjs,
  utctime: dayjs.Dayjs,
}

class TimestampPanel extends React.Component<TimestampPanelProps,TimestampPanelState>{
  constructor(props: TimestampPanelProps){
    super(props);
    this.state = {
      localtime: dayjs(),
      utctime: dayjs.utc(),
    }

    this.handleChangeTime = this.handleChangeTime.bind(this);
  }

  handleChangeTime(value: dayjs.Dayjs){
    this.setState({
      localtime: value.local(),
      utctime: value.utc()
    })
  }

  render(){
    return (
      <div>
        <TimestampInputRow onChange={this.handleChangeTime}/>
        <div className="row">
          <TimestampPanelColumn time={this.state.localtime} label="local"/>
          <TimestampPanelColumn time={this.state.utctime}   label="UTC"/>
        </div>
      </div>
    );
  }
}

export default TimestampPanel;
