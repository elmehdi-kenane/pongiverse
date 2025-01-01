import React, { useEffect, useContext, useState } from 'react'
import DashboardContext from "../DashboardWrapper";
import SvgComponent from '../../Tournament/RemoteTournament/SvgComponent';
import SvgVerticalComponent from '../../Tournament/RemoteTournament/SvgVerticalComponent';
import { useNavigate } from 'react-router-dom';

function DashRsltTourn() {
	const { tournId } = useContext(DashboardContext);
	const [finalMembers, setFinalMembers] = useState([])
	const [winnerMember, setwinnerMember] = useState([])
	const [roundSemiFinalMembers, setroundSemiFinalMembers] = useState([])
	const [roundQuarterFinalMembers, setroundQuarterFinalMembers] = useState([])
	const grind = window.innerWidth <= 768 ? "vertical" : "horizontal"
	const [layout, setLayout] = useState(grind)
	const navigate = useNavigate();

	window.addEventListener("resize", () => {
		if (window.innerWidth <= 768)
			setLayout("vertical")
		else
			setLayout("horizontal")
	});

	useEffect(() => {
		const gameMembersRounds = async () => {
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/get-tournament-members-rounds`, {
				method: 'POST',
				credentials: "include",
				headers: {
					'Content-type': 'application/json'
				},
				body: JSON.stringify({
					tournament_id: tournId
				})
			});
			if (response.ok) {
				const data = await response.json();
				setroundQuarterFinalMembers(data.roundquarter)
				setroundSemiFinalMembers(data.roundsemi)
				setFinalMembers(data.roundfinal)
				setwinnerMember(data.winner)
			} else
				navigate('/signin')
		}

		gameMembersRounds()
	}, [tournId])

	return (
		<>
			<h1> Tournament Match Results </h1>
			<div className='tournament__svg'>
				{layout === "horizontal" ?
					<SvgComponent roundquartermembers={roundQuarterFinalMembers} roundsemifinalmembers={roundSemiFinalMembers} roundfinalmembers={finalMembers} roundwinner={winnerMember} />
					:
					<SvgVerticalComponent roundquartermembers={roundQuarterFinalMembers} roundsemifinalmembers={roundSemiFinalMembers} roundfinalmembers={finalMembers} roundwinner={winnerMember} />
				}
			</div>
		</>
	)
}

export default DashRsltTourn
