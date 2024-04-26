import React,  { useContext, useEffect, useState, useRef }  from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import { Link, useNavigate } from 'react-router-dom';
import * as Icons from '../assets/navbar-sidebar'

const OneVersusOne = () => {
    let { privateCheckAuth, socket, setSocket, user, socketRecreated, setSocketRecreated } = useContext(AuthContext)
    const textCopied = useRef(null)
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
    const allUsers =[
        {
            id: 1,
            name: 'mmaqbour',
            level: 2,
        },
        {
            id: 2,
            name: 'ekenane',
            level: 2,
        },
        {
            id: 3,
            name: 'rennaciri',
            level: 2,
        },
        {
            id: 4,
            name: 'aagouzou',
            level: 2,
        },
        {
            id: 5,
            name: 'idabligi',
            level: 2,
        }
    ]

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
                    // setSearchDisable(false)
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
                    navigate(`../play/1vs1/${message.roomID}`)
                } else if (type === "gameReady") {
                    console.log("inside gameReady")
                    setRoomID(message.id)
                    setAllSet(true)
                    // setStartDisable(false)
                } else if (type === "playersReady") {
                    console.log("inside playersReady")
                    setAllSet(true)
                } else if (type === "playerNo") {
                    console.log("inside playerNo")
                    setPlayerNo(message.playerNo)
                    setTmpRoomID(message.id)
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
            setTimeout(() => {
                console.log("navigating to the game page")
                navigate(`../play/1vs1/${roomID}`)
            }, 250);
        }
    }, [socket, start, allSet, roomID, tmpRoomID])

    const startSearch = async () => {
        if (socket && socket.readyState === WebSocket.OPEN && !start) {
            console.log("inside join")
            socket.send(JSON.stringify({
                type: 'join',
                message: {
                    user: user,
                }
            }))
            setStart(!start)
        } else if (socket && socket.readyState === WebSocket.OPEN && start) {
            console.log("inside join")
            socket.send(JSON.stringify({
                type: 'quit',
                message: {
                    user: user,
                    id: tmpRoomID
                }
            }))
            setTmpRoomID(false)
            setStart(!start)
        } else
            console.log('socket is null or not open, refresh')
    }

    const expandFriendsList = () => {
        setExpandFriends(!expandFriends)
        setExpandJoin(false)
        setExpandCreate(false)
        setExpandQuick(false)
    }
    
    const expandJoinRoom = () => {
        setExpandJoin(!expandJoin)
        setExpandFriends(false)
        setExpandCreate(false)
        setExpandQuick(false)
    }
    
    const expandCreateRoom = () => {
        setExpandCreate(!expandCreate)
        setExpandFriends(false)
        setExpandJoin(false)
        setExpandQuick(false)
    }
    
    const expandQuickMatch = () => {
        setExpandQuick(!expandQuick)
        setExpandCreate(false)
        setExpandFriends(false)
        setExpandJoin(false)
    }

    useEffect(() => {
        const closeAllSections = (e) => {
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

    const handleClick = (friend) => {
        if (selectedFriends.includes(friend)) {
          setSelectedFriends(selectedFriends.filter((selectedFriend) => selectedFriend !== friend));
        } else {
          setSelectedFriends([...selectedFriends, friend]);
        }
      };

    return (
        <div className='onevsone'>
            <div className='onevsone-dashboard'>
                <div className='onevsone-dashboard-selection'>
                    <div className='onevsone-dashboard-possibilities' id='onevsone-dashboard-friends' ref={friendsSection}>
                        <span onClick={expandFriendsList}>Friends</span>
                        {expandFriends && (<div className='expand-friends'>
                            {allUsers.map((user) => {
                                return (<div key={user.id} className='game-friend-list'>
                                    <div className='game-friend-profile'>
                                        <div>
                                            <img src={Icons.profilepic} alt="profile_pic" />
                                        </div>
                                        <div>
                                            <p>{user.name}</p>
                                            <p>level {user.level}</p>
                                        </div>
                                    </div>
                                    {selectedFriends.includes(user.name) && (
                                        <div className='game-friend-waiting'>
                                            <img src={Icons.waitClock} alt="game"/>
                                        </div>
                                    )}
                                    {!selectedFriends.includes(user.name) && (
                                        <div className='game-friend-invite' onClick={() => handleClick(user.name)}>
                                            <img src={Icons.console} alt="game"/>
                                            <span>Invite</span>
                                        </div>
                                    )}
                                    {/* <div className='game-friend-invite' onClick={sendInviteRequest}>
                                        <img src={Icons.console} alt="game"/>
                                        <span>Invite</span>
                                    </div> */}
                                </div>)
                            })}
                        </div>)}
                    </div>
                    <div className='onevsone-dashboard-possibilities' id='onevsone-dashboard-joining' ref={joinMatchSection}>
                        <span onClick={expandJoinRoom}>Join Match</span>
                        {expandJoin && (<div className='expand-joining'>
                            <p>Enter the code below to join the match</p>
                            <input type="text" placeholder='enter the code' required />
                            <div>Confirm</div>
                        </div>)}
                    </div>
                    <div className='onevsone-dashboard-possibilities' id='onevsone-dashboard-creation' ref={createMatchSection}>
                        <span onClick={expandCreateRoom}>Create match</span>
                        {expandCreate && <div className='expand-creating'>
                            <p>Generate and share the code with others to play together</p>
                            <div>Generate</div>
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
            <div className='onevsone-cancel'>Cancel</div>
        </div>
    )
}

export default OneVersusOne