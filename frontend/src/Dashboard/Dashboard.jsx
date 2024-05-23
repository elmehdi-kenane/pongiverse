import React from 'react'
import './Dashboard.css'

import DashboardHead from './DashboardHead';
import DashboardBody from './DashboardBody';
import DashboardFooter from './DashboardFooter';


const Dashboard = () => {

  return (

    <div className='dashpage'>
      <DashboardHead />
      <DashboardBody />
      <DashboardFooter />
    </div>
  )
}

export default Dashboard