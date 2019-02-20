import React, { Component } from 'react';
import logo from './guavus_logo.svg';
import './App.css';
import ToC from './ToC'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">React Sessions</h1>
          <h3 className="App-subtitle">- by Arpit Agarwal</h3>
        </header>
        <div className='toc'>
          <div className="name App-intro">Table of Content</div>
          <ToC/>
        </div>
      </div>
    );
  }
}

export default App;
