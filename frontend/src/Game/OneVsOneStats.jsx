import React from 'react'
import { useNavigate } from 'react-router-dom';
import '../assets/navbar-sidebar/index.css';
import * as Icons from '../assets/navbar-sidebar'
import { PiNumberSquareOneFill } from "react-icons/pi";
import { PiNumberSquareTwoFill } from "react-icons/pi";

const OneVsOneStats = (props) => {
    const navigate = useNavigate()

    const profileImgClick = (name) => name && navigate(`/mainpage/profile/${name}`)

    const exitOneVsOneGame = () => navigate('../game/solo/1vs1')

    return (
        <div className='onevsone' style={{ position: 'relative', marginBottom: props.mode === 'offline' ? '100px' : '' }} >
            {(props.mode === 'online') ? ((props.gameFinished && props.user === props.userName1) ? ((props.playersInfos[0].status === 'winner') ? (
                <>
                    <div className='winner_cup' >
                        <img src={Icons.winnerCup} alt="winner cup" />
                    </div>
                    <p className='winner_congrats' >WINNER WINNER CHICKEN DINNER!</p>
                </>
            ) : (
                <p className='loser_support' >BETTER LUCK NEXT TIME!</p>
            )) : (props.gameFinished && props.user === props.userName2) ? ((props.playersInfos[1].status === 'winner') ? (
                <>
                    <div className='winner_cup' >
                        <img src={Icons.winnerCup} alt="winner cup" />
                    </div>
                    <p className='winner_congrats' >WINNER WINNER CHICKEN DINNER!</p>
                </>
            ) : (
                <p className='loser_support' >BETTER LUCK NEXT TIME!</p>
            )) : (
                <p className='loser_support' >GAME ABORTED!</p>
            )) : (
                <>
                    <p className='loser_support' >
                        Great game! {(props.playersInfos[0].totalScore > props.playersInfos[1].totalScore) ? props.userName1 : props.userName2} 🎮🔥 👑🎉
                    </p>
                </>
            )}
            <div className='gameStats_container' >
                <div className='gameStats_playerInfos' >
                    <div className='gameStats_playerInfos-details' >
                        <div onClick={() => { (props.mode === 'online') ? profileImgClick(props.userName1) : undefined }} >
                            {(props.mode === 'online') ? (props.playersPics.length ? (<img src={props.playersPics[0].avatar} alt="" />) : (<img src={Icons.solidGrey} alt="" />)) : <PiNumberSquareOneFill size={60} />}
                            <p>{props.userName1}</p>
                        </div>
                        <div onClick={() => {(props.mode === 'online') ? profileImgClick(props.userName2) : undefined}} >
                            <p>{props.userName2}</p>
                            {(props.mode === 'online') ? (props.playersPics.length ? (<img src={props.playersPics[1].avatar} alt="" />) : (<img src={Icons.solidGrey} alt="" />)) : <PiNumberSquareTwoFill size={60} />}
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
                        (<p>{Math.floor((props.playersInfos[0].score / props.playersInfos[0].hit ) * 100)}%</p>) :
                        (<p>0%</p>)
                        }
                        <p>Accuracy</p>
                        {(props.playersInfos[1].hit) ?
                        (<p>{Math.floor((props.playersInfos[1].score / props.playersInfos[1].hit ) * 100)}%</p>) :
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