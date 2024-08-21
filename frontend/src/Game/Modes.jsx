import React, { useState, useEffect, useContext } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import * as Icons from '../assets/navbar-sidebar'
import AuthContext from '../navbar-sidebar/Authcontext'
import styles from '../assets/Game/gamemodes.module.css'
import playSoloImage from '../assets/Game/playSoloMode.svg'
import createTournamentImage from '../assets/Game/createTournamentMode.svg'
import joinTournamentImage from '../assets/Game/joinTournamentMode.svg'

const Modes = () => {
	const navigate = useNavigate()
	const [soloModeSelected, setSoloModeSelected] = useState(false)
	const [createTournamentModeSelected, setcreateTournamentModeSelected] = useState(false)
	const [joinTournamentModeSelected, setJoinTournamentModeSelected] = useState(false)
	const [enableButton, setEnableButton] = useState(false)
	const [gameNotif, setGameNotif] = useState([])
	const [roomID, setRoomID] = useState(null)
	let { socket, user, setAllGameNotifs,
		allGameNotifs, notifsImgs, notifSocket } = useContext(AuthContext)

	useEffect(() => {
		const check_is_join = async () => {
			const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/api/is-joining-tournament`, {
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
		const check_is_started_and_not_finished = async () => {
			const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/api/is-started-and-not-finshed`, {
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
	}, [user])

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
	// useEffect(() => {
	// 	if (socket && socket.readyState === WebSocket.OPEN) {
	// 		socket.onmessage = (event) => {
	// 			let data = JSON.parse(event.data)
	// 			let type = data.type
	// 			let message = data.message
	// 			if (type === 'goToGamingPage') {
	// 				console.log("navigating now")
	// 				console.log("")
	// 				if (message.mode === '1vs1')
	// 					navigate(`/mainpage/game/solo/1vs1/friends`)
	// 				else {

	// 					navigate(`/mainpage/game/solo/2vs2/friends`)
	// 				}
	// 			} else if (type === 'receiveFriendGame') {
	// 				console.log("RECEIVED A GAME REQUEST")
	// 				setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message])
	// 				setRoomID(message.roomID)
	// 			}
	// 		}
	// 	}
	// }, [socket])

	// useEffect(() => {
	// 	if (socket && socket.readyState === WebSocket.OPEN) {
	// 		socket.onmessage = (event) => {
	// 			let data = JSON.parse(event.data)
	// 			let type = data.type
	// 			let message = data.message
	// 			if (type === 'goToGamingPage') {
	// 				// console.log("navigating now")
	// 				// navigate(`/mainpage/game/solo/1vs1/friends`)
	// 				if (message.mode === '1vs1')
	// 					navigate(`/mainpage/game/solo/1vs1/friends`)
	// 				else
	// 					navigate(`/mainpage/game/solo/2vs2/friends`)
	// 			} else if (type === 'receiveFriendGame') {
	// 				console.log("RECEIVED A GAME REQUEST")
	// 				setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message])
	// 				setRoomID(message.roomID)
	// 			} else if (type === 'tournament_created') {
	// 				console.log("YESSSSSSSSS")
	// 				navigate("createtournament")
	// 			}
	// 			else if (type === 'connected_again') {
	// 				console.log("YOUR FRIEND IS LOGED AGAIN")
	// 			}
	// 			else if (type === 'hmed') {
	// 				console.log("hmed received")
	// 			}
	// 		}
	// 	}
	// }, [socket])

	useEffect(() => {
		if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
			notifSocket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				let message = data.message
				if (type === 'goToGamingPage') {
					// console.log("navigating now")
					// navigate(`/mainpage/game/solo/1vs1/friends`)
					if (message.mode === '1vs1')
						navigate(`/mainpage/game/solo/1vs1/friends`)
					else
						navigate(`/mainpage/game/solo/2vs2/friends`)
				} else if (type === 'receiveFriendGame') {
					console.log("RECEIVED A GAME REQUEST")
					setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message])
					setRoomID(message.roomID)
				}
			}
		}
	}, [notifSocket])

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				if (type === 'hmed') {
					console.log("WWWWWWWWWAAAAA HMEEEEEEEED")
					socket.close()
					// setSocket(null)
				} else if (type === 'connected_again')
					console.log('USER IS CONNECTED AGAIN')
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
		if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
			console.log("inside join")
			notifSocket.send(JSON.stringify({
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
		if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
			console.log("inside join")
			notifSocket.send(JSON.stringify({
				type: 'acceptInvitation',
				message: {
					user: notifSelected[0].user,
					target: user,
					roomID: notifSelected[0].roomID
				}
			}))
		}
	}

	const handleSelect = (type) => {
		if (type === 'play_solo'){
			setSoloModeSelected(true)
			setcreateTournamentModeSelected(false)
			setJoinTournamentModeSelected(false)
			setEnableButton(true)
		}else if (type === 'create_tournament'){
			setSoloModeSelected(false)
			setcreateTournamentModeSelected(true)
			setJoinTournamentModeSelected(false)
			setEnableButton(true)
		}else if (type === 'join_tournament'){
			setSoloModeSelected(false)
			setcreateTournamentModeSelected(false)
			setJoinTournamentModeSelected(true)
		}
		setEnableButton(true)
	}

	const handleButtonClick = () => {
		if (soloModeSelected)
			goToSoloPage()
		if (createTournamentModeSelected)
			GoToTournamentPage()
		if (joinTournamentModeSelected)
			JoinTournament()
	}

	return (
		<div className={styles['game-modes-page']}>
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
			<div className={`${styles['play-solo-mode']} ${soloModeSelected ? styles['mode-selected'] : ''}`} onClick={() => handleSelect('play_solo')}>
				<div className={styles['play-solo-mode-image']}>
					<img src={playSoloImage} alt="" />
				</div>
				<div className={styles['play-solo-mode-title-and-description']}>
					<h1 className={styles['play-solo-mode-title']}>Play Solo</h1>
					<p className={styles['play-solo-mode-description']}>Initiate a solo team ping pong match where you, as a single player,
						compete against other players.</p>
				</div>
			</div>
			<div className={`${styles['create-tournament-mode']} ${createTournamentModeSelected ? styles['mode-selected'] : ''}`} onClick={() => handleSelect('create_tournament')}>
				<div className={styles['create-tournament-mode-image']}>
					<img src={createTournamentImage} alt="" />
				</div>
				<div className={styles['create-tournament-mode-title-and-description']}>
					<h1 className={styles['create-tournament-mode-title']}>Create Tournament</h1>
					<p className={styles['create-tournament-mode-description']}> Kick off the process of creating a ping pong tournament,
						Craft your own competitive event.</p>
				</div>
			</div>
			<div className={`${styles['join-tournament-mode']} ${joinTournamentModeSelected ? styles['mode-selected'] : ''}`} onClick={() => handleSelect('join_tournament')}>
				<div className={styles['join-tournament-mode-image']}>
					<img src={joinTournamentImage} alt="" />
				</div>
				<div className={styles['join-tournament-mode-title-and-description']}>
					<h1 className={styles['join-tournament-mode-title']}>Join Tournament</h1>
					<p className={styles['join-tournament-mode-description']}>Join an existing ping pong tournament hosted by other players,
						discover various tournaments with different challenges.</p>
				</div>
			</div>
			<div className={`${styles['game-modes-page-button']} ${(soloModeSelected || createTournamentModeSelected || joinTournamentModeSelected) ? styles['game-modes-page-button-selected'] : ''}`}	onClick={handleButtonClick}>
				<button disabled={!enableButton}>Next</button>
			</div>
		</div>
	)
}

export default Modes

// <button onClick={goToSoloPage}>Play solo</button>
// 			<button onClick={GoToTournamentPage}>Create Tournament</button>
// 			<button onClick={JoinTournament}>Join Tournament</button>