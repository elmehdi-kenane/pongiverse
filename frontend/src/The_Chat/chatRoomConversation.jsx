
import { useContext } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import ChatContext from "../Groups/ChatContext";

const ChatRoomConversation = () => {
  const { selectedChatRoom, setSelectedChatRoom } = useContext(ChatContext);

    return (
        <>
        <div className="conversation-header">
        <div className="conversation-header-info">
          <img
            src={ChatIcons.arrowLeft}
            alt=""
            className="conversation-back-arrow"
            onClick={() =>
            setSelectedChatRoom({
                name: "",
                status: "",
              })
            }
          />
          <img
            src={ChatIcons.DefaultAvatar}
            alt="Avatar"
            className="conversation-avatar"
          />
          <div className="conversation-details">
            <div className="conversation-name">{selectedChatRoom.name}</div>
            <div className="conversation-info">
              {selectedChatRoom.members} 10 Members
            </div>
          </div>
        </div>
        <div className="conversation-options">
          <img
            src={ChatIcons.InviteToPlay}
            alt="Invite"
            className="conversation-invite-icon"
          />
          <img
            src={ChatIcons.ThreePoints}
            alt="Options"
            className="conversation-options-icon"
          />
        </div>
      </div>
      <div className="conversation-body"></div>
      <form action="submit" className="conversation-send-form">
        <input type="text" className="conversation-input" />
        <img src={ChatIcons.sendIcon} className="conversation-send-icon" />

      </form>
    </>
  );
}

export default ChatRoomConversation