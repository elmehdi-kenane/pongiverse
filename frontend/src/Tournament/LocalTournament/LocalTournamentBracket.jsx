import styles from '../../assets/Tournament/tournamentbracket.module.css'
import versus from '../../assets/navbar-sidebar/Versus.svg';
import LocalSvgComponent from './LocalSvgComponent';
import LocalSvgVerticalComponent from './LocalSvgVerticalComponent';
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from '../../navbar-sidebar/Authcontext';
import { useEffect, useState, useContext } from 'react';


function LocalTournamentBracket() {
	const players = localStorage.getItem('Round16Players')
	const is_started = localStorage.getItem('is_started')
	const navigate = useNavigate()
	const location = useLocation()
	const { user, socket } = useContext(AuthContext)
	useEffect(()=>{
		if (user){
			console.log("Players : ", players, ", is_started : ", is_started)
			if (players === null || is_started === null)
				navigate("../game/localtournamentfillmembers")
		}
	},[user])
	return (
		<div className={styles['tournamentbracketpage']}>
			<div className={styles['normalSvg']}>
				<LocalSvgComponent/>
			</div>
			<div className={styles['verticalSvg']}>
				<LocalSvgVerticalComponent/>
			</div>
		</div>
	);
}

export default LocalTournamentBracket