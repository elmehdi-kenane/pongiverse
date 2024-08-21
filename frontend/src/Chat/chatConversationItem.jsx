import { useContext} from "react";
import ChatContext from "../Context/ChatContext";

const ChatConversationItem = (props) => {
  const { directsImages, chatRoomIcons } = useContext(ChatContext);
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
      <div className="conversation-item-last-msg-count">9</div>
    </div>
  );
};

export default ChatConversationItem;
