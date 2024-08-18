import React, { useState } from 'react'

import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarGraph from "../../Dashboard/charts/BarGraph"
import LineGraph from '../../Dashboard/charts/LineGraph'
import { profileLevel } from '../data/ProfileDataLevel';

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

export default ProfileUserStatistics
