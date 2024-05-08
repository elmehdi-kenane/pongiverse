import React from 'react'
import { useNavigate } from 'react-router-dom'

const Modes = () => {
	const navigate = useNavigate()

	const goToSoloPage = () => {
		navigate("../game/solo")
	}

	const goToTournamentPage = () => {
		navigate("/createtournament")
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