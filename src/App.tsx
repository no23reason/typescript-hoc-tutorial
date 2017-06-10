import * as React from 'react';
import './App.css';
import { Demo } from './Demo';

class App extends React.Component<{}, null> {
  render() {
    return (
      <div className="App">
        <h1>TypeScript HOC demo</h1>
        <p>Click the green div bellow to see the changes</p>
        <Demo text="Let's see" />
      </div>
    );
  }
}

export default App;
