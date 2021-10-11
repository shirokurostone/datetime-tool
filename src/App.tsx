import dayjs from 'dayjs';
import React from 'react';
import './App.css';
import TimestampPanel from './TimestampPanel';
import DurationPanel from './DurationPanel';

type AppProps = {}
type AppState = {
  timestamps: {
    time: dayjs.Dayjs
  }[],
}

class App extends React.Component<AppProps, AppState>{
  constructor(props: AppProps){
    super(props);
    this.state = {
      timestamps: [
        {time:dayjs().millisecond(0)},
        {time:dayjs().millisecond(0)},
      ],
    };
    this.handleChangeTimestamp = this.handleChangeTimestamp.bind(this);
  }

  handleChangeTimestamp(value: dayjs.Dayjs, i: number){
    this.state.timestamps[i] = {time: value};
    this.setState({
      timestamps: this.state.timestamps,
    });
  }

  render(){
    let elements: JSX.Element[] = [];
    for (let i=0; i<this.state.timestamps.length; i++){
      elements.push( (<TimestampPanel key={2*i} onChange={(v)=>this.handleChangeTimestamp(v,i)} time={this.state.timestamps[i].time}/>) );
      if (i !== this.state.timestamps.length-1 ){
        elements.push( (<DurationPanel key={2*i+1} from={this.state.timestamps[i].time} to={this.state.timestamps[i+1].time}/>) );
      }
    }

    return (
      <div className="App container-xxl">
        { elements }
      </div>
    );
  }
}

export default App;
