
import styles from '../assets/Tournament/tournamentbracket.module.css'
import SvgComponent from './SvgComponent';
import SvgVerticalComponent from './SvgVerticalComponent'
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from '../navbar-sidebar/Authcontext';
import { useEffect, useState, useContext } from 'react';

function TournamentBracket() {
	const navigate = useNavigate()
	const [tournamentMembers, setTournamentMembers] = useState([])
	const [isTournamentOwner, setIsTournamentOwner] = useState(false)
	const [membersImages, setMemberImages] = useState([])
	const { user } = useContext(AuthContext)
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
		if (user) {
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
			check_is_join()
		}
	}, [user])
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