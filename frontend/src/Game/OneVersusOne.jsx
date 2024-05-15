import React,  { useContext, useEffect, useState, useRef }  from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import { Link, useNavigate } from 'react-router-dom';
import * as Icons from '../assets/navbar-sidebar'

const OneVersusOne = () => {
    let { privateCheckAuth, socket, user,
        socketRecreated, setSocketRecreated, allGameFriends,
        loading, userImages} = useContext(AuthContext)
    const inviteFriend = useRef(null)
    const textCopied = useRef(null)
    const inputRoomId = useRef(null)
    const incorrectRoomId = useRef(null)
    const friendsSection = useRef(null)
    const joinMatchSection = useRef(null)
    const createMatchSection = useRef(null)
    const quickMatchSection = useRef(null)
    const [allSet, setAllSet] = useState(false)
    const [playerNo, setPlayerNo] = useState(0)
    const [roomID, setRoomID] = useState(null)
    const [tmpRoomID, setTmpRoomID] = useState(null)
    // const [start, setStart] = useState(false)
    const [expandFriends, setExpandFriends] = useState(false)
    const [expandJoin, setExpandJoin] = useState(false)
    const [expandCreate, setExpandCreate] = useState(false)
    const [expandQuick, setExpandQuick] = useState(false)
    const [image, setImage] = useState(Icons.copy)
    const [isCopied, setIsCopied] = useState(false)
    const navigate = useNavigate()
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [gameStarted, setGameStared] = useState(false)
    const [chosenOne, setChosenOne] = useState('')
    const [isInSearchMode, setIsInSearchMode] = useState(false)
    const [isInPlayingMode, setIsInPlayingMode] = useState(false)
    const [gameNotif, setGameNotif] = useState([])
    
    let inside = false
    let allGood = false

    useEffect(() => {
        privateCheckAuth()
    }, [])

    useEffect(() => {
        if (socket) {
            if (socketRecreated && user) {
                console.log("INSIDE RESTABISHMENT")
                socket.send(JSON.stringify({
                    type: 'dataBackUp',
                    message: {
                        user: user,
                        roomID: roomID,
                    }
                }))
                setSocketRecreated(false)
            } else if (!socketRecreated && user) {
                if (socket && socket.readyState === WebSocket.OPEN && user) {
                    console.log("CHECKING IF PLAYER IN ROOM")
                    socket.send(JSON.stringify({
                        type: 'isPlayerInAnyRoom',
                        message: {
                            user: user
                        }
                    }))
                }
            }
        }
    }, [socketRecreated, socket, user])

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.onmessage = (event) => {
                let data = JSON.parse(event.data)
                let type = data.type
                let message = data.message
                if (type === 'roomAlreadyStarted') {
                    setAllSet(true)
                    console.log("INSIDE THE ROOMALREADYSTARTED")
                    navigate(`../play/1vs1/${message.roomID}`)
                } else if (type === "gameReady") {
                    console.log("inside gameReady")
                    setRoomID(message.id)
                    setAllSet(true)
                    allGood = true
                    // navigate(`../play/1vs1/${message.roomID}`)
                } else if (type === "playersReady") {
                    console.log("inside playersReady")
                    setAllSet(true)
                } else if (type === "playerNo") {
                    console.log("inside playerNo")
                    setPlayerNo(message.playerNo)
                    setTmpRoomID(message.id)
                    setChosenOne('quickMatch')
                    setGameStared(true)
                } else if (type === "removeRoom") {
                    console.log("inside removeRoom")
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            type: 'OpponentIsOut',
                            message: {
                                user: user,
                                roomID: roomID
                            }
                        }))
                    }
                    // setStart(false)
                    setPlayerNo(0)
                    setAllSet(false)
                    setRoomID(null)
                } else if (type === "alreadySearching") {
                    setIsInSearchMode(true)
                    setTimeout(() => {
                        setIsInSearchMode(false)
                    }, 5000);
                } else if (type === "alreadyPlaying") {
                    console.log("in a match buddy")
                    setIsInPlayingMode(true)
                    setTimeout(() => {
                        setIsInPlayingMode(false)
                    }, 5000);
                } else if (type === 'receiveFriendGame') {
                    console.log("RECEIVED A GAME REQUEST")
                    setGameNotif((prevGameNotif) => [...prevGameNotif, message]);
                } else if (type === 'goToGamingPage') {
                    navigate(`../play/1vs1/${message.roomID}`)
                }
            }
        }

        if (allSet && roomID) {
            console.log("INSIDE THE ALLSET && ROOMID")
            navigate(`../play/1vs1/${roomID}`)
        }

    }, [socket, allSet, roomID, tmpRoomID])

    useEffect(() => {
        return () => {
            console.log(allSet, socket, user)
        }
    }, [socket, allSet, user])

    const expandFriendsList = () => {
        if (chosenOne === '' || chosenOne === 'friends') {
            // console.log("inside expandFriendsList")
            setExpandFriends(!expandFriends)
            setExpandJoin(false)
            setExpandCreate(false)
            setExpandQuick(false)
        }
    }

    const expandJoinRoom = () => {
        if (chosenOne === '' || chosenOne === 'joinMatch') {
            setExpandJoin(!expandJoin)
            setExpandFriends(false)
            setExpandCreate(false)
            setExpandQuick(false)
        }
    }

    const expandCreateRoom = () => {
        if (chosenOne === '' || chosenOne === 'createMatch') {
            setExpandCreate(!expandCreate)
            setExpandFriends(false)
            setExpandJoin(false)
            setExpandQuick(false)
        }
    }

    const expandQuickMatch = () => {
        if (chosenOne === '') {
            if (socket && socket.readyState === WebSocket.OPEN) {
                console.log("inside join")
                socket.send(JSON.stringify({
                    type: 'join',
                    message: {
                        user: user,
                    }
                }))
                setExpandQuick(!expandQuick)
                setExpandCreate(false)
                setExpandFriends(false)
                setExpandJoin(false)
                setChosenOne('quickMatch')
                setGameStared(true)
                // setStart(!start)
            } else
                console.log('socket is null or not open, refresh')
        }
    }

    useEffect(() => {
        const closeAllSections = (e) => {
            if (e.target && friendsSection.current && inviteFriend.current && joinMatchSection.current && createMatchSection.current && quickMatchSection.current) {
                if (!friendsSection.current.contains(e.target)
                && !joinMatchSection.current.contains(e.target)
                && !createMatchSection.current.contains(e.target)
                && !quickMatchSection.current.contains(e.target)) {
                    setExpandQuick(false)
                    setExpandCreate(false)
                    setExpandFriends(false)
                    setExpandJoin(false)
                }
            }
        }
        window.addEventListener('click', closeAllSections)
        return () => {
            window.removeEventListener('click', closeAllSections)
        }
    }, [])

    const changeIfTextCopied = () => {
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

    const inviteNewFriend = (friend) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log("inside join")
            socket.send(JSON.stringify({
                type: 'inviteFriendGame',
                message: {
                    user: user,
                    target: friend
                }
            }))
            setSelectedFriends([...selectedFriends, friend])
            setChosenOne('friends')
            setGameStared(true)
        }
    };

    const cancelTheGame = () => {
        setSelectedFriends([])
        if (chosenOne === 'quickMatch') {
            if (socket && socket.readyState === WebSocket.OPEN) {
                console.log("inside join")
                socket.send(JSON.stringify({
                    type: 'quit',
                    message: {
                        user: user,
                        id: tmpRoomID
                    }
                }))
                setGameStared(false)
                setChosenOne('')
                setTmpRoomID(false)
            } else
                console.log('socket is null or not open, refresh')
        }
    }

    const joinToNewMatch = () => {
        const regex = /^\d{7,}$/;
        if (regex.test(inputRoomId.current.value)) {
            // send to the server to check if exist
            inputRoomId.current.value = ''
            setGameStared(true)
            setChosenOne('joinMatch')
        } else {
            inputRoomId.current.style.border = '1px solid red';
            incorrectRoomId.current.style.display = 'block'
            setTimeout(() => {
                inputRoomId.current.style.border = '1px solid white';
                incorrectRoomId.current.style.display = 'none'
            }, 2000);
        }
    }

    const createNewMatch = () => {
        // send to the server to create a new room
        setGameStared(true)
        setChosenOne('createMatch')
    }

    const acceptInvitation = (creator) => {
        setGameNotif(gameNotif.filter((user) => user.user !== creator))
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log("inside join")
            socket.send(JSON.stringify({
                type: 'acceptInvitation',
                message: {
                    user: creator,
                    target: user
                }
            }))
        }
    }

    const refuseInvitation = (creator) => {
        setGameNotif(gameNotif.filter((user) => user.user !== creator))
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log("inside join")
            socket.send(JSON.stringify({
                type: 'acceptInvitation',
                message: {
                    user: creator,
                    target: user
                }
            }))
        }
    }

    return (
        <div className='onevsone'>
            <div className='onevsone-dashboard'>
                <div className='onevsone-dashboard-selection'>
                    <div className='onevsone-dashboard-possibilities' id='onevsone-dashboard-friends' ref={friendsSection}>
                        <span onClick={expandFriendsList}>Friends</span>
                        {expandFriends && (<div className='expand-friends'>
                            {(allGameFriends.length && !loading) ? allGameFriends.map((user, key) => {
                                return (<div key={user.id} className='game-friend-list'>
                                    <div className='game-friend-profile'>
                                        <div>
                                            <img src={userImages[key]}/>
                                        </div>
                                        <div>
                                            <p>{user.name}</p>
                                            <p>level {user.level}</p>
                                        </div>
                                    </div>
                                    <div ref={inviteFriend} className={(!selectedFriends.includes(user.name)) ? 'game-friend-invite' : 'game-friend-waiting'} onClick={() => ((!selectedFriends.includes(user.name)) ? inviteNewFriend(user.name) : '')}>
                                        {(!selectedFriends.includes(user.name) && (<>
                                            <img src={Icons.console} alt="game"/>
                                            Invite
                                        </>)) || (selectedFriends.includes(user.name) && (<img src={Icons.waitClock} alt="game"/>))}
                                    </div>
                                </div>)
                            }) : (!allGameFriends.length && !loading) ? (
                                <div className='game-friend-loading'>
                                    <span>there is no friend available</span>
                                </div>
                            ) : (
                                <div className='game-friend-loading'>
                                    <img src={Icons.loading} alt="game"/>
                                </div>
                            )}
                        </div>)}
                    </div>
                    <div className='onevsone-dashboard-possibilities' id='onevsone-dashboard-joining' ref={joinMatchSection}>
                        <span onClick={expandJoinRoom}>Join Match</span>
                        {expandJoin && (<div className='expand-joining'>
                            <p>Enter the code below to join the match</p>
                            <input ref={inputRoomId} type="text" placeholder='enter the code' required />
                            <span ref={incorrectRoomId} id='incorrect-id'>Must be 7 or more numbers</span>
                            <div onClick={joinToNewMatch}>Confirm</div>
                        </div>)}
                    </div>
                    <div className='onevsone-dashboard-possibilities' id='onevsone-dashboard-creation' ref={createMatchSection}>
                        <span onClick={expandCreateRoom}>Create match</span>
                        {expandCreate && <div className='expand-creating'>
                            <p>Generate and share the code with others to play together</p>
                            <div onClick={createNewMatch}>Generate</div>
                            <div>
                                <span ref={textCopied}>1859336542</span>
                                <img src={image} alt="copy" onClick={changeIfTextCopied} />
                            </div>
                        </div>}
                    </div>
                    <div className='onevsone-dashboard-possibilities' id='onevsone-dashboard-matchmaking' ref={quickMatchSection}>
                        <span onClick={expandQuickMatch}>Quick Match</span>
                    </div>
                </div>
                <div className='onevsone-dashboard-opponents' style={{position: "relative"}}>
                    <div className='onevsone-dashboard-opponent'>
                        <div>
                            <img src={Icons.profilepic} alt="profile-pic"/>
                        </div>
                        <div className='onevsone-opponent-infos'>
                            <p>mmaqbour</p>
                            <p>level 6.5</p>
                        </div>
                    </div>
                    <div className='onevsone-dashboard-logo'>
                        <img src={Icons.versus} alt="profile-pic" />
                    </div>
                    <div className='onevsone-dashboard-opponent'>
                        <div>
                            <img src={Icons.profilepic} alt="profile-pic"/>
                        </div>
                        <div className='onevsone-opponent-infos'>
                            <p>mmaqbour</p>
                            <p>level 6.5</p>
                        </div>
                    </div>
                    {isInSearchMode && (<div style={{backgroundColor: "black", color: "white", position: "absolute", top: "0", left: "50%", transform: "translate(-50%)", padding: "10px 30px"}}>Already searching for a Match</div>)}
                    {isInPlayingMode && (<div style={{backgroundColor: "black", color: "white", position: "absolute", top: "0", left: "50%", transform: "translate(-50%)", padding: "10px 30px"}}>Already in a Match, refresh to continue</div>)}
                </div>
            </div>
            <div className='cancel-game-invite-request'>
                {(gameNotif.length) ? (
                    <div className='game-invitations'>
                        {gameNotif.map((user, key) => {
                            return ((
                                <div key={key} className='game-invitation'>
                                    <img src={`data:image/jpeg;base64,${user.avatar}`} alt="profile-pic" />
                                    <div className='user-infos'>
                                        <span>{user.user}</span>
                                        <span>level 2.5</span>
                                    </div>
                                    <div className='invitation-mode'>
                                        <span>1</span>
                                        <span>vs</span>
                                        <span>1</span>
                                    </div>
                                    <div className='accept-refuse'>
                                        <div onClick={() => acceptInvitation(user.user)}>
                                            <img src={Icons.copied} alt="accept-icon" />
                                        </div>
                                        <div onClick={() => refuseInvitation(user.user)}>
                                            <img src={Icons.cancel} alt="refuse-icon" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        })}
                    </div>
                    ) : ''
                }
                {gameStarted && (<div className='onevsone-cancel' onClick={cancelTheGame}>Cancel</div>)}
            </div>
        </div>
    )
}

export default OneVersusOne