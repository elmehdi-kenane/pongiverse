import { useContext } from "react";
import * as ChatIcons from "../../assets/chat/media";
import AuthContext from "../../navbar-sidebar/Authcontext";
const ChatRoomMember = (props) => {
    const {chatSocket} = useContext(AuthContext)
    const onClickAddMemberAdmin = () => {
        if(chatSocket) {
            chatSocket.send(JSON.stringify({
                type: 'addRoomMemberAdmin',
                message: {
                    room : props.roomName,
                    memberName: props.name
                }
            }))
        }
    }
    return (
        <div className="add-room-member-list">
            <div className="add-admin-member-infos">
                <img src={ChatIcons.mmaqbourImage} alt="" className="add-room-admin-image" />
                <div className="add-room-admin-infos">
                    <div className="add-admin-member-name">{props.name}</div>
                    <div className="add-admin-member-level">level2</div>
                </div>
            </div>
            <button className="add-room-admin-btn room-admin-btn-added" onClick={onClickAddMemberAdmin}>Add Admin</button>
        </div>
    )
}

export default ChatRoomMember