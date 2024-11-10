import styles from '../../assets/Tournament/tournamentbracket.module.css'
import versus from '../../assets/navbar-sidebar/Versus.svg';
import LocalSvgComponent from './LocalSvgComponent';
import LocalSvgVerticalComponent from './LocalSvgVerticalComponent';
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from '../../navbar-sidebar/Authcontext';
import { useEffect, useState, useContext } from 'react';


function LocalTournamentBracket() {
	const players = localStorage.getItem('QuarterFinalPlayers')
	const is_started = localStorage.getItem('is_started')
	const navigate = useNavigate()
	const location = useLocation()
	const { user, socket } = useContext(AuthContext)
	useEffect(() => {
			if (players === null || is_started === null || is_started != "true") {
				navigate("../game/localtournamentfillmembers")
			}
	}, [])
	return (
		<div className={styles['tournamentbracketpage']}>
			{
				<div className={styles['display-components-div']}>
					<div className={styles['display-components-div-players-data']}>
						<img src={versus} alt="" className={styles['display-components-div-players-data-image']} />
						<img src={versus} className={styles['display-components-div-players-data-svg']} alt="" />
						<img src={versus} alt="" className={styles['display-components-div-players-data-image']} />
					</div>
					<p className={styles['display-components-div-text']}>The game will start in</p>
				</div>
			}
			<div className={styles['normalSvg']}>
				<LocalSvgComponent />
			</div>
			<div className={styles['verticalSvg']}>
				<LocalSvgVerticalComponent />
			</div>
		</div>
	);
}

export default LocalTournamentBracket