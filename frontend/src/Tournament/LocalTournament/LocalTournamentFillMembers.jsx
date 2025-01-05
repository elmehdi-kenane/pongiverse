import { useEffect, useState, useContext } from 'react';
import styles from '../../assets/Tournament/localtournamentfillmembers.module.css'
import avatar from '../avatar.svg'
import toast, { Toaster } from 'react-hot-toast';
import AuthContext from '../../navbar-sidebar/Authcontext'
import { useNavigate } from 'react-router-dom';
import backgroundImage from './bg.jpg'
import { Avatar } from '@mui/material';
import { PiNumberSquareOneFill } from "react-icons/pi";
import { PiNumberSquareTwoFill } from "react-icons/pi";
import { PiNumberSquareThreeFill } from "react-icons/pi";
import { PiNumberSquareFourFill } from "react-icons/pi";
import { PiNumberSquareFiveFill } from "react-icons/pi";
import { PiNumberSquareSixFill } from "react-icons/pi";
import { PiNumberSquareSevenFill } from "react-icons/pi";
import { PiNumberSquareEightFill } from "react-icons/pi";


function LocalTournamentFillMembers() {
	const iconArray = [
		PiNumberSquareOneFill,
		PiNumberSquareTwoFill,
		PiNumberSquareThreeFill,
		PiNumberSquareFourFill,
		PiNumberSquareFiveFill,
		PiNumberSquareSixFill,
		PiNumberSquareSevenFill,
		PiNumberSquareEightFill
	];
	const [players, setPlayers] = useState([]);
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)
	const [index, setIndex] = useState(-1)
	const [username, setUsername] = useState('')
	const regex = /^(?!\d)[a-zA-Z0-9_]{4,8}$/;

	const handleCancel = () => {
		setOpen(false);
		setIndex(-1);
	}

	const handleCancelButton = () => {
		localStorage.clear();
		navigate("/")
	}

	async function generateHash(value) {
		const encoder = new TextEncoder();
		const data = encoder.encode(value);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
		return hashHex;
	}

	async function setSecureItem(key, value) {
		const valueString = JSON.stringify(value);
		const hash = await generateHash(valueString);
		localStorage.setItem(key, valueString);
		localStorage.setItem(`${key}_hash`, hash);
	}

	async function getSecureItem(key) {
		const valueString = localStorage.getItem(key);
		const storedHash = localStorage.getItem(`${key}_hash`);

		if (!valueString || !storedHash) return null;

		const currentHash = await generateHash(valueString);
		if (currentHash === storedHash) {
			return JSON.parse(valueString);
		} else {
			console.warn("Data integrity check failed for:", key);
			return null; // Or handle accordingly (e.g., reset or alert the user)
		}
	}


	const Component = () => {
		return (
			<div className={styles['change-player-username']}>
				<p className={styles['change-player-username-title']}>Change the username</p>
				<input type="text" value={username} autoFocus onChange={(e) => { setUsername(e.target.value) }} maxLength={10} className={styles['change-player-username-input']} />
				<div className={styles['change-player-buttons']}>
					<button className={styles['change-player-button']} onClick={handleCancel}>Cancel</button>
					<button className={styles['change-player-button']} onClick={handleConfirm}>Confirm</button>
				</div>
			</div>
		);
	}


	async function checkAndNavigate() {
		const isStarted = await getSecureItem("is_started");
		if (isStarted && isStarted === "true") {
			navigate("/localtournamentbracket");
		}
	}

	async function verifyDataIntegrity(keys) {
		for (const key of keys) {
			const storedValue = localStorage.getItem(key);
			const storedHash = localStorage.getItem(`${key}_hash`);

			if (!storedValue || !storedHash) {
				console.warn(`Data for ${key} is missing or incomplete`);
				return false;
			}

			const currentHash = await generateHash(storedValue);
			if (currentHash !== storedHash) {
				return false;
			}
		}

		return true;
	}


	useEffect(() => {
		const item = localStorage.getItem('QuarterFinalPlayers');
		if (item !== null) {
			setPlayers(JSON.parse(item));
		}
		else {
			////console.log("ITEM DOES NOT EXIST")
			const QuarterFinalPlayers = Array.from({ length: 8 }, (_, index) => `Player_${index + 1}`);
			const SemiFinalPlayers = Array.from({ length: 4 }, () => null);
			const FinalPlayers = Array.from({ length: 2 }, () => null);
			setSecureItem('QuarterFinalPlayers', QuarterFinalPlayers);
			setSecureItem('SemiFinalPlayers', SemiFinalPlayers);
			setSecureItem('FinalPlayers', FinalPlayers);
			setSecureItem('Winner', null);
			setPlayers(QuarterFinalPlayers)
			setSecureItem('is_started', 'false');
			setSecureItem('matches_played', 0);
			setSecureItem('is_game_finished', 'false');
		}
		checkAndNavigate();
	}, [])

	useEffect(() => {
		if (players.length > 0) {
			////console.log("PLAYER YSEE")
			setSecureItem('QuarterFinalPlayers', players);
		}
	}, [players])

	const handleConfirm = () => {
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

	const handleStart = async () => {
		const keysToCheck = [
			"QuarterFinalPlayers",
			"SemiFinalPlayers",
			"FinalPlayers",
			"Winner",
			"is_started",
			"matches_played",
			"is_game_finished"
		];

		const isDataValid = await verifyDataIntegrity(keysToCheck);
		if (!isDataValid) {
			toast.error("Please dont touch local storage", {
				duration: 3000,
			});
			const QuarterFinalPlayers = Array.from({ length: 8 }, (_, index) => `Player_${index + 1}`);
			const SemiFinalPlayers = Array.from({ length: 4 }, () => null);
			const FinalPlayers = Array.from({ length: 2 }, () => null);
			setSecureItem('QuarterFinalPlayers', QuarterFinalPlayers);
			setSecureItem('SemiFinalPlayers', SemiFinalPlayers);
			setSecureItem('FinalPlayers', FinalPlayers);
			setSecureItem('Winner', null);
			setPlayers(QuarterFinalPlayers)
			setSecureItem('is_started', 'false');
			setSecureItem('matches_played', 0);
			setSecureItem('is_game_finished', 'false');
			return;
		}

		setSecureItem('is_started', 'true');
		navigate("/localtournamentbracket")
	}

	const modify_open = () => {
		setOpen(!open);
	}
	const div_click = (index) => {
		setIndex(index)
		modify_open()
	}

	return (
		<div className={styles["tournament-page"]}>
			<Toaster />
			<div className={styles["tournament-page-content"]}>
				<div className={styles["title-and-destroy"]}>
					<div className={styles["title-and-destroy-div"]}>

						<button className={styles["destroy-button"]} onClick={handleCancelButton}>
							Cancel
						</button>
						<button className={styles["destroy-button"]} onClick={handleStart}>
							Start
						</button>
					</div>
				</div>
				<div className={styles["tournament-members"]}>
					{open && <Component />}
					{players.map((player, ind) => {
						const Icon = iconArray[ind];
						return (
							<div
								key={ind}
								className={`
					  ${open ? styles["player-opened"] : styles["player"]} 
					  ${ind === index ? styles["player-selected"] : ""} 
					`}
								onClick={!open ? () => div_click(ind) : null}
								style={{
									backgroundImage: `url(${backgroundImage})`,
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}
							>
								<div className={styles["user-avatar"]}>
									<Icon className={styles["avatar"]} color='white' />
								</div>
								<div className={styles["line-and-user-info"]}>
									<div className={styles["user-info"]}>
										<h4 className={styles["user-info-name"]}>{player}</h4>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
export default LocalTournamentFillMembers