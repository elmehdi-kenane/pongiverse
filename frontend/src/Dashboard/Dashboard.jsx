import React, { useState } from 'react'
import { useEffect, useContext } from 'react';
import { useNavigate, useLocation, json } from 'react-router-dom';
import AuthContext from '../navbar-sidebar/Authcontext';
import InviteNotif from '../Tournament/invite_notif'
import styles from '../assets/Tournament/tournament.module.css'
import Swal from 'sweetalert2';


const Dashboard = () => {
	const location = useLocation()
	const { user, notifSocket, socket } = useContext(AuthContext)
	const [users, setUsers] = useState([])
	const [notifications, setNotifications] = useState([])
	const navigate = useNavigate()
	let a = 0
	useEffect(()=>{
		const check_is_joining_a_tournament = async () => {
			const response = await fetch(`http://localhost:8000/api/is-started-and-not-finshed`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					user: user,
				})
			})
			const res = await response.json()
			if (res.Case === 'yes'){
				console.log("you have to go back to tournament")
			}
		}
		check_is_joining_a_tournament()
	},[])
	useEffect(() => {
		const getUsers = async () => {
			const response = await fetch(`http://localhost:8000/users/profile/${user}`, {
				method: 'GET'
			})
			const res = await response.json()
			console.log(res)
			setUsers(res)
		}
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
			setNotifications(res.notifications)
		}
		const set_is_inside = async () =>{
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
			const res = await response.json()
		}

		if (user){
			getUsers()
			getNotifications()
			set_is_inside()
		}
	}, [user])


	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				if (type === 'invited_to_tournament') {
					const notif = {'sender' : data.message.user, 'tournament_id': data.message.tournament_id}
					setNotifications((prevNotifications) => [...prevNotifications, notif]);
				}
				else if (type == 'accepted_invitation'){
					navigate("/mainpage/game/createtournament");
				}
				else if (type == 'tournament_started'){
					console.log("tournament mohamed")
				}
				else if (type == 'warn_members'){
					console.log("you have to go back to tournament")
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
		const response = await fetch(`http://localhost:8000/api/get-tournament-size`, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				tournament_id: tournament_id
			})
		});
		if (response.ok) {
			const data = await response.json();
			if (data.Case === 'Tournament_started'){
				Swal.fire({
					icon: "warning",
					position: "top-end",
					title: "Tournament is already started",
					showConfirmButton: false,
					customClass: {
						popup: styles['error-container'] ,
						title: styles['title-swal'],
					},
					timer: 1500
				});
			}else if (data.Case === 'Tournament_is_full'){
				Swal.fire({
					icon: "warning",
					position: "top-end",
					title: "Tournament is full",
					showConfirmButton: false,
					customClass: {
						popup: styles['error-container'] ,
						title: styles['title-swal'],
					},
					timer: 1500
				});
			} else {
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
			}
		} else {
			console.error('Failed to fetch data');
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