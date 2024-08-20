import { React } from 'react'

import DashTournament from './DashBody/DashTournament';
import DashRanking from './DashBody/DashRanking';
import DashStatistics from './DashBody/DashStatistics';

function DashboardBody() {
  return (
    <div className="dashpage__body dash--space">
      <DashStatistics />
      <div className="rank-classment">
        <DashRanking />
        <DashTournament />
      </div>
    </div>
  )
}

export default DashboardBody
