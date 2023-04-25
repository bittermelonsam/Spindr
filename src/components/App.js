import React, { useState } from 'react';
import MainPage from './mainPage';
import Login from './login';
import fetch from 'node-fetch'
import axios from 'axios';
import * as Spotify from './fetch';


function App() {

  //set initialState here
  const initialState = {
    trackData: '',
  };

  const [state, setState] = useState(initialState);

  // Variable to store music list
  let musicList = 'Artist Name';
  // Variable that will store the current text of search input
  let searchValue = '';
  // Function that runs when onchange
  function handleOnChange(e){
    //set target.value of input field to variable
   searchValue = e.target.value;
  }
  // Function that gets a list of music recomendations when button is clicked
  const handleMainPageButtonClick = (e) => {
  //set variable for getRecc function
  //pass in search val as argument
  axios.defaults.withCredentials = true; // not what youre supposed to do
  axios
      .post('http://localhost:3000/getSongRecs', { genre: 'pop' })
      .then((res) => {
        console.log(res)
        const trackRes = res.data.trackDetails;
        setState({...state, trackData: trackRes});
        console.log(state);
      });

  console.log('IMAGE', state.trackData[0].albumImg.url);
  }
  // A state that represents if user is logged in
  const [loggedIn, setLoggedIn] = useState(false);
  // When login is clicked, redirects to spodify to sign in
  const handleLoginClick = (e) => {
    e.preventDefault();
    // Make a get request to /login
    if (loggedIn === false) {
    // window.location.href='http://localhost:3000/login'; 
    setLoggedIn(true);
  }
  }
  // If user is logged in, return mainpage component
  if (loggedIn) {
     return (
     <div>
      <h1 id='title'>Spinder</h1>
     <MainPage handleOnChange={(e) => handleOnChange(e)} getRecommendations={() => handleMainPageButtonClick()} musicList={musicList}/>
     </div>
     )
    }
  return <Login handleLoginClick={handleLoginClick}/>  
}

export default App;

