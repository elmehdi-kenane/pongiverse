import styles from '../../assets/Tournament/tournamentbracket.module.css'
import versus from '../../assets/navbar-sidebar/Versus.svg';
import SvgComponent from './SvgComponent';
import SvgVerticalComponent from './SvgVerticalComponent'
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from '../../navbar-sidebar/Authcontext';
import { useEffect, useState, useContext } from 'react';
import Confetti from 'react-confetti-boom';

function TournamentCelebration() {
	const navigate = useNavigate()
	const location = useLocation()
	const tournamentId = location.state?.tournament_id;
	useEffect(() => {
		if (!tournamentId) {
			navigate('../game');
		}
	}, [tournamentId, navigate]);
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
		const gameMembersRounds = async () => {
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/get-tournament-members-rounds`, {
				method: 'POST',
				credentials: "include",
				headers: {
					'Content-type': 'application/json'
				},
				body: JSON.stringify({
					tournament_id: tournamentId
				})
			});
			if (response.ok) {
				const data = await response.json();
				////console.log("----mohamed data : ", data)
				setroundQuarterFinalMembers(data.roundquarter)
				setroundSemiFinalMembers(data.roundsemi)
				setFinalMembers(data.roundfinal)
				setwinnerMember(data.winner)
			} else {
				navigate("/signin")
			}
		}

		const fetchData = async () => {
			if (user) {
				await gameMembersRounds();
			}
		};

		fetchData();
	}, [user, tournamentId])



	return (
		<div className={styles['tournamentbracketpage']}>
			{/* <div className={styles['confetti-div']}>
				<Confetti
					mode='fall'
					particleCount={1000}
					shapeSize={40}
					recycle={false}
					gravity={0.1}
					wind={0.1}
				/>
			</div> */}
			<div className={styles['normalSvg']}>
			<div className={styles['display-components-div-winner']}>
				<div className={styles['winner-message']}>🎉 Congratulations!!!! {winnerMember.name}🎉</div>
			</div>
				<SvgComponent roundquartermembers={roundQuarterFinalMembers} roundsemifinalmembers={roundSemiFinalMembers} roundfinalmembers={finalMembers} roundwinner={winnerMember} />
			</div>
			<div className={styles['verticalSvg']}>
			<div className={styles['display-components-div-winner']}>
				<div className={styles['winner-message']}>🎉 Congratulations!!!! {winnerMember.name}🎉</div>
			</div>
				<SvgVerticalComponent roundquartermembers={roundQuarterFinalMembers} roundsemifinalmembers={roundSemiFinalMembers} roundfinalmembers={finalMembers} roundwinner={winnerMember} />
			</div>
		</div>
	);
}

export default TournamentCelebration