import { React, useContext, useEffect, useState } from 'react'
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import LineGraph from "../charts/LineGraph"
import BarGraph from "../charts/BarGraph"
import AuthContext from '../../navbar-sidebar/Authcontext';
import { useNavigate } from 'react-router-dom';

function DashStatistics() {
    const { user } = useContext(AuthContext);
    const [userStcs, setUserStcs] = useState([])
    const [isLineChart, setIsLineChart] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const getUserStcs = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/getUserStcsDash`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const res = await response.json()
                if (response.ok) {
                    setUserStcs(res.userStcs)
                }
                else if (response.status === 401)
                    navigate('/signin')
            } catch (error) {
               console.log("Error: ", error);
            }
        }
        if (user)
            getUserStcs()
    }, [user])

    const handleIconClick = () => {
        setIsLineChart(!isLineChart);
    }
    const chartParameters = {
        left: -30,
        right: 5,
        data: userStcs,
        brSize: 10,
    }

    return (
        <div className="dashpage__body__statistics purple--glass">
            <div className="statistics-head-button">
                <h1> Wins/Lost Historics </h1>
                {isLineChart && <BarChartIcon className="chart-icon" onClick={handleIconClick} />}
                {!isLineChart && <ShowChartIcon className="chart-icon" onClick={handleIconClick} />}
            </div>
            {userStcs.length ?
                <div className="line-graph">
                    {!isLineChart && <BarGraph param={chartParameters} />}
                    {isLineChart && <LineGraph param={chartParameters} />}
                </div> : <></>
            }
        </div>
    )
}

export default DashStatistics
