import { useEffect, useState, useContext } from 'react';
import styles from '../../assets/Tournament/localtournamentfillmembers.module.css'
import avatar from '../avatar.svg'
import toast, { Toaster } from 'react-hot-toast';
import AuthContext from '../../navbar-sidebar/Authcontext'
import { useNavigate } from 'react-router-dom';
import backgroundImage from './bg.jpg'
import { Avatar } from '@mui/material';


function LocalTournamentFillMembers() {
	const [players, setPlayers] = useState([]);
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)
	const [index, setIndex] = useState(-1)
	const [username, setUsername] = useState('')
	const regex = /^(?!\d)[a-zA-Z0-9_]{4,8}$/;
	const { user } = useContext(AuthContext)

	const handleCancel = () => {
		setOpen(false);
		setIndex(-1);
	}

	const Component = () => {
		return (
			<div className={styles['change-player-username']}>
				<p className={styles['change-player-username-title']}>Change the username</p>
				<input type="text" value={username} autoFocus onChange={(e) => { setUsername(e.target.value) }} className={styles['change-player-username-input']} />
				<div className={styles['change-player-buttons']}>
					<button className={styles['change-player-button']} onClick={handleCancel}>Cancel</button>
					<button className={styles['change-player-button']} onClick={handleConfirm}>Confirm</button>
				</div>
			</div>
		);
	}

	useEffect(() => {
		if (user)
			console.log("USER EXIST")
	}, [user])

	useEffect(() => {
		if (user) {
			const item = localStorage.getItem('QuarterFinalPlayers');
			if (item !== null) {
				setPlayers(JSON.parse(item));
			}
			else {
				console.log("ITEM DOES NOT EXIST")
				const QuarterFinalPlayers = Array.from({ length: 8 }, (_, index) => `Player_${index + 1}`);
				const SemiFinalPlayers = Array.from({ length: 4 }, () => null);
				const FinalPlayers = Array.from({ length: 2 }, () => null);
				const Winner = Array.from({ length: 1 }, () => null);
				localStorage.setItem('QuarterFinalPlayers', JSON.stringify(QuarterFinalPlayers));
				localStorage.setItem('SemiFinalPlayers', JSON.stringify(SemiFinalPlayers));
				localStorage.setItem('FinalPlayers', JSON.stringify(FinalPlayers));
				localStorage.setItem('Winner', null);
				setPlayers(QuarterFinalPlayers)
				localStorage.setItem('is_started', 'false');
				localStorage.setItem('matches_played', 0);
				localStorage.setItem('is_game_finished', 'false');
			}
			const is_started = localStorage.getItem('is_started');
			if (is_started !== null && is_started === 'true')
				navigate("../game/localtournamentbracket")
		}
	}, [user])

	useEffect(() => {
		if (players.length > 0) {
			console.log("PLAYER YSEE")
			localStorage.setItem('QuarterFinalPlayers', JSON.stringify(players));
		}
	}, [players])

	const handleConfirm = () => {
		console.log("usernane", username, " indexx :", index)
		const foundPlayer = players.find(player => player === username);
		if (!regex.test(username)) {
			toast.error("Invalid or used username", {
				duration: 700,
			});
		}
		else if (foundPlayer) {
			toast.error("Invalid or used username", {
				duration: 700,
			});
		}
		else {
			setPlayers(prevPlayers => {
				const newPlayers = [...prevPlayers];
				newPlayers[index] = username;
				return newPlayers;
			});
			setUsername('')
			setOpen(false);
		}
	}

	const handleStart = () => {
		localStorage.setItem('is_started', 'true');
		navigate("../game/localtournamentbracket")
	}

	const modify_open = () => {
		setOpen(!open);
	}
	const div_click = (index) => {
		console.log("Indexxx : ", index)
		setIndex(index)
		modify_open()
	}

	return (
		<div className={styles["tournament-page"]}>
			<Toaster />
			<div className={styles["tournament-page-content"]}>
				<div className={styles["title-and-destroy"]}>
					<h1 className={styles["tournament-title"]}>Tournament Creation</h1>
					<button className={styles["destroy-button"]} onClick={handleStart}>Start</button>
				</div>
				<div className={styles["tournament-members"]}>
					{
						open && <Component />
					}
					{
						players.map((player, ind) => (
							<div key={ind} className={`
							${open ? styles["player-opened"] : styles["player"]} 
							${ind === index ? styles["player-selected"] : ""} 
						  `} onClick={!open ? () => div_click(ind) : null} style={{
									backgroundImage: `url(${backgroundImage})`,
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}>
								<div className={styles["user-avatar"]} >
									<img className={styles["avatar"]} src={avatar} alt="" />
								</div>
								<div className={styles["line-and-user-info"]}>
									<div className={styles["user-info"]}>
										<h4 className={styles["user-info-name"]}>{players[ind]}</h4>
									</div>
								</div>
							</div>
						))
					}
				</div>
			</div>
		</div>
	);
}
export default LocalTournamentFillMembers