import { React } from 'react'
import DashRanking from './DashBody/DashRanking';
import DashStatistics from './DashBody/DashStatistics';
import DashTourn from './DashFooter/DashTourn';

function DashboardBody() {
  return (
    <div className="dashpage__body dash--space">
      <DashStatistics />
      <div className="rank-classment">
        <DashRanking />
        <DashTourn items={6} class={"footer__tournament-match2"}/>
      </div>
    </div>
  )
}

export default DashboardBody
