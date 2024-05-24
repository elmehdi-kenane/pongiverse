import React from 'react'
import { useNavigate } from 'react-router-dom'

const Modes = () => {
	const navigate = useNavigate()

	const goToSoloPage = () => {
		navigate("../game/solo")
	}

	const goToTournamentPage = async () => {
		try {
			let response = await fetch(`http://localhost:8000/api/create_tournament`, {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
				}
			});
			let data = await response.json();
			const tournamentId = data.tournament_id;
			navigate("createtournament", {state: tournamentId});
		} catch (error) {
			console.error('There has been a problem with your fetch operation:', error);
		}
	}

	return (
		<>
			<div>Modes</div>
			<button onClick={goToSoloPage}>Play solo match</button>
			<button onClick={goToTournamentPage}>Create Tournament</button>
		</>
	)
}

export default Modes