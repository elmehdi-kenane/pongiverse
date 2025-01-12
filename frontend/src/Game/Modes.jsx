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
import { IoSettingsOutline } from "react-icons/io5";

const Modes = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const [soloModeSelected, setSoloModeSelected] = useState(false)
	const [createTournamentModeSelected, setcreateTournamentModeSelected] = useState(false)
	const [joinTournamentModeSelected, setJoinTournamentModeSelected] = useState(false)
	const [enableButton, setEnableButton] = useState(false)
	const [gameNotif, setGameNotif] = useState([])
	const [roomID, setRoomID] = useState(null)
	let { socket, user, setAllGameNotifs,
		allGameNotifs, notifsImgs, notifSocket,
		setSocket, socketRef } = useContext(AuthContext)

	useEffect(() => {
		const check_is_join = async () => {
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/is-joining-tournament`, {
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
				navigate("/signin")
			}
		}
		const check_is_started_and_not_finished = async () => {
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/is-started-and-not-finshed`, {
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
				navigate("/signin")
			}
		}
		if (user && socket)
			check_is_started_and_not_finished()
	}, [user, socket])

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
				if (type === 'tournament_created')
					navigate("createtournament")
				else if (type === 'hmed')
					socket.close()
			}
		}
	}, [socket])

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

	const navigateToBoard = () => {
		navigate('/mainpage/game/customization')
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
			<GameNotifications />
			<div className={styles['game-modes-page']}>
				<Toaster />
				<div className={styles['game-modes-div']}>
					<div className={styles['customize-game-options']}>
						<button onClick={navigateToBoard}><IoSettingsOutline color='#4D4EA6' size={20} />Customize Game</button>
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
					<div className={`${styles['game-modes-page-button']} ${(soloModeSelected || createTournamentModeSelected || joinTournamentModeSelected) ? styles['game-modes-page-button-selected'] : ''}`}>
						<button onClick={handleButtonClick} disabled={!enableButton}>Next</button>
					</div>
				</div>
			</div>
		</>
	)
}

export default Modes
