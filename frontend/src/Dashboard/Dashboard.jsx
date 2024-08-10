// import React, { useContext, useEffect } from 'react'
// import './Dashboard.css'

// import DashboardHead from './DashboardHead';
// import DashboardBody from './DashboardBody';
// import DashboardFooter from './DashboardFooter';
// import AuthContext from '../navbar-sidebar/Authcontext';


// const Dashboard = () => {
// 	const { user } = useContext(AuthContext)
// 	const set_is_inside = async () => {
// 		const response = await fetch(`http://localhost:8000/api/set-is-inside`, {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json'
// 			},
// 			body: JSON.stringify({
// 				user: user,
// 				is_inside: false
// 			})
// 		})
// 	}

// 	useEffect(() => {
// 		if (user) {
// 			set_is_inside()
// 		}
// 	}, [user])

// 	return (

// 		<div className='dashpage'>
// 			<DashboardHead />
// 			<DashboardBody />
// 			<DashboardFooter />
// 		</div>
// 	)
// }

// export default Dashboard

import React, { useState } from 'react'
import { useEffect, useContext } from 'react';
// import { useNavigate, useLocation, json } from 'react-router-dom';
import AuthContext from '../navbar-sidebar/Authcontext';

const Dashboard = () => {
  const { user, notifSocket } = useContext(AuthContext)
  const [users, setUsers] = useState([])
  let a = 0

  useEffect(() => {
	const getUsers = async () => {
		const response = await fetch(`http://localhost:8000/users/profile/${user}`, {
		  method: 'GET'
		})
		const res = await response.json()
		// set
		console.log(res)
		setUsers(res)
		// document.write(res)
	}
	if (user)
	  getUsers()
  }, [user])

  const addFriend = async (myuser) => {
	const response = await fetch(`http://localhost:8000/users/add/${user}`, {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({
		user : myuser,
	  })
	})
	const res = await response.json()
  }

  return (
	<div style={{color:"white"}}>Dashboard
	  <ul>
		{users.map((myuser) => (
		  <li onClick={() => {
			addFriend(myuser)
		  }} key={a++}>{myuser}</li>
		))}
	  </ul>
	</div>
  )
}

export default Dashboard