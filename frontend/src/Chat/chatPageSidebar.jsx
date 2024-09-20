import { useContext, useEffect, useState } from "react";
import ChatContext from "../Context/ChatContext";
import ChatConversationItem from "./chatConversationItem";

const ChatSideBar = ({
  directs,
  setDirects,
  directsOnScroll,
  directsListInnerRef,
  chatRooms,
  setChatRooms,
  chatRoomsOnScroll,
  chatRoomsListInnerRef,
}) => {
  const {
    setSelectedChatRoom,
    selectedChatRoom,
    setSelectedDirect,
    selectedDirect,
    setSelectedItem,
    isHome,
    setIsHome,
    selectedItem,
  } = useContext(ChatContext);
  const [query, setQuery] = useState("");

  const filteredConversations = directs.filter((conversation) => {
    return conversation.name.includes(query);
  });
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
      {isHome && (
        <div
          className="chat-conversations-list"
          onScroll={directsOnScroll}
          ref={directsListInnerRef}
        >
          {filteredConversations.map((friend, index) => (
            <ChatConversationItem
              key={index}
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
              setDirects={setDirects}
              directs={directs}
            />
          ))}
        </div>
      )}
      {!isHome && (
        <div
          className="chat-rooms-conversations-list"
          onScroll={chatRoomsOnScroll}
          ref={chatRoomsListInnerRef}
        >
          {chatRooms.map((chatRoom, index) => (
            <ChatConversationItem
              key={index}
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
              setChatRooms={setChatRooms}
              chatRooms={chatRooms}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatSideBar;
