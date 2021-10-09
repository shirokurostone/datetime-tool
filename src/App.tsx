import React from 'react';
import './App.css';

type AppProps = {}
type AppState = {}

class App extends React.Component<AppProps, AppState>{
  constructor(props: AppProps){
    super(props);
    this.state = {}
  }

  render(){
    return (
      <div className="App">
      </div>
    );
  }
}

export default App;
