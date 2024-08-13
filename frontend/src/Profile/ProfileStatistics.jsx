import React, { useState } from 'react'
import Pagination from "../Dashboard/helpers/Pagination"
import BarGraph from "../Dashboard/charts/BarGraph"
import LineGraph from '../Dashboard/charts/LineGraph'
import { profileLevel } from './data/ProfileDataLevel';

import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';

import { achv } from './data/achvData'
import ProfileUserFriends from './Statistics/ProfileUserFriends'

  function ProfileUserStatistics(){
    const [isLineChart, setIsLineChart] = useState(false);
    const iconClick = () => {
      setIsLineChart(!isLineChart);
    }

    const chartParameters = {
      left: -30,
      right: 10,
      data: profileLevel,
      brSize: 15,
    }

    return (
      <div className='userstate_statistics purple-glass-stats'>
        <div className='userstate-header'><h1> Statistics </h1> </div>
        {isLineChart && <BarChartIcon className="statics__chart-icon" onClick={iconClick}/>}
        {!isLineChart && <ShowChartIcon className="statics__chart-icon" onClick={iconClick}/>}
        <div className="statistics__container">
          {!isLineChart && <BarGraph param={chartParameters}/>}
          {isLineChart && <LineGraph param={chartParameters}/>}
        </div>
      </div>
    )
  }
  
  const ProfileUserAchievement = () => {
    return (
      <div className='userstate__achievements purple-glass-stats'>
        <div className='userstate-header'> <h1> Achievements </h1> </div>
        <div className="achievements__container">
          { achv.map((ach, key) => {
            return (
              <div className="achivement" key={key}>
                <img src={ach.image} alt='achievmentImg'/>
                <div className="achivement__title-desc">
                  <h3> {ach.title} </h3>
                  <p> {ach.desc} </p>
                </div>
              </div>
            )
          })}
        </div>
        <Pagination />
      </div>
    )
  }
  
function ProfileStatistics() {
    
  return (
    <div className="profile-userstats">
        <ProfileUserStatistics />
      <div className="userstate__friends-achievements">
            <ProfileUserFriends />
            <ProfileUserAchievement />
      </div>
    
    </div>
  )
}

export default ProfileStatistics
