import { useContext } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import ChatContext from "../Groups/ChatContext";

const ChatConversation = () => {
  const { selectedDirect, setSelectedDirect } = useContext(ChatContext);
  return (
    <>
      <div className="conversation-header">
        <div className="conversation-header-info">
          <img
            src={ChatIcons.arrowLeft}
            alt=""
            className="conversation-back-arrow"
            onClick={() =>
              setSelectedDirect({
                name: "",
                avatar: "",
                status: "",
              })
            }
          />
          <img
            src={selectedDirect.avatar}
            alt="Avatar"
            className="conversation-avatar"
          />
          <div className="conversation-details">
            <div className="conversation-name">{selectedDirect.name}</div>
            <div className="conversation-info">
              {selectedDirect.status ? "online" : "offline"}
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
      </form>
    </>
  );
};

export default ChatConversation;
