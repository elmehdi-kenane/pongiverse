import React, { useContext } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext';
import './Dashboard.css'

import DashboardHead from './DashboardHead';
import DashboardBody from './DashboardBody';
import DashboardFooter from './DashboardFooter';
import DashResult from './DashResult/DashResult';

const Dashboard = () => {
  const {isGameStats} = useContext(AuthContext);

  return (
    <>
      { isGameStats && <DashResult/> }
      <div className={`${!isGameStats ? `dashpage` : `dashpage dash-blur`}`}>
        <DashboardHead />
        <DashboardBody />
        <DashboardFooter />
      </div>
    </>
  )
}

export default Dashboard