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
		allGameNotifs, notifsImgs } = useContext(AuthContext)

	useEffect(() => {
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
		const check_is_started_and_not_finished = async () => {
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

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				let message = data.message
				if (type === 'goToGamingPage') {
					console.log("navigating now")
					navigate(`/mainpage/game/solo/1vs1/friends`)
				} else if (type === 'receiveFriendGame') {
					console.log("RECEIVED A GAME REQUEST")
					setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message])
					setRoomID(message.roomID)
				} else if (type === 'tournament_created') {
					navigate("createtournament")
				}
				else if (type === 'connected_again') {
					console.log("YOUR FRIEND IS LOGED AGAIN")
				}
				else if (type === 'hmed') {
					console.log("hmed received")
				} else if (type === 'invited_to_tournament') {
					setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message])
				}
				else if (type == 'accepted_invitation') {
					navigate("/mainpage/game/createtournament");
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
		let notifSelected = allGameNotifs.filter((user) => user.user === creator.user)
		setAllGameNotifs(allGameNotifs.filter((user) => user.user !== creator.user))
		if (socket && socket.readyState === WebSocket.OPEN) {
			if (creator.mode === '1vs1'){
				socket.send(JSON.stringify({
					type: 'refuseInvitation',
					message: {
						user: notifSelected[0].user,
						target: user,
						roomID: notifSelected[0].roomID
					}
				}))
			} else if (creator.mode === 'TournamentInvitation'){
				socket.send(JSON.stringify({
					type: 'deny-tournament-invitation',
					message: {
						user: user,
						sender: creator.user,
						tournament_id: creator.tournament_id
					}
				}))
			}
		}
	}

	const acceptInvitation = async (sender) => {
		let notifSelected = allGameNotifs.filter((user) => user.user === sender.user)
		setAllGameNotifs(allGameNotifs.filter((user) => user.user !== sender.user))
		console.log("SENDER : ", sender)
		if (socket && socket.readyState === WebSocket.OPEN) {
			if (sender.mode === '1vs1'){
				console.log("YES!")
				await socket.send(JSON.strlingify({
					type: 'acceptInvitation',
					message: {
						user: notifSelected[0].user,
						target: user,
						roomID: notifSelected[0].roomID
					}
				}))
			}else if (sender.mode === 'TournamentInvitation'){
				console.log("YES1!")
				const response = await fetch(`http://localhost:8000/api/get-tournament-size`, {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						tournament_id: sender.tournament_id
					})
				});
				if (response.ok) {
					const data = await response.json();
					if (data.Case === 'Tournament_started') {
						Swal.fire({
							icon: "warning",
							position: "top-end",
							title: "Tournament is already started",
							showConfirmButton: false,
							customClass: {
								popup: styles['error-container'],
								title: styles['title-swal'],
							},
							timer: 1500
						});
					} else if (data.Case === 'Tournament_is_full') {
						Swal.fire({
							icon: "warning",
							position: "top-end",
							title: "Tournament is full",
							showConfirmButton: false,
							customClass: {
								popup: styles['error-container'],
								title: styles['title-swal'],
							},
							timer: 1500
						});
					} else {
						await socket.send(
							JSON.stringify({
								type: 'accept-tournament-invitation',
								message: {
									user: user,
									tournament_id: sender.tournament_id
								}
							})
						);
					}
				} else {
					console.error('Failed to fetch data');
				}
			}
		}
	}

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
	const tournamentHandleAccept = async (tournament_id) => {
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
			if (data.Case === 'Tournament_started') {
				Swal.fire({
					icon: "warning",
					position: "top-end",
					title: "Tournament is already started",
					showConfirmButton: false,
					customClass: {
						popup: styles['error-container'],
						title: styles['title-swal'],
					},
					timer: 1500
				});
			} else if (data.Case === 'Tournament_is_full') {
				Swal.fire({
					icon: "warning",
					position: "top-end",
					title: "Tournament is full",
					showConfirmButton: false,
					customClass: {
						popup: styles['error-container'],
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

	// Tournamet hahndle deny
	const TournamentHandleDeny = (sender, tournament_id) => {
		// setTournamentInviteNotifications((prevTournamentInviteNotifications) => prevTournamentInviteNotifications.filter((notif) => notif.sender !== sender));
		//delete from notifffsss
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({
				type: 'deny-tournament-invitation',
				message: {
					user: user,
					sender: sender,
					tournament_id: tournament_id
				}
			}))
		}

	}


	return (
		<div className={styles['game-modes-page']}>
			<div className={styles['game-modes-div']}>
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
			</div>
			<div className={`${styles['game-modes-page-button']} ${(soloModeSelected || createTournamentModeSelected || joinTournamentModeSelected) ? styles['game-modes-page-button-selected'] : ''}`}>
				<button onClick={handleButtonClick} disabled={!enableButton}>Next</button>
			</div>
		</div>
	)
}

export default Modes

// <button onClick={goToSoloPage}>Play solo</button>
// 			<button onClick={GoToTournamentPage}>Create Tournament</button>
// 			<button onClick={JoinTournament}>Join Tournament</button>