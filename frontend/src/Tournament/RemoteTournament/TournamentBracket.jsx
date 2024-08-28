import styles from '../../assets/Tournament/tournamentbracket.module.css'
import versus from '../../assets/navbar-sidebar/Versus.svg';
import SvgComponent from './SvgComponent';
import SvgVerticalComponent from './SvgVerticalComponent'
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from '../../navbar-sidebar/Authcontext';
import { useEffect, useState, useContext } from 'react';

function TournamentBracket() {
	const navigate = useNavigate()
	const location = useLocation()
	const [tournamentMembers, setTournamentMembers] = useState([])
	const [roundSixteenMembers, setRoundSixteenMembers] = useState([])
	const [roundQuarterFinalMembers, setroundQuarterFinalMembers] = useState([])
	const [roundSemiFinalMembers, setroundSemiFinalMembers] = useState([])
	const [winnerMember, setwinnerMember] = useState([])
	const [roundSixteenMembersImages, setRoundSixteenMembersImages] = useState([])
	const [roundQuarterFinalMembersImages, setroundQuarterFinalMembersImages] = useState([])
	const [roundSemiFinalMembersImages, setroundSemiFinalMembersImages] = useState([])
	const [winnerMemberImage, setwinnerMemberImage] = useState([])
	const [isTournamentOwner, setIsTournamentOwner] = useState(false)
	const [userOneToDisplay, setUserOneToDisplay] = useState('')
	const [userTwoToDisplay, setUserTwoToDisplay] = useState('')
	const [createdAt, setCreatedAt] = useState(null)
	const [timeDiff, setTimeDiff] = useState(null);
	const { user, socket, notifSocket } = useContext(AuthContext)

	const findMemberByPosition = (roundmembers, name) => {
		const index = roundmembers.findIndex(member => member.name === name);
		return index
	};

	useEffect(() => {
		const set_is_inside = async () => {
			console.log("----SET IS INSIDE")
			console.log("USER IS INSIDE AGAIN +++++++++======+++")
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
					gameMembersRounds()
				else
					navigate("../game")
			} else {
				console.error('Failed to fetch data');
			}
		}
		const fetchImages = async (members, setElements) => {
			const promises = members.map(async (user) => {
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
			console.log("imageeeesssss", images)
			setElements(images)
		}
		const gameMembersRounds = async () => {
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
				setRoundSixteenMembers(data.roundsixteen)
				setroundQuarterFinalMembers(data.roundquarter)
				setroundSemiFinalMembers(data.roundsemi)
				setwinnerMember(data.winner)
				if (data.roundsixteen.length > 0)
					fetchImages(data.roundsixteen, setRoundSixteenMembersImages)
				if (data.roundquarter.length > 0)
					fetchImages(data.roundquarter, setroundQuarterFinalMembersImages)
				if (data.roundsemi.length > 0)
					fetchImages(data.roundsemi, setroundSemiFinalMembersImages)
			} else {
				console.error('Failed to fetch data');
			}
		}

		const get_oponent = async () => {
			const response = await fetch('http://localhost:8000/api/get-opponent', {
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

	// useEffect(() => {
	// 	if (socket && socket.readyState === WebSocket.OPEN) {
	// 		socket.onmessage = (event) => {
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
	// }, [socket])

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
	}, [socket])

	useEffect(() => {
		if (createdAt) {
			const interval = setInterval(() => {
				const now = new Date();
				const diffInSeconds = Math.floor((now - createdAt) / 1000);
				if (diffInSeconds < 30) {
					setTimeDiff(30 - diffInSeconds);
				} else {
					setTimeDiff(null);
					navigate("/mainpage/chat");
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
						<img src={roundSixteenMembersImages[findMemberByPosition(roundSixteenMembers, userOneToDisplay)]} alt="" className={styles['display-components-div-players-data-image']} />
						<img src={versus} className={styles['display-components-div-players-data-svg']} alt="" />
						<img src={roundSixteenMembersImages[findMemberByPosition(roundSixteenMembers, userTwoToDisplay)]} alt="" className={styles['display-components-div-players-data-image']} />
					</div>
					<p className={styles['display-components-div-text']}>The game will start in {timeDiff}</p>
				</div>
			}
			<div className={styles['normalSvg']}>
				{/* <img src={<SvgComponent images={membersImages} />} alt="" /> */}
				<SvgComponent roundsixteenimages={roundSixteenMembersImages} roundsixteenmembers={roundSixteenMembers} roundquarterimages={roundQuarterFinalMembersImages} roundquartermembers={roundQuarterFinalMembers} />

			</div>
			<div className={styles['verticalSvg']}>
				{/* <img src={<SvgVerticalComponent images={membersImages} />} alt="" /> */}
				<SvgVerticalComponent roundsixteenimages={roundSixteenMembersImages} roundsixteenmembers={roundSixteenMembers} roundquarterimages={roundQuarterFinalMembersImages} roundquartermembers={roundQuarterFinalMembers} />
			</div>
		</div>
	);
}

export default TournamentBracket