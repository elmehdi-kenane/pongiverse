import React,  { useContext, useEffect, useState, useRef }  from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import { Link, useNavigate } from 'react-router-dom';
import * as Icons from '../assets/navbar-sidebar'

const OneVersusOne = () => {
    let { privateCheckAuth, socket, setSocket, user, socketRecreated, setSocketRecreated } = useContext(AuthContext)
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
    const [start, setStart] = useState(false)
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
    const [allUsers, setallUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        privateCheckAuth()
    }, [])
    
    useEffect(() => {
        const getAllFriends = async () => {
            try {
                let response = await fetch('http://localhost:8000/api/allFriends', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user: user
                    })
                })
                let friends = await response.json()
                console.log(friends.message)
                if (friends.message.length) {
                    setallUsers(friends.message)
                    setLoading(false)
                } else
                    setLoading(false)

            } catch (e) {
                console.log("something wrong with fetch")
            }
        }
        if (user)
            getAllFriends()
    }, [user])

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
                    setStart(false)
                    setPlayerNo(0)
                    setAllSet(false)
                    setRoomID(null)
                }
            }
        }

        if (allSet && roomID) {
            console.log("INSIDE THE ALLSET && ROOMID")
            navigate(`../play/1vs1/${roomID}`)
        }

    }, [socket, start, allSet, roomID, tmpRoomID])

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
            // if (e.target && friendsSection.current && inviteFriend.current && joinMatchSection.current && createMatchSection.current && quickMatchSection.current) {
                if (!friendsSection.current.contains(e.target)
                && !joinMatchSection.current.contains(e.target)
                && !createMatchSection.current.contains(e.target)
                && !quickMatchSection.current.contains(e.target)) {
                    setExpandQuick(false)
                    setExpandCreate(false)
                    setExpandFriends(false)
                    setExpandJoin(false)
                }
            // }
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
        if (selectedFriends.includes(friend)) {
            setSelectedFriends(selectedFriends.filter((selectedFriend) => selectedFriend !== friend));
        } else {
            setSelectedFriends([...selectedFriends, friend]);
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

    return (
        <div className='onevsone'>
            <div className='onevsone-dashboard'>
                <div className='onevsone-dashboard-selection'>
                    <div className='onevsone-dashboard-possibilities' id='onevsone-dashboard-friends' ref={friendsSection}>
                        <span onClick={expandFriendsList}>Friends</span>
                        {expandFriends && (<div className='expand-friends'>
                            {(allUsers.length && !loading) ? allUsers.map((user) => {
                                return (<div key={user.id} className='game-friend-list'>
                                    <div className='game-friend-profile'>
                                    {/* src={`data:image/jpeg;base64,${userData.profile_picture_base64}`} */}
                                        <div>
                                            <img src={`data:image/jpeg;base64,${user.image}`} alt="profile_pic" />
                                        </div>
                                        <div>
                                            <p>{user.name}</p>
                                            <p>level {user.level}</p>
                                        </div>
                                    </div>
                                    {/* {selectedFriends.includes(user.name) && (
                                        <div className='game-friend-waiting'>
                                            <img src={Icons.waitClock} alt="game"/>
                                        </div>
                                    )} */}
                                    <div ref={inviteFriend} className={(!selectedFriends.includes(user.name)) ? 'game-friend-invite' : 'game-friend-waiting'} onClick={() => ((!selectedFriends.includes(user.name)) ? inviteNewFriend(user.name) : '')}>
                                        {(!selectedFriends.includes(user.name) && (<>
                                            <img src={Icons.console} alt="game"/>
                                            Invite
                                        </>)) || (selectedFriends.includes(user.name) && (<img src={Icons.waitClock} alt="game"/>))}
                                    </div>
                                </div>)
                            }) : (!allUsers.length && !loading) ? (
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
                <div className='onevsone-dashboard-opponents'>
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
                </div>
            </div>
            {gameStarted && (<div className='onevsone-cancel' onClick={cancelTheGame}>Cancel</div>)}
        </div>
    )
}

export default OneVersusOne