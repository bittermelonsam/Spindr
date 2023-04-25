import React from 'react';

export default function Login(props) {
  return (
    <div id="login">
      <h1>Welcome to Spinder 1.0</h1>
      <button onClick={props.handleLoginClick}>Login</button>
    </div>
  )
}