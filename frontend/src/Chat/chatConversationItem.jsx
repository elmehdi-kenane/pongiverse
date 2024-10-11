import { useContext, useEffect, useState } from "react";
import * as ChatIcons from "../assets/chat/media/index";
import ChatContext from "../Groups/ChatContext";

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

const ChatConversationItem = (props) => {
  const { user } = useContext(AuthContext);
  const { directConversationsRef, setDirectConversations } =
    useContext(ChatContext);
  const handleClick = () => {
    if (props.isDirect && props.name) {
      props.setSelectedDirect({
        name: props.name,
        avatar: directsImages[props.imageIndex],
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
        icon: chatRoomIcons[props.imageIndex],
        roomId: props.roomId,
      });
    }
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
        src={
          props.isDirect
            ? directsImages[props.imageIndex]
            : chatRoomIcons[props.imageIndex]
        }
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
            {props.lastMessage
              ? props.lastMessage
              : props.status
              ? "online"
              : "offline"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatConversationItem;
