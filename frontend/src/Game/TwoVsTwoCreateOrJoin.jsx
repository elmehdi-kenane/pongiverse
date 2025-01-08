import React, { useContext, useState, useEffect, useRef } from 'react'
import * as Icons from '../assets/navbar-sidebar'
import '../assets/navbar-sidebar/index.css'
import AuthContext from '../navbar-sidebar/Authcontext'
import { Link, useNavigate } from 'react-router-dom';

const TwoVsTwoCreateOrJoin = () => {
    const [randomPic, setRandomPic] = useState(Icons.profilepic)
    const [gameStarted, setGameStarted] = useState(false)
    const [enemyInfos, setEnemyInfos] = useState(null)
    const [loadMatch, setLoadMatch] = useState(false)
    const [tmpRoomID, setTmpRoomID] = useState(null)
    const [allSet, setAllSet] = useState(false)
    const [playerNo, setPlayerNo] = useState(0)
    const [roomID, setRoomID] = useState(null)
    const [expandCreate, setExpandCreate] = useState(false)
    const [expandJoin, setExpandJoin] = useState(false)
    const textCopied = useRef(null)
    const [codeToShare, setCodeToShare] = useState('')
    const [isCopied, setIsCopied] = useState(false)
    const [image, setImage] = useState(Icons.copy)
    const inputRoomId = useRef(null)
    const [matchCreated, setMatchCreated] = useState(false)
    const [matchJoined, setMatchJoined] = useState(false)
    const [checkingCode, setCheckingCode] = useState(false)
    const [roomIdIncorrect, setRoomIdIncorrect] = useState(false)
    const [temmateInfos, setTemmateInfos] = useState(false)
    const [enemy1Infos, setEnemy1Infos] = useState(false)
    const [enemy2Infos, setEnemy2Infos] = useState(false)
    const playerNoRef = useRef(playerNo)
    const expandCreateRef = useRef(null)
    const expandJoinRef = useRef(null)
    const generateCodeRef = useRef(null)
    const navigate = useNavigate()
    let { privateCheckAuth, socket, user,
        socketRecreated, setSocketRecreated,
        userImg, loading, userLevel, notifSocket, setChatNotificationCounter, addNotificationToList, notifications,
        setNotifications } = useContext(AuthContext)

    let isOut = false
    const userRef = useRef(user)
    const roomIdRef = useRef(tmpRoomID)
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
                    mode: '2vs2',
                    type: 'create_join'
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
                }
                else if (type === 'gameOnHold') {
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
                        }
                        else {
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
                    setGameStarted(false)
                    setRoomID(message.room.id)
                    setLoadMatch(false)
                    setExpandCreate(false)
                    setExpandJoin(false)
                    setMatchCreated(true)
                    setMatchJoined(true)
                    setAllSet(true)
                } else if (type === "playersReady") {
                    setLoadMatch(false)
                    setAllSet(true)
                } else if (type === "playerNo") {
                    setPlayerNo(message.playerNo)
                    setTmpRoomID(message.id)
                    setGameStarted(true)
                } else if (type === "playerInfos") {
                    setPlayerNo(message.playerNo)
                    setTmpRoomID(message.id)
                    setExpandJoin(false)
                    setMatchCreated(true)
                    setGameStarted(true)
                    setLoadMatch(true) ////////////
                    if (!message.creator) {
                        setExpandCreate(false)
                        setMatchJoined(true)
                    } else
                        setCodeToShare(message.id)
                } else if (type === 'alreadySearching') {
                    setPlayerNo(message.playerNo)
                    setTmpRoomID(message.id)
                    setExpandJoin(false)
                    setMatchCreated(true)
                    setGameStarted(true)
                    setLoadMatch(true)
                    if (!message.creator) {
                        setExpandCreate(false)
                        setMatchJoined(true)
                    } else
                        setCodeToShare(message.id)
                } else if (type === 'invalidCode') {
                    inputRoomId.current.value = ''
                    setRoomIdIncorrect(true)
                    setCheckingCode(false)
                } else if (type === 'creatorOut') {
                    navigate(`../game/solo/2vs2`)
                } else if (type === 'hmed')
                    socket.close()
            }
        }

        if (allSet && roomID) {
            setTimeout(() => {
                navigate(`../play/2vs2/${roomID}`)
            }, 2000);
        }

    }, [socket, allSet, roomID, tmpRoomID])

    useEffect(() => {
        playerNoRef.current = playerNo;
        userRef.current = user;
        roomIdRef.current = tmpRoomID;
        socketRef.current = socket;
    }, [playerNo, user, tmpRoomID, socket]);

    const cancelTheGame = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'quitMp',
                message: {
                    user: user,
                    id: tmpRoomID
                }
            }))
            navigate(`../game/solo/2vs2`)  // CHANGE LATER TO THIS ROUTE "game/solo/1vs1" !!!!!!!! DO NOT FORGET
        } else
            console.log('socket is null or not open, refresh')
    }



    const expandCreateRoom = () => {
        setExpandCreate(!expandCreate)
        setExpandJoin(false)
    }

    const expandJoinRoom = () => {
        setExpandJoin(!expandJoin)
        setExpandCreate(false)
    }

    const createNewMatch = () => {
        if (!checkingCode) {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'createRoomMp',
                    message: {
                        user: user,
                    }
                }))
                setMatchCreated(true)
                setGameStarted(true)
            }
        }
    }

    const changeIfTextCopied = () => {
        if (!textCopied.current.textContent)
            return
        if (!isCopied) {
            setImage(Icons.copied)
            navigator.clipboard.writeText(textCopied.current.textContent)
            setTimeout(() => {
                setImage(Icons.copy)
                setIsCopied(false)
            }, 2000);
        }
        setIsCopied(true)
    }

    const joinToNewMatch = () => {
        const regex = /^\d{7,}$/;
        const value = inputRoomId.current.value
        if (!checkingCode) {
            if (regex.test(inputRoomId.current.value)) {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    inputRoomId.current.value = ''
                    setRoomIdIncorrect(false)
                    setCheckingCode(true)
                    socket.send(JSON.stringify({
                        type: 'checkingRoomCodeMp',
                        message: {
                            user: user,
                            roomCode: value
                        }
                    }))
                }
            } else {
                setRoomIdIncorrect(true)
            }
        }
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
        <div className='twovstwo'>
            <div className='twovstwo-dashboard'>
                <div className='twovstwo-dashboard-opponents'>
                    {!matchJoined && (<div className='twovstwo-create-room' ref={expandCreateRef}>
                        <div onClick={expandCreateRoom} style={{ display: 'flex', flexDirection: 'row', cursor: 'pointer', position: 'relative', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <img src={Icons.gameInvite} alt="" style={{ paddingLeft: '5px' }} />
                            <div className='invite-friends-button'>create match</div>
                        </div>
                    </div>)}
                    {expandCreate && (<div className='expand-create-room' style={{ display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '12px', fontWeight: '500' }} >
                        {!matchCreated ? (<p style={{ margin: '0 8px' }} >press Generate and share the code with others to play together</p>) : (<p style={{ margin: '0 8px' }} >Now you can share the code with others to play together</p>)}
                        {!matchCreated && (<div style={{ margin: '0 8px', textAlign: 'center', backgroundColor: '#913DCE', padding: '6px', borderRadius: '5px' }} onClick={createNewMatch} ref={generateCodeRef} >Generate</div>)}
                        <div style={{ margin: '0 8px', display: 'flex', alignItems: 'center', backgroundColor: '#EAD3D6', color: 'black', padding: '6px', borderRadius: '5px' }}>
                            <span style={{ display: 'block', textAlign: 'left', width: '100%', marginLeft: '0', color: 'black' }} ref={textCopied}>{codeToShare}</span>
                            <img style={{ marginRight: '0', width: '18px' }} src={image} alt="copy" onClick={changeIfTextCopied} />
                        </div>
                    </div>)}
                    {!matchCreated && (<div className='twovstwo-join-room' ref={expandJoinRef}>
                        <div onClick={expandJoinRoom} style={{ display: 'flex', flexDirection: 'row', cursor: 'pointer', position: 'relative', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <img src={Icons.gameInvite} alt="" style={{ paddingLeft: '5px' }} />
                            <div className='invite-friends-button'>join match</div>
                        </div>
                    </div>)}
                    {expandJoin && !matchCreated && (<div className='expand-join-room' style={{ display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '12px', fontWeight: '500' }} >
                        <p style={{ margin: '0 8px' }} >Enter the code below to join the match</p>
                        <input style={{ margin: '0 8px', outline: 'none', border: '1px solid #EAD3D6', backgroundColor: 'transparent', padding: '6px', borderRadius: '5px', textIndent: '8px', color: 'white' }} ref={inputRoomId} type="text" maxLength={20} placeholder='enter the code' required />
                        {roomIdIncorrect && (<span style={{ margin: '0 8px', fontSize: '11px', display: 'block' }} id='incorrect-id'>Invalid code. Please try again.</span>)}
                        <div style={{ margin: '0 8px', textAlign: 'center', backgroundColor: '#913DCE', padding: '6px', borderRadius: '5px' }} onClick={joinToNewMatch}>Confirm</div>
                    </div>)}
                    <div className='twovstwo-dashboard-opponent'>
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
                    <div className='twovstwo-dashboard-opponent'>
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
                        {enemy2Infos ? (
                            <div className='twovstwo-dashboard-player' >
                                <div><img src={enemy2Infos.avatar} alt="profile-pic" /></div>
                                <div className='twovstwo-opponent-infos' >
                                    <p>{enemy2Infos.name}</p>
                                    <p>level {enemy2Infos.level}</p>
                                </div>
                            </div>
                        ) : (
                            <div className='twovstwo-dashboard-player' >
                                <div><img src={randomPic} alt="profile-pic" /></div>
                                <div className='twovstwo-opponent-infos-none' ></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {gameStarted && (
                <div className='twovstwo-cancel'>
                    <div className='twovstwo-cancel-game' onClick={cancelTheGame}>Cancel</div>
                </div>
            )}
        </div>
    )
}

export default TwoVsTwoCreateOrJoin