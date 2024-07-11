import { useContext, useState } from "react";
import * as ChatIcons from "../assets/chat/media";
import AuthContext from "../navbar-sidebar/Authcontext";
import * as Icons from '../assets/navbar-sidebar'


const ChatRoomMemberToInvite = (props) => {
  const {socket} = useContext(AuthContext)
  const [isInviteSent, setIsInviteSent] = useState(false)
  const onClickInviteMember = () => {
    if(socket) {
      socket.send (JSON.stringify({
        type: 'inviteChatRoomMember',
        message : {
          room : props.roomName,
          member: props.name,
        }
      }))
      setIsInviteSent(true)
    }
  }
  return (
        <div className="invite-room-member-list">
              <div className="invite-member-infos">
                <img src={ChatIcons.mmaqbourImage} alt="" className="invite-room-member-image"/>
                <div className="invite-room-member-infos">
                  <div className="invite-room-member-name">{props.name}</div>
                  <div className="invite-room-member-level">level2</div>
                </div>
              </div>
              {isInviteSent ? <img src={Icons.waitClock} className="room-invite-sent-icon"/> : <button className="invite-room-member-btn" onClick={onClickInviteMember}>Invite</button>}
              
        </div>
    )
}

export default ChatRoomMemberToInvite