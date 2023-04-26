import React from 'react';

// If user is not logged in, renders a page with a button, when button is clicked handle login on mainpage
export default function Login(props) {
  return (
    <div id="login">
      <h1>Welcome to Spindr 1.0</h1>
      <button onClick={props.handleLoginClick}>Login</button>
    </div>
  )
}