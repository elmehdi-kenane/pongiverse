import * as ChatIcons from "../assets/chat/media";

const MyRoom = () => {
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
        Lorem Ipsum is simply dummy text of the printing and
      </div>
      <div className="btn-and-settings">
        <button className="leave-room">Leave Channel</button>
        <img src={ChatIcons.RoomSettings} className="room-settings" />
      </div>
    </div>
  );
};

export default MyRoom;
