import logo from './logo.svg';

import React, { useState } from 'react';

const axios = require('axios').default;

function Test(){
  const [apiResult, setApiResult] = useState("");
  
  function onClick() {
    axios.get('/api/').then((res)=>{
      setApiResult(JSON.stringify(res.data));
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={() => {onClick()}}>
          Call API
        </button>
        <h2>Result: {apiResult}</h2>
      </header>
    </div>
  );
}

export default Test;