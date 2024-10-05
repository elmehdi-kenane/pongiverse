import React, { useContext, useEffect } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext';
import './Dashboard.css'

import DashboardHead from './DashboardHead';
import DashboardBody from './DashboardBody';
import DashboardFooter from './DashboardFooter';
import DashResult from './DashResult/DashResult';

const Dashboard = () => {
  const {isGameStats, user} = useContext(AuthContext);
  
  const set_is_inside = async () => {
	  const response = await fetch(`http://localhost:8000/api/set-is-inside`, {
		  method: 'POST',
		  headers: {
			  'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({
			  user: user,
			  is_inside: false
		  })
	  })
  }

  useEffect(() => {
	  if (user) {
		  set_is_inside()
	  }
  }, [user])

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