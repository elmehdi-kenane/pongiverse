import React, { useState, useContext, useEffect, useRef } from 'react'
import * as Icons from '../assets/navbar-sidebar'
import '../assets/navbar-sidebar/index.css'
import AuthContext from '../navbar-sidebar/Authcontext'
import { Link, useNavigate } from 'react-router-dom';

const TwoVsTwoRandom = () => {
    // const [isInSearchMode, setIsInSearchMode] = useState(false)
    // const [isInPlayingMode, setIsInPlayingMode] = useState(false)
    // const [gameNotif, setGameNotif] = useState([])
    const picsList = [Icons.profilepic1, Icons.profilepic2, Icons.profilepic3, Icons.profilepic4]
    const [randomPic, setRandomPic] = useState(Icons.profilepic)
    const [gameStarted, setGameStarted] = useState(false)
    const [temmateInfos, setTemmateInfos] = useState(false)
    const [enemy1Infos, setEnemy1Infos] = useState(false)
    const [enemy2Infos, setEnemy2Infos] = useState(false)
    const [loadMatch, setLoadMatch] = useState(false)
    // const [tmpRoomID, setTmpRoomID] = useState(null)
    const [allSet, setAllSet] = useState(false)
    const [playerNo, setPlayerNo] = useState(0)
    const playerNoRef = useRef(playerNo)
    const [roomID, setRoomID] = useState(0)
    const [alreadyChecked, setAlreadyChecked] = useState(false)
    const navigate = useNavigate()
    let checked = false
    let randomPics
    // const [chosenOne, setChosenOne] = useState('')
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
        // console.log(socket, socket.readyState, user)
        if (!checked && socket && socket.readyState === WebSocket.OPEN && user) {
            checked = true
            socket.send(JSON.stringify({
                type: 'isPlayerInAnyRoom',
                message: {
                    user: user,
                    mode: '2vs2',
                    type: 'random'
                }
            }))
        }
    }, [socket, user])

    useEffect(() => {
        if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
            notifSocket.onmessage = (event) => {
                let data = JSON.parse(event.data)
                let type = data.type
                let message = data.message
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
        playerNoRef.current = playerNo;
        userRef.current = user;
        roomIdRef.current = roomID;
        socketRef.current = socket;
    }, [playerNo, user, roomID, socket]);

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
                } else if (type === 'gameOnHold') {
                    // console.log(message, playerNo)
                    const playerNbr = playerNoRef.current;
                    if (playerNbr === 1 || playerNbr === 2) {
                        if (playerNbr === 1 && message.users.length >= 2)
                            setTemmateInfos({
                                avatar: message.users[1].image,
                                name: message.users[1].name,
                                level: message.users[1].level
                            })
                        else if (playerNbr === 2)
                            setTemmateInfos({
                                avatar: message.users[0].image,
                                name: message.users[0].name,
                                level: message.users[0].level
                            })
                        else
                            setTemmateInfos(false)
                        if (message.users.length === 3)
                            setEnemy1Infos({
                                avatar: message.users[2].image,
                                name: message.users[2].name,
                                level: message.users[2].level
                            })
                        else if (message.users.length === 4) {
                            setEnemy1Infos({
                                avatar: message.users[2].image,
                                name: message.users[2].name,
                                level: message.users[2].level
                            })
                            setEnemy2Infos({
                                avatar: message.users[3].image,
                                name: message.users[3].name,
                                level: message.users[3].level
                            })
                        } else {
                            setEnemy1Infos(false)
                            setEnemy2Infos(false)
                        }
                    } else if (playerNbr === 3 || playerNbr === 4) {
                        if (playerNbr === 3 && message.users.length === 4)
                            setTemmateInfos({
                                avatar: message.users[3].image,
                                name: message.users[3].name,
                                level: message.users[3].level
                            })
                        else if (playerNo === 4)
                            setTemmateInfos({
                                avatar: message.users[2].image,
                                name: message.users[2].name,
                                level: message.users[2].level
                            })
                        else
                            setTemmateInfos(false)
                        setEnemy1Infos({
                            avatar: message.users[0].image,
                            name: message.users[0].name,
                            level: message.users[0].level
                        })
                        setEnemy2Infos({
                            avatar: message.users[1].image,
                            name: message.users[1].name,
                            level: message.users[1].level
                        })
                    }
                } else if (type === "gameReady") {
                    const playerNbr = playerNoRef.current;
                    if (playerNbr === 1 || playerNbr === 2) {
                        if (playerNbr === 1 && message.users.length >= 2)
                            setTemmateInfos({
                                avatar: message.users[1].image,
                                name: message.users[1].name,
                                level: message.users[1].level
                            })
                        else if (playerNbr === 2)
                            setTemmateInfos({
                                avatar: message.users[0].image,
                                name: message.users[0].name,
                                level: message.users[0].level
                            })
                        else
                            setTemmateInfos(false)
                        if (message.users.length === 3)
                            setEnemy1Infos({
                                avatar: message.users[2].image,
                                name: message.users[2].name,
                                level: message.users[2].level
                            })
                        else if (message.users.length === 4) {
                            setEnemy1Infos({
                                avatar: message.users[2].image,
                                name: message.users[2].name,
                                level: message.users[2].level
                            })
                            setEnemy2Infos({
                                avatar: message.users[3].image,
                                name: message.users[3].name,
                                level: message.users[3].level
                            })
                        } else {
                            setEnemy1Infos(false)
                            setEnemy2Infos(false)
                        }
                    } else if (playerNbr === 3 || playerNbr === 4) {
                        if (playerNbr === 3 && message.users.length === 4)
                            setTemmateInfos({
                                avatar: message.users[3].image,
                                name: message.users[3].name,
                                level: message.users[3].level
                            })
                        else if (playerNo === 4)
                            setTemmateInfos({
                                avatar: message.users[2].image,
                                name: message.users[2].name,
                                level: message.users[2].level
                            })
                        else
                            setTemmateInfos(false)
                        setEnemy1Infos({
                            avatar: message.users[0].image,
                            name: message.users[0].name,
                            level: message.users[0].level
                        })
                        setEnemy2Infos({
                            avatar: message.users[1].image,
                            name: message.users[1].name,
                            level: message.users[1].level
                        })
                    }
                    if (randomPics)
                        clearInterval(randomPics)
                    setGameStarted(false)
                    setRoomID(message.room.id)
                    setLoadMatch(false)
                    setAllSet(true)
                } else if (type === "playersReady") {
                    setLoadMatch(false)
                    setAllSet(true)
                } else if (type === "playerNo") {
                    setPlayerNo(message.playerNo)
                    setRoomID(message.id)
                    // console.log(message.id, message.playerNo)
                    setGameStarted(true)
                    // setChosenOne('quickMatch')
                } else if (type === "noRoomFound") {
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            type: 'joinMp',
                            message: {
                                user: user,
                            }
                        }))
                        setGameStarted(true)
                        setLoadMatch(true)
                        randomPics = setInterval(() => {
                            setRandomPic(picsList[Math.floor(Math.random() * picsList.length)])
                        }, 500);
                    }
                } else if (type === 'alreadySearching') {
                    setPlayerNo(message.playerNo)
                    setRoomID(message.id)
                    // console.log(message.id)
                    setGameStarted(true)
                    setLoadMatch(true)
                    randomPics = setInterval(() => {
                        setRandomPic(picsList[Math.floor(Math.random() * picsList.length)])
                    }, 500);
                } else if (type === 'hmed')
                    socket.close()
            }
        }

        if (allSet && roomID) {
            clearInterval(randomPics)
            setTimeout(() => {
                navigate(`../play/2vs2/${roomID}`)
            }, 2000);
        }

    }, [socket, user, allSet, roomID, alreadyChecked])

    const cancelTheGame = () => {
        // setSelectedFriends([])
        if (socket && socket.readyState === WebSocket.OPEN && user && roomID) {
            socket.send(JSON.stringify({
                type: 'quitMp',
                message: {
                    user: user,
                    id: roomID
                }
            }))
            navigate(`../game/solo/2vs2`)  // CHANGE LATER TO THIS ROUTE "game/solo/1vs1" !!!!!!!! DO NOT FORGET
            // setGameStarted(false)
            // setTmpRoomID(false)
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
                        type: 'quitMp',
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
                    type: 'quitMp',
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
        <div className='twovstwo' >
            <div className='twovstwo-dashboard' >
                <div className='twovstwo-dashboard-opponents' >
                    <div className='twovstwo-dashboard-opponent' >
                        <div className='twovstwo-dashboard-player' >
                            <div><img src={userImg} alt="profile-pic" /></div>
                            <div className='twovstwo-opponent-infos'>
                                <p>{user}</p>
                                <p>level {userLevel}</p>
                            </div>
                        </div>
                        {temmateInfos ? (
                            <div className='twovstwo-dashboard-player' >
                                <div><img src={temmateInfos.avatar} alt="profile-pic" /></div>
                                <div className='twovstwo-opponent-infos' >
                                    <p>{temmateInfos.name}</p>
                                    <p>level {temmateInfos.level}</p>
                                </div>
                            </div>
                        ) : (
                            <div className='twovstwo-dashboard-player' >
                                <div><img src={randomPic} alt="profile-pic" /></div>
                                <div className='twovstwo-opponent-infos-none' ></div>
                            </div>
                        )}
                    </div>
                    <div className={(!allSet && loadMatch) ? 'twovstwo-dashboard-logo twovstwo-dashboard-logo-loading' : 'twovstwo-dashboard-logo'} >
                        {(!loadMatch && allSet) ? (
                            <img id='versus-logo' src={Icons.versus} alt="profile-pic" />
                        ) : (loadMatch && !allSet) ? (
                            <>
                                <div id='paddle-1' ></div>
                                <div id='net' ></div>
                                <div id='ball' ></div>
                                <div id='paddle-2' ></div>
                            </>
                        ) : ''}
                    </div>
                    <div className='twovstwo-dashboard-opponent' >
                        {enemy1Infos ? (
                            <div className='twovstwo-dashboard-player' >
                                <div><img src={enemy1Infos.avatar} alt="profile-pic" /></div>
                                <div className='twovstwo-opponent-infos' >
                                    <p>{enemy1Infos.name}</p>
                                    <p>level {enemy1Infos.level}</p>
                                </div>
                            </div>
                        ) : (
                            <div className='twovstwo-dashboard-player' >
                                <div><img src={randomPic} alt="profile-pic" /></div>
                                <div className='twovstwo-opponent-infos-none' ></div>
                            </div>
                        )}
                        {enemy2Infos ? (<div className='twovstwo-dashboard-player' >
                            <div><img src={enemy2Infos.avatar} alt="profile-pic" /></div>
                            <div className='twovstwo-opponent-infos' >
                                <p>{enemy2Infos.name}</p>
                                <p>level {enemy2Infos.level}</p>
                            </div>
                        </div>) : (
                            <div className='twovstwo-dashboard-player' >
                                <div><img src={randomPic} alt="profile-pic" /></div>
                                <div className='twovstwo-opponent-infos-none' ></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {gameStarted && (<div className='twovstwo-cancel' ><div className='twovstwo-cancel-game' onClick={cancelTheGame} >cancel</div></div>)}
        </div>
    )
}

export default TwoVsTwoRandom