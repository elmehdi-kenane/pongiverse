
import CloseIcon from "@mui/icons-material/Close";

const ChatRoomInfos = (props) => {
    return (
        <div className="chat-room-infos-conatiner">
              <CloseIcon
          className="create-room-close-icon"
          onClick={() => props.setShowChatRoomInfos(false)}
        />
        </div>
    )
}

export default ChatRoomInfos