import * as ChatIcons from "../assets/chat/media";

const SuggestedRoom = () => {
  return (
    <div className="room-box">
      <div className="room-details">
        <img src={ChatIcons.RoomIcon} className="room-avatar" alt="" />
        <div className="room-infos">
          <div className="room-name">No Hesi</div>
          <div className="room-members">144 Member</div>
        </div>
      </div>
      <div className="room-desc">
        Lorem Ipsum is simply 
      </div>
      <div className="btn-and-settings">
        <button className="leave-room">Join Channel</button>
      </div>
    </div>
  );
};

export default SuggestedRoom;