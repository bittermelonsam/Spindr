import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import TinderCard from 'react-tinder-card'
import * as Spotify from './fetch';

// Stock images until we pull data from spotify api
const images = [
  'https://picsum.photos/400/600',
  'https://picsum.photos/401/601',
  'https://picsum.photos/402/602',
  'https://picsum.photos/403/603',
  'https://picsum.photos/404/604',
];


export default function Card(props) {

  // State that represents which way the user is swiping a card  //add the fetch functions here
  const [lastDirection, setLastDirection] = useState();
  // Function that will update the direction user is swiping based on movements, nameTodelete is the current data passed in
  const swiped = (direction, nameToDelete) => {
    console.log(direction)
    setLastDirection(direction)
  }
  // Function that occurs when card leaves screen
  const outOfFrame = (name) => {
    console.log(name = 'left the screen!')
  }

  return (
    <div className='cardContainer'> 
    {/* Iterate through given images and creates a 'tindercard' for each  */}
      {images.map((img) => {
        return <TinderCard className='swipe' key={img} onSwipe={(dir) => swiped(dir, img)} onCardLeftScreen={() => outOfFrame(img)} preventSwipe={['up', 'down']}>
          <div className='card container1' style={{backgroundImage: `url(${img})`}}>
          </div>
          <p>{props.musicList}</p>
          <button id='playButton'>Play</button>
        </TinderCard>
      })
      }  
    </div>
  )
}