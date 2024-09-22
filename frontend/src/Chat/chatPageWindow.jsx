import { useContext, useState } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import ChatConversation from "./chatConversation";
import ChatRoomConversation from "./chatRoomConversation";
import ChatContext from "../Context/ChatContext";
import BlockPopUp from "./chatRoomOptions/blockPopUp";

const ChatWindow = ({
  messages,
  setMessages,
  chatRoomMessages,
  setChatRoomMessages,
}) => {
  const {selectedChatRoom, selectedDirect, isHome } =
    useContext(ChatContext);
  const [showBlockPopup, setShowBlockPopup] = useState(false);
  return (
    <div
      className={
        Object.values(selectedDirect).every((value) => value !== "") ||
        Object.values(selectedChatRoom).every((value) => value !== "")
          ? "chat-window"
          : "chat-window-hidden"
      }
    >
      {showBlockPopup && <BlockPopUp setShowBlockPopup={setShowBlockPopup} />}
      {isHome &&
      Object.values(selectedDirect).every((value) => value !== "") ? (
        <ChatConversation messages={messages} setMessages={setMessages} setShowBlockPopup={setShowBlockPopup}/>
      ) : !isHome &&
        Object.values(selectedChatRoom).every((value) => value !== "") ? (
        <ChatRoomConversation
          chatRoomMessages={chatRoomMessages}
          setChatRoomMessages={setChatRoomMessages}
        />
      ) : (
        <div className="chat-window-empty">
          <div className="chat-window-empty-wrapper">
            <img
              src={ChatIcons.emptyChatIcon}
              alt=""
              className="empty-chat-icon"
            />
            <p className="chat-window-empty-message">
              {" "}
              Begin a conversation with a friend to see it show up here!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
