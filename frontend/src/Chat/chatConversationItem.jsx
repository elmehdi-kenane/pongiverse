import { useContext, useEffect, useState } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import ChatContext from "../Context/ChatContext";

const ChatConversationItem = (props) => {
  const { user } = useContext(AuthContext);
  const { directConversationsRef, setDirectConversations } =
    useContext(ChatContext);
  const resetUnreadMessages = async () => {
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
            receiver: props.friendId,
          }),
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

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
          return { ...friend, unreadCount: 0};
        }
        return friend;
      });
      setDirectConversations(updatedDirects);
      if(parseInt(props.unreadCount) > 0)
        resetUnreadMessages();
    } else if (!props.isDirect && props.name) {
      props.setSelectedChatRoom({
        name: props.name,
        memberCount: props.membersCount,
        icon: props.icon,
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
        src={props.isDirect ? props.avatar : props.icon}
        alt=""
        className="conversation-item-avatar"
      />
      <div className="conversation-item-details">
        <div className="conversation-item-name">{props.name}</div>
        <div className={parseInt(props.unreadCount) > 0 ?  "conversation-item-last-msg-wrapper-bolder" : "conversation-item-last-msg-wrapper"}>
          <div className="conversation-item-last-msg">
            {props.lastMessage
              ? props.lastMessage
              : props.status
              ? "online"
              : "offline"}
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
