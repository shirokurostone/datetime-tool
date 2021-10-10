import React from 'react';
import './App.css';
import TimestampPanel from './TimestampPanel';

type AppProps = {}
type AppState = {}

class App extends React.Component<AppProps, AppState>{
  constructor(props: AppProps){
    super(props);
    this.state = {};
  }

  render(){
    return (
      <div className="App container-xxl">
        <TimestampPanel />
      </div>
    );
  }
}

export default App;
