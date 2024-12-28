import React from 'react'
import { useNavigate } from 'react-router-dom';
import '../assets/navbar-sidebar/index.css';
import * as Icons from '../assets/navbar-sidebar'

const TwoVsTwoStats = (props) => {
    const navigate = useNavigate()

    const profileImgClick = (name) => name && navigate(`/mainpage/profile/${name}`)

    const exitTwoVsTwoGame = () => navigate('../game/solo/2vs2')

    return (
        <div className='twovstwo' style={{position: 'relative'}} >
                {(props.gameFinished && (props.user === props.userName1 || props.user === props.userName2)) ? ((props.playersInfos[0].status === 'winner' || props.playersInfos[1].status === 'winner') ? (
                    <>
                        <div className='winner_cup' >
                            <img src={Icons.winnerCup} alt="winner cup" />
                        </div>
                        <p className='winner_congrats' >WINNER WINNER CHICKEN DINNER!</p>
                    </>
                ) : (
                    <p className='loser_support' >BETTER LUCK NEXT TIME!</p>
                )) : (props.gameFinished && (props.user === props.userName3 || props.user === props.userName4)) ? ((props.playersInfos[2].status === 'winner' || props.playersInfos[3].status === 'winner') ? (
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
                )}
                <div className='gameStats_container' >
                    <div className='gameStats_playerInfos' >
                        <div className='gameStats_playerInfos-details' >
                            <div>
                                {props.playersPics.length ? (<img onClick={() => profileImgClick(props.userName1)} src={props.playersPics[0].avatar} alt="" />) : (<img onClick={() => profileImgClick(props.userName1)} src={Icons.solidGrey} alt="" />)}
                                {props.playersPics.length ? (<img onClick={() => profileImgClick(props.userName2)}  src={props.playersPics[1].avatar} alt="" />) : (<img onClick={() => profileImgClick(props.userName2)} src={Icons.solidGrey} alt="" />)}
                            </div>
                            <div>
                                {props.playersPics.length ? (<img onClick={() => profileImgClick(props.userName3)} src={props.playersPics[2].avatar} alt="" />) : (<img onClick={() => profileImgClick(props.userName3)} src={Icons.solidGrey} alt="" />)}
                                {props.playersPics.length ? (<img onClick={() => profileImgClick(props.userName4)}  src={props.playersPics[3].avatar} alt="" />) : (<img onClick={() => profileImgClick(props.userName4)} src={Icons.solidGrey} alt="" />)}
                            </div>
                        </div>
                    </div>
                    <div className='gameStats_details_2v2' >
                        <div>
                            <div>
                                <p>{props.playersInfos[0].totalScore}</p>
                                <p>{props.playersInfos[1].totalScore}</p>
                            </div>
                            <p>Score</p>
                            <div>
                                <p>{props.playersInfos[2].totalScore}</p>
                                <p>{props.playersInfos[3].totalScore}</p>
                            </div>
                        </div>
                    </div>
                    <div className='gameStats_details_2v2' >
                        <div>
                            <div>
                                <p>{props.playersInfos[0].score}</p>
                                <p>{props.playersInfos[1].score}</p>
                            </div>
                            <p>Goals</p>
                            <div>
                                <p>{props.playersInfos[2].score}</p>
                                <p>{props.playersInfos[3].score}</p>
                            </div>
                        </div>
                    </div>
                    <div className='gameStats_details_2v2' >
                        <div>
                            <div>
                                <p>{props.playersInfos[0].hit}</p>
                                <p>{props.playersInfos[1].hit}</p>
                            </div>
                            <p>Hit</p>
                            <div>
                                <p>{props.playersInfos[2].hit}</p>
                                <p>{props.playersInfos[3].hit}</p>
                            </div>
                        </div>
                    </div>
                    <div className='gameStats_details_2v2' >
                        <div>
                            <div>
                                {(props.playersInfos[0].hit) ?
                                (<p>{Math.floor((props.playersInfos[0].score / props.playersInfos[0].hit ) * 100)}%</p>) :
                                (<p>0%</p>)
                                }
                                {(props.playersInfos[1].hit) ?
                                (<p>{Math.floor((props.playersInfos[1].score / props.playersInfos[1].hit ) * 100)}%</p>) :
                                (<p>0%</p>)
                                }
                            </div>
                            <p>Accuracy</p>
                            <div>
                                {(props.playersInfos[2].hit) ?
                                (<p>{Math.floor((props.playersInfos[2].score / props.playersInfos[2].hit ) * 100)}%</p>) :
                                (<p>0%</p>)
                                }
                                {(props.playersInfos[3].hit) ?
                                (<p>{Math.floor((props.playersInfos[3].score / props.playersInfos[3].hit ) * 100)}%</p>) :
                                (<p>0%</p>)
                                }
                            </div>
                        </div>
                    </div>
                    <div className='gameStats_details_2v2' >
                        <div>
                            <div>
                                <p>{props.playersInfos[0].rating}</p>
                                <p>{props.playersInfos[1].rating}</p>
                            </div>
                            <p>Rating</p>
                            <div>
                                <p>{props.playersInfos[2].rating}</p>
                                <p>{props.playersInfos[3].rating}</p>
                            </div>
                        </div>
                    </div>
                </div>
                    <div className='stats-selects stats-selects-modes' >
                        <button onClick={exitTwoVsTwoGame} >Exit</button>
                    </div>
                </div>
    )
}

export default TwoVsTwoStats