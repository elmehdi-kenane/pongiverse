import { useContext, useState } from "react";
import ChatContext from "../Context/ChatContext";
import ChatConversationItem from "./chatConversationItem";

const ChatSideBar = (props) => {
  const {
    directConversations,
    chatRoomConversations,
    setSelectedChatRoom,
    selectedChatRoom,
    setSelectedDirect,
    selectedDirect,
    setSelectedItem,
    isHome,
    setIsHome,
    selectedItem,
    listInnerRef,
    onScroll,
  } = useContext(ChatContext);
  const [query, setQuery] = useState("");

  const filteredConversations = directConversations.filter((conversation) => {
    return conversation.name.includes(query);
  })
  const handleSelectItem = (itemName) => {
    setSelectedItem(itemName);
  };
  return (
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
              isHome ? "direct-switch-button-active" : "direct-switch-button"
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
      <div
        className="chat-conversations-list"
        onScroll={onScroll}
        ref={listInnerRef}
      >
        {isHome
          ? filteredConversations.map((friend, key) => (
              <ChatConversationItem
                key={key}
                friendId={friend.id}
                name={friend.name}
                avatar={friend.avatar}
                status={friend.is_online}
                lastMessage={friend.lastMessage}
                unreadCount={friend.unreadCount}
                isDirect={isHome}
                setSelectedDirect={setSelectedDirect}
                isSelected={selectedItem === friend.name}
                setSelectedItem={handleSelectItem}
              />
            ))
          : chatRoomConversations.map((chatRoom, key) => (
              <ChatConversationItem
                key={key}
                roomId={chatRoom.id}
                name={chatRoom.name}
                icon={chatRoom.icon}
                lastMessage={chatRoom.lastMessage}
                membersCount={chatRoom.membersCount}
                unreadCount={chatRoom.unreadCount}
                isDirect={isHome}
                setSelectedChatRoom={setSelectedChatRoom}
                isSelected={selectedItem === chatRoom.name}
                setSelectedItem={handleSelectItem}
              />
            ))}
      </div>
    </div>
  );
};

export default ChatSideBar;
