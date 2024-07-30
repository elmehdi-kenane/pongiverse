import { useContext, useEffect, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import {useClickOutSide} from "../Chat/chatConversation"
import { Switch } from 'antd';
// import 'antd/dist/reset.css'


const JoinRoom = (props) => {
  const [isProtected, setIsProtected] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [roomPassword, setRoomPassword] = useState('')
  const {chatSocket, user} = useContext(AuthContext)

  const joinRoomSubmitHandler = (e) => {
    e.preventDefault()

    chatSocket.send(JSON.stringify({
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
      <div className="join-room-visibility-buttons">
        <div className="join-room-visibility-text">
          Please Select Room Visibility:{" "}
        </div>
        <div className="join-room-visibility-labels">
        <Switch defaultChecked={true} checkedChildren="Public" unCheckedChildren="Protected" className="custom-switch"/>
        </div>
      </div>
      <form action="" onSubmit={joinRoomSubmitHandler} className="join-room-form">
        <input type="text" placeholder="Room name"  value={roomName} onChange={(e)=> setRoomName(e.target.value)} />
        {isProtected ? <input type="text" placeholder="Password" value={roomPassword} onChange={(e)=> setRoomPassword(e.target.value)}  /> : ""}
      <div className="join-room-buttons">
        <button className="join-room-cancel" type="button" onClick={props.onClose}>
          CANCEL
        </button>
        <button className="join-room-submit" type="submit" onClick={joinRoomSubmitHandler} >JOIN</button>
      </div>
      </form>
    </div>
  );
};

export default JoinRoom;
