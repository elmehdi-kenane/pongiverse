import React, { useState, useEffect, useContext } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import * as Icons from '../assets/navbar-sidebar'
import AuthContext from '../navbar-sidebar/Authcontext'

const Modes = () => {
	const navigate = useNavigate()
	const [gameNotif, setGameNotif] = useState([])
	const [roomID, setRoomID] = useState(null)
	let { socket, user, setAllGameNotifs,
		allGameNotifs, notifsImgs } = useContext(AuthContext)


		useEffect(() =>{
			const check_is_join = async () => {
				const response = await fetch(`http://localhost:8000/api/is-joining-tournament`, {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						user: user
					})
				});
				if (response.ok) {
					const data = await response.json();
					if (data.Case === 'yes')
						navigate("createtournament")
				} else {
					console.error('Failed to fetch data');
				}
			}
			const check_is_started_and_not_finished = async () =>{
				const response = await fetch(`http://localhost:8000/api/is-started-and-not-finshed`, {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						user: user
					})
				});
				if (response.ok) {
					const data = await response.json();
					if (data.Case === 'yes')
						navigate('tournamentbracket');
					else
						check_is_join()
				} else {
					console.error('Failed to fetch data');
				}
			}
			if (user)
				check_is_started_and_not_finished()
		},[user])

	const goToSoloPage = () => {
		navigate("../game/solo")
	}

	const GoToTournamentPage = async () => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({
				type: 'createTournament',
				message: {
					user: user
				}
			}))
		}
	}

	const JoinTournament = async () => {
		navigate("jointournament")
	}
  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.onmessage = (event) => {
            let data = JSON.parse(event.data)
            let type = data.type
            let message = data.message
            if (type === 'goToGamingPage') {
                console.log("navigating now")
                console.log("")
                if (message.mode === '1vs1')
                    navigate(`/mainpage/game/solo/1vs1/friends`)
                else {

                    navigate(`/mainpage/game/solo/2vs2/friends`)
                }
            } else if (type === 'receiveFriendGame') {
              console.log("RECEIVED A GAME REQUEST")
              setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message])
              setRoomID(message.roomID)
            }
        }
    }
  }, [socket])

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				let message = data.message
				console.log("DKHEL MODESS: ", type)
				if (type === 'goToGamingPage') {
					console.log("navigating now")
					navigate(`/mainpage/game/solo/1vs1/friends`)
				} else if (type === 'receiveFriendGame') {
					console.log("RECEIVED A GAME REQUEST")
					setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message])
					setRoomID(message.roomID)
				} else if (type === 'tournament_created') {
					navigate("createtournament")
				}else if (type === 'socket_close'){
					console.log("SOCKEEEET CLOSSSSSEEEE AHMEDDDD")
					socket.close()
				}else if (type === 'connected_again'){
					console.log("CONNECETDDDDDD AGAAAAAIN")
				}
			}
		}
	}, [socket])

//   const acceptInvitation = (creator) => {
//     let notifSelected = allGameNotifs.filter((user) => user.user === creator)
//     setAllGameNotifs(allGameNotifs.filter((user) => user.user !== creator))
//     console.log(creator, user, notifSelected)
//     if (socket && socket.readyState === WebSocket.OPEN) {
//         console.log("inside join")
//         if (notifSelected[0].mode === '1vs1') {
//             socket.send(JSON.stringify({
//                 type: 'acceptInvitation',
//                 message: {
//                     user: notifSelected[0].user,
//                     target: user,
//                     roomID: notifSelected[0].roomID
//                 }
//             }))
//         }
//         else if (notifSelected[0].mode === '2vs2') {
//             console.log("2vs2 accepting notif")
//             socket.send(JSON.stringify({
//                 type: 'acceptInvitationMp',
//                 message: {
//                     user: notifSelected[0].user,
//                     target: user,
//                     roomID: notifSelected[0].roomID
//                 }
//             }))
//         }
//       }
//   }


	const refuseInvitation = (creator) => {
		let notifSelected = allGameNotifs.filter((user) => user.user === creator)
		setAllGameNotifs(allGameNotifs.filter((user) => user.user !== creator))
		if (socket && socket.readyState === WebSocket.OPEN) {
			console.log("inside join")
			socket.send(JSON.stringify({
				type: 'refuseInvitation',
				message: {
					user: notifSelected[0].user,
					target: user,
					roomID: notifSelected[0].roomID
				}
			}))
		}
	}

	const acceptInvitation = (creator) => {
		let notifSelected = allGameNotifs.filter((user) => user.user === creator)
		setAllGameNotifs(allGameNotifs.filter((user) => user.user !== creator))
		console.log(creator, user, roomID)
		if (socket && socket.readyState === WebSocket.OPEN) {
			console.log("inside join")
			socket.send(JSON.stringify({
				type: 'acceptInvitation',
				message: {
					user: notifSelected[0].user,
					target: user,
					roomID: notifSelected[0].roomID
				}
			}))
		}
	}

	return (
		<div className='onevsone'>
			<div className='cancel-game-invite-request'>
				{(allGameNotifs.length) ? (
					<div className='game-invitations'>
						{allGameNotifs.map((user, key) => {
							return ((
								<div key={key} className='game-invitation'>
									<img src={notifsImgs[key]} alt="profile-pic" />
									<div className='user-infos'>
										<span>{user.user}</span>
										<span>level 2.5</span>
									</div>
									<div className='invitation-mode'>
										<span>1</span>
										<span>vs</span>
										<span>1</span>
									</div>
									<div className='accept-refuse'>
										<div onClick={() => acceptInvitation(user.user)}>
											<img src={Icons.copied} alt="accept-icon" />
										</div>
										<div onClick={() => refuseInvitation(user.user)}>
											<img src={Icons.cancel} alt="refuse-icon" />
										</div>
									</div>
								</div>
							))
						})}
					</div>
				) : ''
				}
			</div>
			<div>Modes</div>
			<button onClick={goToSoloPage}>Play solo</button>
			<button onClick={GoToTournamentPage}>Create Tournament</button>
			<button onClick={JoinTournament}>Join Tournament</button>
		</div>
	)
}

export default Modes