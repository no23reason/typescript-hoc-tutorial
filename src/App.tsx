import * as React from 'react';
import './App.css';
import { Demo } from './Demo';

class App extends React.Component<{}, null> {
  render() {
    return (
      <div className="App">
        <Demo text="Let's see" />
      </div>
    );
  }
}

export default App;
