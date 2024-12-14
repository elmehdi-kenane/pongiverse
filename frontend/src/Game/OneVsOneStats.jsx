import React from 'react'
import { useNavigate } from 'react-router-dom';
import '../assets/navbar-sidebar/index.css';
import * as Icons from '../assets/navbar-sidebar'
import { PiNumberSquareOneFill } from "react-icons/pi";
import { PiNumberSquareTwoFill } from "react-icons/pi";

const OneVsOneStats = (props) => {
    const navigate = useNavigate()

    const exitOneVsOneGame = () => navigate('../game/solo/1vs1')

    return (
        <div className='onevsone' style={{ position: 'relative', marginBottom: props.mode === 'offline' ? '100px' : '' }} >
            {(
                <>
                    <p className='loser_support' >
                        Great game! {(props.playersInfos[0].totalScore > props.playersInfos[1].totalScore) ? props.userName1 : props.userName2} 🎮🔥 👑🎉
                    </p>
                </>
            )}
            <div className='gameStats_container' >
                <div className='gameStats_playerInfos' >
                    <div className='gameStats_playerInfos-details' >
                        <div >
                            <PiNumberSquareOneFill size={60}/>
                            <p>{props.userName1}</p>
                        </div>
                        <div>
                            <p>{props.userName2}</p>
                            {<PiNumberSquareTwoFill size={60}/>}
                        </div>
                    </div>
                </div>
                <div className='gameStats_details' >
                    <div>
                        <p>{props.playersInfos[0].totalScore}</p>
                        <p>Score</p>
                        <p>{props.playersInfos[1].totalScore}</p>
                    </div>
                </div>
                <div className='gameStats_details' >
                    <div>
                        <p>{props.playersInfos[0].score}</p>
                        <p>Goals</p>
                        <p>{props.playersInfos[1].score}</p>
                    </div>
                </div>
                <div className='gameStats_details' >
                    <div>
                        <p>{props.playersInfos[0].hit}</p>
                        <p>Hit</p>
                        <p>{props.playersInfos[1].hit}</p>
                    </div>
                </div>
                <div className='gameStats_details' >
                    <div>
                        {(props.playersInfos[0].hit) ?
                            (<p>{Math.floor((props.playersInfos[0].score / props.playersInfos[0].hit) * 100)}%</p>) :
                            (<p>0%</p>)
                        }
                        <p>Accuracy</p>
                        {(props.playersInfos[1].hit) ?
                            (<p>{Math.floor((props.playersInfos[1].score / props.playersInfos[1].hit) * 100)}%</p>) :
                            (<p>0%</p>)
                        }
                    </div>
                </div>
                <div className='gameStats_details' >
                    <div>
                        <p>{props.playersInfos[0].rating}</p>
                        <p>Rating</p>
                        <p>{props.playersInfos[1].rating}</p>
                    </div>
                </div>
            </div>
            {(props.mode === 'online') ? (
                <div className='stats-selects stats-selects-modes' >
                    <button onClick={exitOneVsOneGame} >Exit</button>
                </div>
            ) : (
                <div className='stats-selects' >
                    <button onClick={props.exitOfflineGame} >Exit</button>
                    <button onClick={props.restartGame} >Restart</button>
                </div>
            )}
        </div>
    )
}

export default OneVsOneStats