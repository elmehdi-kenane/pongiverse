import { React, useState } from 'react'

import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';

import { dataLevel } from './helpers/Data';
import LineGraph from "./charts/LineGraph"
import BarGraph from "./charts/BarGraph"
import DashTournament from './DashBody/DashTournament';
import DashRanking from './DashBody/DashRanking';

function DashboardBody() {

  const [isLineChart, setIsLineChart] = useState(false);
  let i = 0;

  const handleIconClick = () => {
    setIsLineChart(!isLineChart);
    console.log(isLineChart);
  }

  const chartParameters = {
    left: -30,
    right: 5,
    data: dataLevel,
    brSize: 10,
  }

  return (
    <div className="dashpage__body dash--space">
      <div className="dashpage__body__statistics dash--bkborder">
        <div className="statistics-head-button">
          <h1> Wins/Lost Historics </h1>
          {isLineChart && <BarChartIcon className="chart-icon" onClick={handleIconClick} />}
          {!isLineChart && <ShowChartIcon className="chart-icon" onClick={handleIconClick} />}
        </div>
        <div className="line-graph">
          {!isLineChart ? <BarGraph param={chartParameters} />
            : <LineGraph param={chartParameters} />}
        </div>
      </div>
      {/* Rank */}
      <div className="rank-classment">
        <DashRanking />
        <DashTournament />
      </div>
    </div>
  )
}

export default DashboardBody
