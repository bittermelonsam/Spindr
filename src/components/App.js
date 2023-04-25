import React, { useEffect, useState } from 'react';
import MainPage from './mainPage';
import Login from './login';
import * as Spotify from './fetch';


function App() {

  useEffect(() => {
    const recs = Spotify.getRecommendations("pop").then(data => console.log(data));
    console.log("cookies", recs);
  }, []);


  // A state that represents if user is logged in
  const [loggedIn, setLoggedIn] = useState(false);
  // Function that changes login status
  const handleLoginClick = (e) => {
    e.preventDefault();
    setLoggedIn(!loggedIn);
  }
  // If user is logged in, return mainpage component
  if (loggedIn) {
     return <MainPage />
    }
  return <Login handleLoginClick={handleLoginClick}/>  
}

export default App;

