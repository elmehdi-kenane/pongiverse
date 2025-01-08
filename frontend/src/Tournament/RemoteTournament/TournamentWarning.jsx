import { useEffect, useState, useContext } from "react";
import styles from '../../assets/Tournament/TournamentWarning.module.css';
import cross from '../../assets/Tournament/cross.svg';
import AuthContext from "../../navbar-sidebar/Authcontext";
import { useNavigate } from "react-router-dom";
function TournamentWarning() {
    const { user, notifSocket } = useContext(AuthContext);
    const [createdAt, setCreatedAt] = useState(null)
    const [timeDiff, setTimeDiff] = useState(null);
    const navigate = useNavigate()
    useEffect(() => {
        if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
            notifSocket.onmessage = (event) => {
                let data = JSON.parse(event.data)
                let type = data.type
                let message = data.message
                if (type === 'warn_members')
                    setCreatedAt(new Date(message.time))
            }
        }
    }, [notifSocket])

    useEffect(() => {
        const getTournamentWarning = async () => {
            const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/get-tournament-warning`, {
                method: "POST",
                credentials: "include",
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
                    setCreatedAt(new Date(data.time))
            } else 
                navigate("/signin")
        }
        if (user)
            getTournamentWarning()
    }, [user])

    useEffect(() => {
        if (createdAt) {
            const interval = setInterval(() => {
                const now = new Date();
                const diffInSeconds = Math.floor((now - createdAt) / 1000);
                if (diffInSeconds < 14) {
                    setTimeDiff(14 - diffInSeconds);
                } else {
                    setTimeDiff(null);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [createdAt])


    const hideButton = () => {   
        setTimeDiff(null);
    }

    return (
        <>
            {timeDiff &&
                <div className={styles['tournament-warning-div']}>
                    <div className={styles['tournament-warning-text']}>
                        Game will start in 14
                    </div>
                    <div className={styles['tournament-warning-button']} onClick={hideButton}>
                        <img src={cross} alt="" />
                    </div>
                </div>
            }
        </>
    );
}

export default TournamentWarning;