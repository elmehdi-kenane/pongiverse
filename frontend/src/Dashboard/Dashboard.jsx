import React, { useState } from 'react'
import { useEffect, useContext } from 'react';
import { useNavigate, useLocation, json } from 'react-router-dom';
import AuthContext from '../navbar-sidebar/Authcontext';
import InviteNotif from '../Tournament/invite_notif'
import styles from '../assets/Tournament/tournament.module.css'


const Dashboard = () => {
	const { user, notifSocket, socket } = useContext(AuthContext)
	const [users, setUsers] = useState([])
	const [notifications, setNotifications] = useState([])
	const navigate = useNavigate()
	let a = 0

	useEffect(() => {
		const getUsers = async () => {
			const response = await fetch(`http://localhost:8000/users/profile/${user}`, {
				method: 'GET'
			})
			const res = await response.json()
			console.log(res)
			setUsers(res)
		}
		if (user)
			getUsers()
	}, [user])

	useEffect(() => {
		const getNotifications = async () => {
			const response = await fetch(`http://localhost:8000/api/get-notifications`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					user: user,
				})
			})
			const res = await response.json()
			console.log("reskh :", res.notifications)
			setNotifications(res.notifications)
			console.log("RESSS :", res)
		}
		if (user)
			getNotifications()
	}, [user])

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				if (type === 'invited_to_tournament') {
					console.log("YOU HAVE BEEN INVITED BY " + data.message.user + " TO TOURNAMENT N: ", data.message.tournament_id)
					const notif = {'sender' : data.message.user, 'tournament_id': data.message.tournament_id}
					setNotifications((prevNotifications) => [...prevNotifications, notif]);
				}
				else if (type == 'accepted_invitation'){
					navigate("/mainpage/game/createtournament");
				}
			}
		}
	}, [socket])

	const addFriend = async (myuser) => {
		const response = await fetch(`http://localhost:8000/users/add/${user}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user: myuser,
			})
		})
		const res = await response.json()
	}

	const handleAccept = async (tournament_id) => {
		console.log("user : ", user);
		if (socket && socket.readyState === WebSocket.OPEN) {
		  try {
			await socket.send(
			  JSON.stringify({
				type: 'accept-tournament-invitation',
				message: {
				  user: user,
				  tournament_id: tournament_id
				}
			  })
			);
		  } catch (error) {
			console.error("Error sending message:", error);
		  }
		}
	  };

	const handleDeny = (sender, tournament_id) => {
		setNotifications((prevNotifications) => prevNotifications.filter((notif) => notif.sender !== sender));
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({
				type: 'deny-tournament-invitation',
				message: {
					user: user,
					sender : sender,
					tournament_id : tournament_id
				}
			}))
		}

	}

	return (
		<div style={{ color: "white" }}>Dashboard
			<ul>
				{users.map((myuser) => (
					<li onClick={() => {
						addFriend(myuser)
					}} key={a++}>{myuser}</li>
				))}
			</ul>
			<div className={styles["notifications"]}>
				{
					notifications.length > 0 && notifications.map((user, key) => {
						return (
							<div className={styles["notif"]} key={key}>
								<p className={styles["invite-notif-text"]}><b>{user.sender}</b> invited you to a tournament</p>
								<div className={styles["invite-notif-buttons"]}>
									<button className={styles["invite-notif-button-accept"]} onClick={() => handleAccept(user.tournament_id)}>accept</button>
									<button className={styles["invite-notif-button-deny"]} onClick={() => handleDeny(user.sender, user.tournament_id)}>deny</button>
								</div>
							</div>
						)
					})
				}
			</div>

		</div>
	)
}

export default Dashboard