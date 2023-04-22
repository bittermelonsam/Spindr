import React, { Component } from 'react';
import fetch from 'node-fetch';

function App() {
  fetch('/test')
    .then((data) => {
      console.log('here');
      data.json();
    })
    .then((data) => {
      console.log('not bob', data);
    });

  return <div>Hi</div>;
}

export default App;
//test
