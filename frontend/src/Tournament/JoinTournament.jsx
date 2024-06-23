import { useContext, useEffect, useState } from 'react';
import styles from '../assets/Tournament/jointournament.module.css'
import SearchIcon from '@mui/icons-material/Search';
import AuthContext from '../navbar-sidebar/Authcontext'
import { useNavigate, useLocation } from "react-router-dom";

function JoinTournament() {
	const navigate = useNavigate()
	const [data, setData] = useState(0)
	const { user, socket } = useContext(AuthContext)
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

	useEffect(() => {
		const getTournamentSuggestions = async () => {
			const response = await fetch(`http://localhost:8000/api/get-tournament-suggestions`, {
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
				if (type == 'accepted_invitation') {
					navigate("/mainpage/game/createtournament");
				} else if (type === 'tournament_created_by_user') {
					let newTournament = data.message.tournament_info
					console.log("IN CREATEE :", newTournament)
					setTournamentSuggestions((prevTournamentSuggestions) => [...prevTournamentSuggestions, newTournament]);
				}
				else if (type === 'tournament_destroyed_by_user') {
					let tournament_id = data.message.tournament_id
					console.log("DESTROY : ", tournament_id)
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
				}
				else if (type === 'user_join_tournament') {
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
	}, [socket])

	useEffect(() => {
		const get_members = async () => {
			const response = await fetch(`http://localhost:8000/api/get-tournament-data`, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: data
				})
			});
			if (response.ok) {
				const response_data = await response.json();
				console.log("data :", response_data)
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
				console.error('Failed to fetch data');
			}
		}
		if (user)
			get_members()
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
					<h3>Id</h3>
					<h3>Owner</h3>
					<h3>Players</h3>
					<h3></h3>
				</div>
				<div className={styles['table-line']}>
				</div>
				{
					tournamentSuggestions.length > 0 && tournamentSuggestions.map((tournament) => {
						return (
							<div className={styles['table-th']} key={tournament.tournament_id}>
								<h4>{tournament.tournament_id}</h4>
								<h4>{tournament.owner}</h4>
								<h4>{tournament.size}/16</h4>
								<div className={styles['join']}>
									<button className={styles['join-button']}>Join</button>
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