import React, { useState, useEffect, useContext } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import * as Icons from '../assets/navbar-sidebar'
import AuthContext from '../navbar-sidebar/Authcontext'

const Modes = () => {
  const navigate = useNavigate()
  const [gameNotif, setGameNotif] = useState([])
  const [roomID, setRoomID] = useState(null)
  let { socket, user, setAllGameNotifs,
    allGameNotifs, notifsImgs } = useContext(AuthContext)

  const goToSoloPage = () => {
    navigate("../game/solo")
  }

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.onmessage = (event) => {
            let data = JSON.parse(event.data)
            let type = data.type
            let message = data.message
            if (type === 'goToGamingPage') {
              console.log("navigating now")
                navigate(`/mainpage/game/solo/1vs1/friends`)
            } else if (type === 'receiveFriendGame') {
              console.log("RECEIVED A GAME REQUEST")
              setAllGameNotifs((prevGameNotif) => [...prevGameNotif, message])
              setRoomID(message.roomID)
            }
        }
    }
  }, [socket])

  const refuseInvitation = (creator) => {
    let notifSelected = allGameNotifs.filter((user) => user.user === creator)
    setAllGameNotifs(allGameNotifs.filter((user) => user.user !== creator))
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("inside join")
        socket.send(JSON.stringify({
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
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("inside join")
        socket.send(JSON.stringify({
            type: 'acceptInvitation',
            message: {
                user: notifSelected[0].user,
                target: user,
                roomID: notifSelected[0].roomID
            }
        }))
      }
  }

  return (
    <div className='onevsone'>
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
        <div>Modes</div>
        <button onClick={goToSoloPage}>Play solo</button>
    </div>
  )
}

export default Modes