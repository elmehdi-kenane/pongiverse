import { useContext, useState } from "react"
import AuthContext from "../../navbar-sidebar/Authcontext"
import * as Icons from '../../assets/navbar-sidebar'


const ChatRoomInvitee = (props) => {
  const {chatSocket} = useContext(AuthContext)
  const [isInviteSent, setIsInviteSent] = useState(false)
  const onClickInviteMember = () => {
    if(chatSocket.readyState === WebSocket.OPEN && !isInviteSent) {
      chatSocket.send (JSON.stringify({
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
                <img src={props.avatar} alt="" className="invite-room-member-image"/>
                  <div className="invite-room-member-name">{props.name}</div>
              </div>
              {isInviteSent ? <img src={Icons.waitClock} className="room-invite-sent-icon"/> : <button className="invite-room-member-btn" onClick={onClickInviteMember}>Invite</button>}
              
        </div>
    )
}

export default ChatRoomInvitee