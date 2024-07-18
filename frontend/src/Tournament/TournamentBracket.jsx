
import styles from '../assets/Tournament/tournamentbracket.module.css'
import SvgComponent from './SvgComponent';
import SvgVerticalComponent from './SvgVerticalComponent'
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from '../navbar-sidebar/Authcontext';
import { useEffect, useState, useContext } from 'react';

function TournamentBracket() {
	const navigate = useNavigate()
	const location = useLocation()
	const [tournamentMembers, setTournamentMembers] = useState([])
	const [roundSixteenMembers, setRoundSixteenMembers] = useState([])
	const [roundQuarterFinalMembers, setroundQuarterFinalMembers] = useState([])
	const [roundSemiFinalMembers, setroundSemiFinalMembers] = useState([])
	const [winnerMember, setwinnerMember] = useState([])
	const [isTournamentOwner, setIsTournamentOwner] = useState(false)
	const [membersImages, setMemberImages] = useState([])
	const { user, socket } = useContext(AuthContext)

	useEffect(() => {
		const get_members = async () => {
			const response = await fetch(`http://localhost:8000/api/started-tournament-members`, {
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
				const allMembers = data.allMembers
				if (data.is_owner === 'yes')
					setIsTournamentOwner(true)
				if (allMembers.length < 1)
					navigate("../game/createTournament")
				console.log(data)
				setTournamentMembers(allMembers)
				const fetchImages = async () => {
					const promises = allMembers.map(async (user) => {
						const response = await fetch(`http://localhost:8000/api/getImage`, {
							method: "POST",
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								image: user.image
							})
						});
						const blob = await response.blob();
						return URL.createObjectURL(blob);
					});
					const images = await Promise.all(promises);
					setMemberImages(images)
				};
				fetchImages()
			} else {
				console.error('Failed to fetch data');
			}
		}
		const set_is_inside = async () => {
			console.log("----SET IS INSIDE")
			const response = await fetch(`http://localhost:8000/api/set-is-inside`, {
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
					get_members()
				else
					navigate("../game")
			} else {
				console.error('Failed to fetch data');
			}
		}
		const gameMembersRounds = async () =>{
			console.log("----GET MEMBERS------")
			const response = await fetch('http//localhost:8000/api/get-game-members-round', {
				method : 'POST',
				headers : {
					'Content-type' : 'application/json'
				},
				body: JSON.stringify({
					user: user
				})
			});
			if (response.ok) {
				const data = await response.json();
				console.log("---------USERSS MEMBERS : ", data)
			} else {
				console.error('Failed to fetch data');
			}
		}
		if (user) {
			check_is_join()
			set_is_inside()
			gameMembersRounds()
		}
	}, [user])

	useEffect(() =>{
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				let message = data.message
				console.log("DATA rida RECEIVED:", data)
				// if (type == 'user_eliminated'){
				// 	navigate("../game")
				// }
			}
		}
	},[socket])

	return (
		<div className={styles['tournamentbracketpage']}>
			<div className={styles['normalSvg']}>
				{/* <img src={<SvgComponent images={membersImages} />} alt="" /> */}
				<SvgComponent images={membersImages} />
			</div>
			<div className={styles['verticalSvg']}>
				{/* <img src={<SvgVerticalComponent images={membersImages} />} alt="" /> */}
				<SvgVerticalComponent images={membersImages} />
			</div>
		</div>
	);
}

export default TournamentBracket