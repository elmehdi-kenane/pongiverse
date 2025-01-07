import { useContext} from "react"
import AuthContext from "../navbar-sidebar/Authcontext"
import { useNavigate } from "react-router-dom"
export const resetUnreadMessages = async (user, friendId, navigate) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_PROTOCOL}://${
        import.meta.env.VITE_IPADDRESS
      }:${import.meta.env.VITE_PORT}/chatAPI/resetUndreadMessages`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user,
          receiver: friendId,
        }),
      }
    )
    if (response.status === 401)
      navigate("/signin")
  } catch (error) {
    console.log(error)
  }
}

export const resetChatRoomUnreadMessages = async (user, roomId, navigate) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_PROTOCOL}://${
        import.meta.env.VITE_IPADDRESS
      }:${import.meta.env.VITE_PORT}/chatAPI/resetChatRoomUndreadMessages`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user,
          roomId: roomId,
        }),
      }
    )
    if (response.status === 401)
      navigate("/signin")
  } catch (error) {
    console.log(error)
  }
}


const ChatConversationItem = (props) => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const handleClick = () => {
    if (props.isDirect && props.name) {
      props.setSelectedDirect({
        id: props.friendId,
        name: props.name,
        avatar: props.avatar,
        status: props.status,
      })
      let allDirects = props.directs
      const updatedDirects = allDirects.map((friend) => {
        if (props.friendId === friend.id) {
          return { ...friend, unreadCount: 0 }
        }
        return friend
      })
      props.setDirects(updatedDirects)
      if (parseInt(props.unreadCount) > 0)
        resetUnreadMessages(user, props.friendId, navigate)
    } else if (!props.isDirect && props.name) {
      props.setSelectedChatRoom({
        id: props.roomId,
        name: props.name,
        membersCount: props.membersCount,
        icon: props.icon,
      })
      let allChatRooms = props.chatRooms
      const updatedRooms = allChatRooms.map((room) => {
        if (props.roomId === room.id) {
          return { ...room, unreadCount: 0 }
        }
        return room
      })
      props.setChatRooms(updatedRooms)
      if (parseInt(props.unreadCount) > 0)
        resetChatRoomUnreadMessages(user, props.roomId, navigate)
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

export default ChatConversationItem
