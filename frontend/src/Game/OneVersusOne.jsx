import React, { useContext, useEffect, useState, useRef } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import { useNavigate } from 'react-router-dom';
import * as Icons from '../assets/navbar-sidebar'

const OneVersusOne = () => {
    const [roomID, setRoomID] = useState(null)
    let { privateCheckAuth, socket, user,
		setAllGameNotifs, allGameNotifs, notifsImgs,
		notifSocket, setSocket } = useContext(AuthContext)
    const [selected, setSelected] = useState(0)
    const navigate = useNavigate()

    const quickMatch = () => {
        setSelected(1)
    }

    const friendMatch = () => {
        setSelected(2)
    }

    const createJoinMatch = () => {
        setSelected(3)
    }

    const returnBackwards = () => {
        navigate('../game/solo')
    }

    const nextPage = () => {
        // console.log(socket, socket.readyState === WebSocket.OPEN, user)
        if (selected === 1) {
            navigate('../game/solo/1vs1/random')
        }
        if (selected === 2) {
            navigate('../game/solo/1vs1/friends')
        }
        if (selected === 3) {
            navigate('../game/solo/1vs1/create-or-join')
        }
    }

    // FOR THE GAME NOTIFICATIONS - START -

	useEffect(() => {
		if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
			notifSocket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				let message = data.message
				if (type === 'goToGamingPage') {
					// console.log("navigating now")
					// navigate(`/mainpage/game/solo/1vs1/friends`)
					if (socket.readyState !== WebSocket.OPEN) {
						const newSocket = new WebSocket(`ws://${import.meta.env.VITE_IPADDRESS}:8000/ws/socket-server`)
						newSocket.onopen = () => {
							console.log("+++++++++++=======+++++++++")
							console.log("GAME SOCKET OPENED AND NOW WE WILL MOVE TO FRIEND PAGE")
							console.log("+++++++++++=======+++++++++")
							setSocket(newSocket)
							if (message.mode === '1vs1')
								navigate(`/mainpage/game/solo/1vs1/friends`)
							else
								navigate(`/mainpage/game/solo/2vs2/friends`)
						}
					} else {
						if (message.mode === '1vs1')
							navigate(`/mainpage/game/solo/1vs1/friends`)
						else
							navigate(`/mainpage/game/solo/2vs2/friends`)
					}
				} else if (type === 'receiveFriendGame') {
					console.log("RECEIVED A GAME REQUEST")
					setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message])
					setRoomID(message.roomID)
				}
			}
		}
	}, [notifSocket])

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				if (type === 'hmed') {
					console.log("WWWWWWWWWAAAAA HMEEEEEEEED")
					socket.close()
					// setSocket(null)
				} else if (type === 'connected_again')
					console.log('USER IS CONNECTED AGAIN')
			}
		}
	}, [socket])

	const refuseInvitation = (creator) => {
		let notifSelected = allGameNotifs.filter((user) => user.user === creator)
		setAllGameNotifs(allGameNotifs.filter((user) => user.user !== creator))
		if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
			console.log("inside join")
			notifSocket.send(JSON.stringify({
				type: 'refuseInvitation',
				message: {
					user: notifSelected[0].user,
					target: user,
					roomID: notifSelected[0].roomID
				}
			}))
		}
	}

	const acceptInvitation = (creator) => {
		let notifSelected = allGameNotifs.filter((user) => user.user === creator)
		setAllGameNotifs(allGameNotifs.filter((user) => user.user !== creator))
		console.log(creator, user, roomID)
		if (notifSocket && notifSocket.readyState === WebSocket.OPEN) {
			console.log("inside join")
			notifSocket.send(JSON.stringify({
				type: 'acceptInvitation',
				message: {
					user: notifSelected[0].user,
					target: user,
					roomID: notifSelected[0].roomID
				}
			}))
		}
	}

	// FOR THE GAME NOTIFICATIONS - END -

    return (
        <div className='duelMode' >
            <div className='cancel-game-invite-request'>
				{(allGameNotifs.length) ? (
					<div className='game-invitations'>
						{allGameNotifs.map((user, key) => {
							return ((
								<div key={key} className='game-invitation'>
									<img src={notifsImgs[key]} alt="profile-pic" />
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
			</div>
            <div className='duelMode-modes' >
                <div className={(selected === 1) ? 'duelMode-modes-quickMatch duelMode-modes-quickMatch-selected' : 'duelMode-modes-quickMatch'} onClick={quickMatch} >
                    <div>
                        <img src={Icons.quickMatch} alt="quick-match" />
                    </div>
                    <h1>Play a Quick Match</h1>
                    <p>Jump into action with a quick match mode where you are randomly paired with another player for a 1 vs 1 game. Enjoy a fast and exciting experience without the wait!</p>
                </div>
                <div className={(selected === 2) ? 'duelMode-modes-friendMatch duelMode-modes-friendMatch-selected' : 'duelMode-modes-friendMatch'} onClick={friendMatch} >
                    <div>
                        <img src={Icons.friendMatch} alt="friend-match" />
                    </div>
                    <h1>Play with friends</h1>
                    <p>Challenge your friend to a 1 vs 1 game in Friends Match mode. Invite a friend to join you for a competitive and fun-filled match,ensuring  a personalized gaming experience!</p>
                </div>
                <div className={(selected === 3) ? 'duelMode-modes-createJoinMatch duelMode-modes-createJoinMatch-selected' : 'duelMode-modes-createJoinMatch'} onClick={createJoinMatch} >
                    <div className='createJoinMatch__icon' >
                        <div>
                            <img src={Icons.createMatch} alt="create-match" />
                        </div>
                        <img src={Icons.paddleCreateJoin} alt="create-join-match" />
                        <div>
                            <img src={Icons.joinMatch} alt="join-match" />
                        </div>
                    </div>
                    <h1>Create or Join Match</h1>
                    <p>Start a new game or join an existing one in Create/Join Match mode. Create a room and wait for other player to join, or jump into an available match for flexible and instant gameplay.</p>
                </div>
            </div>
            <div className='duelMode-cancel-next' >
                <div onClick={returnBackwards} >Back</div>
                <div id={selected ? 'selected' : ''} onClick={nextPage} >Next</div>
            </div>
        </div>
    )
}

export default OneVersusOne