import {React, useState} from 'react'

import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';

import { dataLevel } from './helpers/DataLevel';
import { rankData } from "./helpers/rankData"
import LineGraph from "./charts/LineGraph"
import BarGraph from "./charts/BarGraph"
import Pagination from './helpers/Pagination';
import mmaqbourSvg from "./assets/Group5.svg"

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

const tournamentMatch = () => {
    return (
      <div className="tournament-match__result footer__result">
        <img src={mmaqbourSvg} alt="Player" />
        <p> Semi-Final </p>
        <p> 4th </p>
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
            <Pagination />
      </div>
    )
}

function DashboardBody() {
  
    const [isLineChart, setIsLineChart] = useState(false);
    let i = 0;
  
    const handleIconClick = () => {
        setIsLineChart(!isLineChart);
        console.log(isLineChart);
      }

    return (
    <div className="dashpage__body dash--space">
        <div className="dashpage__body__statistics dash--bkborder">
          <div className="statistics-head-button">
            <h1> Wins/Lost Historics </h1>
            {isLineChart && <BarChartIcon className="chart-icon" onClick={handleIconClick}/>}
            {!isLineChart && <ShowChartIcon className="chart-icon" onClick={handleIconClick}/>}
          </div>
          <div className="line-graph">
            {!isLineChart ? <BarGraph marginLeft={-30} marginRight={5} dataLevel={dataLevel}/>
              : <LineGraph />}
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
              {rankData.map((player, key) => {
                return (
                  <div className='player__classment' key={key}>
                    {RankClassment(i = i + 1, player)}
                  </div>
                )
              })}
            </div>
          </div>
          {tournamentMatch2()}
        </div>
      </div>
  )
}

export default DashboardBody
