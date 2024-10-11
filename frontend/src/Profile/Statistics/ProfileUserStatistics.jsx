import React, { useContext, useEffect, useId, useState } from 'react'

import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarGraph from "../../Dashboard/charts/BarGraph"
import LineGraph from '../../Dashboard/charts/LineGraph'
import ProfileContext from '../ProfileWrapper'


function ProfileUserStatistics(){
    const [isLineChart, setIsLineChart] = useState(false);
    const [userStcs, setUserStcs] = useState([])
    const {userId} = useContext(ProfileContext);

  useEffect(()=>{
    const getUserStcs = async () => {
      try {
        const response = await fetch(`http://localhost:8000/profile/getUserStcs/${userId}/${15}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const res = await response.json()
        if (response.ok) 
          setUserStcs(res.userStcs)
        else 
          console.log("Error : ", res.error);
      } catch (error) {
        console.log("Error: ", error);
      }
    }
    if (userId)
      getUserStcs()
  },[userId])

    const iconClick = () => {
      setIsLineChart(!isLineChart);
    }
    const chartParameters = {
      left: -30,
      right: 10,
      data: userStcs,
      brSize: 15,
    }

    return (
      <div className='userstate_statistics purple-glass-stats'>
        <div className='userstate-header'><h1> Statistics </h1> </div>
        {isLineChart && <BarChartIcon className="statics__chart-icon" onClick={iconClick}/>}
        {!isLineChart && <ShowChartIcon className="statics__chart-icon" onClick={iconClick}/>}
        {userStcs ? 
          <div className="statistics__container">
            {!isLineChart && <BarGraph param={chartParameters}/>}
            {isLineChart && <LineGraph param={chartParameters}/>}
          </div> : <></>
        }
      </div>
    )
  }

export default ProfileUserStatistics
