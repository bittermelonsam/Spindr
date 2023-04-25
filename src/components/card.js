import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import TinderCard from 'react-tinder-card'
import * as Spotify from './fetch';


const images = [
  'https://picsum.photos/400/600',
  'https://picsum.photos/401/601',
  'https://picsum.photos/402/602',
  'https://picsum.photos/403/603',
  'https://picsum.photos/404/604',
];


export default function Card(props) {

  //add the fetch functions here
  const [lastDirection, setLastDirection] = useState();
  
  const swiped = (direction, nameToDelete) => {
    console.log(direction)
    setLastDirection(direction)
  }

  const outOfFrame = (name) => {
    console.log(name = 'left the screen!')
  }

  return (
    <div className='cardContainer'> 
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