import React from "react";
import Card from "./Card";

export default function MainPage(props){
  // User searches for a genre and then clicks button which is passed up to App.js
  return(
  <div id="main-page-container">
    <div className='container1' id='searchbar'>
      <input onChange={props.handleOnChange} placeholder="Enter Genre here"></input>
      <button id='searchbutton' onClick={props.getRecommendations}>Search</button>
    </div>
    <Card musicList={props.musicList}/>
   {/* //link button for playlist? */}
  </div>
   
  )
}

