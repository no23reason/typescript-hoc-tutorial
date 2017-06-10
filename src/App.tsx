import * as React from 'react';
import './App.css';
import { Demo, DemoWithDebug } from './Demo';

class App extends React.Component<{}, null> {
  render() {
    return (
      <div className="App">
        <h1>TypeScript HOC demo</h1>
        <p>Click the divs bellow to see the changes</p>
        <Demo text="This one doesn't console.log" style={{backgroundColor: 'lightgreen'}} />
        <DemoWithDebug text="This one does" style={{backgroundColor: 'lightblue'}} />
      </div>
    );
  }
}

export default App;
