import React, { useState } from 'react'
import { rankData } from "./helpers/rankData"
import './Dashboard.css'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import ekenaneSvg from "./assets/Group1.svg"
import idabligiSvg from "./assets/Group2.svg"
import AgouzouSvg from "./assets/Group3.svg"
import rennacirSvg from "./assets/Group4.svg"
import mmaqbourSvg from "./assets/Group5.svg"
import racketSvg from "./assets/racket.svg"

import LineGraph from "./charts/LineGraph"
import BarGraph from "./charts/BarGraph"




const Dashboard = () => {

  const games =20;
  const win = 9;
  const lost = 6;
  const winPcnt = ((win * 100)/games).toFixed(0);
  const lostPcnt = 100 - winPcnt;

  const [isLineChart, setIsLineChart] = useState(false);
  let i = 0;

  const RankClassment = (position, player) => {
    let trophyClass = ""; // pos-pic
    let championsClass = ""; // name-level
    if (position <= 3){
      trophyClass = `winners winner--${position}`;
      championsClass = `player__name_level--champions`;
    }
    return (
      <>
        <div className='player__pos_pic'>
          <p className={trophyClass}> #{position}</p>
          <img src={player.img} alt="Player" />
        </div>
        <div className="player__name_level">
          <p className={championsClass}> {player.name} </p>
          <p className={championsClass}> {player.level} </p>
        </div>
      </>
    );
  };

// Footer -------------------

  const singleMatch = () => {
    return (
      <div className="single-match__result footer__result">
        <img src={idabligiSvg} alt="Player" />
        <p> 5 - 3 </p>
        <img src={AgouzouSvg} alt="Player" />
      </div>
    )
  }
  
  const multiplayerMatch = () => {
    return (
      <div className="multiplayer-match__result footer__result">
        <div className="multiplayer-pics">
        <img src={idabligiSvg} alt="Player" />
        <img src={rennacirSvg} alt="Player" />
        </div>
        <div className="middle-side">
          <p> 5 - 3 </p>
        </div>
        <div className="multiplayer-pics">
          <img src={ekenaneSvg} alt="Player" />
          <img src={mmaqbourSvg} alt="Player" />
        </div>
      </div>
    )
  }
  
  const tournamentMatch = () => {
    return (
      <div className="tournament-match__result footer__result">
        <img src={mmaqbourSvg} alt="Player" />
        <p> Semi-Final </p>
        <p> 4th </p>
      </div>
    )
  }

  const paginationIcons = () => {
    return (
      <div className="expand">
        <ExpandLessIcon className='expand-less'/>
        <ExpandMoreIcon className='expand-more'/>
    </div>
    )
  }
 
  const tournamentMatch2 = () => {
    return (
      <div className="footer__tournament-match2 dash--bkborder">
        <h1 className="footer__titles"> Tournament Match </h1>
              {tournamentMatch()}
              {tournamentMatch()}
              {tournamentMatch()}
              {tournamentMatch()}
              {tournamentMatch()}
              {tournamentMatch()}
              {paginationIcons()}
      </div>
    )
  }

  const handleIconClick = () => {
    setIsLineChart(!isLineChart);
    console.log(isLineChart);
  }

  return (


    <div className='dashpage'>
      {/* Head */}
      <div className="dashpage__head dash--space"> 
        <div className="head__game-stats dash--bkborder">
          <p className='game'> Games </p>
          <div className="head__games-value-pic">
            <img src={racketSvg} />
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
      {/* Body */}
          {/* Level */}
      <div className="dashpage__body dash--space">
        <div className="dashpage__body__statistics dash--bkborder">
          <div className="statistics-head-button">
            <h1> Wins/Lost Historics </h1>
            {isLineChart && <BarChartIcon className="chart-icon" onClick={handleIconClick}/>}
            {!isLineChart && <ShowChartIcon className="chart-icon" onClick={handleIconClick}/>}
          </div>
          <div className="line-graph">
            {!isLineChart ? <BarGraph/>  : <LineGraph />}
          </div>
        </div>
          {/* Rank */}
        <div className="rank-classment"> 
          <div className="dashpage__body__rank dash--bkborder">
            <h1> Rank </h1>
            <div className='dashpage__body__rank__title'>
              <div className='title'> Level </div>
              <div className='title'> Win </div>
              <div className='title'> Goal </div>
            </div>
            <div className="dashpage__body__rank__classment">
              {rankData.map((player) => {
                return (
                  <div className='player__classment'>
                    {RankClassment(i = i + 1, player)}
                  </div>
                )
              })}
            </div>
          </div>
          {tournamentMatch2()}
        </div>

      </div>
      {/* Footer */}
      <div className="dashpage__footer dash--space">
        <div className="footer__single-match dash--bkborder">
          <h1 className="footer__titles"> Single Match </h1>
          {singleMatch()}
          {singleMatch()}
          {singleMatch()}
          {paginationIcons()}
        </div>
        <div className="footer__multiplayer-match dash--bkborder">
          <h1 className="footer__titles"> Multiplayer Match </h1>
          {multiplayerMatch()}
          {multiplayerMatch()}
          {multiplayerMatch()}
          {paginationIcons()}
        </div>
        <div className="footer__tournament-match dash--bkborder">
          <h1 className="footer__titles"> Tournament Match </h1>
          {tournamentMatch()}
          {tournamentMatch()}
          {tournamentMatch()}
          {paginationIcons()}
        </div>
      </div>
    </div>
  )
}

export default Dashboard