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
  setChatRoomMessages,
  setMessages,
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

  // const filteredConversations = directs.filter((conversation) => {
  //   return conversation.name.includes(query);
  // });
  const [showSearchContainer, setShowSreachContainer] = useState(false);
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
          className="chat-search-input"
          onClick={()=>setShowSreachContainer(true)}
        />
        {showSearchContainer && (
          <div className="chat-search-container">
          </div>
        )}
        <div className="chat-switch-button-wrapper">
          <button
            className={
              isHome ? "direct-switch-button-active" : "direct-switch-button"
            }
            onClick={() => {setIsHome(true); setSelectedChatRoom({
              name: "",
              memberCount: "",
              icon: "",
              roomId: "",
            }); setSelectedItem(""); setChatRoomMessages([]);}}
          >
            Directs
          </button>
          <button
            className={
              isHome ? "rooms-switch-button" : "rooms-switch-button-active"
            }
            onClick={() => {setIsHome(false); setSelectedDirect({
              id: "",
              name: "",
              status: "",
              avatar: "",
            }); setSelectedItem(""); setMessages([]);}}
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
          {directs.map((friend, index) => (
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
              cover={chatRoom.cover}
              topic={chatRoom.topic}
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
