import "../assets/chat/Chat.css";
import ChatConversationItem from "./chatConversationItem";
import ChatContext from "../Context/ChatContext";
import ChatConversation from "./chatConversation";
import ChatRoomConversation from "./chatRoomConversation";
import { useContext, useEffect, useState } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import { Toaster } from "react-hot-toast";
import AuthContext from "../navbar-sidebar/Authcontext";

const Chat = () => {
  const {
    chatRoomConversations,
    directConversations,
    setSelectedChatRoom,
    selectedChatRoom,
    setSelectedDirect,
    selectedDirect,
    isHome,
    setIsHome,
  } = useContext(ChatContext);
  const {chatSocket} = useContext(AuthContext)
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const filteredConversations = directConversations.filter((conversation) => {
    return conversation.name.includes(query);
  });

  const handleSelectItem = (itemName) => {
    setSelectedItem(itemName);
  };

  useEffect(() => {
    if (chatSocket) {
      chatSocket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        console.log("data received inside:", data);
        if (data.type === "newDirect") { 
          console.log("the MESSAGE")
        }
      };
    }
  }, [chatSocket]);

  return (
    <div className="chat-page">
      <Toaster/>
      <div className="chat-container">
        <div
          className={
            Object.values(selectedDirect).every((value) => value !== "") ||
            Object.values(selectedChatRoom).every((value) => value !== "")
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
                    friendId={friend.id}
                    name={friend.name}
                    avatar={friend.avatar}
                    status={friend.is_online}
                    lastMessage={friend.lastMessage}
                    isDirect={isHome}
                    setSelectedDirect={setSelectedDirect}
                    isSelected={selectedItem === friend.name}
                    setSelectedItem={handleSelectItem}
                  />
                ))
              : chatRoomConversations.map((chatRoom, key) => (
                  <ChatConversationItem
                    key={key}
                    name={chatRoom.name}
                    icon={chatRoom.icon}
                    lastMessage={
                      "The correct format would typically be chatRoomConversations"
                    }
                    imageIndex={key}
                    isDirect={isHome}
                    membersCount={chatRoom.membersCount}
                    roomId={chatRoom.id}
                    setSelectedChatRoom={setSelectedChatRoom}
                    isSelected={selectedItem === chatRoom.name}
                    setSelectedItem={handleSelectItem}
                  />
                ))}
          </div>
        </div>
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
            <ChatConversation />
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
      </div>
    </div>
  );
};

export default Chat;
