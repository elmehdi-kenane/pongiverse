import React, { useState, useContext, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AuthContext from '../navbar-sidebar/Authcontext'
import * as Icons from '../assets/navbar-sidebar'

const Solo = () => {
  const [gameNotif, setGameNotif] = useState([])
  const [roomID, setRoomID] = useState(null)
  let { socket, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const goToTwoPlayersPage = () => {
    navigate("../game/solo/1vs1")
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
              setGameNotif((prevGameNotif) => [...prevGameNotif, message])
              setRoomID(message.roomID)
            }
        }
    }
  }, [socket])

  const refuseInvitation = (creator) => {
    setGameNotif(gameNotif.filter((user) => user.user !== creator))
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("inside join")
        socket.send(JSON.stringify({
            type: 'acceptInvitation',
            message: {
                user: creator,
                target: user,
                roomID: roomID
            }
        }))
      }
  }

  const acceptInvitation = (creator) => {
    setGameNotif(gameNotif.filter((user) => user.user !== creator))
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("inside join")
        socket.send(JSON.stringify({
            type: 'acceptInvitation',
            message: {
                user: creator,
                target: user,
                roomID: roomID
            }
        }))
      }
  }

  return (
    <>
      <div>Solo</div>
      <button onClick={goToTwoPlayersPage}>2 Players</button>
      {(gameNotif.length) ? (
          <div>
              {gameNotif.map((user, key) => {
                  return ((
                      <div key={key}>
                          <img src={`data:image/jpeg;base64,${user.avatar}`} alt="profile-pic" />
                          <div>
                              <span>{user.user}</span>
                              <span>level 2.5</span>
                          </div>
                          <div>
                              <span>1</span>
                              <span>vs</span>
                              <span>1</span>
                          </div>
                          <div>
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
    </>
  )
}

export default Solo