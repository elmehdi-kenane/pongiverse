import { useContext, useEffect, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import {useClickOutSide} from "../Chat/chatConversation"

const JoinRoom = (props) => {
  const [isProtected, setIsProtected] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [roomPassword, setRoomPassword] = useState('')
  const {socket, user} = useContext(AuthContext)

  const joinRoomSubmitHandler = (e) => {
    e.preventDefault()

    socket.send(JSON.stringify({
      type : 'joinChatRoom',
      user: user,
      name : roomName,
      password : roomPassword,
    }))
    props.onClose()
  }

  let nodeDom = useClickOutSide(props.onClose)
  return (
    <div className="join-room-container" ref={nodeDom}>
      <div className="join-room-header">Join a Room</div>
      <div className="join-visibility-btns">
        <div className="join-visibility-text">
          Please Select Room Visibility:{" "}
        </div>
        <div className="select-visibilty-lables">
          <label className="room-visibility-check">
            Public
            <input type="radio" checked={!isProtected} name="radio" onChange={() => setIsProtected(false)}/>
          </label>
          <label className="room-visibility-check">
          </label>
            Protected
            <input type="radio" checked={isProtected} name="radio" onChange={() => setIsProtected(true)}/>
        </div>
      </div>
      <form action="" onSubmit={joinRoomSubmitHandler} className="join-room-form">
        <input type="text" placeholder="Room name"  value={roomName} onChange={(e)=> setRoomName(e.target.value)} />
        {isProtected ? <input type="text" placeholder="Password" value={roomPassword} onChange={(e)=> setRoomPassword(e.target.value)}  /> : ""}
      <div className="join-btns">
        <button className="cancel-room" type="button" onClick={props.onClose}>
          CANCEL
        </button>
        <button className="join-room" type="submit" onClick={joinRoomSubmitHandler} >JOIN</button>
      </div>
      </form>
    </div>
  );
};

export default JoinRoom;
