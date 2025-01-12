import { useContext, useState } from "react"
import * as ChatIcons from "../../assets/chat/media"
import * as Icons from "../../assets/navbar-sidebar"
import AuthContext from "../../navbar-sidebar/Authcontext"
const ChatRoomMember = (props) => {
    const {chatSocket} = useContext(AuthContext)
    const [isInviteSent, setIsInviteSent] = useState(false)
    const onClickAddMemberAdmin = () => {
        if(chatSocket.readyState === WebSocket.OPEN && !isInviteSent) {
            chatSocket.send(JSON.stringify({
                type: 'addRoomMemberAdmin',
                message: {
                    room : props.roomName,
                    memberName: props.name
                }
            }))
            setIsInviteSent(true)
        }
    }
    return (
        <div className="add-room-member-list">
            <div className="add-admin-member-infos">
                <img src={props.avatar} alt="" className="add-room-admin-image" />
                <div className="add-room-admin-infos">
                    <div className="add-admin-member-name">{props.name}</div>
                </div>
            </div>
            {isInviteSent ? <img src={Icons.waitClock} className="room-invite-sent-icon"/> : <button className="invite-room-member-btn" onClick={onClickAddMemberAdmin}>Add Admin</button>}


        </div>
    )
}

export default ChatRoomMember