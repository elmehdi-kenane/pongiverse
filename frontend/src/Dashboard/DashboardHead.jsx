import React, { useContext } from 'react'

import racketSvg from "../assets/Profile/racket.svg"
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import DashboardContext from './DashboardWrapper';

function DashboardHead() {
  const { wins, losts, games, winPcnt, lostPcnt } = useContext(DashboardContext);

  return (
    <div className="dashpage__head dash--space"> 
        <div className="head__game-stats purple--glass">
          <p className='game'> Games </p>
          <div className="head__games-value-pic">
            <img alt='racket' src={racketSvg} />
            <p> {games ? games : 0} </p> 
          </div>
          
          <div className="head__game-stats__percentage">
            <div className='pic-percentage dash--win-color'>
              <AddCircleIcon />
              <p>{isNaN(winPcnt) || winPcnt === 0 ? '0%' : `${winPcnt}%`}</p>
            </div>
            <div className='pic-percentage dash--lost-color'>
              <RemoveCircleIcon />
              <p>{isNaN(lostPcnt) || lostPcnt === 0 ? '0%' : `${lostPcnt}%`}</p>
            </div>
          </div>

          <div className='head__game-stats__line'>
            <div className="left-side" style={{width:`${winPcnt}%`}} ></div>
            <div className="right-side" style={{width:`${lostPcnt}%`}}></div>
          </div>

          <div className='head__game-stats__statistics'>
            <p className='dash--win-color'> {wins ? wins : 0} Wins </p>
            <p className='dash--lost-color'> {losts ? losts : 0} Losts </p>
          </div>

        </div>
      </div>
  )
}

export default DashboardHead
