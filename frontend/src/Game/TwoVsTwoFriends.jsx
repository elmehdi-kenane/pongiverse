import React, { useState, useContext, useEffect, useRef } from 'react'
import * as Icons from '../assets/navbar-sidebar'
import '../assets/navbar-sidebar/index.css'
import AuthContext from '../navbar-sidebar/Authcontext'
import { Link, useNavigate } from 'react-router-dom';

const TwoVsTwoFriends = () => {
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
	const [temmateInfos, setTemmateInfos] = useState(false)
	const [enemy1Infos, setEnemy1Infos] = useState(false)
	const [enemy2Infos, setEnemy2Infos] = useState(false)
	const expandFriendList = useRef(null)
	const friendsSection = useRef(null)
	const inviteFriend = useRef(null)
	const playerNoRef = useRef(playerNo)
	const navigate = useNavigate()

	let randomPics
	// const [chosenOne, setChosenOne] = useState('')
	let { privateCheckAuth, socket, user,
		socketRecreated, setSocketRecreated,
		userImg, loading, allGameFriends,
		userImages, setAllGameFriends, userLevel, notifSocket, setChatNotificationCounter, addNotificationToList, notifications,
		setNotifications } = useContext(AuthContext)
	const allGameFriendsRef = useRef(allGameFriends);

	let isOut = false
	const userRef = useRef(user)
	const roomIdRef = useRef(tmpRoomID)
	const socketRef = useRef(socket)

	// useEffect(() => {
	// 	privateCheckAuth()
	// }, [])

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN && user) {
			////console.log("CHECKING IF PLAYER IN ROOM")
			socket.send(JSON.stringify({
				type: 'isPlayerInAnyRoom',
				message: {
					user: user,
					mode: '2vs2',
					type: 'friends'
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
				if (type === 'connected_again') {
					////console.log("****IS A FRIEND:", message.is_a_friend);
					const currentAllGameFriends = allGameFriendsRef.current;
					////console.log("*******IWA YAHAMIIIIID:", message.user)
					if (message.is_a_friend === true) {
						const userExists = currentAllGameFriends.some(friend => friend.name === message.user)
						if (!userExists)
							setAllGameFriends([...currentAllGameFriends, message.userInfos])
					}
				} else if (type === 'user_disconnected') {
					const currentAllGameFriends = allGameFriendsRef.current;
					////console.log("user disconnected : ", allGameFriends)
					let uname = data.message.user
					setAllGameFriends(currentAllGameFriends.filter(user => user.name !== uname))
				} else if (type === "chatNotificationCounter") {
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
				////console.log("TYYYYPE:", type);
				let message = data.message
				if (type === 'roomAlreadyStarted') {
					////console.log("inside roomAlreadyStarted")
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
					friendsSection.current.remove()
					setExpandFriends(false)
					setGameStarted(false)
					setRoomID(message.room.id)
					setLoadMatch(false)
					setAllSet(true)
				} else if (type === "playersReady") {
					setLoadMatch(false)
					setAllSet(true)
				} else if (type === "playerNo") {
					setPlayerNo(message.playerNo)
					setTmpRoomID(message.id)
					setGameStarted(true)
					setLoadMatch(true)
				} else if (type === 'user_disconnected') {
					const currentAllGameFriends = allGameFriendsRef.current;
					let uname = data.message.user
					setAllGameFriends(currentAllGameFriends.filter(user => user.name !== uname))
				} else if (type === 'connected_again') {
					////console.log("****IS A FRIEND:", message.is_a_friend);
					const currentAllGameFriends = allGameFriendsRef.current;
					////console.log("*******IWA YAHAMIIIIID:", message.user)
					if (message.is_a_friend === true) {
						const userExists = currentAllGameFriends.some(friend => friend.name === message.user)
						if (!userExists)
							setAllGameFriends([...currentAllGameFriends, message.userInfos])
					}
				} else if (type === 'alreadySearching') {
					////console.log("inside alreadySearching")
					setPlayerNo(message.playerNo)
					setTmpRoomID(message.id)
					setGameStarted(true)
					setLoadMatch(true)
				} else if (type === 'playingStatus') {
					const currentAllGameFriends = allGameFriendsRef.current;
					if (message.is_playing)
						setAllGameFriends(currentAllGameFriends.filter(friend => friend.name !== message.user))
					else {
						const userExists = currentAllGameFriends.some(friend => friend.name === message.user)
						if (!userExists)
							setAllGameFriends([...currentAllGameFriends, message.userInfos])
					}
				} else if (type === 'blocked-friend' || type === 'remove-friendship') {
					const currentAllGameFriends = allGameFriendsRef.current;
					let username = message.second_username
					setAllGameFriends(currentAllGameFriends.filter(user => user.name !== username))
				} else if (type === 'hmed')
					socket.close()
			}
		}

		if (allSet && roomID) {
			////console.log("inside allSet and roomID")
			// clearInterval(randomPics)
			setTimeout(() => {
				navigate(`../play/2vs2/${roomID}`)
			}, 2000);
		}

	}, [socket, allSet, roomID, tmpRoomID])

	useEffect(() => {
		allGameFriendsRef.current = allGameFriends;
		playerNoRef.current = playerNo;
		userRef.current = user;
		roomIdRef.current = tmpRoomID;
		socketRef.current = socket;
	}, [allGameFriends, playerNo, user, tmpRoomID, socket]);

	// useEffect(() => {
	//     console.log(allGameFriends)
	// }, [allGameFriends])

	const cancelTheGame = () => {
		// setSelectedFriends([])
		if (socket && socket.readyState === WebSocket.OPEN && user && tmpRoomID) {
			////console.log("inside quit")
			socket.send(JSON.stringify({
				type: 'quitMp',
				message: {
					user: user,
					id: tmpRoomID
				}
			}))
			navigate(`../game/solo/2vs2`)  // CHANGE LATER TO THIS ROUTE "game/solo/1vs1" !!!!!!!! DO NOT FORGET
			// setGameStarted(false)
			// setTmpRoomID(false)
		} else
			console.log('socket is null or not open, refresh')
	}

	const inviteNewFriend = (friend) => {
		if (socket && socket.readyState === WebSocket.OPEN && user) {
			////console.log("inside join")
			socket.send(JSON.stringify({
				type: 'inviteFriendGameMp',
				message: {
					user: user,
					target: friend
				}
			}))
			setSelectedFriends(prevSelectedFriends => {
				const updatedFriends = [...prevSelectedFriends, friend];
				setTimeout(() => {
					setSelectedFriends(prevSelectedFriends =>
						prevSelectedFriends.filter(selectedFriend => selectedFriend !== friend)
					);
				}, 2000);
				return updatedFriends;
			});
			setGameStarted(true)
			// setLoadMatch(true)
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
				////console.log("USER IS GETTING OUT ", user, roomID, socket)
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
			////console.log("INSIDE THE MATCH : ", user, roomID, socket)
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
					<div className='twovstwo-invite-friends' ref={friendsSection}>
						<div onClick={expandFriendsList} style={{ display: 'flex', flexDirection: 'row', cursor: 'pointer', position: 'relative' }}>
							<img src={Icons.gameInvite} alt="" style={{ width: '20%', paddingLeft: '5px' }} />
							<div className='invite-friends-button'>invite friend</div>
						</div>
					</div>
					{expandFriends && (<div className='expand-friends' ref={expandFriendList}>
						{(allGameFriends.length && !loading) ? allGameFriends.map((user, key) => {
							return (<div key={user.id} className='game-friend-list'>
								<div className='game-friend-profile'>
									<div>
										<img src={user.image} />
									</div>
									<div>
										<p>{user.name}</p>
										<p>level {user.level}</p>
									</div>
								</div>
								<div ref={inviteFriend} className={(!selectedFriends.includes(user.name)) ? 'game-friend-invite' : 'game-friend-waiting'} onClick={() => ((!selectedFriends.includes(user.name)) ? inviteNewFriend(user.name) : '')}>
									{(!selectedFriends.includes(user.name) && (<>
										<img src={Icons.console} alt="game" />
										Invite
									</>)) || (selectedFriends.includes(user.name) && (<img src={Icons.waitClock} alt="game" />))}
								</div>
							</div>)
						}) : (!allGameFriends.length && !loading) ? (
							<div className='game-friend-loading'>
								<span>there is no friend available</span>
							</div>
						) : (
							<div className='game-friend-loading'>
								<img src={Icons.loading} alt="game" />
							</div>
						)}
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
				<div className='onevsone-cancel'>
					<div className='onevsone-cancel-game' onClick={cancelTheGame}>Cancel</div>
				</div>
			)}
		</div>
	)
}

export default TwoVsTwoFriends