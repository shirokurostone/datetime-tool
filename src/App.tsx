import React from 'react';
import './App.css';
import { Timestamp } from './Timestamp'
import TimestampPanel from './TimestampPanel';
import DurationPanel from './DurationPanel';
import PreviewPanel from './PreviewPanel';
import { ReactComponent as PlusLgIcon } from 'bootstrap-icons/icons/plus-lg.svg';

type AppProps = {}
type AppState = {
  timestamps: {
    id: number,
    time: Timestamp,
  }[],
  maxId: number,
  inputText: string,
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
      inputText: '',
    };
    this.handleChangeTimestamp = this.handleChangeTimestamp.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleChangeInputText = this.handleChangeInputText.bind(this);
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

  handleChangeInputText(event: React.ChangeEvent<HTMLTextAreaElement>){
    this.setState({
      inputText: event.target.value,
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
        <div className="card">
          <div className="card-body">
            <div className="row">
              <textarea
                className="form-control"
                rows={10}
                onChange={this.handleChangeInputText}
                value={this.state.inputText}
                />
              <PreviewPanel text={this.state.inputText} />
            </div>
          </div>
        </div>
        <div className="">
          { elements }
          <div className="row plusbutton-card">
            <button className="btn btn-outline-secondary col-12" onClick={this.handleClick}><PlusLgIcon/></button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
