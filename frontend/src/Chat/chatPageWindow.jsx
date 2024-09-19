import { useContext } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import ChatConversation from "./chatConversation";
import ChatRoomConversation from "./chatRoomConversation";
import ChatContext from "../Context/ChatContext";

const ChatWindow = ({messages, setMessages}) => {
  const { setSelectedChatRoom, selectedChatRoom, selectedDirect, isHome } =
    useContext(ChatContext);
  return (
    <div
      className={
        Object.values(selectedDirect).every((value) => value !== "") ||
        Object.values(selectedChatRoom).every((value) => value !== "")
          ? "chat-window"
          : "chat-window-hidden"
      }
    >
      {isHome &&
      Object.values(selectedDirect).every((value) => value !== "") ? (
        <ChatConversation
          messages={messages}
          setMessages={setMessages}
        />
      ) : !isHome &&
        Object.values(selectedChatRoom).every((value) => value !== "") ? (
        <ChatRoomConversation
          setSelectedItem={handleSelectItem}
          setSelectedChatRoom={setSelectedChatRoom}
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
