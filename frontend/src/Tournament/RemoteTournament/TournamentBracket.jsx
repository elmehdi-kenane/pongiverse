import styles from '../../assets/Tournament/tournamentbracket.module.css'
import versus from '../../assets/navbar-sidebar/Versus.svg';
import SvgComponent from './SvgComponent';
import SvgVerticalComponent from './SvgVerticalComponent'
import { useNavigate } from "react-router-dom";
import AuthContext from '../../navbar-sidebar/Authcontext';
import { useEffect, useState, useContext } from 'react';

function TournamentBracket() {
	const navigate = useNavigate()
	const [tournamentMembers, setTournamentMembers] = useState([])
	const [roundQuarterFinalMembers, setroundQuarterFinalMembers] = useState([])
	const [roundSemiFinalMembers, setroundSemiFinalMembers] = useState([])
	const [finalMembers, setFinalMembers] = useState([])
	const [winnerMember, setwinnerMember] = useState([])
	const [isTournamentOwner, setIsTournamentOwner] = useState(false)
	const [userOneToDisplay, setUserOneToDisplay] = useState('')
	const [userTwoToDisplay, setUserTwoToDisplay] = useState('')
	const [createdAt, setCreatedAt] = useState(null)
	const [timeDiff, setTimeDiff] = useState(null);
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
			const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/api/set-is-inside`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					user: user,
					is_inside: true
				})
			})
		}
		const check_is_join = async () => {
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
					gameMembersRounds()
				else
					navigate("../game")
			} else {
				console.error('Failed to fetch data');
			}
		}
		// const fetchImages = async (members, setElements) => {
		// 	const promises = members.map(async (user) => {
		// 		const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/api/getImage`, {
		// 			method: "POST",
		// 			headers: {
		// 				'Content-Type': 'application/json',
		// 			},
		// 			body: JSON.stringify({
		// 				image: user.image
		// 			})
		// 		});
		// 		const blob = await response.blob();
		// 		return URL.createObjectURL(blob);
		// 	});
		// 	const images = await Promise.all(promises);
		// 	console.log("imageeeesssss", images)
		// 	setElements(images)
		// }
		const gameMembersRounds = async () => {
			const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/api/get-game-members-round`, {
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

		const get_oponent = async () => {
			const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/api/get-opponent`, {
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
				console.log("DIIIB : ", data)
				if (data.Case === 'exist') {
					setUserOneToDisplay(data.user1)
					setUserTwoToDisplay(data.user2)
					setCreatedAt(new Date(data.time))
				}
			} else {
				console.error('Failed to fetch data');
			}
		}

		if (user) {
			check_is_join()
			set_is_inside()
			get_oponent()
		}
	}, [user])

	useEffect(() => {
		if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
			notifSocket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				let message = data.message
				console.log("DATA RECEIVED:", data)
				if (type == 'you_and_your_user') {
					console.log("YOU data : ", data)
						setUserOneToDisplay(message.user1)
						setUserTwoToDisplay(message.user2)
						setCreatedAt(new Date(message.time))
				}
			}
		}
	}, [notifSocket])


	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				let message = data.message
				if (type == 'new_user_win') {
					const newMember = {'id': message.id, 'name': message.name, 'level': message.level, 'image': message.image, 'position': message.position}
					if (message.round_reached === 'SEMIFINAL')
						setroundSemiFinalMembers((prevRoundSemiFinalMembers) => [...prevRoundSemiFinalMembers, newMember])
					if (message.round_reached === 'FINAL')
						setFinalMembers((prevFinalMembers) => [...prevFinalMembers, newMember])
					if (message.round_reached === 'WINNER')
						navigate("../game/tournamentcel", { state: { tournament_id: message.tournament_id } });

				}
			}
		}
	}, [socket])

	useEffect(() => {
		if (createdAt) {
			const interval = setInterval(() => {
				const now = new Date();
				const diffInSeconds = Math.floor((now - createdAt) / 1000);
				if (diffInSeconds < 3) {
					setTimeDiff(3 - diffInSeconds);
				} else {
					if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
						notifSocket.send(JSON.stringify({
							type: 'Delete-display-oponent',
							message : {
								user1: userOneToDisplay,
								user2: userTwoToDisplay
							}
						}))
					}
					navigate('../game/1vs1tournament')
				}
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [createdAt])

	return (
		<div className={styles['tournamentbracketpage']}>
			{
				userOneToDisplay && userTwoToDisplay && timeDiff &&
				<div className={styles['display-components-div']}>
					<div className={styles['display-components-div-players-data']}>
						<img src={findMemberByPosition(roundQuarterFinalMembers, userOneToDisplay).image} alt="" className={styles['display-components-div-players-data-image']} />
						<img src={versus} className={styles['display-components-div-players-data-svg']} alt="" />
						<img src={findMemberByPosition(roundQuarterFinalMembers, userTwoToDisplay).image} alt="" className={styles['display-components-div-players-data-image']} />
					</div>
					<p className={styles['display-components-div-text']}>The game will start in {timeDiff}</p>
				</div>
			}
			{/* <div className={styles['normalSvg']}>
				<SvgComponent roundquartermembers={roundQuarterFinalMembers} roundsemifinalmembers={roundSemiFinalMembers} roundfinalMembers={finalMembers} roundwinner={winnerMember}/>

			</div> */}
			<div className={styles['verticalSvg']}>
				<SvgVerticalComponent roundquartermembers={roundQuarterFinalMembers} roundsemifinalmembers={roundSemiFinalMembers} roundfinalmembers={finalMembers} roundwinner={winnerMember}/>
			</div>
		</div>
	);
}

export default TournamentBracket