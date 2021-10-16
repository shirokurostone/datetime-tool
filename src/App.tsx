import React from 'react';
import './App.css';
import { Timestamp } from './Timestamp'
import TimestampPanel from './TimestampPanel';
import DurationPanel from './DurationPanel';
import { ReactComponent as PlusLgIcon } from 'bootstrap-icons/icons/plus-lg.svg';

type AppProps = {}
type AppState = {
  timestamps: {
    id: number,
    time: Timestamp,
  }[],
  maxId: number,
}

class App extends React.Component<AppProps, AppState>{
  constructor(props: AppProps){
    super(props);
    this.state = {
      timestamps: [
        {id: 0, time:Timestamp.now()},
        {id: 1, time:Timestamp.now()},
      ],
      maxId: 1,
    };
    this.handleChangeTimestamp = this.handleChangeTimestamp.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChangeTimestamp(id: number, value: Timestamp){
    for (let i=0; i<this.state.timestamps.length; i++){
      if (id === this.state.timestamps[i].id){
        this.state.timestamps[i].time = value;
      }
    }
    this.setState({
      timestamps: this.state.timestamps,
    });
  }

  handleRemoveTimestamp(id: number){
    this.setState({
      timestamps: this.state.timestamps.filter(v=>v.id !== id),
    });
  }

  handleClick(event: React.MouseEvent<HTMLButtonElement>){
    const id = this.state.maxId+1;
    this.state.timestamps.push({id:id, time: Timestamp.now()});
    this.setState({
      timestamps: this.state.timestamps,
      maxId: id,
    });
  }

  render(){
    let elements: JSX.Element[] = [];
    for (let i=0; i<this.state.timestamps.length; i++){
      elements.push( (<TimestampPanel key={this.state.timestamps[i].id} id={this.state.timestamps[i].id} onChange={(id, value)=>this.handleChangeTimestamp(id, value)} onRemove={(id)=>this.handleRemoveTimestamp(id)} time={this.state.timestamps[i].time}/>) );
      if (i !== this.state.timestamps.length-1 ){
        elements.push( (<DurationPanel key={this.state.timestamps[i].id+"_duration"} from={this.state.timestamps[i].time} to={this.state.timestamps[i+1].time}/>) );
      }
    }

    return (
      <div className="App container-xxl">
        { elements }
        <div className="row plusbutton-card">
          <button className="btn btn-outline-secondary col-12" onClick={this.handleClick}><PlusLgIcon/></button>
        </div>
      </div>
    );
  }
}

export default App;
