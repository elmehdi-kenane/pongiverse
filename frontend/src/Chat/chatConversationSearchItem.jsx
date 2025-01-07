import React from "react"

const ChatConversationSearchItem = (props) => {
  const handleClick = () => {
    if (props.isDirect) {
      props.setSelectedDirect({
        id: props.friendId,
        name: props.name,
        status: props.status,
        avatar: props.avatar,
      })
      let allDirects = props.directs
      const updatedDirects = allDirects.map((friend) => {
        if (props.friendId === friend.id) {
          return { ...friend, unreadCount: 0 }
        }
        return friend
      })
      props.setDirects(updatedDirects)
    } else if (!props.isDirect) {
      props.setSelectedChatRoom({
        id: props.roomId,
        name: props.name,
        membersCount: props.membersCount,
        icon: props.icon,
      })
      let allChatRooms = props.chatRooms
      const updatedChatRooms = allChatRooms.map((room) => {
        if (props.roomId === room.id) {
          return { ...room, unreadCount: 0 }
        }
        return room
      })
      props.setChatRooms(updatedChatRooms)
    }
    props.setSelectedItem(props.name)
  }
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
            {props.lastMessage
              ? props.lastMessage
              : !props.isDirect
              ? parseInt(props.membersCount) > 1
                ? props.membersCount + " Members"
                : props.membersCount + " Member"
              : props.status
              ? "Online"
              : "Offline"}
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
  )
}

export default ChatConversationSearchItem
