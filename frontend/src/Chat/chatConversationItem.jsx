import { useContext, useEffect, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import ChatContext from "../Context/ChatContext";

export const resetUnreadMessages = async (user, friendId) => {
  try {
    await fetch(
      `http://${
        import.meta.env.VITE_IPADDRESS
      }:8000/chatAPI/resetUndreadMessages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user,
          receiver: friendId,
        }),
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const resetChatRoomUnreadMessages = async (user, roomId) => {
  try {
    await fetch(
      `http://${
        import.meta.env.VITE_IPADDRESS
      }:8000/chatAPI/resetChatRoomUndreadMessages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user,
          roomId: roomId,
        }),
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const ChatConversationItem = (props) => {
  const { user } = useContext(AuthContext);
  const { directConversationsRef, setDirectConversations , chatRoomConversationsRef, setChatRoomConversations, setMessages, setCurrentMessagePage, setHasMoreMessages} =
    useContext(ChatContext);
  const handleClick = () => {
    if (props.isDirect && props.name) {
      props.setSelectedDirect({
        id: props.friendId,
        name: props.name,
        avatar: props.avatar,
        status: props.status,
      });
      let allDirects = directConversationsRef.current;
      const updatedDirects = allDirects.map((friend) => {
        if (props.friendId === friend.id) {
          return { ...friend, unreadCount: 0 };
        }
        return friend;
      });
      setDirectConversations(updatedDirects);
      if (parseInt(props.unreadCount) > 0)
        resetUnreadMessages(user, props.friendId);
    } else if (!props.isDirect && props.name) {
      props.setSelectedChatRoom({
        name: props.name,
        memberCount: props.membersCount,
        icon: props.icon,
        roomId: props.roomId,
      });
      let allChatRooms = chatRoomConversationsRef.current
      const updatedRooms = allChatRooms.map((room) => {
        if (props.roomId === room.id) {
          return { ...room, unreadCount: 0 };
        }
        return room;
      });
      setChatRoomConversations(updatedRooms);
      if (parseInt(props.unreadCount) > 0)
        resetChatRoomUnreadMessages(user, props.roomId);
    }
    setMessages([])
    setCurrentMessagePage(1)
    setHasMoreMessages(true)
    props.setSelectedItem(props.name);
  };
  return (
    <div
      className={
        props.isSelected
          ? "chat-conversation-item chat-conversation-item-active"
          : "chat-conversation-item "
      }
      onClick={handleClick}
    >
      <img
        src={props.isDirect ? props.avatar : props.icon}
        alt=""
        className="conversation-item-avatar"
      />
      <div className="conversation-item-details">
        <div className="conversation-item-name">{props.name}</div>
        <div className="conversation-item-last-msg-wrapper">
          <div
            className={
              parseInt(props.unreadCount) > 0
                ? "conversation-item-last-msg-bold"
                : "conversation-item-last-msg"
            }
          >
            { props.lastMessage ? props.lastMessage : !props.isDirect ? parseInt(props.membersCount) > 1 ? props.membersCount + " Member" : props.membersCount + " Members": props.status ? 'Online' : "Offline" } 
          </div>
        </div>
      </div>
      {parseInt(props.unreadCount) > 0 ? (
        <div className="conversation-item-last-msg-count">
          {props.unreadCount}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default ChatConversationItem;
