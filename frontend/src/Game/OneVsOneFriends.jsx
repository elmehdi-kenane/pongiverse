import React, { useState, useContext, useEffect, useRef } from 'react'
import * as Icons from '../assets/navbar-sidebar'
import '../assets/navbar-sidebar/index.css'
import AuthContext from '../navbar-sidebar/Authcontext'
import { Link, useNavigate } from 'react-router-dom';

const OneVsOneFriends = () => {
	const picsList = [Icons.profilepic1, Icons.profilepic2, Icons.profilepic3, Icons.profilepic4]
	const [randomPic, setRandomPic] = useState(Icons.profilepic)
	const [gameStarted, setGameStarted] = useState(false)
	const [enemyInfos, setEnemyInfos] = useState(null)
	const [loadMatch, setLoadMatch] = useState(false)
	const [tmpRoomID, setTmpRoomID] = useState(null)
	const [allSet, setAllSet] = useState(false)
	const [playerNo, setPlayerNo] = useState(0)
	const [roomID, setRoomID] = useState(null)
	const [selectedFriends, setSelectedFriends] = useState([]);
	const [expandFriends, setExpandFriends] = useState(false)
	const expandFriendList = useRef(null)
	const friendsSection = useRef(null)
	const inviteFriend = useRef(null)
	const navigate = useNavigate()

	let randomPics
	// const [chosenOne, setChosenOne] = useState('')
	let { privateCheckAuth, socket, user,
		socketRecreated, setSocketRecreated,
		userImg, loading, allGameFriends,
		userImages, setAllGameFriends } = useContext(AuthContext)
	const allGameFriendsRef = useRef(allGameFriends);

	let isOut = false
	const userRef = useRef(user)
    const roomIdRef = useRef(tmpRoomID)
    const socketRef = useRef(socket)

    useEffect(() => {
        privateCheckAuth()
    }, [])

    useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN && user) {
			console.log("CHECKING IF PLAYER IN ROOM")
			socket.send(JSON.stringify({
				type: 'isPlayerInAnyRoom',
				message: {
					user: user,
					mode: '1vs1',
					type: 'friends'
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
					friendsSection.current.remove()
					setExpandFriends(false)
					setGameStarted(false)
					setRoomID(message.room.id)
					setLoadMatch(false)
					setAllSet(true)
					console.log("ALL SET BROTHER")
				} else if (type === "playersReady") {
					console.log("inside playersReady")
					setLoadMatch(false)
					setAllSet(true)
				} else if (type === "playerNo") {
					console.log("inside playerNo")
					setPlayerNo(message.playerNo)
					setTmpRoomID(message.id)
					setGameStarted(true)
					// setChosenOne('quickMatch')
				}
				else if (type === 'user_disconnected') {
					const currentAllGameFriends = allGameFriendsRef.current;
					console.log("user disconnected : ", allGameFriends)
					let uname = data.message.user
					setAllGameFriends(currentAllGameFriends.filter(user => user.name !== uname))
				} else if (type === 'connected_again') {
					const currentAllGameFriends = allGameFriendsRef.current;
					const userExists = currentAllGameFriends.some(friend => friend.name === message.user)
						if (!userExists)
							setAllGameFriends([...currentAllGameFriends, message.userInfos])
				}
				// else if (type === "noRoomFound") {
				//     console.log("inside noRoomFound")
				//     if (socket && socket.readyState === WebSocket.OPEN) {
				//         console.log("inside join")
				//         socket.send(JSON.stringify({
				//             type: 'join',
				//             message: {
				//                 user: user,
				//             }
				//         }))
				//         setGameStarted(true)
				//         setLoadMatch(true)
				//     }
				// }
				else if (type === 'alreadySearching') {
					console.log("inside alreadySearching")
					setPlayerNo(message.playerNo)
					setTmpRoomID(message.id)
					setGameStarted(true)
					setLoadMatch(true)
				}
				else if (type === 'playingStatus') {
					// console.log(message.user)
					// console.log(allGameFriends)
					const currentAllGameFriends = allGameFriendsRef.current;
					if (message.is_playing)
						setAllGameFriends(currentAllGameFriends.filter(friend => friend.name !== message.user))
					else {
						const userExists = currentAllGameFriends.some(friend => friend.name === message.user)
						if (!userExists)
							setAllGameFriends([...currentAllGameFriends, message.userInfos])
					}
					//     for (let i = 0;i < allGameFriends.length; i++) {
					//         console.log(allGameFriends[i].name)
					//     }
					// }
				}
				// else if (type === "removeRoom") {
				//     console.log("inside removeRoom")
				//     if (socket && socket.readyState === WebSocket.OPEN) {
				//         socket.send(JSON.stringify({
				//             type: 'OpponentIsOut',
				//             message: {
				//                 user: user,
				//                 roomID: roomID
				//             }
				//         }))
				//     }
				//     setPlayerNo(0)
				//     setAllSet(false)
				//     setRoomID(null)
				// }
				// else if (type === "alreadySearching") {
				//     setIsInSearchMode(true)
				//     setTimeout(() => {
				//         setIsInSearchMode(false)
				//     }, 5000);
				// } else if (type === "alreadyPlaying") {
				//     console.log("in a match buddy")
				//     setIsInPlayingMode(true)
				//     setTimeout(() => {
				//         setIsInPlayingMode(false)
				//     }, 5000);
				// }
			}
		}

		if (allSet && roomID) {
			console.log("inside allSet and roomID")
			clearInterval(randomPics)
			setTimeout(() => {
				navigate(`../play/1vs1/${roomID}`)
			}, 2000);
		}

	}, [socket, allSet, roomID, tmpRoomID])

	useEffect(() => {
		allGameFriendsRef.current = allGameFriends;
		userRef.current = user;
		roomIdRef.current = tmpRoomID;
		socketRef.current = socket;
	}, [allGameFriends, user, tmpRoomID, socket]);

	// useEffect(() => {
	//     console.log(allGameFriends)
	// }, [allGameFriends])

	const cancelTheGame = () => {
		// setSelectedFriends([])
		if (socket && socket.readyState === WebSocket.OPEN && user) {
			console.log("inside quit")
			socket.send(JSON.stringify({
				type: 'quit',
				message: {
					user: user,
					id: tmpRoomID
				}
			}))
			navigate(`../game/solo/1vs1`)  // CHANGE LATER TO THIS ROUTE "game/solo/1vs1" !!!!!!!! DO NOT FORGET
			// setGameStarted(false)
			// setTmpRoomID(false)
		} else
			console.log('socket is null or not open, refresh')
	}

	const inviteNewFriend = (friend) => {
		if (socket && socket.readyState === WebSocket.OPEN && user) {
			console.log("inside join")
			socket.send(JSON.stringify({
				type: 'inviteFriendGame',
				message: {
					user: user,
					target: friend
				}
			}))
			setSelectedFriends([...selectedFriends, friend])
			setTimeout(() => {
				setSelectedFriends(selectedFriends.filter(selectedFriend => selectedFriend !== friend))
			}, 2000);
			setGameStarted(true)
			// setGameStared(true)
		}
	};

	const expandFriendsList = () => {
		setExpandFriends(!expandFriends)
	}
	
	useEffect(() => {
        return () => {
            if (isOut) {
                const user = userRef.current
                const socket = socketRef.current
                const roomID = roomIdRef.current
                console.log("USER IS GETTING OUT ", user, roomID, socket)
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
            console.log("INSIDE THE MATCH : ", user, roomID, socket)
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
			<div className='onevsone-dashboard'>
				<div className='onevsone-dashboard-opponents'>
					<div className='onevsone-invite-friends' ref={friendsSection}>
						<div onClick={expandFriendsList} style={{display: 'flex', flexDirection: 'row', cursor: 'pointer', position: 'relative'}}>
							<img src={Icons.gameInvite} alt="" style={{width: '20%', paddingLeft: '5px'}} />
							<div className='invite-friends-button'>invite friend</div>
						</div>
					</div>
					{expandFriends && (<div className='expand-friends' ref={expandFriendList}>
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
					<div className='onevsone-dashboard-opponent'>
						<div>
							<img src={userImg} alt="profile-pic" style={{borderRadius: '50%'}} />
						</div>
						{/* {enemyInfos && (<div className='onevsone-opponent-infos'>
							<p>mmaqbour</p>
							<p>level 6.5</p>
						</div>)} */}
						<div className='onevsone-opponent-infos'>
							<p>mmaqbour</p>
							<p>level 6.5</p>
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
								<div>
									<img src={`data:image/jpeg;base64,${enemyInfos.avatar}`} alt="profile-pic" style={{borderRadius: '50%'}} />
								</div>
								<div className='onevsone-opponent-infos'>
									<p>{enemyInfos.name}</p>
									<p>level {enemyInfos.level}</p>
								</div>
							</>
						) : (
							<>
								<div>
									<img src={randomPic} alt="profile-pic"/>
									{/* <img src={Icons.profilepic} alt="profile-pic"/> */}
								</div>
								<div className={'onevsone-opponent-infos-none'}>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
			{gameStarted && (
				<div className='onevsone-cancel'>
					<div className='onevsone-cancel-game' onClick={cancelTheGame}>Cancel</div>
				</div>
			)}
		</div>
	)
}

export default OneVsOneFriends