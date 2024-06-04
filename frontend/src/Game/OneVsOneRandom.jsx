import React, { useState, useContext, useEffect, useRef } from 'react'
import * as Icons from '../assets/navbar-sidebar'
import '../assets/navbar-sidebar/index.css'
import AuthContext from '../navbar-sidebar/Authcontext'
import { Link, useNavigate } from 'react-router-dom';

const OneVsOneRandom = () => {
    const picsList = [Icons.profilepic1, Icons.profilepic2, Icons.profilepic3, Icons.profilepic4]
    const [randomPic, setRandomPic] = useState(Icons.profilepic)
    const [gameStarted, setGameStarted] = useState(false)
    const [enemyInfos, setEnemyInfos] = useState(null)
    const [loadMatch, setLoadMatch] = useState(false)
    const [allSet, setAllSet] = useState(false)
    const [playerNo, setPlayerNo] = useState(0)
    const [roomID, setRoomID] = useState(0)
    const [alreadyChecked, setAlreadyChecked] = useState(false)
    const navigate = useNavigate()
    let randomPics
    let { privateCheckAuth, socket, user,
        socketRecreated, setSocketRecreated,
        userImg, loading } = useContext(AuthContext)
    
    useEffect(() => {
        privateCheckAuth()
    }, [])

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN && user) {
            console.log("CHECKING IF PLAYER IN ROOM 1vs1")
            socket.send(JSON.stringify({
                type: 'isPlayerInAnyRoom',
                message: {
                    user: user,
                    mode: '1vs1',
                    type: 'random'
                }
            }))
        }
	}, [socket, user])

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.onmessage = (event) => {
                let data = JSON.parse(event.data)
                let type = data.type
                let message = data.message
                if (type === 'roomAlreadyStarted') {
                    console.log("inside roomAlreadyStarted")
                    setAllSet(true)
                    navigate(`../play/1vs1/${message.roomID}`)
                } else if (type === "gameReady") {
                    console.log("inside gameReady")
                    console.log(message.avatars)
                    if (playerNo === 1) {
                        setEnemyInfos({
                            avatar: message.users[1].image,
                            name: message.room.players[1].user,
                            level: message.users[1].level
                        })
                    } else {
                        setEnemyInfos({
                            avatar: message.users[0].image,
                            name: message.room.players[0].user,
                            level: message.users[0].level
                        })
                    }
                    // if (randomPics)
                    //     clearInterval(randomPics)
                    setGameStarted(false)
                    setRoomID(message.room.id)
                    setLoadMatch(false)
                    setAllSet(true)
                    console.log("ALL SET BROTHER")
                } else if (type === "playersReady") {
                    console.log("inside playersReady")
                    setAllSet(true)
                } else if (type === "playerNo") {
                    console.log("inside playerNo")
                    setPlayerNo(message.playerNo)
                    setRoomID(message.id)
                    setGameStarted(true)
                } else if (type === "noRoomFound") {
                    console.log("inside noRoomFound")
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        console.log("inside join")
                        socket.send(JSON.stringify({
                            type: 'join',
                            message: {
                                user: user,
                            }
                        }))
                        setGameStarted(true)
                        setLoadMatch(true)
                        randomPics = setInterval(() => {
                            setRandomPic(picsList[Math.floor(Math.random() * picsList.length)])
                        }, 1000);
                    }
                } else if (type === 'alreadySearching') {
                    console.log("inside alreadySearching")
                    console.log(message)
                    setPlayerNo(message.playerNo)
                    setRoomID(message.id)
                    setGameStarted(true)
                    setLoadMatch(true)
                    randomPics = setInterval(() => {
                        setRandomPic(picsList[Math.floor(Math.random() * picsList.length)])
                    }, 1000);
                }
            }
        }

        if (allSet && roomID) {
            console.log("inside allSet and roomID")
            clearInterval(randomPics)
            setTimeout(() => {
                navigate(`../play/1vs1/${roomID}`)
            }, 2000);
        }

    }, [socket, user, allSet, roomID, alreadyChecked])

    const cancelTheGame = () => {
        if (socket && socket.readyState === WebSocket.OPEN && user) {
            socket.send(JSON.stringify({
                type: 'quit',
                message: {
                    user: user,
                    id: roomID
                }
            }))
            navigate(`../game/solo/1vs1`)  // CHANGE LATER TO THIS ROUTE "game/solo/1vs1" !!!!!!!! DO NOT FORGET
        } else
            console.log('socket is null or not open, refresh')
    }

    return (
    <div className='onevsone'>
        <div className='onevsone-dashboard' >
            <div className='onevsone-dashboard-opponents' style={{position: "relative"}}>
                <div className='onevsone-dashboard-opponent'>
                    <div><img src={userImg} alt="profile-pic" style={{borderRadius: '50%'}} /></div>
                    <div className='onevsone-opponent-infos'>
                        <p>mmaqbour</p>
                        <p>level 6.5</p>
                    </div>
                </div>
                <div className='onevsone-dashboard-logo'>
                {(!loadMatch && allSet) ? (<img id='versus-logo' src={Icons.versus} alt="profile-pic" />) : (loadMatch && !allSet) ? (
                    <>
                        <div id='paddle-1' ></div>
                        <div id='net' ></div>
                        <div id='ball' ></div>
                        <div id='paddle-2' ></div>
                    </>
                ) : ''}
                </div>
                <div className='onevsone-dashboard-opponent'>
                    {enemyInfos ? (
                        <>
                            <div><img src={`data:image/jpeg;base64,${enemyInfos.avatar}`} alt="profile-pic" style={{borderRadius: '50%'}} /></div>
                            <div className='onevsone-opponent-infos'>
                                <p>{enemyInfos.name}</p>
                                <p>level {enemyInfos.level}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div><img src={randomPic} alt="profile-pic" /></div>
                            <div className='onevsone-opponent-infos-none' ></div>
                        </>
                    )}
                </div>
            </div>
        </div>
        {gameStarted && (<div className='onevsone-cancel' ><div className='onevsone-cancel-game' onClick={cancelTheGame} >cancel</div></div>)}
    </div>
    )
}

export default OneVsOneRandom