import * as ChatIcons from "../assets/chat/media";

const SuggestedRoom = () => {
  return (
    <div className="room-container">
      <div className="room-header">
        <img src={ChatIcons.RoomIcon} className="room-avatar" alt="" />
        <div className="room-info">
          <div className="room-name">No Hesi</div>
          <div className="room-member-count">144 Member</div>
        </div>
      </div>
      <div className="room-topic">
        Lorem Ipsum is simply Lorem Ipsum is Lorem Ipsum aa
      </div>
      <div className="room-actions">
        <button className="room-leave-button">Join Room</button>
      </div>
    </div>
  );
};

export default SuggestedRoom;