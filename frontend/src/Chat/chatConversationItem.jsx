import { useContext} from "react";
import ChatContext from "../Context/ChatContext";
import AuthContext from "../navbar-sidebar/Authcontext";

const ChatConversationItem = (props) => {
  const { directsImages } = useContext(ChatContext);
  const {user} = useContext(AuthContext)
  const resetUnreadMessages = async () => {
    try {
      await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/chatAPI/resetUndreadMessages`,{
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user,
          receiver: props.friendId,
        })
      })
    } catch(error) {
      console.log(error)
    }
  }

  const handleClick = () => {
    if (props.isDirect && props.name) {
      props.setSelectedDirect({
        name: props.name,
        avatar: directsImages[props.imageIndex],
        status: props.status,
      });
    } else if (!props.isDirect && props.name) {
      props.setSelectedChatRoom({
        name: props.name,
        memberCount: props.membersCount,
        icon: props.icon,
        roomId: props.roomId,
      });
    }
    props.setSelectedItem(props.name);
    // resetUnreadMessages()
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
            : props.icon
        }
        alt=""
        className="conversation-item-avatar"
      />
      <div className="conversation-item-details">
        <div className="conversation-item-name">{props.name}</div>
        <div className="conversation-item-last-msg-wrapper">
          <div className="conversation-item-last-msg">
            {props.lastMessage
              ? props.lastMessage
              : props.status
              ? "online"
              : "offline"}
          </div>
        </div>
      </div>
      {parseInt(props.unreadCount) > 0 ? <div className="conversation-item-last-msg-count">{props.unreadCount}</div> : ""}
    </div>
  );
};

export default ChatConversationItem;
