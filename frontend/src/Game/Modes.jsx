import React, { useState, useEffect, useContext } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import * as Icons from '../assets/navbar-sidebar'
import AuthContext from '../navbar-sidebar/Authcontext'
import styles from '../assets/Game/gamemodes.module.css'
import playSoloImage from '../assets/Game/playSoloMode.svg'
import createTournamentImage from '../assets/Game/createTournamentMode.svg'
import joinTournamentImage from '../assets/Game/joinTournamentMode.svg'
import toast, { Toaster } from 'react-hot-toast';
import GameNotifications from '../GameNotif/GameNotifications'
import Instructions from './Instructions'
import { BsQuestionSquareFill } from "react-icons/bs";
const Modes = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const [soloModeSelected, setSoloModeSelected] = useState(false)
	const [createTournamentModeSelected, setcreateTournamentModeSelected] = useState(false)
	const [joinTournamentModeSelected, setJoinTournamentModeSelected] = useState(false)
	const [enableButton, setEnableButton] = useState(false)
	const [roomID, setRoomID] = useState(null)
	let { socket, user } = useContext(AuthContext)
	const [hideInst, setHideInst] = useState(true)

	useEffect(() => {
		const check_is_join = async () => {
			const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/api/is-joining-tournament`, {
				method: "POST",
				credentials: "include",
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
				credentials: "include",
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

	// useEffect(() => {
	// 	if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
	// 		notifSocket.onmessage = (event) => {
	// 			let data = JSON.parse(event.data)
	// 			let type = data.type
	// 			let message = data.message
	// 			console.log("MESSAGE TYPE", type)
	// 			if (type === 'goToGamingPage') {
	// 				// console.log("navigating now")
	// 				// navigate(`/mainpage/game/solo/1vs1/friends`)
	// 				const socketRefer = socketRef.current
	// 				console.log("SOCKET........", socketRefer)
	// 				if (socketRefer.readyState !== WebSocket.OPEN) {
	// 					console.log("SOCKET IS CLOSED, SHOULD OPENED")
	// 					const newSocket = new WebSocket(`ws://${import.meta.env.VITE_IPADDRESS}:8000/ws/socket-server`)
	// 					newSocket.onopen = () => {
	// 						console.log("+++++++++++=======+++++++++")
	// 						console.log("GAME SOCKET OPENED AND NOW WE WILL MOVE TO FRIEND PAGE")
	// 						console.log("+++++++++++=======+++++++++")
	// 						setSocket(newSocket)
	// 						if (message.mode === '1vs1')
	// 							navigate(`/mainpage/game/solo/1vs1/friends`)
	// 						else
	// 							navigate(`/mainpage/game/solo/2vs2/friends`)
	// 					}
	// 				} else {
	// 					if (message.mode === '1vs1')
	// 						navigate(`/mainpage/game/solo/1vs1/friends`)
	// 					else
	// 						navigate(`/mainpage/game/solo/2vs2/friends`)
	// 				}
	// 			} else if (type === 'receiveFriendGame') {
	// 				console.log("RECEIVED A GAME REQUEST")
	// 				setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message])
	// 				setRoomID(message.roomID)
	// 			} else if (type === 'accepted_invitation') {
	// 				const socketRefer = socketRef.current
	// 				if (socketRefer.readyState !== WebSocket.OPEN) {
	// 					console.log("SOCKET IS CLOSED, SHOULD OPENED")
	// 					const newSocket = new WebSocket(`ws://${import.meta.env.VITE_IPADDRESS}:8000/ws/socket-server`)
	// 					newSocket.onopen = () => {
	// 						setSocket(newSocket)
	// 						navigate("/mainpage/game/createtournament");
	// 					}
	// 				} else {
	// 					navigate("/mainpage/game/createtournament");
	// 				}
	// 			} else if (type === 'warn_members'){
	// 				notifyError('your game In tournament will start in 15 seconds')
	// 			}
	// 			else if (type === 'invited_to_tournament') {
	// 				setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message])
	// 			} else if (type === 'deny_tournament_invitation'){
	// 				setAllGameNotifs(allGameNotifs.filter((user) => user.user !== message.user))
	// 			}
	// 		}
	// 	}
	// }, [notifSocket])

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				let message = data.message
				if (type === 'goToGamingPage') {
					navigate(`/mainpage/game/solo/1vs1/friends`)
				} else if (type === 'tournament_created') {
					navigate("createtournament")
				} else if (type === 'hmed') {
					console.log("WWWWWWWWWAAAAA HMEEEEEEEED")
					socket.close()
					console.log(socket)
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


	// const refuseInvitation = (creator) => {
	// 	let notifSelected = allGameNotifs.filter((user) => user.user === creator.user)
	// 	setAllGameNotifs(allGameNotifs.filter((user) => user.user !== creator.user))
	// 	if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
	// 		if (creator.mode === '1vs1') {
	// 			notifSocket.send(JSON.stringify({
	// 				type: 'refuseInvitation',
	// 				message: {
	// 					user: notifSelected[0].user,
	// 					target: user,
	// 					roomID: notifSelected[0].roomID
	// 				}
	// 			}))
	// 		} else if (creator.mode === 'TournamentInvitation') {
	// 			notifSocket.send(JSON.stringify({
	// 				type: 'deny-tournament-invitation',
	// 				message: {
	// 					user: user,
	// 					sender: creator.user,
	// 					tournament_id: creator.tournament_id
	// 				}
	// 			}))
	// 		}
	// 	}
	// }

	// const notifyError = (message) => toast.error(message, {
	// 	position: 'top-center',
	// 	duration: 6000,
	// });

	// const acceptInvitation = async (sender) => {
	// 	let notifSelected = allGameNotifs.filter((user) => user.user === sender.user)
	// 	setAllGameNotifs(allGameNotifs.filter((user) => user.user !== sender.user))
	// 	console.log("SENDER : ", sender)
	// 	if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
	// 		if (sender.mode === '1vs1') {
	// 			console.log("YES!")
	// 			notifSocket.send(JSON.stringify({
	// 				type: 'acceptInvitation',
	// 				message: {
	// 					user: notifSelected[0].user,
	// 					target: user,
	// 					roomID: notifSelected[0].roomID
	// 				}
	// 			}))
	// 		} else if (sender.mode === 'TournamentInvitation') {
	// 			console.log("YES1!")
	// 			const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/api/get-tournament-size`, {
	// 				method: "POST",
	// 				headers: {
	// 					'Content-Type': 'application/json',
	// 				},
	// 				body: JSON.stringify({
	// 					tournament_id: sender.tournament_id
	// 				})
	// 			});
	// 			if (response.ok) {
	// 				const data = await response.json();
	// 				if (data.Case === 'Tournament_started' || data.Case === 'Tournament_is_full'){
	// 					if (data.Case === 'Tournament_started')
	// 						notifyError("Tournament is already started")
	// 					else
	// 						notifyError("Tournament is full")
	// 						notifSocket.send(JSON.stringify({
	// 						type: 'deny-tournament-invitation',
	// 						message: {
	// 							user: user,
	// 							sender: sender.user,
	// 							tournament_id: sender.tournament_id
	// 						}
	// 					}))
	// 				} else {
	// 					await notifSocket.send(
	// 						JSON.stringify({
	// 							type: 'accept-tournament-invitation',
	// 							message: {
	// 								user: user,
	// 								tournament_id: sender.tournament_id
	// 							}
	// 						})
	// 					);
	// 				}
	// 			} else {
	// 				console.error('Failed to fetch data');
	// 			}
	// 		}
	// 	}
	// }

	const handleSelect = (type) => {
		if (type === 'play_solo') {
			setSoloModeSelected(true)
			setcreateTournamentModeSelected(false)
			setJoinTournamentModeSelected(false)
			setEnableButton(true)
		} else if (type === 'create_tournament') {
			setSoloModeSelected(false)
			setcreateTournamentModeSelected(true)
			setJoinTournamentModeSelected(false)
			setEnableButton(true)
		} else if (type === 'join_tournament') {
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
		<>
			<button className={styles['instructions-div-button-modes']} onClick={() => { setHideInst(false) }}><BsQuestionSquareFill className={styles['question-mark-icon']} size={25} /></button>
			{
				!hideInst && 
				<Instructions hideInst={hideInst} setHideInst={setHideInst}/>
			}
			<div className={styles['game-modes-page']}>
				<Toaster />
				<GameNotifications />
				<div className={styles['game-modes-div']}>
					{/* <div className='cancel-game-invite-request'>
					{(allGameNotifs.length) ? (
						<div className='game-invitations'>
							{allGameNotifs.map((user, key) => {
								return ((
									<div key={key} className='game-invitation'>
										<img src={user.image} alt="profile-pic" />
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
											<div onClick={() => acceptInvitation(user)}>
												<img src={Icons.copied} alt="accept-icon" />
											</div>
											<div onClick={() => refuseInvitation(user)}>
												<img src={Icons.cancel} alt="refuse-icon" />
											</div>
										</div>
									</div>
								))
							})}
						</div>
					) : ''
					}
				</div> */}
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
					<div className={`${styles['game-modes-page-button']} ${(soloModeSelected || createTournamentModeSelected || joinTournamentModeSelected) ? styles['game-modes-page-button-selected'] : ''}`}>
						<button onClick={handleButtonClick} disabled={!enableButton}>Next</button>
					</div>
				</div>
			</div>
		</>
	)
}

export default Modes
