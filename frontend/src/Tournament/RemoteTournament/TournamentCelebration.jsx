import styles from '../../assets/Tournament/tournamentbracket.module.css'
import versus from '../../assets/navbar-sidebar/Versus.svg';
import SvgComponent from './SvgComponent';
import SvgVerticalComponent from './SvgVerticalComponent'
import { useNavigate } from "react-router-dom";
import AuthContext from '../../navbar-sidebar/Authcontext';
import { useEffect, useState, useContext } from 'react';
import Confetti from 'react-confetti-boom';

function TournamentCelebration() {
	const navigate = useNavigate()
	const [roundQuarterFinalMembers, setroundQuarterFinalMembers] = useState([])
	const [roundSemiFinalMembers, setroundSemiFinalMembers] = useState([])
	const [finalMembers, setFinalMembers] = useState([])
	const [winnerMember, setwinnerMember] = useState([])
	const { user, socket, notifSocket } = useContext(AuthContext)

	const findMemberByPosition = (roundmembers, name) => {
		const member = roundmembers.find(member => member.name === name);
		if (member)
			return member
		else
			return null
	};

	useEffect(() => {
		const set_is_inside = async () => {
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
		}
		const gameMembersRounds = async () => { //NOTE: this function need to modify (send tournament Id instead of user)			
			const response = await fetch('http://localhost:8000/api/get-game-members-round', {
				method: 'POST',
				headers: {
					'Content-type': 'application/json'
				},
				body: JSON.stringify({
					user: user
				})
			});
			if (response.ok) {
				const data = await response.json();
				console.log("----mohamed data : ", data)
				setroundQuarterFinalMembers(data.roundquarter)
				setroundSemiFinalMembers(data.roundsemi)
				setFinalMembers(data.roundfinal)
				setwinnerMember(data.winner)
			} else {
				console.error('Failed to fetch data');
			}
		}

		if (user) {
			set_is_inside()
		}
	}, [user])

	// useEffect(() => {
	// 	if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
	// 		notifSocket.onmessage = (event) => {
	// 			let data = JSON.parse(event.data)
	// 			let type = data.type
	// 			let message = data.message
	// 			console.log("DATA RECEIVED:", data)
	// 			if (type == 'you_and_your_user') {
	// 				console.log("YOU data : ", data)
	// 					setUserOneToDisplay(message.user1)
	// 					setUserTwoToDisplay(message.user2)
	// 					setCreatedAt(new Date(message.time))
	// 			}
	// 		}
	// 	}
	// }, [notifSocket])


	return (
		<div className={styles['tournamentbracketpage']}>
			<div className={styles['normalSvg']}>
				<SvgComponent roundquartermembers={roundQuarterFinalMembers} roundsemifinalmembers={roundSemiFinalMembers} roundfinalMembers={finalMembers} roundwinner={winnerMember} />
			</div>
			<div className={styles['verticalSvg']}>
				<SvgVerticalComponent roundquartermembers={roundQuarterFinalMembers} roundsemifinalmembers={roundSemiFinalMembers} roundfinalmembers={finalMembers} roundwinner={winnerMember} />
			</div>
		</div>
	);
}

export default TournamentCelebration