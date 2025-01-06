

const ChatRoomInfos = (props) => {
  return (
    <div className="chat-room-infos">
      <div className="chat-room-info-header">
        <div
          className="chat-room-info-cover"
          style={{ backgroundImage: `url(${props.selectedChatRoom.cover})` }}
        >
        <img src={props.selectedChatRoom.icon} alt="" className="chat-room-info-icon"/>
        </div>
      </div>
        <div className="chat-room-info-body">
            <div className="chat-room-info-name">{props.selectedChatRoom.name}</div>
            <div className="chat-room-info-topic">{props.selectedChatRoom.topic}</div>
            <div className="chat-room-info-members-count">
            {props.selectedChatRoom.membersCount} Members
            </div>
        </div>
    </div>
  );
};

export default ChatRoomInfos;
