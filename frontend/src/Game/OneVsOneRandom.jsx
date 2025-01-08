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
        userImg, loading, userLevel, notifSocket, setChatNotificationCounter, addNotificationToList, notifications,
		setNotifications } = useContext(AuthContext)

    let isOut = false
    const userRef = useRef(user)
    const roomIdRef = useRef(roomID)
    const socketRef = useRef(socket)

    // useEffect(() => {
    //     privateCheckAuth()
    // }, [])

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN && user) {
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
        if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
            notifSocket.onmessage = (event) => {
                let data = JSON.parse(event.data)
                let message = data.message
                let type = data.type
                if (type === "chatNotificationCounter") {
                    setChatNotificationCounter(data.count);
                } else if (type === "receive-friend-request") {
					addNotificationToList({
						notificationText: `${message.second_username} sent you a friend request`,
						urlRedirection: "friendship",
						avatar: message.avatar,
						notifications: notifications,
						setNotifications: setNotifications,
						user: user,
					});
				}
            }
        }
    }, [notifSocket])


    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.onmessage = (event) => {
                let data = JSON.parse(event.data)
                let type = data.type
                let message = data.message
                if (type === 'roomAlreadyStarted') {
                    setAllSet(true)
                    if (message.mode === '1vs1')
                        navigate(`../play/1vs1/${message.roomID}`)
                    else if (message.mode === '2vs2')
                        navigate(`../play/2vs2/${message.roomID}`)
                    else
                        navigate("../game/createtournament")
                } else if (type === "gameReady") {
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
                } else if (type === "playersReady") {
                    setAllSet(true)
                } else if (type === "playerNo") {
                    setPlayerNo(message.playerNo)
                    setRoomID(message.id)
                    setGameStarted(true)
                } else if (type === "noRoomFound") {
                    if (socket && socket.readyState === WebSocket.OPEN) {
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
                    setPlayerNo(message.playerNo)
                    setRoomID(message.id)
                    setGameStarted(true)
                    setLoadMatch(true)
                    randomPics = setInterval(() => {
                        setRandomPic(picsList[Math.floor(Math.random() * picsList.length)])
                    }, 1000);
                } else if (type === 'hmed')
                    socket.close()
            }
        }

        if (allSet && roomID) {
            clearInterval(randomPics)
            setTimeout(() => {
                navigate(`../play/1vs1/${roomID}`)
            }, 2000);
        }

    }, [socket, user, allSet, roomID, alreadyChecked])

    useEffect(() => {
        userRef.current = user;
        roomIdRef.current = roomID;
        socketRef.current = socket;
    }, [user, roomID, socket]);

    const cancelTheGame = () => {
        if (socket && socket.readyState === WebSocket.OPEN && user && roomID) {
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

    useEffect(() => {
        return () => {
            if (isOut) {
                const user = userRef.current
                const socket = socketRef.current
                const roomID = roomIdRef.current
                if (socket && socket.readyState === WebSocket.OPEN && user && roomID) {
                    socket.send(JSON.stringify({
                        type: 'quit',
                        message: {
                            user: user,
                            id: roomID
                        }
                    }))
                }
            } else
                isOut = true
        }
    }, [])

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            const user = userRef.current
            const socket = socketRef.current
            const roomID = roomIdRef.current
            if (socket && socket.readyState === WebSocket.OPEN && user && roomID) {
                socket.send(JSON.stringify({
                    type: 'quit',
                    message: {
                        user: user,
                        id: roomID
                    }
                }))
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [])

    return (
        <div className='onevsone'>
            <div className='onevsone-dashboard' >
                <div className='onevsone-dashboard-opponents' style={{ position: "relative" }}>
                    <div className='onevsone-dashboard-opponent'>
                        <div><img src={userImg} alt="profile-pic" style={{ borderRadius: '50%' }} /></div>
                        <div className='onevsone-opponent-infos'>
                            <p>{user}</p>
                            <p>level {userLevel}</p>
                        </div>
                    </div>
                    <div className={(!allSet && loadMatch) ? 'onevsone-dashboard-logo onevsone-dashboard-logo-loading' : 'onevsone-dashboard-logo'} >
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
                                <div><img src={enemyInfos.avatar} alt="profile-pic" style={{ borderRadius: '50%' }} /></div>
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