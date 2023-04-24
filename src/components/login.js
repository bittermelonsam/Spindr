import React from 'react';

export default function Login(props) {
  return (
    <div id="login">
      <h1>Welcome to Splinder 1.0</h1>
      <form>
        <label htmlFor='#username'>Username: </label>
        <input id='username'></input>
        <label htmlFor='#password'>Password: </label>
        <input id='username'></input>
        <button onClick={props.handleLoginClick}>Login</button>
      </form>
    </div>
  )
}