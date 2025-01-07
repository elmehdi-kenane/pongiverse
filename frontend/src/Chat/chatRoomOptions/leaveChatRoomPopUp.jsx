import CloseIcon from "@mui/icons-material/Close"
import { LeaveChatRoomSubmitter } from "../../Groups/ChatRoomSettings/leaveChatRoom"
import { useContext } from "react"
import ChatContext from "../../Context/ChatContext"
import AuthContext from "../../navbar-sidebar/Authcontext"

const LeaveChatRoomPopUp = (props) => {
  const { user } = useContext(AuthContext)
  const { chatRoomConversationsRef, setChatRoomConversations } =
    useContext(ChatContext)
  return (
    <div className="Leave-chat-room-pop">
      <div className="create-room-header">
        <h1 className="create-room-title">Leave Chat Room</h1>
        <CloseIcon
          className="create-room-close-icon"
          onClick={() => props.setShowLeaveRoomPopUp(false)}
        />
      </div>
      <div className="Leave-chat-room-question">
        Are you Sure you want to leave
      </div>
      <div className="create-room-actions-next">
        <button
          className="create-room-cancel-button"
          onClick={() => props.setShowLeaveRoomPopUp(false)}
        >
          Cancel
        </button>
        <button
          className="create-room-cancel-button"
          onClick={() => {
            LeaveChatRoomSubmitter(
              user,
              chatRoomConversationsRef,
              setChatRoomConversations,
              props.roomId
            )
            props.setSelectedChatRoom({
              name: "",
              membersCount: "",
              icon: "",
              id: "",
            })
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  )
}

export default LeaveChatRoomPopUp
