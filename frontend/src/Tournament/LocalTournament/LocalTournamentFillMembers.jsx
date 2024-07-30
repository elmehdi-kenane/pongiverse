import { useState } from 'react';
import styles from '../../assets/Tournament/localtournamentfillmembers.module.css'
import avatar from '../avatar.svg'

function LocalTournamentFillMembers() {
	const [players, setPlayers] = useState(Array(16).fill('Player'));
	const [open, setOpen] = useState(false)
	const [index, setIndex] = useState(-1)
	const [validUsername, setValidUsername] = useState(true)
	const [username, setUsername] = useState('')
	const regex = /^(?!\d)[a-zA-Z0-9_]{4,8}$/;

	const Component = () => {
		return (
			<div className={styles['change-player-username']}>
				<p className={styles['change-player-username-title']}>Change the username</p>
				<input type="text" value={username} autoFocus onChange={(e) => { setUsername(e.target.value) }} className={styles['change-player-username-input']} />
				{!validUsername && <span className={styles["spans"]}>Username Invalid or already used</span>}
				<div className={styles['change-player-buttons']}>
					<button className={styles['change-player-button']} onClick={modify_open}>Cancel</button>
					<button className={styles['change-player-button']} onClick={handleConfirm}>Confirm</button>
				</div>
			</div>
		);
	}

	const handleConfirm = () => {
		console.log("usernane", username, " indexx :", index)
		const foundPlayer = players.find(player => player === username);
		if (!regex.test(username))
			setValidUsername(false)
		else if (foundPlayer)
			setValidUsername(false)
		else{
			setValidUsername(true)
			setPlayers(prevPlayers => {
				const newPlayers = [...prevPlayers];
				newPlayers[index] = username;
				return newPlayers;
			});
			setUsername('')
			setOpen(false);
		}
	}

	const modify_open = () => {
		setOpen(!open);
		setValidUsername(true)
	}
	const div_click = (index) => {
		console.log("Indexxx : ", index)
		setIndex(index)
		modify_open()
	}

	return (
		<div className={styles["tournament-page"]}>
			<div className={styles["tournament-page-content"]}>
				<div className={styles["title-and-destroy"]}>
					<h1 className={styles["tournament-title"]}>Tournament Creation</h1>
					<button className={styles["destroy-button"]}>Start</button>
				</div>
				<div className={styles["tournament-members"]}>
					{
						open && <Component />
					}
					{
						players.map((player, index) => (
						<div key={index} className={open ? styles["player-opened"] : styles["player"]} onClick={!open ? () => div_click(index) : null}>
							<div className={styles["user-avatar"]}>
								<img className={styles["avatar"]} src={avatar} alt="" />
							</div>
							<div className={styles["user-info"]}>
								<h4 className={styles["user-info-name"]}>{players[index]}</h4>
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