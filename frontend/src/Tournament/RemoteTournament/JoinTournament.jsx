import { useContext, useEffect, useState } from 'react';
import styles from '../../assets/Tournament/jointournament.module.css'
import SearchIcon from '@mui/icons-material/Search';
import AuthContext from '../../navbar-sidebar/Authcontext'
import { useNavigate, useLocation } from "react-router-dom";

function JoinTournament() {
	const navigate = useNavigate()
	const [data, setData] = useState('')
	const { user, socket, notifSocket, socketRef, setSocket } = useContext(AuthContext)
	const [tournamentSuggestions, setTournamentSuggestions] = useState([])
	const [TournamentInfo, setTournamentInfo] = useState({
		tournament_id: '',
		size: 0
	})
	const handleInputChange = (e) => {
		e.preventDefault();
		const value = e.target.value.replace(/\D/g, '');
		setData(value);
	};
	const handleAccept = async () => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			try {
				await socket.send(
					JSON.stringify({
						type: 'accept-tournament-invitation',
						message: {
							user: user,
							tournament_id: TournamentInfo.tournament_id
						}
					})
				);
			} catch (error) {
				console.error("Error sending message:", error);
			}
		}
	};

	const handleJoin = async (tournament_id) => {
		// await check_is_in_game()
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
					navigate("../game/createtournament")
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
					navigate('../game/tournamentbracket');
				else
					check_is_join()
			} else {
				console.error('Failed to fetch data');
			}
		}
		if (user)
			check_is_started_and_not_finished()
	}, [user])

	useEffect(() => {
		const getTournamentSuggestions = async () => {
			const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/api/get-tournament-suggestions`, {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
				},
			});
			if (response.ok) {
				const response_data = await response.json();
				setTournamentSuggestions(response_data.tournaments)
			} else {
				console.error('Failed to fetch data');
			}
		}
		if (user)
			getTournamentSuggestions()
	}, [user])

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				 if (type === 'tournament_created_by_user') {
					let newTournament = data.message.tournament_info
					setTournamentSuggestions((prevTournamentSuggestions) => [...prevTournamentSuggestions, newTournament]);
				}
				else if (type === 'tournament_destroyed_by_user' || type === 'tournament_started_by_user') {
					let tournament_id = data.message.tournament_id
					setTournamentSuggestions((prevTournamentSuggestions) => prevTournamentSuggestions.filter((member) => member.tournament_id !== tournament_id));
				}
				else if (type === 'user_leave_tournament' || type === 'user_kicked_from_tournament') {
					let tournament_id = data.message.tournament_id
					setTournamentSuggestions(prevSuggestions =>
						prevSuggestions.map(tournament =>
							tournament.tournament_id == tournament_id
								? { ...tournament, size: tournament.size - 1 }
								: tournament
						)
					);
				} else if (type === 'hmed') {
					console.log("WWWWWWWWWAAAAA HMEEEEEEEED")
					socket.close()
				} 
				// else if (type === 'user_join_tournament') {
				// 	let tournament_id = data.message.tournament_id
				// 	setTournamentSuggestions(prevSuggestions =>
				// 		prevSuggestions.map(tournament =>
				// 			tournament.tournament_id == tournament_id
				// 				? { ...tournament, size: tournament.size + 1 }
				// 				: tournament
				// 		)
				// 	);
				// }
			}
		}
	}, [socket])

	useEffect(() =>{
		if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
			notifSocket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				if (type == 'accepted_invitation') {
					const socketRefer = socketRef.current
					if (socketRefer.readyState !== WebSocket.OPEN) {
						console.log("SOCKET IS CLOSED, SHOULD OPENED")
						const newSocket = new WebSocket(`ws://${import.meta.env.VITE_IPADDRESS}:8000/ws/socket-server`)
						newSocket.onopen = () => {
							setSocket(newSocket)
							navigate("/mainpage/game/createtournament");
						}
					} else {
						navigate("/mainpage/game/createtournament");
					}
				} else if (type === 'user_join_tournament') {
					let tournament_id = data.message.tournament_id
					setTournamentSuggestions(prevSuggestions =>
						prevSuggestions.map(tournament =>
							tournament.tournament_id == tournament_id
								? { ...tournament, size: tournament.size + 1 }
								: tournament
						)
					);
				}
			}
		}
	},[notifSocket])

	const check_is_in_game = async () => {
		try {
			let response = await fetch(
				`http://${import.meta.env.VITE_IPADDRESS}:8000/api/check_is_in_game`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						user: user,
					}),
				}
			);
			let data = await response.json();
			if (!data.error) {
				(data.mode === 'tournament') ? navigate('../game/createtournament') : (data.mode === '1vs1') ? navigate('../game/solo/1vs1/random') : navigate('../game/solo/2vs2/random')
			}
			
		} catch (error) {
			console.error(
				"There has been a problem with your fetch operation:",
				error
			);
		}
	}

	useEffect(() => {
		const get_members = async () => {
			const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/api/get-tournament-data`, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					id: data
				})
			});
			if (response.ok) {
				const response_data = await response.json();
				if (response_data.case === 'exist') {
					setTournamentInfo({
						tournament_id: response_data.id,
						size: response_data.size
					});
				}
				else {
					setTournamentInfo({
						tournament_id: '',
						size: 0
					})
				}
			} else {
				navigate('/signin')
			}
		}
		if (user) {
			get_members()
		}
	}, [data])

	return (
		<div className={styles['joinTournament']}>
			<div className={styles['search']}>
				<div className={styles['input-and-icon']}>
					<SearchIcon className={styles['search-icon']} />
					<input className={styles['search-input']} type="text" name='data' value={data} onChange={handleInputChange} placeholder='Search' />
				</div>
				<div>
					{
						TournamentInfo.size > 0 && TournamentInfo.size < 16 &&
						<button className={styles['join-button-search']} onClick={handleAccept}>Join</button>
					}
				</div>
			</div>
			<div className={styles['tournament-suggestions']}>
				<div className={styles['table-th']}>
					<h3 className={styles['h3-titles']}>Id</h3>
					<h3 className={styles['h3-titles']}>Owner</h3>
					<h3 className={styles['h3-titles']}>Players</h3>
					<h3 className={styles['h3-titles']}></h3>
				</div>
				<div className={styles['table-line']}>
				</div>
				{
					tournamentSuggestions.length > 0 && tournamentSuggestions.map((tournament) => {
						return (
							<div className={styles['table-th']} key={tournament.tournament_id}>
								<h4 className={styles['h4-titles']}>{tournament.tournament_id}</h4>
								<h4 className={styles['h4-titles']}>{tournament.owner}</h4>
								<h4 className={styles['h4-titles']}>{tournament.size}/8</h4>
								<div className={styles['join']}>
									<button className={styles['join-button']} onClick={() => handleJoin(tournament.tournament_id)}>Join</button>
								</div>
							</div>
						)
					})
				}
			</div>
		</div>
	);
}

export default JoinTournament