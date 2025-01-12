import React, { useState, useEffect, useContext } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import * as Icons from '../assets/navbar-sidebar'
import AuthContext from '../navbar-sidebar/Authcontext'
import styles from '../assets/Game/gamemodeslocal.module.css'
import playSoloImage from '../assets/Game/playSoloMode.svg'
import createTournamentImage from '../assets/Game/createTournamentMode.svg'
import joinTournamentImage from '../assets/Game/joinTournamentMode.svg'
import toast, { Toaster } from 'react-hot-toast';

const LocalModes = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [soloModeSelected, setSoloModeSelected] = useState(false)
    const [createTournamentModeSelected, setcreateTournamentModeSelected] = useState(false)
    const [enableButton, setEnableButton] = useState(false)
    let { socket, user } = useContext(AuthContext)

    const goToSoloPage = () => {
        navigate("/1vs1/offline")
    }

    const GoToLocalTournament = () => {
        navigate("/localtournamentfillmembers")
    }

    const handleSelect = (type) => {
        if (type === 'play_solo') {
            setSoloModeSelected(true)
            setcreateTournamentModeSelected(false)
            setEnableButton(true)
        } else if (type === 'localTournament') {
            setSoloModeSelected(false)
            setcreateTournamentModeSelected(true)
            setEnableButton(true)
        }
        setEnableButton(true)
    }

    const handleButtonClick = () => {
        if (soloModeSelected) {
            goToSoloPage()

        }
        if (createTournamentModeSelected)
            GoToLocalTournament()
    }

    return (
        <div className={styles['game-modes-page-local']}>
            <Toaster />
            <div className={styles['game-modes-div']}>
                <div className={`${styles['play-solo-mode']} ${soloModeSelected ? styles['mode-selected'] : ''}`} onClick={() => handleSelect('play_solo')}>
                    <div className={styles['play-solo-mode-image']}>
                        <img src={playSoloImage} alt="" />
                    </div>
                    <div className={styles['play-solo-mode-title-and-description']}>
                        <h1 className={styles['play-solo-mode-title']}>Play Solo</h1>
                        <p className={styles['play-solo-mode-description']}>Initiate a solo team ping pong match where you, as a single player,
                            compete against other players.</p>
                    </div>
                </div>
                <div className={`${styles['create-tournament-mode']} ${createTournamentModeSelected ? styles['mode-selected'] : ''}`} onClick={() => handleSelect('localTournament')}>
                    <div className={styles['create-tournament-mode-image']}>
                        <img src={createTournamentImage} alt="" />
                    </div>
                    <div className={styles['create-tournament-mode-title-and-description']}>
                        <h1 className={styles['create-tournament-mode-title']}>Create Tournament</h1>
                        <p className={styles['create-tournament-mode-description']}> Kick off the process of creating a ping pong tournament,
                            Craft your own competitive event.</p>
                    </div>
                </div>
                <div className={styles['game-modes-page-buttons']}>
                    <div className={styles['game-modes-page-button-selected']}>
                        <button onClick={() => {navigate("/")}}>Go back</button>
                    </div>
                    <div className={`${styles['game-modes-page-button']} ${(soloModeSelected || createTournamentModeSelected) ? styles['game-modes-page-button-selected'] : ''}`}>
                        <button onClick={handleButtonClick} disabled={!enableButton}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LocalModes
