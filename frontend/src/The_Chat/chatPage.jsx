import "../assets/chat/chatSmallScreen.css";
import ChatConversationItem from "./chatConversationItem";
import ChatContext from "../Groups/ChatContext";
import AuthContext from "../navbar-sidebar/Authcontext";
import ChatConversation from "./chatConversation";
import ChatRoomConversation from "./chatRoomConversation";
import { useContext, useEffect, useState } from "react";

const MyChat = () => {
  const {
    chatRoomConversations,
    directConversations,
    setSelectedChatRoom,
    selectedChatRoom,
    setSelectedDirect,
    selectedDirect,
  } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const [isHome, setIsHome] = useState(true);

  const filteredConversations = directConversations.filter((conversation) => {
    return conversation.name.includes(query);
  });

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div
          className={
            Object.values(selectedDirect).every((value) => value !== "")
              ? "chat-sidebar-hidden"
              : "chat-sidebar"
          }
        >
          <div className="chat-sidebar-header">
            <input
              type="text"
              placeholder="search"
              value={query}
              className="chat-search-input"
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="chat-switch-button-wrapper">
              <button
                className={
                  isHome
                    ? "direct-switch-button-active"
                    : "direct-switch-button"
                }
                onClick={() => setIsHome(true)}
              >
                Directs
              </button>
              <button
                className={
                  isHome ? "rooms-switch-button" : "rooms-switch-button-active"
                }
                onClick={() => setIsHome(false)}
              >
                Rooms
              </button>
            </div>
          </div>
          <div className="chat-conversations-list">
            {isHome
              ? filteredConversations.map((friend, key) => (
                  <ChatConversationItem
                    key={key}
                    name={friend.name}
                    status={friend.is_online}
                    lastMessage={
                      "The correct format would typically be chatRoomConversations"
                    }
                    imageIndex={key}
                    isDirect={isHome}
                    setSelectedDirect={setSelectedDirect}
                  />
                ))
              : chatRoomConversations.map((chatRoom, key) => (
                  <ChatConversationItem
                    key={key}
                    name={chatRoom.name}
                    lastMessage={
                      "The correct format would typically be chatRoomConversations"
                    }
                    imageIndex={key}
                    isDirect={isHome}
                    members={chatRoom.membersCount}
                    setSelectedChatRoom={setSelectedChatRoom}
                  />
                ))}
          </div>
        </div>
        <div
          className={
            Object.values(selectedDirect).every((value) => value !== "")
              ? "chat-window"
              : "chat-window-hidden"
          }
        >
          {isHome &&
          Object.values(selectedDirect).every((value) => value !== "") ? (
            <ChatConversation />
          ) : !isHome &&
            Object.values(selectedChatRoom).every((value) => value !== "") ? (
            <ChatRoomConversation />
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default MyChat;
