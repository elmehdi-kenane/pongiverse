import React from 'react'

import racketSvg from "./assets/racket.svg"

import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const games =12;
  const win = 6;
  const lost = games - win;
  const winPcnt = ((win * 100)/games).toFixed(0);
  const lostPcnt = 100 - winPcnt;

function DashboardHead() {
  return (
    <div className="dashpage__head dash--space"> 
        <div className="head__game-stats dash--bkborder">
          <p className='game'> Games </p>
          <div className="head__games-value-pic">
            <img alt='racket' src={racketSvg} />
            <p> {games} </p> 
          </div>
          
          <div className="head__game-stats__percentage">
            <div className='pic-percentage dash--win-color'>
              <AddCircleIcon />
              <p> {winPcnt} %</p>
            </div>
            <div className='pic-percentage dash--lost-color'>
              <RemoveCircleIcon />
              <p> {lostPcnt} %</p>
            </div>
          </div>

          <div className='head__game-stats__line'>
            <div className="left-side" style={{width:`${winPcnt}%`}} ></div>
            <div className="right-side" style={{width:`${lostPcnt}%`}}></div>
          </div>

          <div className='head__game-stats__statistics'>
            <p className='dash--win-color'> {win} Won </p>
            <p className='dash--lost-color'> {lost} Lost</p>
          </div>

        </div>
      </div>
  )
}

export default DashboardHead
