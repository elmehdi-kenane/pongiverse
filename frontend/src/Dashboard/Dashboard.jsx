import React, { useContext, useEffect } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext';
import './Dashboard.css'
import DashboardHead from './DashboardHead';
import DashboardBody from './DashboardBody';
import DashboardFooter from './DashboardFooter';
import DashResult from './DashResult/DashResult';
import GameNotifications from '../GameNotif/GameNotifications';

const Dashboard = () => {
  const {isGameStats} = useContext(AuthContext);

  return (
    <>
      { isGameStats && <DashResult/> }
      <div className={`${!isGameStats ? `dashpage` : `dashpage dash-blur`}`}>
        <GameNotifications />
        <DashboardHead />
        <DashboardBody />
        <DashboardFooter />
      </div>
    </>
  );
}

export default Dashboard