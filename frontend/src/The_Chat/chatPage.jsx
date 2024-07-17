import "../assets/chat/chatSmallScreen.css";
import ChatConversationItem from "./chatConversationItem";
import ChatContext from "../Groups/ChatContext";
import AuthContext from "../navbar-sidebar/Authcontext";
import ChatConversation from "./chatConversation";

import { useContext, useEffect, useState } from "react";
const MyChat = () => {
  const {
    channelsConversations,
    directsConversations,
    setSelectedChannel,
    selectedChannel,
    setSelectedDirect,
    selectedDirect,
  } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const [isHome, setIsHome] = useState(true);

  const filteredConversation = directsConversations.filter((conversation) => {
    return conversation.name.includes(query);
  });

  useEffect(() => {
    console.log("im hereeee");
    console.log(directsConversations);
  }, []);

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
              <button className="direct-switch-button">Directs</button>
              <button className="rooms-switch-button">Rooms</button>
            </div>
          </div>
          <div className="chat-conversations-list">
            {filteredConversation.map((friend, key) => (
              <ChatConversationItem
                name={friend.name}
                key={key}
                status={friend.is_online}
                imageIndex={key}
                isDirect={isHome}
                setSelectedDirect={setSelectedDirect}
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
          {Object.values(selectedDirect).every((value) => value !== "") ? (
            <ChatConversation />
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default MyChat;
