import React from "react";
import Card from "./card";

export default function MainPage(props){
  
  return(
    //div for flex container
  <div id="main-page-container">
    {/* //input tag */}
    <div className='container1' id='searchbar'>
      
      <input onChange={props.handleOnChange} placeholder="Enter Genre here"></input>
      <button id='searchbutton' onClick={props.getRecommendations}>Search</button>
    </div>
    <Card musicList={props.musicList}/>
   {/* //link button for playlist? */}
  </div>
   
  )
}

